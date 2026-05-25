import * as XLSX from "xlsx";
import * as fs from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaSqlite } from "prisma-adapter-sqlite";

const adapter = new PrismaSqlite({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const DIR = "D:\\APLIKASI KPRI\\tampung";

function generateNikop(tahun: number, urutan: number) {
  return `KPRI-SMS/${tahun}/${String(urutan).padStart(4, "0")}`;
}

function cleanStr(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s && s !== "undefined" && s !== "null" ? s : null;
}

function readRaw(file: string, sheet: string): string[][] {
  const buf = fs.readFileSync(file);
  const wb = XLSX.read(buf, { type: "buffer", codepage: 1252 });
  const ws = wb.Sheets[sheet];
  return XLSX.utils.sheet_to_json(ws, { header: 1 });
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

async function main() {
  // Read all sources
  console.log("Reading files...");
  const pinjaman = readRaw(DIR + "\\Pinjaman 2025 fix.xlsx", "Sheet2");
  console.log("  Pinjaman Sheet2:", pinjaman.length, "rows");

  const shuRows = readRaw(DIR + "\\SHU tb 2025 new.xlsx", "Sheet5");
  console.log("  SHU Sheet5:", shuRows.length, "rows");

  const tabungan = readRaw(DIR + "\\Simpanan wajib Des 2025.xls", "Page 1");
  console.log("  Tabungan:", tabungan.length, "rows");

  // Build SHU lookup: nama -> { unit, nip }
  const shuMap = new Map<string, { unit: string; nip: string }>();
  for (let i = 4; i < shuRows.length; i++) {
    const r = shuRows[i];
    const nama = cleanStr(r[1]);
    const unit = cleanStr(r[3]) || "";
    const nip = cleanStr(r[2]) || "";
    if (nama) {
      const key = norm(nama);
      const existing = shuMap.get(key);
      if (!existing || (nip && !existing.nip)) {
        shuMap.set(key, { unit, nip });
      }
    }
  }

  // Build Tabungan lookup: nama -> { gender, alamat, tglMulai }
  const tabMap = new Map<string, { gender: string; alamat: string; tglMulai: string }>();
  for (let i = 12; i < tabungan.length; i++) {
    const r = tabungan[i];
    const nama = cleanStr(r[2]);
    const gender = cleanStr(r[6]) || "";
    const alamat = cleanStr(r[7]) || "";
    const tglMulai = cleanStr(r[9]) || "";
    if (nama) {
      const key = norm(nama);
      if (!tabMap.has(key)) {
        tabMap.set(key, { gender, alamat, tglMulai });
      }
    }
  }

  // Build member list from Pinjaman, dedup by nama+unitKerja
  const seen = new Set<string>();
  interface M { nama: string; unit: string }
  const members: M[] = [];

  // Pinjaman Sheet2 data starts at row 0 (no header row)
  for (let i = 0; i < pinjaman.length; i++) {
    const r = pinjaman[i];
    const nama = cleanStr(r[1]);
    const unit = cleanStr(r[2]) || "";
    if (!nama) continue;
    const key = norm(nama) + "|" + norm(unit);
    if (seen.has(key)) continue;
    seen.add(key);
    members.push({ nama, unit });
  }

  console.log(`\nUnique members (by nama+unitKerja): ${members.length}`);

  // Get existing anggota count to continue nikop numbering
  const existingCount = await prisma.anggota.count();
  let urutan = existingCount + 1;
  let created = 0;
  let skipped = 0;
  let errors = 0;
  const tahun = new Date().getFullYear();

  console.log(`Existing members in DB: ${existingCount}\nImporting...`);

  for (const m of members) {
    // Skip if already exists by name+unit (simple check)
    const dup = await prisma.anggota.findFirst({
      where: { namaLengkap: m.nama, unitKerja: m.unit },
    });
    if (dup) {
      skipped++;
      continue;
    }

    const shu = shuMap.get(norm(m.nama));
    const tab = tabMap.get(norm(m.nama));

    const tempNik = `TEMP-${String(urutan).padStart(6, "0")}`;
    const tempHp = `081200000${String(urutan).padStart(6, "0")}`;
    const nikop = generateNikop(tahun, urutan);
    const rawNip = shu?.nip || "";
    // Only set NIP if it looks like a real PNS NIP (18 digits, not "0" or short numbers)
    const nip = /^\d{18}$/.test(rawNip) ? rawNip : null;

    const jkRaw = tab?.gender || "";
    const jk = jkRaw === "L" ? "LAKI_LAKI" : jkRaw === "P" ? "PEREMPUAN" : "LAKI_LAKI";

    try {
      await prisma.anggota.create({
        data: {
          nik: tempNik,
          nikop,
          namaLengkap: m.nama,
          tempatLahir: "-",
          tanggalLahir: new Date("1990-01-01"),
          jenisKelamin: jk as any,
          alamatJalan: tab?.alamat || "-",
          rtRw: null,
          kelurahan: "-",
          kecamatan: "-",
          kota: "Kabupaten Bogor",
          provinsi: "Jawa Barat",
          nomorHp: tempHp,
          unitKerja: m.unit || "-",
          statusKepegawaian: nip ? "PNS" : "HONORER",
          nip,
          tanggalDaftar: new Date("2025-01-01"),
          statusKeanggotaan: "AKTIF",
        },
      });
      created++;
    } catch (err: any) {
      if (err.code === "P2002" && nip) {
        // NIP collision — retry without NIP
        try {
          await prisma.anggota.create({
            data: {
              nik: tempNik,
              nikop,
              namaLengkap: m.nama,
              tempatLahir: "-",
              tanggalLahir: new Date("1990-01-01"),
              jenisKelamin: jk as any,
              alamatJalan: tab?.alamat || "-",
              rtRw: null,
              kelurahan: "-",
              kecamatan: "-",
              kota: "Kabupaten Bogor",
              provinsi: "Jawa Barat",
              nomorHp: tempHp,
              unitKerja: m.unit || "-",
              statusKepegawaian: "HONORER",
              nip: null,
              tanggalDaftar: new Date("2025-01-01"),
              statusKeanggotaan: "AKTIF",
            },
          });
          created++;
          if (created % 300 === 0) console.log(`  ${created} created...`);
        } catch (err2: any) {
          console.error(`  ✗ Failed (retry): ${m.nama} (${m.unit}): ${err2.code}`);
          errors++;
        }
      } else {
        console.error(`  ✗ Failed: ${m.nama} (${m.unit}): ${err.code}`);
        errors++;
      }
    }
    urutan++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
