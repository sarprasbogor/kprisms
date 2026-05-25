import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PinjamanClient from "./client";

export default async function PinjamanPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const pinjaman = await prisma.pinjaman.findMany({
    include: {
      anggota: { select: { id: true, namaLengkap: true, nikop: true } },
      jenisPinjaman: { select: { id: true, nama: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCair = await prisma.pinjaman.aggregate({
    where: { status: "CAIR" },
    _sum: { jumlah: true },
  });

  const aktifCount = await prisma.pinjaman.count({
    where: { status: { in: ["CAIR", "DISETUJUI"] } },
  });

  const lunasCount = await prisma.pinjaman.count({
    where: { status: "LUNAS" },
  });

  const bermasalahCount = await prisma.pinjaman.count({
    where: { status: "BERMASALAH" },
  });

  return (
    <PinjamanClient
      pinjaman={JSON.parse(JSON.stringify(pinjaman))}
      totalCair={totalCair._sum.jumlah || 0}
      aktifCount={aktifCount}
      lunasCount={lunasCount}
      bermasalahCount={bermasalahCount}
    />
  );
}
