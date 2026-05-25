import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaSqlite } from "prisma-adapter-sqlite";
import bcrypt from "bcryptjs";

const adapter = new PrismaSqlite({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Admin user
  const password = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@koperasisms.com" },
    update: {},
    create: {
      email: "admin@koperasisms.com",
      password,
      name: "Super Admin KPRI",
      role: "SUPER_ADMIN",
    },
  });
  console.log("Created admin user");

  // Chart of accounts
  const akunData = [
    { kodeAkun: "1-0000", namaAkun: "ASET", tipeAkun: "ASET" as const, saldoNormal: "Debit" },
    { kodeAkun: "1-1000", namaAkun: "Kas", tipeAkun: "ASET" as const, saldoNormal: "Debit", indukKode: "1-0000" },
    { kodeAkun: "1-1100", namaAkun: "Bank", tipeAkun: "ASET" as const, saldoNormal: "Debit", indukKode: "1-0000" },
    { kodeAkun: "1-2000", namaAkun: "Piutang Anggota", tipeAkun: "ASET" as const, saldoNormal: "Debit", indukKode: "1-0000" },
    { kodeAkun: "1-3000", namaAkun: "Pinjaman Diberikan", tipeAkun: "ASET" as const, saldoNormal: "Debit", indukKode: "1-0000" },
    { kodeAkun: "2-0000", namaAkun: "KEWAJIBAN", tipeAkun: "KEWAJIBAN" as const, saldoNormal: "Kredit" },
    { kodeAkun: "2-1000", namaAkun: "Simpanan Pokok", tipeAkun: "KEWAJIBAN" as const, saldoNormal: "Kredit", indukKode: "2-0000" },
    { kodeAkun: "2-2000", namaAkun: "Simpanan Wajib", tipeAkun: "KEWAJIBAN" as const, saldoNormal: "Kredit", indukKode: "2-0000" },
    { kodeAkun: "2-3000", namaAkun: "Simpanan Sukarela", tipeAkun: "KEWAJIBAN" as const, saldoNormal: "Kredit", indukKode: "2-0000" },
    { kodeAkun: "3-0000", namaAkun: "EKUITAS", tipeAkun: "EKUITAS" as const, saldoNormal: "Kredit" },
    { kodeAkun: "3-1000", namaAkun: "Modal Koperasi", tipeAkun: "EKUITAS" as const, saldoNormal: "Kredit", indukKode: "3-0000" },
    { kodeAkun: "3-2000", namaAkun: "SHU Tahun Berjalan", tipeAkun: "EKUITAS" as const, saldoNormal: "Kredit", indukKode: "3-0000" },
    { kodeAkun: "4-0000", namaAkun: "PENDAPATAN", tipeAkun: "PENDAPATAN" as const, saldoNormal: "Kredit" },
    { kodeAkun: "4-1000", namaAkun: "Pendapatan Bunga Pinjaman", tipeAkun: "PENDAPATAN" as const, saldoNormal: "Kredit", indukKode: "4-0000" },
    { kodeAkun: "4-2000", namaAkun: "Pendapatan Jasa", tipeAkun: "PENDAPATAN" as const, saldoNormal: "Kredit", indukKode: "4-0000" },
    { kodeAkun: "5-0000", namaAkun: "BEBAN", tipeAkun: "BEBAN" as const, saldoNormal: "Debit" },
    { kodeAkun: "5-1000", namaAkun: "Beban Operasional", tipeAkun: "BEBAN" as const, saldoNormal: "Debit", indukKode: "5-0000" },
    { kodeAkun: "5-2000", namaAkun: "Beban Gaji", tipeAkun: "BEBAN" as const, saldoNormal: "Debit", indukKode: "5-0000" },
    { kodeAkun: "5-3000", namaAkun: "Beban Listrik & Air", tipeAkun: "BEBAN" as const, saldoNormal: "Debit", indukKode: "5-0000" },
  ];

  for (const akun of akunData) {
    const { indukKode, ...rest } = akun;
    let indukId: string | undefined;
    if (indukKode) {
      const induk = await prisma.akunAkuntansi.findUnique({ where: { kodeAkun: indukKode } });
      if (induk) indukId = induk.id;
    }
    await prisma.akunAkuntansi.upsert({
      where: { kodeAkun: akun.kodeAkun },
      update: {},
      create: { ...rest, indukId: indukId || null },
    });
  }
  console.log("Created chart of accounts");

  // Loan types
  const jenisPinjaman = [
    { nama: "Pinjaman Anggota Biasa", deskripsi: "Pinjaman maksimal 10x simpanan", bungaFlat: 0.8, bungaEfektif: 1.2, maksimal: 50000000 },
    { nama: "Pinjaman Khusus", deskripsi: "Multiguna, pendidikan, kesehatan", bungaFlat: 1.0, bungaEfektif: 1.5, maksimal: 100000000 },
    { nama: "Pinjaman Darurat", deskripsi: "Proses cepat tanpa agunan", bungaFlat: 0.5, bungaEfektif: 0.8, maksimal: 5000000 },
  ];

  for (const jp of jenisPinjaman) {
    await prisma.jenisPinjaman.upsert({
      where: { nama: jp.nama },
      update: {},
      create: jp,
    });
  }
  console.log("Created loan types");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
