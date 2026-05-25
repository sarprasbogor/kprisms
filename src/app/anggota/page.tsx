import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AnggotaClient from "./client";

interface PageProps {
  searchParams: Promise<{ search?: string; statusKeanggotaan?: string; unitKerja?: string }>;
}

export default async function AnggotaPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const search = params.search || "";
  const statusFilter = params.statusKeanggotaan || "";
  const unitKerjaFilter = params.unitKerja || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { namaLengkap: { contains: search } },
      { nik: { contains: search } },
      { nikop: { contains: search } },
    ];
  }
  if (statusFilter) where.statusKeanggotaan = statusFilter;
  if (unitKerjaFilter) where.unitKerja = unitKerjaFilter;

  const [anggota, unitKerjaList] = await Promise.all([
    prisma.anggota.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
    }),
    prisma.anggota.findMany({
      select: { unitKerja: true },
      distinct: ["unitKerja"],
      orderBy: { unitKerja: "asc" },
    }),
  ]);

  return (
    <AnggotaClient
      anggota={anggota.map((a) => ({
        ...a,
        tanggalLahir: a.tanggalLahir.toISOString(),
        tanggalDaftar: a.tanggalDaftar.toISOString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }))}
      unitKerjaList={unitKerjaList.map((u) => u.unitKerja)}
      currentSearch={search}
      currentStatus={statusFilter}
      currentUnitKerja={unitKerjaFilter}
    />
  );
}
