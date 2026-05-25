import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SimpananClient from "./client";

export default async function SimpananPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [pokokData, wajibData, sukarelaData, anggota] = await Promise.all([
    prisma.simpananPokok.findMany({
      include: { anggota: { select: { id: true, namaLengkap: true, nikop: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.simpananWajib.findMany({
      include: { anggota: { select: { id: true, namaLengkap: true, nikop: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.simpananSukarela.findMany({
      include: { anggota: { select: { id: true, namaLengkap: true, nikop: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.anggota.findMany({
      where: { statusKeanggotaan: "AKTIF" },
      select: { id: true, namaLengkap: true, nikop: true },
      orderBy: { namaLengkap: "asc" },
    }),
  ]);

  const totalPokok = await prisma.simpananPokok.aggregate({ _sum: { jumlah: true } });
  const totalWajib = await prisma.simpananWajib.aggregate({ _sum: { jumlah: true } });

  const lastSukarela = await prisma.simpananSukarela.findFirst({
    orderBy: { createdAt: "desc" },
    select: { saldoSetelah: true },
  });

  return (
    <SimpananClient
      pokokData={JSON.parse(JSON.stringify(pokokData))}
      wajibData={JSON.parse(JSON.stringify(wajibData))}
      sukarelaData={JSON.parse(JSON.stringify(sukarelaData))}
      anggota={JSON.parse(JSON.stringify(anggota))}
      totalPokok={totalPokok._sum.jumlah || 0}
      totalWajib={totalWajib._sum.jumlah || 0}
      totalSukarela={lastSukarela?.saldoSetelah ?? 0}
    />
  );
}
