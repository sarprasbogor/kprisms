"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PengurusSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  jabatan: z.string().min(1, "Jabatan wajib diisi"),
  kontak: z.string().optional(),
  tugasPokok: z.string().optional(),
  periodeMulai: z.string().min(1, "Periode mulai wajib diisi"),
  periodeSelesai: z.string().min(1, "Periode selesai wajib diisi"),
  isActive: z.boolean().default(true),
});

export async function createPengurus(formData: FormData) {
  const data = {
    nama: formData.get("nama") as string,
    jabatan: formData.get("jabatan") as string,
    kontak: formData.get("kontak") as string || null,
    tugasPokok: formData.get("tugasPokok") as string || null,
    periodeMulai: formData.get("periodeMulai") as string,
    periodeSelesai: formData.get("periodeSelesai") as string,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = PengurusSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data tidak valid", issues: parsed.error.issues };
  }

  await prisma.pengurus.create({
    data: {
      nama: parsed.data.nama,
      jabatan: parsed.data.jabatan,
      kontak: parsed.data.kontak || null,
      tugasPokok: parsed.data.tugasPokok || null,
      periodeMulai: new Date(parsed.data.periodeMulai),
      periodeSelesai: new Date(parsed.data.periodeSelesai),
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/pengurus");
  return { success: true };
}

export async function updatePengurus(id: string, formData: FormData) {
  const data = {
    nama: formData.get("nama") as string,
    jabatan: formData.get("jabatan") as string,
    kontak: formData.get("kontak") as string || null,
    tugasPokok: formData.get("tugasPokok") as string || null,
    periodeMulai: formData.get("periodeMulai") as string,
    periodeSelesai: formData.get("periodeSelesai") as string,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = PengurusSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data tidak valid", issues: parsed.error.issues };
  }

  await prisma.pengurus.update({
    where: { id },
    data: {
      nama: parsed.data.nama,
      jabatan: parsed.data.jabatan,
      kontak: parsed.data.kontak || null,
      tugasPokok: parsed.data.tugasPokok || null,
      periodeMulai: new Date(parsed.data.periodeMulai),
      periodeSelesai: new Date(parsed.data.periodeSelesai),
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/pengurus");
  return { success: true };
}

export async function deletePengurus(id: string) {
  await prisma.pengurus.delete({ where: { id } });
  revalidatePath("/pengurus");
  return { success: true };
}

export async function createPengawas(formData: FormData) {
  const data = {
    nama: formData.get("nama") as string,
    jabatan: formData.get("jabatan") as string,
    kontak: formData.get("kontak") as string || null,
    tugasPokok: formData.get("tugasPokok") as string || null,
    periodeMulai: formData.get("periodeMulai") as string,
    periodeSelesai: formData.get("periodeSelesai") as string,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = PengurusSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data tidak valid", issues: parsed.error.issues };
  }

  await prisma.pengawas.create({
    data: {
      nama: parsed.data.nama,
      jabatan: parsed.data.jabatan,
      kontak: parsed.data.kontak || null,
      tugasPokok: parsed.data.tugasPokok || null,
      periodeMulai: new Date(parsed.data.periodeMulai),
      periodeSelesai: new Date(parsed.data.periodeSelesai),
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/pengurus");
  return { success: true };
}

export async function updatePengawas(id: string, formData: FormData) {
  const data = {
    nama: formData.get("nama") as string,
    jabatan: formData.get("jabatan") as string,
    kontak: formData.get("kontak") as string || null,
    tugasPokok: formData.get("tugasPokok") as string || null,
    periodeMulai: formData.get("periodeMulai") as string,
    periodeSelesai: formData.get("periodeSelesai") as string,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = PengurusSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data tidak valid", issues: parsed.error.issues };
  }

  await prisma.pengawas.update({
    where: { id },
    data: {
      nama: parsed.data.nama,
      jabatan: parsed.data.jabatan,
      kontak: parsed.data.kontak || null,
      tugasPokok: parsed.data.tugasPokok || null,
      periodeMulai: new Date(parsed.data.periodeMulai),
      periodeSelesai: new Date(parsed.data.periodeSelesai),
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/pengurus");
  return { success: true };
}

export async function deletePengawas(id: string) {
  await prisma.pengawas.delete({ where: { id } });
  revalidatePath("/pengurus");
  return { success: true };
}

const KaryawanSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  jabatan: z.string().min(1, "Jabatan wajib diisi"),
  unitKerja: z.string().optional(),
  nik: z.string().optional(),
  noTelepon: z.string().optional(),
  alamat: z.string().optional(),
  gajiPokok: z.string().optional(),
  tanggalMasuk: z.string().min(1, "Tanggal masuk wajib diisi"),
  isActive: z.boolean().default(true),
});

export async function createKaryawan(formData: FormData) {
  const data = {
    nama: formData.get("nama") as string,
    jabatan: formData.get("jabatan") as string,
    unitKerja: formData.get("unitKerja") as string || null,
    nik: formData.get("nik") as string || null,
    noTelepon: formData.get("noTelepon") as string || null,
    alamat: formData.get("alamat") as string || null,
    gajiPokok: formData.get("gajiPokok") as string || null,
    tanggalMasuk: formData.get("tanggalMasuk") as string,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = KaryawanSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data tidak valid", issues: parsed.error.issues };
  }

  await prisma.karyawan.create({
    data: {
      nama: parsed.data.nama,
      jabatan: parsed.data.jabatan,
      unitKerja: parsed.data.unitKerja || null,
      nik: parsed.data.nik || null,
      noTelepon: parsed.data.noTelepon || null,
      alamat: parsed.data.alamat || null,
      gajiPokok: parsed.data.gajiPokok ? parseFloat(parsed.data.gajiPokok) : null,
      tanggalMasuk: new Date(parsed.data.tanggalMasuk),
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/pengurus");
  return { success: true };
}

export async function updateKaryawan(id: string, formData: FormData) {
  const data = {
    nama: formData.get("nama") as string,
    jabatan: formData.get("jabatan") as string,
    unitKerja: formData.get("unitKerja") as string || null,
    nik: formData.get("nik") as string || null,
    noTelepon: formData.get("noTelepon") as string || null,
    alamat: formData.get("alamat") as string || null,
    gajiPokok: formData.get("gajiPokok") as string || null,
    tanggalMasuk: formData.get("tanggalMasuk") as string,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = KaryawanSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data tidak valid", issues: parsed.error.issues };
  }

  await prisma.karyawan.update({
    where: { id },
    data: {
      nama: parsed.data.nama,
      jabatan: parsed.data.jabatan,
      unitKerja: parsed.data.unitKerja || null,
      nik: parsed.data.nik || null,
      noTelepon: parsed.data.noTelepon || null,
      alamat: parsed.data.alamat || null,
      gajiPokok: parsed.data.gajiPokok ? parseFloat(parsed.data.gajiPokok) : null,
      tanggalMasuk: new Date(parsed.data.tanggalMasuk),
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/pengurus");
  return { success: true };
}

export async function deleteKaryawan(id: string) {
  await prisma.karyawan.delete({ where: { id } });
  revalidatePath("/pengurus");
  return { success: true };
}
