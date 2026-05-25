"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createPinjaman(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const anggotaId = formData.get("anggotaId") as string;
  const jenisPinjamanId = formData.get("jenisPinjamanId") as string;
  const jumlah = parseFloat(formData.get("jumlah") as string);
  const jangkaWaktu = parseInt(formData.get("jangkaWaktu") as string);
  const tujuan = formData.get("tujuan") as string;
  const dokumenPendukung = formData.get("dokumenPendukung") as string;

  const jenisPinjaman = await prisma.jenisPinjaman.findUnique({
    where: { id: jenisPinjamanId },
  });
  if (!jenisPinjaman) throw new Error("Jenis pinjaman tidak ditemukan");

  if (jenisPinjaman.maksimal && jumlah > jenisPinjaman.maksimal) {
    throw new Error(
      `Jumlah pinjaman melebihi maksimal (${jenisPinjaman.maksimal})`
    );
  }

  const bunga = jenisPinjaman.bungaFlat;
  const pokokPerBulan = jumlah / jangkaWaktu;
  const bungaPerBulan = (jumlah * bunga) / 100;
  const angsuranPerBulan = pokokPerBulan + bungaPerBulan;

  const pinjaman = await prisma.pinjaman.create({
    data: {
      anggotaId,
      jenisPinjamanId,
      jumlah,
      jangkaWaktu,
      bunga,
      angsuranPerBulan: Math.round(angsuranPerBulan * 100) / 100,
      tujuan,
      dokumenPendukung,
      status: "DIAJUKAN",
    },
  });

  const angsuranData = [];
  for (let i = 1; i <= jangkaWaktu; i++) {
    const jatuhTempo = new Date();
    jatuhTempo.setMonth(jatuhTempo.getMonth() + i);
    angsuranData.push({
      pinjamanId: pinjaman.id,
      angsuranKe: i,
      tanggalJatuhTempo: jatuhTempo,
      jumlahPokok: Math.round(pokokPerBulan * 100) / 100,
      jumlahBunga: Math.round(bungaPerBulan * 100) / 100,
      denda: 0,
      statusLunas: false,
    });
  }

  await prisma.angsuran.createMany({ data: angsuranData });

  revalidatePath("/pinjaman");
}

export async function updateStatusPinjaman(
  id: string,
  status: string,
  catatan?: string
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const data: any = { status };

  if (status === "CAIR") data.tanggalCair = new Date();
  if (catatan) data.catatan = catatan;

  await prisma.pinjaman.update({ where: { id }, data });

  revalidatePath("/pinjaman");
}

export async function createAngsuran(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const angsuranId = formData.get("angsuranId") as string;
  const tanggalBayar = formData.get("tanggalBayar")
    ? new Date(formData.get("tanggalBayar") as string)
    : new Date();
  const denda = parseFloat(formData.get("denda") as string) || 0;
  const keterangan = formData.get("keterangan") as string;

  const angsuran = await prisma.angsuran.update({
    where: { id: angsuranId },
    data: { tanggalBayar, denda, statusLunas: true, keterangan },
  });

  const allAngsuran = await prisma.angsuran.findMany({
    where: { pinjamanId: angsuran.pinjamanId },
  });

  if (allAngsuran.every((a) => a.statusLunas)) {
    await prisma.pinjaman.update({
      where: { id: angsuran.pinjamanId },
      data: { status: "LUNAS" },
    });
  }

  revalidatePath("/pinjaman");
}
