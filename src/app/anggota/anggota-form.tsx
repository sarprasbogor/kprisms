"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { createAnggota, updateAnggota } from "./actions";

const formSchema = z.object({
  nik: z.string().min(1, "NIK wajib diisi"),
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenisKelamin: z.enum(["LAKI_LAKI", "PEREMPUAN"]),
  statusPernikahan: z.string().optional(),
  alamatJalan: z.string().min(1, "Alamat wajib diisi"),
  rtRw: z.string().optional(),
  kelurahan: z.string().min(1, "Kelurahan wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  kota: z.string().min(1, "Kota wajib diisi"),
  provinsi: z.string().min(1, "Provinsi wajib diisi"),
  kodePos: z.string().optional(),
  nomorHp: z.string().min(1, "No. HP wajib diisi"),
  email: z.string().optional(),
  unitKerja: z.string().min(1, "Unit kerja wajib diisi"),
  jabatan: z.string().optional(),
  statusKepegawaian: z.enum(["PNS", "PPPK", "KONTRAK", "HONORER"]),
  nip: z.string().optional(),
  golonganRuang: z.string().optional(),
  masaKerjaTahun: z.any().optional(),
  tmtPns: z.string().optional(),
  tmtJabatan: z.string().optional(),
  tanggalPensiun: z.string().optional(),
  nomorIndukNonPns: z.string().optional(),
  jenisNonPns: z.string().optional(),
  tanggalMulaiKontrak: z.string().optional(),
  tanggalBerakhirKontrak: z.string().optional(),
  penghasilanTetap: z.string().optional(),
  tanggalDaftar: z.string().min(1, "Tanggal daftar wajib diisi"),
  statusKeanggotaan: z.enum(["CALON", "AKTIF", "NONAKTIF", "MENINGGAL", "DIBERHENTIKAN"]),
  tanggalAktif: z.string().optional(),
  tanggalNonaktif: z.string().optional(),
  alasanNonaktif: z.string().optional(),
  tanggalMeninggal: z.string().optional(),
  namaAhliWaris: z.string().optional(),
  hubunganAhliWaris: z.string().optional(),
  hpAhliWaris: z.string().optional(),
  nomorRekening: z.string().optional(),
  namaBank: z.string().optional(),
  fotoUrl: z.string().optional(),
  fotoKtpUrl: z.string().optional(),
  suratKeteranganUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AnggotaFormProps {
  initialData?: (FormValues & { id: string }) | null;
}

export default function AnggotaForm({ initialData }: AnggotaFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      statusKeanggotaan: "CALON",
      statusKepegawaian: "PNS",
      jenisKelamin: "LAKI_LAKI",
    },
  });

  const watchedStatusKepegawaian = watch("statusKepegawaian");

  async function onSubmit(data: FormValues) {
    const result = isEdit
      ? await updateAnggota(initialData!.id, data)
      : await createAnggota(data);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Anggota berhasil diperbarui" : "Anggota berhasil ditambahkan");
      router.push("/anggota");
      router.refresh();
    }
  }

  const inputClass = "flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/anggota">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Anggota" : "Tambah Anggota Baru"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEdit ? "Perbarui data anggota" : "Isi formulir untuk mendaftarkan anggota baru"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identitas Diri</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="nik">NIK</Label>
              <Input id="nik" {...register("nik")} placeholder="Nomor Induk Kependudukan" />
              {errors.nik && <p className={errorClass}>{errors.nik.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaLengkap">Nama Lengkap</Label>
              <Input id="namaLengkap" {...register("namaLengkap")} placeholder="Nama sesuai KTP" />
              {errors.namaLengkap && <p className={errorClass}>{errors.namaLengkap.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tempatLahir">Tempat Lahir</Label>
              <Input id="tempatLahir" {...register("tempatLahir")} />
              {errors.tempatLahir && <p className={errorClass}>{errors.tempatLahir.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
              <Input id="tanggalLahir" type="date" {...register("tanggalLahir")} />
              {errors.tanggalLahir && <p className={errorClass}>{errors.tanggalLahir.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
              <select id="jenisKelamin" className={inputClass} {...register("jenisKelamin")}>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusPernikahan">Status Pernikahan</Label>
              <select id="statusPernikahan" className={inputClass} {...register("statusPernikahan")}>
                <option value="">Pilih</option>
                <option value="BELUM_MENIKAH">Belum Menikah</option>
                <option value="MENIKAH">Menikah</option>
                <option value="CERAI_HIDUP">Cerai Hidup</option>
                <option value="CERAI_MATI">Cerai Mati</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alamat</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="alamatJalan">Alamat Jalan</Label>
              <Input id="alamatJalan" {...register("alamatJalan")} placeholder="Nama jalan, gang, no. rumah" />
              {errors.alamatJalan && <p className={errorClass}>{errors.alamatJalan.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rtRw">RT / RW</Label>
              <Input id="rtRw" {...register("rtRw")} placeholder="001/002" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kelurahan">Kelurahan</Label>
              <Input id="kelurahan" {...register("kelurahan")} />
              {errors.kelurahan && <p className={errorClass}>{errors.kelurahan.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kecamatan">Kecamatan</Label>
              <Input id="kecamatan" {...register("kecamatan")} />
              {errors.kecamatan && <p className={errorClass}>{errors.kecamatan.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kota">Kota</Label>
              <Input id="kota" {...register("kota")} />
              {errors.kota && <p className={errorClass}>{errors.kota.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="provinsi">Provinsi</Label>
              <Input id="provinsi" {...register("provinsi")} />
              {errors.provinsi && <p className={errorClass}>{errors.provinsi.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kodePos">Kode Pos</Label>
              <Input id="kodePos" {...register("kodePos")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kontak</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomorHp">No. HP</Label>
              <Input id="nomorHp" {...register("nomorHp")} placeholder="08xxxxxxxxxx" />
              {errors.nomorHp && <p className={errorClass}>{errors.nomorHp.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="email@example.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Kepegawaian</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="unitKerja">Unit Kerja</Label>
              <Input id="unitKerja" {...register("unitKerja")} placeholder="Dinas Kesehatan / Puskesmas ..." />
              {errors.unitKerja && <p className={errorClass}>{errors.unitKerja.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input id="jabatan" {...register("jabatan")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusKepegawaian">Status Kepegawaian</Label>
              <select id="statusKepegawaian" className={inputClass} {...register("statusKepegawaian")}>
                <option value="">Pilih</option>
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="KONTRAK">Kontrak</option>
                <option value="HONORER">Honorer</option>
              </select>
              {errors.statusKepegawaian && <p className={errorClass}>{errors.statusKepegawaian.message}</p>}
            </div>
          </CardContent>
        </Card>

        {watchedStatusKepegawaian === "PNS" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data PNS</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <Input id="nip" {...register("nip")} placeholder="Nomor Induk Pegawai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="golonganRuang">Golongan Ruang</Label>
                <Input id="golonganRuang" {...register("golonganRuang")} placeholder="III/a, III/b, dll" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="masaKerjaTahun">Masa Kerja (tahun)</Label>
                <Input id="masaKerjaTahun" type="number" {...register("masaKerjaTahun", { setValueAs: (v) => (v === "" ? null : Number(v)) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tmtPns">TMT PNS</Label>
                <Input id="tmtPns" type="date" {...register("tmtPns")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tmtJabatan">TMT Jabatan</Label>
                <Input id="tmtJabatan" type="date" {...register("tmtJabatan")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalPensiun">Tanggal Pensiun</Label>
                <Input id="tanggalPensiun" type="date" {...register("tanggalPensiun")} />
              </div>
            </CardContent>
          </Card>
        )}

        {watchedStatusKepegawaian !== "PNS" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Non-PNS</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nomorIndukNonPns">Nomor Induk Non-PNS</Label>
                <Input id="nomorIndukNonPns" {...register("nomorIndukNonPns")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenisNonPns">Jenis Non-PNS</Label>
                <Input id="jenisNonPns" {...register("jenisNonPns")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalMulaiKontrak">Tanggal Mulai Kontrak</Label>
                <Input id="tanggalMulaiKontrak" type="date" {...register("tanggalMulaiKontrak")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalBerakhirKontrak">Tanggal Berakhir Kontrak</Label>
                <Input id="tanggalBerakhirKontrak" type="date" {...register("tanggalBerakhirKontrak")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="penghasilanTetap">Penghasilan Tetap</Label>
                <Input id="penghasilanTetap" {...register("penghasilanTetap")} />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Keanggotaan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tanggalDaftar">Tanggal Daftar</Label>
              <Input id="tanggalDaftar" type="date" {...register("tanggalDaftar")} />
              {errors.tanggalDaftar && <p className={errorClass}>{errors.tanggalDaftar.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusKeanggotaan">Status Keanggotaan</Label>
              <select id="statusKeanggotaan" className={inputClass} {...register("statusKeanggotaan")}>
                <option value="CALON">Calon</option>
                <option value="AKTIF">Aktif</option>
                <option value="NONAKTIF">Nonaktif</option>
                <option value="MENINGGAL">Meninggal</option>
                <option value="DIBERHENTIKAN">Diberhentikan</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalAktif">Tanggal Aktif</Label>
              <Input id="tanggalAktif" type="date" {...register("tanggalAktif")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalNonaktif">Tanggal Nonaktif</Label>
              <Input id="tanggalNonaktif" type="date" {...register("tanggalNonaktif")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="alasanNonaktif">Alasan Nonaktif</Label>
              <Input id="alasanNonaktif" {...register("alasanNonaktif")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ahli Waris</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="namaAhliWaris">Nama Ahli Waris</Label>
              <Input id="namaAhliWaris" {...register("namaAhliWaris")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hubunganAhliWaris">Hubungan</Label>
              <Input id="hubunganAhliWaris" {...register("hubunganAhliWaris")} placeholder="Suami/Istri/Anak" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hpAhliWaris">No. HP Ahli Waris</Label>
              <Input id="hpAhliWaris" {...register("hpAhliWaris")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rekening</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomorRekening">Nomor Rekening</Label>
              <Input id="nomorRekening" {...register("nomorRekening")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaBank">Nama Bank</Label>
              <Input id="namaBank" {...register("namaBank")} placeholder="BRI / BNI / Mandiri / dll" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dokumen (Lokasi File)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fotoUrl">Foto</Label>
              <Input id="fotoUrl" {...register("fotoUrl")} placeholder="/uploads/pas/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fotoKtpUrl">Foto KTP</Label>
              <Input id="fotoKtpUrl" {...register("fotoKtpUrl")} placeholder="/uploads/ktp/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suratKeteranganUrl">Surat Keterangan</Label>
              <Input id="suratKeteranganUrl" {...register("suratKeteranganUrl")} placeholder="/uploads/sk/..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/anggota">
            <Button type="button" variant="outline">Batal</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-4 h-4 mr-1" /> {isEdit ? "Simpan Perubahan" : "Simpan"}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
