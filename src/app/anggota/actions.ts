"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateNikop } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const anggotaSchema = z.object({
  nik: z.string().min(1, "NIK wajib diisi"),
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenisKelamin: z.enum(["LAKI_LAKI", "PEREMPUAN"]),
  statusPernikahan: z.string().optional().nullable(),
  alamatJalan: z.string().min(1, "Alamat wajib diisi"),
  rtRw: z.string().optional().nullable(),
  kelurahan: z.string().min(1, "Kelurahan wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  kota: z.string().min(1, "Kota wajib diisi"),
  provinsi: z.string().min(1, "Provinsi wajib diisi"),
  kodePos: z.string().optional().nullable(),
  nomorHp: z.string().min(1, "No. HP wajib diisi"),
  email: z.string().optional().nullable(),
  unitKerja: z.string().min(1, "Unit kerja wajib diisi"),
  jabatan: z.string().optional().nullable(),
  golonganRuang: z.string().optional().nullable(),
  masaKerjaTahun: z.any().optional().nullable(),
  tanggalDaftar: z.string().min(1, "Tanggal daftar wajib diisi"),
  statusKeanggotaan: z.enum(["CALON", "AKTIF", "NONAKTIF", "MENINGGAL", "DIBERHENTIKAN"]),
  statusKepegawaian: z.enum(["PNS", "PPPK", "KONTRAK", "HONORER"]),
  nip: z.string().optional().nullable(),
  tmtPns: z.string().optional().nullable(),
  tmtJabatan: z.string().optional().nullable(),
  nomorIndukNonPns: z.string().optional().nullable(),
  jenisNonPns: z.string().optional().nullable(),
  tanggalMulaiKontrak: z.string().optional().nullable(),
  tanggalBerakhirKontrak: z.string().optional().nullable(),
  penghasilanTetap: z.any().optional().nullable(),
  tanggalAktif: z.string().optional().nullable(),
  tanggalNonaktif: z.string().optional().nullable(),
  alasanNonaktif: z.string().optional().nullable(),
  tanggalPensiun: z.string().optional().nullable(),
  tanggalMeninggal: z.string().optional().nullable(),
  namaAhliWaris: z.string().optional().nullable(),
  hubunganAhliWaris: z.string().optional().nullable(),
  hpAhliWaris: z.string().optional().nullable(),
  nomorRekening: z.string().optional().nullable(),
  namaBank: z.string().optional().nullable(),
  fotoUrl: z.string().optional().nullable(),
  fotoKtpUrl: z.string().optional().nullable(),
  suratKeteranganUrl: z.string().optional().nullable(),
});

export type AnggotaFormValues = z.infer<typeof anggotaSchema>;

function cleanVal(v: unknown) {
  if (v === "" || v === undefined || v === null) return null;
  return v;
}

export async function getAnggotaById(id: string) {
  const session = await auth();
  if (!session) return null;

  const anggota = await prisma.anggota.findUnique({
    where: { id },
    include: {
      simpananPokok: { orderBy: { tanggalBayar: "desc" } },
      simpananWajib: { orderBy: [{ tahun: "desc" }, { bulan: "desc" }] },
      simpananSukarela: { orderBy: { tanggal: "desc" } },
      pinjaman: {
        include: { jenisPinjaman: true, angsuran: { orderBy: { angsuranKe: "asc" } } },
        orderBy: { tanggalPengajuan: "desc" },
      },
    },
  });

  return anggota;
}

export async function createAnggota(data: AnggotaFormValues) {
  const session = await auth();
  if (!session) return { error: "Sesi tidak valid. Silakan login ulang." };

  const parsed = anggotaSchema.safeParse(data);
  if (!parsed.success) return { error: "Data tidak valid. Periksa kembali input Anda." };

  const f = parsed.data;
  const count = await prisma.anggota.count();
  const noInduk = generateNikop(new Date().getFullYear(), count + 1);

  try {
    await prisma.anggota.create({
      data: {
        nik: f.nik,
        namaLengkap: f.namaLengkap,
        nikop: noInduk,
        tempatLahir: f.tempatLahir,
        tanggalLahir: new Date(f.tanggalLahir),
        jenisKelamin: f.jenisKelamin as any,
        statusPernikahan: cleanVal(f.statusPernikahan) as any,
        alamatJalan: f.alamatJalan,
        rtRw: cleanVal(f.rtRw) as string | null,
        kelurahan: f.kelurahan,
        kecamatan: f.kecamatan,
        kota: f.kota,
        provinsi: f.provinsi,
        kodePos: cleanVal(f.kodePos) as string | null,
        nomorHp: f.nomorHp,
        email: cleanVal(f.email) as string | null,
        unitKerja: f.unitKerja,
        jabatan: cleanVal(f.jabatan) as string | null,
        golonganRuang: cleanVal(f.golonganRuang) as string | null,
        masaKerjaTahun: f.masaKerjaTahun ? Number(f.masaKerjaTahun) : null,
        tanggalDaftar: new Date(f.tanggalDaftar),
        statusKeanggotaan: f.statusKeanggotaan as any,
        statusKepegawaian: f.statusKepegawaian as any,
        nip: cleanVal(f.nip) as string | null,
        tmtPns: f.tmtPns ? new Date(f.tmtPns) : null,
        tmtJabatan: f.tmtJabatan ? new Date(f.tmtJabatan) : null,
        nomorIndukNonPns: cleanVal(f.nomorIndukNonPns) as string | null,
        jenisNonPns: cleanVal(f.jenisNonPns) as string | null,
        tanggalMulaiKontrak: f.tanggalMulaiKontrak ? new Date(f.tanggalMulaiKontrak) : null,
        tanggalBerakhirKontrak: f.tanggalBerakhirKontrak ? new Date(f.tanggalBerakhirKontrak) : null,
        penghasilanTetap: f.penghasilanTetap ? Number(f.penghasilanTetap) : null,
        tanggalAktif: f.tanggalAktif ? new Date(f.tanggalAktif) : null,
        tanggalNonaktif: f.tanggalNonaktif ? new Date(f.tanggalNonaktif) : null,
        alasanNonaktif: cleanVal(f.alasanNonaktif) as string | null,
        tanggalPensiun: f.tanggalPensiun ? new Date(f.tanggalPensiun) : null,
        tanggalMeninggal: f.tanggalMeninggal ? new Date(f.tanggalMeninggal) : null,
        namaAhliWaris: cleanVal(f.namaAhliWaris) as string | null,
        hubunganAhliWaris: cleanVal(f.hubunganAhliWaris) as string | null,
        hpAhliWaris: cleanVal(f.hpAhliWaris) as string | null,
        nomorRekening: cleanVal(f.nomorRekening) as string | null,
        namaBank: cleanVal(f.namaBank) as string | null,
        fotoUrl: cleanVal(f.fotoUrl) as string | null,
        fotoKtpUrl: cleanVal(f.fotoKtpUrl) as string | null,
        suratKeteranganUrl: cleanVal(f.suratKeteranganUrl) as string | null,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      const target = error.meta?.target as string[] | undefined;
      if (target?.includes("nik")) return { error: "NIK sudah terdaftar." };
      if (target?.includes("nomorHp")) return { error: "No. HP sudah terdaftar." };
      return { error: "Data sudah terdaftar." };
    }
    return { error: "Gagal menyimpan data anggota." };
  }

  revalidatePath("/anggota");
  return { success: true };
}

export async function updateAnggota(id: string, data: AnggotaFormValues) {
  const session = await auth();
  if (!session) return { error: "Sesi tidak valid. Silakan login ulang." };

  const parsed = anggotaSchema.safeParse(data);
  if (!parsed.success) return { error: "Data tidak valid. Periksa kembali input Anda." };

  const f = parsed.data;

  try {
    await prisma.anggota.update({
      where: { id },
      data: {
        nik: f.nik,
        namaLengkap: f.namaLengkap,
        tempatLahir: f.tempatLahir,
        tanggalLahir: new Date(f.tanggalLahir),
        jenisKelamin: f.jenisKelamin as any,
        statusPernikahan: cleanVal(f.statusPernikahan) as any,
        alamatJalan: f.alamatJalan,
        rtRw: cleanVal(f.rtRw) as string | null,
        kelurahan: f.kelurahan,
        kecamatan: f.kecamatan,
        kota: f.kota,
        provinsi: f.provinsi,
        kodePos: cleanVal(f.kodePos) as string | null,
        nomorHp: f.nomorHp,
        email: cleanVal(f.email) as string | null,
        unitKerja: f.unitKerja,
        jabatan: cleanVal(f.jabatan) as string | null,
        golonganRuang: cleanVal(f.golonganRuang) as string | null,
        masaKerjaTahun: f.masaKerjaTahun ? Number(f.masaKerjaTahun) : null,
        tanggalDaftar: new Date(f.tanggalDaftar),
        statusKeanggotaan: f.statusKeanggotaan as any,
        statusKepegawaian: f.statusKepegawaian as any,
        nip: cleanVal(f.nip) as string | null,
        tmtPns: f.tmtPns ? new Date(f.tmtPns) : null,
        tmtJabatan: f.tmtJabatan ? new Date(f.tmtJabatan) : null,
        nomorIndukNonPns: cleanVal(f.nomorIndukNonPns) as string | null,
        jenisNonPns: cleanVal(f.jenisNonPns) as string | null,
        tanggalMulaiKontrak: f.tanggalMulaiKontrak ? new Date(f.tanggalMulaiKontrak) : null,
        tanggalBerakhirKontrak: f.tanggalBerakhirKontrak ? new Date(f.tanggalBerakhirKontrak) : null,
        penghasilanTetap: f.penghasilanTetap ? Number(f.penghasilanTetap) : null,
        tanggalAktif: f.tanggalAktif ? new Date(f.tanggalAktif) : null,
        tanggalNonaktif: f.tanggalNonaktif ? new Date(f.tanggalNonaktif) : null,
        alasanNonaktif: cleanVal(f.alasanNonaktif) as string | null,
        tanggalPensiun: f.tanggalPensiun ? new Date(f.tanggalPensiun) : null,
        tanggalMeninggal: f.tanggalMeninggal ? new Date(f.tanggalMeninggal) : null,
        namaAhliWaris: cleanVal(f.namaAhliWaris) as string | null,
        hubunganAhliWaris: cleanVal(f.hubunganAhliWaris) as string | null,
        hpAhliWaris: cleanVal(f.hpAhliWaris) as string | null,
        nomorRekening: cleanVal(f.nomorRekening) as string | null,
        namaBank: cleanVal(f.namaBank) as string | null,
        fotoUrl: cleanVal(f.fotoUrl) as string | null,
        fotoKtpUrl: cleanVal(f.fotoKtpUrl) as string | null,
        suratKeteranganUrl: cleanVal(f.suratKeteranganUrl) as string | null,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2025") return { error: "Anggota tidak ditemukan." };
    if (error?.code === "P2002") {
      const target = error.meta?.target as string[] | undefined;
      if (target?.includes("nik")) return { error: "NIK sudah terdaftar." };
      if (target?.includes("nomorHp")) return { error: "No. HP sudah terdaftar." };
      return { error: "Data sudah terdaftar." };
    }
    return { error: "Gagal memperbarui data anggota." };
  }

  revalidatePath("/anggota");
  revalidatePath(`/anggota/${id}`);
  return { success: true };
}

export async function getUnitKerjaList() {
  const session = await auth();
  if (!session) return [];
  const result = await prisma.anggota.findMany({
    select: { unitKerja: true },
    distinct: ["unitKerja"],
    orderBy: { unitKerja: "asc" },
  });
  return result.map((r) => r.unitKerja);
}
