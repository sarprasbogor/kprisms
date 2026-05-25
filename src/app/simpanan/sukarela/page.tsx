import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SukarelaClient from "./client";

export default async function SimpananSukarelaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const anggota = await prisma.anggota.findMany({
    where: { statusKeanggotaan: "AKTIF" },
    select: { id: true, namaLengkap: true, nikop: true },
    orderBy: { namaLengkap: "asc" },
  });

  return <SukarelaClient anggota={JSON.parse(JSON.stringify(anggota))} />;
}
