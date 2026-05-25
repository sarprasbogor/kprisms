import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AnggotaForm from "../../anggota-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnggotaPage({ params }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const anggota = await prisma.anggota.findUnique({
    where: { id },
  });

  if (!anggota) redirect("/anggota");

  function toDateString(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  const initialData = {
    id: anggota.id,
    nik: anggota.nik,
    nikop: anggota.nikop,
    namaLengkap: anggota.namaLengkap,
    tempatLahir: anggota.tempatLahir,
    tanggalLahir: toDateString(anggota.tanggalLahir),
    jenisKelamin: anggota.jenisKelamin,
    statusPernikahan: anggota.statusPernikahan || "",
    alamatJalan: anggota.alamatJalan,
    rtRw: anggota.rtRw || "",
    kelurahan: anggota.kelurahan,
    kecamatan: anggota.kecamatan,
    kota: anggota.kota,
    provinsi: anggota.provinsi,
    kodePos: anggota.kodePos || "",
    nomorHp: anggota.nomorHp,
    email: anggota.email || "",
    unitKerja: anggota.unitKerja,
    jabatan: anggota.jabatan || "",
    golonganRuang: anggota.golonganRuang || "",
    masaKerjaTahun: anggota.masaKerjaTahun ?? null,
    tanggalDaftar: toDateString(anggota.tanggalDaftar),
    statusKeanggotaan: anggota.statusKeanggotaan,
    fotoKtpUrl: anggota.fotoKtpUrl || "",
    fotoUrl: anggota.fotoUrl || "",
    statusKepegawaian: anggota.statusKepegawaian || "",
    nip: anggota.nip || "",
    tmtPns: anggota.tmtPns ? toDateString(anggota.tmtPns) : "",
    tmtJabatan: anggota.tmtJabatan ? toDateString(anggota.tmtJabatan) : "",
    tanggalPensiun: anggota.tanggalPensiun ? toDateString(anggota.tanggalPensiun) : "",
    nomorIndukNonPns: anggota.nomorIndukNonPns || "",
    jenisNonPns: anggota.jenisNonPns || "",
    tanggalMulaiKontrak: anggota.tanggalMulaiKontrak ? toDateString(anggota.tanggalMulaiKontrak) : "",
    tanggalBerakhirKontrak: anggota.tanggalBerakhirKontrak ? toDateString(anggota.tanggalBerakhirKontrak) : "",
    penghasilanTetap: anggota.penghasilanTetap?.toString() || "",
    tanggalAktif: anggota.tanggalAktif ? toDateString(anggota.tanggalAktif) : "",
    tanggalNonaktif: anggota.tanggalNonaktif ? toDateString(anggota.tanggalNonaktif) : "",
    alasanNonaktif: anggota.alasanNonaktif || "",
    tanggalMeninggal: anggota.tanggalMeninggal ? toDateString(anggota.tanggalMeninggal) : "",
    namaAhliWaris: anggota.namaAhliWaris || "",
    hubunganAhliWaris: anggota.hubunganAhliWaris || "",
    hpAhliWaris: anggota.hpAhliWaris || "",
    nomorRekening: anggota.nomorRekening || "",
    namaBank: anggota.namaBank || "",
    suratKeteranganUrl: anggota.suratKeteranganUrl || "",
  };

  return <AnggotaForm initialData={initialData} />;
}
