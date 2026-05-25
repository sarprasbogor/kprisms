import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BaruClient from "./client";

export default async function PinjamanBaruPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [anggota, jenisPinjaman] = await Promise.all([
    prisma.anggota.findMany({
      where: { statusKeanggotaan: "AKTIF" },
      select: { id: true, namaLengkap: true, nikop: true },
      orderBy: { namaLengkap: "asc" },
    }),
    prisma.jenisPinjaman.findMany({
      orderBy: { nama: "asc" },
    }),
  ]);

  return (
    <BaruClient
      anggota={JSON.parse(JSON.stringify(anggota))}
      jenisPinjaman={JSON.parse(JSON.stringify(jenisPinjaman))}
    />
  );
}
