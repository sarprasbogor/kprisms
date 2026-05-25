import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaSqlite } from "prisma-adapter-sqlite";
import { createHash } from "crypto";
import * as fs from "fs";

const adapter = new PrismaSqlite({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// Generate a Web-Crypto compatible password hash for "admin123"
function sha256(pwd: string): string {
  return createHash("sha256").update(pwd + "kpri-sms-2026").digest("base64");
}

function esc(v: any): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  // Escape single quotes by doubling them
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function toSql(table: string, rows: any[], columns: string[]): string[] {
  if (rows.length === 0) return [];
  return rows.map(row => {
    const vals = columns.map(c => {
      let v = (row as any)[c];
      if (v === undefined) return "NULL";
      if (v instanceof Date) return esc(v.toISOString());
      return esc(v);
    });
    return `INSERT INTO ${table} (${columns.join(",")}) VALUES (${vals.join(",")});`;
  });
}

async function main() {
  console.log("Exporting data from SQLite...");
  const lines: string[] = [];

  // admin user
  const adminHash = sha256("admin123");
  lines.push(`INSERT INTO users (id,email,password,name,role,is_active,created_at,updated_at) VALUES ('admin-001','admin@koperasisms.com',${esc(adminHash)},'Super Admin KPRI','SUPER_ADMIN',1,datetime('now'),datetime('now'));`);

  // anggota
  const anggota = await prisma.anggota.findMany();
  const acols = ["id","nik","nikop","nama_lengkap","tempat_lahir","tanggal_lahir","jenis_kelamin","status_pernikahan","alamat_jalan","rt_rw","kelurahan","kecamatan","kota","provinsi","kode_pos","nomor_hp","email","unit_kerja","jabatan","status_kepegawaian","nip","golongan_ruang","masa_kerja_tahun","tmt_pns","tmt_jabatan","nomor_induk_non_pns","jenis_non_pns","tanggal_mulai_kontrak","tanggal_berakhir_kontrak","penghasilan_tetap","tanggal_daftar","tanggal_aktif","tanggal_nonaktif","status_keanggotaan","alasan_nonaktif","tanggal_pensiun","tanggal_meninggal","nama_ahli_waris","hubungan_ahli_waris","hp_ahli_waris","nomor_rekening","nama_bank","foto_url","foto_ktp_url","surat_keterangan_url","created_at","updated_at"];
  lines.push(`-- ${anggota.length} anggota`);
  for (const a of anggota) {
    const v: any = { ...a };
    // Map camelCase from Prisma to snake_case for D1
    v.nama_lengkap = v.namaLengkap;
    v.tempat_lahir = v.tempatLahir;
    v.tanggal_lahir = v.tanggalLahir.toISOString();
    v.jenis_kelamin = v.jenisKelamin;
    v.status_pernikahan = v.statusPernikahan;
    v.alamat_jalan = v.alamatJalan;
    v.rt_rw = v.rtRw;
    v.kode_pos = v.kodePos;
    v.nomor_hp = v.nomorHp;
    v.unit_kerja = v.unitKerja;
    v.status_kepegawaian = v.statusKepegawaian;
    v.golongan_ruang = v.golonganRuang;
    v.masa_kerja_tahun = v.masaKerjaTahun;
    v.tmt_pns = v.tmtPns?.toISOString() || null;
    v.tmt_jabatan = v.tmtJabatan?.toISOString() || null;
    v.nomor_induk_non_pns = v.nomorIndukNonPns;
    v.jenis_non_pns = v.jenisNonPns;
    v.tanggal_mulai_kontrak = v.tanggalMulaiKontrak?.toISOString() || null;
    v.tanggal_berakhir_kontrak = v.tanggalBerakhirKontrak?.toISOString() || null;
    v.penghasilan_tetap = v.penghasilanTetap;
    v.tanggal_daftar = v.tanggalDaftar.toISOString();
    v.tanggal_aktif = v.tanggalAktif?.toISOString() || null;
    v.tanggal_nonaktif = v.tanggalNonaktif?.toISOString() || null;
    v.status_keanggotaan = v.statusKeanggotaan;
    v.alasan_nonaktif = v.alasanNonaktif;
    v.tanggal_pensiun = v.tanggalPensiun?.toISOString() || null;
    v.tanggal_meninggal = v.tanggalMeninggal?.toISOString() || null;
    v.nama_ahli_waris = v.namaAhliWaris;
    v.hubungan_ahli_waris = v.hubunganAhliWaris;
    v.hp_ahli_waris = v.hpAhliWaris;
    v.nomor_rekening = v.nomorRekening;
    v.nama_bank = v.namaBank;
    v.foto_url = v.fotoUrl;
    v.foto_ktp_url = v.fotoKtpUrl;
    v.surat_keterangan_url = v.suratKeteranganUrl;

    lines.push(`INSERT INTO anggota (${acols.join(",")}) VALUES (${acols.map(c => {
      const key = c === "created_at" ? "createdAt" : c === "updated_at" ? "updatedAt" : c;
      const val = (v as any)[c];
      if (val === null || val === undefined) {
        if (c === "created_at" || c === "updated_at") return "datetime('now')";
        return "NULL";
      }
      return esc(val);
    }).join(",")});`);
  }

  // Export financial data
  const tables = [
    { model: prisma.simpananPokok, table: "simpanan_pokok", columns: ["id","anggota_id","jumlah","status_lunas","cicilan_ke","total_cicilan","tanggal_bayar","keterangan","created_at","updated_at"] },
    { model: prisma.simpananWajib, table: "simpanan_wajib", columns: ["id","anggota_id","bulan","tahun","jumlah","tanggal_bayar","status_lunas","denda","keterangan","created_at","updated_at"] },
    { model: prisma.simpananSukarela, table: "simpanan_sukarela", columns: ["id","anggota_id","jenis","jumlah","saldo_setelah","tanggal","keterangan","created_at","updated_at"] },
    { model: prisma.jenisPinjaman, table: "jenis_pinjaman", columns: ["id","nama","deskripsi","bunga_flat","bunga_efektif","maksimal","created_at","updated_at"] },
    { model: prisma.pinjaman, table: "pinjaman", columns: ["id","anggota_id","jenis_pinjaman_id","jumlah","jangka_waktu","bunga","angsuran_per_bulan","tujuan","dokumen_pendukung","status","catatan","tanggal_pengajuan","tanggal_cair","bukti_transfer","created_at","updated_at"] },
    { model: prisma.angsuran, table: "angsuran", columns: ["id","pinjaman_id","angsuran_ke","tanggal_jatuh_tempo","tanggal_bayar","jumlah_pokok","jumlah_bunga","denda","status_lunas","keterangan","created_at","updated_at"] },
    { model: prisma.shuAnggota, table: "shu_anggota", columns: ["id","tahun","anggota_id","simpanan_wajib","simpanan_pokok","total_simpanan","shu_simpanan","angsuran_pinjaman","shu_pinjaman","shu_total","created_at","updated_at"] },
    { model: prisma.akunAkuntansi, table: "akun_akuntansi", columns: ["id","kode_akun","nama_akun","tipe_akun","saldo_normal","deskripsi","induk_id","is_active","created_at","updated_at"] },
  ];

  const fieldMaps: Record<string, Record<string, string>> = {
    simpanan_pokok: {
      anggota_id: "anggotaId", cicilan_ke: "cicilanKe", total_cicilan: "totalCicilan",
      tanggal_bayar: "tanggalBayar", status_lunas: "statusLunas",
      created_at: "createdAt", updated_at: "updatedAt",
    },
    simpanan_wajib: {
      anggota_id: "anggotaId", tanggal_bayar: "tanggalBayar", status_lunas: "statusLunas",
      created_at: "createdAt", updated_at: "updatedAt",
    },
    simpanan_sukarela: {
      anggota_id: "anggotaId", saldo_setelah: "saldoSetelah",
      created_at: "createdAt", updated_at: "updatedAt",
    },
    jenis_pinjaman: {
      bunga_flat: "bungaFlat", bunga_efektif: "bungaEfektif",
      created_at: "createdAt", updated_at: "updatedAt",
    },
    pinjaman: {
      anggota_id: "anggotaId", jenis_pinjaman_id: "jenisPinjamanId",
      jangka_waktu: "jangkaWaktu", angsuran_per_bulan: "angsuranPerBulan",
      tanggal_pengajuan: "tanggalPengajuan", tanggal_cair: "tanggalCair",
      dokumen_pendukung: "dokumenPendukung", bukti_transfer: "buktiTransfer",
      created_at: "createdAt", updated_at: "updatedAt",
    },
    angsuran: {
      pinjaman_id: "pinjamanId", angsuran_ke: "angsuranKe",
      tanggal_jatuh_tempo: "tanggalJatuhTempo", tanggal_bayar: "tanggalBayar",
      jumlah_pokok: "jumlahPokok", jumlah_bunga: "jumlahBunga",
      status_lunas: "statusLunas",
      created_at: "createdAt", updated_at: "updatedAt",
    },
    shu_anggota: {
      anggota_id: "anggotaId", simpanan_wajib: "simpananWajib",
      simpanan_pokok: "simpananPokok", total_simpanan: "totalSimpanan",
      shu_simpanan: "shuSimpanan", angsuran_pinjaman: "angsuranPinjaman",
      shu_pinjaman: "shuPinjaman", shu_total: "shuTotal",
      created_at: "createdAt", updated_at: "updatedAt",
    },
    akun_akuntansi: {
      kode_akun: "kodeAkun", nama_akun: "namaAkun", tipe_akun: "tipeAkun",
      saldo_normal: "saldoNormal", induk_id: "indukId", is_active: "isActive",
      created_at: "createdAt", updated_at: "updatedAt",
    },
  };

  for (const t of tables) {
    const fm = fieldMaps[t.table];
    if (!fm) continue;
    const rows = await t.model.findMany();
    lines.push(`\n-- ${t.table}: ${rows.length} rows`);
    for (const row of rows) {
      const v: any = { ...row };
      // Map Prisma camelCase fields to snake_case expected by D1
      const vals = t.columns.map(c => {
        const prismaField = fm[c] || c;
        const val = (v as any)[prismaField];
        if (val === null || val === undefined) {
          if (c === "created_at" || c === "updated_at") return "datetime('now')";
          return "NULL";
        }
        if (val instanceof Date) return esc(val.toISOString());
        return esc(val);
      });
      lines.push(`INSERT INTO ${t.table} (${t.columns.join(",")}) VALUES (${vals.join(",")});`);
    }
  }

  const outPath = "D:\\APLIKASI KPRI\\cloudflare\\data\\seed.sql";
  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log(`Exported to ${outPath}`);
  console.log(`Total lines: ${lines.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
