import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import DetailClient from "./client";

export default async function PinjamanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const pinjaman = await prisma.pinjaman.findUnique({
    where: { id },
    include: {
      anggota: {
        select: { id: true, namaLengkap: true, nikop: true },
      },
      jenisPinjaman: {
        select: { id: true, nama: true, deskripsi: true, bungaFlat: true, maksimal: true },
      },
      angsuran: { orderBy: { angsuranKe: "asc" } },
    },
  });

  if (!pinjaman) notFound();

  const userRole = (session.user as any)?.role;

  return (
    <DetailClient
      pinjaman={JSON.parse(JSON.stringify(pinjaman))}
      userRole={userRole}
    />
  );
}
