import * as XLSX from "xlsx";
import * as fs from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaSqlite } from "prisma-adapter-sqlite";

// ───────── helpers ─────────
function clean(v: unknown): string | null {
  if (v == null || v === undefined) return null;
  const s = String(v).trim();
  return s && s !== "null" && s !== "undefined" ? s : null;
}
function num(v: unknown): number {
  if (v == null) return 0;
  const s = String(v).replace(/[^0-9.,-]/g, "").replace(/\./g, "").replace(",", ".");
  return parseFloat(s) || 0;
}
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}
function matchKey(nama: string, unit: string): string {
  return norm(nama) + "|" + norm(unit);
}

const DIR = "D:\\APLIKASI KPRI\\tampung";

// ───────── DB ─────────
const adapter = new PrismaSqlite({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Build member lookup: nama+unitKerja → anggota.id
  console.log("Building member lookup...");
  const allAnggota = await prisma.anggota.findMany({
    select: { id: true, namaLengkap: true, unitKerja: true },
  });
  const memberMap = new Map<string, string>();
  const memberByName = new Map<string, string[]>();
  const dupes: string[] = [];
  for (const a of allAnggota) {
    const key = matchKey(a.namaLengkap, a.unitKerja);
    if (memberMap.has(key)) dupes.push(key);
    memberMap.set(key, a.id);
    const nk = norm(a.namaLengkap);
    if (!memberByName.has(nk)) memberByName.set(nk, []);
    memberByName.get(nk)!.push(a.id);
  }
  console.log(`  Members in DB: ${allAnggota.length}`);
  if (dupes.length) console.log(`  ⚠ Key duplicates: ${dupes.length}`);
  const lookup = (nama: string, unit: string): string | null => {
    const key = matchKey(nama, unit);
    let id = memberMap.get(key);
    if (id) return id;
    // fallback: match by name only
    const nk = norm(nama);
    const ids = memberByName.get(nk);
    if (ids && ids.length === 1) return ids[0];
    if (ids && ids.length > 1) {
      // Try without unit match
      return ids[0];
    }
    return null;
  };

  // ──── 2. READ FILES ──────────────────────────────────────
  const bin = (f: string) => fs.readFileSync(DIR + "\\" + f);
  const wb = (f: string) => XLSX.read(bin(f), { type: "buffer" });

  // SHU tb 2025 new.xlsx → Sheet1: simpanan summary, Sheet5: SHU
  const wbShu = wb("SHU tb 2025 new.xlsx");
  const shuSheet1 = XLSX.utils.sheet_to_json(wbShu.Sheets["Sheet1"], { header: 1 }) as any[][];
  const shuSheet5 = XLSX.utils.sheet_to_json(wbShu.Sheets["Sheet5"], { header: 1 }) as any[][];

  // Pinjaman 2025 fix.xlsx → Sheet1: piutang
  const wbPin = wb("Pinjaman 2025 fix.xlsx");
  const piutangSheet = XLSX.utils.sheet_to_json(wbPin.Sheets["Sheet1"], { header: 1 }) as any[][];

  // Simpanan wajib Des 2025.xls → Page 1: detail tabungan
  const wbTab = wb("Simpanan wajib Des 2025.xls");
  const tabSheet = XLSX.utils.sheet_to_json(wbTab.Sheets["Page 1"], { header: 1 }) as any[][];

  // ──── 3. PARSE SHU SHEET1 — Simpanan Summary ─────────────
  console.log("\nParsing SHU Sheet1 (Simpanan)...");
  interface SimpananRow {
    nama: string; unit: string;
    wajib: number; pokok: number; total: number; pensiun: number | null;
    nip: string | null;
  }
  const simpananData: SimpananRow[] = [];
  let skipCount = 0;
  for (let i = 3; i < shuSheet1.length; i++) {
    const r = shuSheet1[i];
    if (!r || !r[1] || String(r[1]).trim() === "" || !r[0]) continue;
    const nama = clean(r[1]) || "";
    if (!nama) continue;
    const unit = clean(r[2]) || "-";
    simpananData.push({
      nama,
      unit,
      wajib: num(r[3]),
      pokok: Math.round(num(r[4])),
      total: Math.round(num(r[5])),
      pensiun: r[6] ? Math.round(num(r[6])) : null,
      nip: clean(r[8]) || null,
    });
  }
  console.log(`  Rows parsed: ${simpananData.length}`);

  // ──── 4. PARSE SHU SHEET5 — SHU ──────────────────────────
  console.log("\nParsing SHU Sheet5 (SHU)...");
  interface ShuRow {
    nama: string; unit: string;
    wajib: number; pokok: number; totalSimpanan: number;
    shuSimpanan: number;
    angsuran: number | null;
    shuPinjaman: number;
    shuTotal: number;
  }
  const shuData: ShuRow[] = [];
  for (let i = 3; i < shuSheet5.length; i++) {
    const r = shuSheet5[i];
    if (!r || !r[1] || String(r[1]).trim() === "" || !r[0]) continue;
    const nama = clean(r[1]) || "";
    if (!nama) continue;
    const unit = clean(r[3]) || "-";
    shuData.push({
      nama,
      unit,
      wajib: num(r[4]),
      pokok: Math.round(num(r[5])),
      totalSimpanan: Math.round(num(r[6])),
      shuSimpanan: Math.round(num(r[9])),
      angsuran: r[12] ? Math.round(num(r[12])) : null,
      shuPinjaman: Math.round(num(r[13])),
      shuTotal: Math.round(num(r[15])),
    });
  }
  console.log(`  Rows parsed: ${shuData.length}`);

  // ──── 5. PARSE PIUTANG ───────────────────────────────────
  console.log("\nParsing Piutang...");
  interface PiutangRow { nama: string; unit: string; amount: number; }
  const piutangData: PiutangRow[] = [];
  for (let i = 3; i < piutangSheet.length; i++) {
    const r = piutangSheet[i];
    if (!r || !r[1] || String(r[1]).trim() === "" || !r[0]) continue;
    const nama = clean(r[1]) || "";
    if (!nama) continue;
    const amount = Math.round(num(r[4]));
    if (amount <= 0) continue;
    piutangData.push({ nama, unit: clean(r[2]) || "-", amount });
  }
  console.log(`  Rows parsed: ${piutangData.length}`);
  console.log(`  Total piutang: Rp ${piutangData.reduce((s, p) => s + p.amount, 0).toLocaleString()}`);

  // ──── 6. PARSE TABUNGAN (DETAIL) ────────────────────────
  console.log("\nParsing Tabungan (detail)...");
  interface TabRow { nama: string; noRek: string; prefix: string; saldo: number; }
  const tabData: TabRow[] = [];
  let emptyRun = 0;
  for (let i = 12; i < tabSheet.length; i++) {
    const r = tabSheet[i];
    if (!r || !r[0] || String(r[0]).trim() === "") {
      emptyRun++;
      if (emptyRun > 20) break; // too many empty rows = end of data
      continue;
    }
    emptyRun = 0;
    const no = parseInt(String(r[0]).trim());
    if (isNaN(no)) continue;
    const noRek = clean(r[1]) || "";
    const nama = clean(r[2]) || "";
    if (!nama) continue;
    const saldo = num(r[13]);
    tabData.push({ nama, noRek, prefix: noRek.split(".")[1] || "", saldo });
  }
  console.log(`  Records parsed: ${tabData.length}`);
  const pokokCount = tabData.filter(t => t.prefix === "101").length;
  const wajibCount = tabData.filter(t => t.prefix === "102").length;
  console.log(`  Prefix 101 (pokok): ${pokokCount}`);
  console.log(`  Prefix 102 (wajib): ${wajibCount}`);

  // ──── 7. ENSURE JENIS PINJAMAN ───────────────────────────
  let jenisPiutang = await prisma.jenisPinjaman.findFirst({ where: { nama: "Piutang 2025" } });
  if (!jenisPiutang) {
    jenisPiutang = await prisma.jenisPinjaman.create({
      data: { nama: "Piutang 2025", deskripsi: "Piutang per Desember 2025" },
    });
    console.log("  Created JenisPinjaman: Piutang 2025");
  }

  // ──── 8. IMPORT ──────────────────────────────────────────
  let created = 0, skipped = 0, errors = 0;

  // 8a. SimpananPokok from tabungan prefix 101
  console.log("\n── Importing Simpanan Pokok...");
  const existingPokok = new Set(
    (await prisma.simpananPokok.findMany({ select: { anggotaId: true } })).map(p => p.anggotaId)
  );
  for (const t of tabData.filter(t => t.prefix === "101")) {
    const anggotaId = lookup(t.nama, "");
    if (!anggotaId) { skipped++; continue; }
    if (existingPokok.has(anggotaId)) { skipped++; continue; }
    try {
      await prisma.simpananPokok.create({
        data: {
          anggotaId,
          jumlah: 100000,
          statusLunas: true,
          tanggalBayar: new Date("2025-08-20"),
          keterangan: "Simpanan Pokok (impor data per Des 2025)",
        },
      });
      created++;
      existingPokok.add(anggotaId);
    } catch (e: any) {
      errors++;
    }
  }
  console.log(`  Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);

  // 8b. SimpananWajib from SHU Sheet1 (accumulated)
  created = 0; skipped = 0; errors = 0;
  console.log("\n── Importing Simpanan Wajib (accumulated)...");
  const existingWajib = new Set(
    (await prisma.simpananWajib.findMany({ select: { anggotaId: true, bulan: true, tahun: true } }))
      .map(w => w.anggotaId + "|" + w.bulan + "|" + w.tahun)
  );
  for (const s of simpananData) {
    if (!s.wajib) { skipped++; continue; }
    const anggotaId = lookup(s.nama, s.unit);
    if (!anggotaId) { skipped++; continue; }
    const key = anggotaId + "|12|2025";
    if (existingWajib.has(key)) { skipped++; continue; }
    try {
      await prisma.simpananWajib.create({
        data: {
          anggotaId,
          bulan: 12,
          tahun: 2025,
          jumlah: s.wajib,
          statusLunas: true,
          tanggalBayar: new Date("2025-12-31"),
          keterangan: "Akumulasi sd Desember 2025",
        },
      });
      created++;
      existingWajib.add(key);
    } catch (e: any) {
      errors++;
    }
  }
  console.log(`  Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);

  // 8c. Simpanan Sukarela (dari selisih total - pokok - wajib)
  created = 0; skipped = 0; errors = 0;
  console.log("\n── Importing Simpanan Sukarela...");
  for (const s of simpananData) {
    const sukarela = s.total - s.pokok - s.wajib;
    if (sukarela <= 0) { skipped++; continue; }
    const anggotaId = lookup(s.nama, s.unit);
    if (!anggotaId) { skipped++; continue; }
    try {
      await prisma.simpananSukarela.create({
        data: {
          anggotaId,
          jenis: "SETORAN",
          jumlah: sukarela,
          saldoSetelah: sukarela,
          tanggal: new Date("2025-12-31"),
          keterangan: "Saldo sukarela per Desember 2025",
        },
      });
      created++;
    } catch (e: any) {
      errors++;
    }
  }
  console.log(`  Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);

  // 8d. Pinjaman (Piutang)
  created = 0; skipped = 0; errors = 0;
  console.log("\n── Importing Piutang (Pinjaman)...");
  const existingPiutang = new Set(
    (await prisma.pinjaman.findMany({ select: { anggotaId: true, jenisPinjamanId: true } }))
      .map(p => p.anggotaId + "|" + p.jenisPinjamanId)
  );
  for (const p of piutangData) {
    const anggotaId = lookup(p.nama, p.unit);
    if (!anggotaId) { skipped++; continue; }
    const key = anggotaId + "|" + jenisPiutang!.id;
    if (existingPiutang.has(key)) { skipped++; continue; }
    const angsuranPerBulan = Math.round(p.amount / 12);
    try {
      await prisma.pinjaman.create({
        data: {
          anggotaId,
          jenisPinjamanId: jenisPiutang!.id,
          jumlah: p.amount,
          jangkaWaktu: 12,
          bunga: 0,
          angsuranPerBulan,
          status: "CAIR",
          tanggalPengajuan: new Date("2025-01-01"),
          tanggalCair: new Date("2025-01-15"),
          catatan: "Piutang per Desember 2025 (impor data)",
        },
      });
      created++;
    } catch (e: any) {
      errors++;
    }
  }
  console.log(`  Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);

  // 8e. SHU Anggota 2025
  created = 0; skipped = 0; errors = 0;
  console.log("\n── Importing SHU Anggota 2025...");
  const existingShu = new Set(
    (await prisma.shuAnggota.findMany({ select: { anggotaId: true, tahun: true } }))
      .map(s => s.anggotaId + "|" + s.tahun)
  );
  for (const s of shuData) {
    const anggotaId = lookup(s.nama, s.unit);
    if (!anggotaId) { skipped++; continue; }
    const key = anggotaId + "|2025";
    if (existingShu.has(key)) { skipped++; continue; }
    try {
      await prisma.shuAnggota.create({
        data: {
          tahun: 2025,
          anggotaId,
          simpananWajib: s.wajib,
          simpananPokok: s.pokok,
          totalSimpanan: s.totalSimpanan,
          shuSimpanan: s.shuSimpanan,
          angsuranPinjaman: s.angsuran,
          shuPinjaman: s.shuPinjaman,
          shuTotal: s.shuTotal,
        },
      });
      created++;
    } catch (e: any) {
      errors++;
    }
  }
  console.log(`  Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);

  // ──── 9. REPORT ──────────────────────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("IMPORT SUMMARY");
  console.log("═══════════════════════════════════════");
  const counts = {
    anggota: await prisma.anggota.count(),
    simpananPokok: await prisma.simpananPokok.count(),
    simpananWajib: await prisma.simpananWajib.count(),
    simpananSukarela: await prisma.simpananSukarela.count(),
    pinjaman: await prisma.pinjaman.count(),
    shuAnggota: await prisma.shuAnggota.count(),
  };
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k}: ${v}`);
  }

  // Unmatched check
  const unmatchedSimpanan = simpananData.filter(s => !lookup(s.nama, s.unit));
  const unmatchedPiutang = piutangData.filter(p => !lookup(p.nama, p.unit));
  if (unmatchedSimpanan.length) console.log(`\n⚠ ${unmatchedSimpanan.length} simpanan records not matched to any member (first 5):`);
  for (const s of unmatchedSimpanan.slice(0, 5)) console.log(`   - ${s.nama} (${s.unit})`);
  if (unmatchedPiutang.length) console.log(`\n⚠ ${unmatchedPiutang.length} piutang records not matched to any member (first 5):`);
  for (const p of unmatchedPiutang.slice(0, 5)) console.log(`   - ${p.nama} (${p.unit})`);
  
  console.log("\nDone!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
