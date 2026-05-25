"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createSimpananPokok(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const anggotaId = formData.get("anggotaId") as string;
  const jumlah = parseFloat(formData.get("jumlah") as string);
  const cicilanKe = formData.get("cicilanKe")
    ? parseInt(formData.get("cicilanKe") as string)
    : null;
  const totalCicilan = formData.get("totalCicilan")
    ? parseInt(formData.get("totalCicilan") as string)
    : null;
  const statusLunas = formData.get("statusLunas") === "true";
  const tanggalBayar = formData.get("tanggalBayar")
    ? new Date(formData.get("tanggalBayar") as string)
    : new Date();
  const keterangan = formData.get("keterangan") as string;

  await prisma.simpananPokok.create({
    data: {
      anggotaId,
      jumlah,
      cicilanKe,
      totalCicilan,
      statusLunas,
      tanggalBayar,
      keterangan,
    },
  });

  revalidatePath("/simpanan");
}

export async function createSimpananWajib(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const anggotaId = formData.get("anggotaId") as string;
  const bulan = parseInt(formData.get("bulan") as string);
  const tahun = parseInt(formData.get("tahun") as string);
  const jumlah = parseFloat(formData.get("jumlah") as string) || 100000;
  const denda = parseFloat(formData.get("denda") as string) || 0;
  const tanggalBayar = formData.get("tanggalBayar")
    ? new Date(formData.get("tanggalBayar") as string)
    : new Date();
  const keterangan = formData.get("keterangan") as string;

  const existing = await prisma.simpananWajib.findUnique({
    where: { anggotaId_bulan_tahun: { anggotaId, bulan, tahun } },
  });

  if (existing) {
    await prisma.simpananWajib.update({
      where: { id: existing.id },
      data: { jumlah, denda, tanggalBayar, statusLunas: true, keterangan },
    });
  } else {
    await prisma.simpananWajib.create({
      data: {
        anggotaId,
        bulan,
        tahun,
        jumlah,
        denda,
        tanggalBayar,
        statusLunas: true,
        keterangan,
      },
    });
  }

  revalidatePath("/simpanan");
}

export async function createSimpananSukarela(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const anggotaId = formData.get("anggotaId") as string;
  const jenis = formData.get("jenis") as string;
  const jumlah = parseFloat(formData.get("jumlah") as string);
  const tanggal = formData.get("tanggal")
    ? new Date(formData.get("tanggal") as string)
    : new Date();
  const keterangan = formData.get("keterangan") as string;

  const lastTransaction = await prisma.simpananSukarela.findFirst({
    where: { anggotaId },
    orderBy: { createdAt: "desc" },
  });

  const currentSaldo = lastTransaction?.saldoSetelah ?? 0;
  const saldoSetelah =
    jenis === "SETORAN" ? currentSaldo + jumlah : currentSaldo - jumlah;

  if (saldoSetelah < 0) throw new Error("Saldo tidak mencukupi");

  await prisma.simpananSukarela.create({
    data: { anggotaId, jenis, jumlah, saldoSetelah, tanggal, keterangan },
  });

  revalidatePath("/simpanan");
}
