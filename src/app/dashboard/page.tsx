import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [
    totalAnggota,
    anggotaAktif,
    simpananPokok,
    simpananWajib,
    simpananSukarela,
    pinjamanAktif,
    totalAset,
    legalitasValid,
    totalPengurus,
  ] = await Promise.all([
    prisma.anggota.count(),
    prisma.anggota.count({ where: { statusKeanggotaan: "AKTIF" } }),
    prisma.simpananPokok.aggregate({ _sum: { jumlah: true } }),
    prisma.simpananWajib.aggregate({ _sum: { jumlah: true } }),
    prisma.simpananSukarela.aggregate({ _sum: { jumlah: true } }),
    prisma.pinjaman.count({ where: { status: { in: ["CAIR", "DISETUJUI"] } } }),
    prisma.aset.aggregate({ _sum: { nilaiPerolehan: true } }),
    prisma.legalitas.count({ where: { masaBerlaku: { gte: new Date() } } }),
    prisma.pengurus.count({ where: { isActive: true } }),
  ]);

  const anggotaPerUnit = await prisma.anggota.groupBy({
    by: ["unitKerja"],
    _count: true,
  });

  const anggotaPerGolongan = await prisma.anggota.groupBy({
    by: ["golonganRuang"],
    _count: true,
  });

  const anggotaPerStatus = await prisma.anggota.groupBy({
    by: ["statusKeanggotaan"],
    _count: true,
  });

  return (
    <DashboardClient
      totalAnggota={totalAnggota}
      anggotaAktif={anggotaAktif}
      totalSimpananPokok={simpananPokok._sum.jumlah || 0}
      totalSimpananWajib={simpananWajib._sum.jumlah || 0}
      totalSimpananSukarela={simpananSukarela._sum.jumlah || 0}
      pinjamanAktif={pinjamanAktif}
      totalAset={totalAset._sum.nilaiPerolehan || 0}
      legalitasValid={legalitasValid}
      totalPengurus={totalPengurus}
      anggotaPerUnit={anggotaPerUnit}
      anggotaPerGolongan={anggotaPerGolongan}
      anggotaPerStatus={anggotaPerStatus}
    />
  );
}
