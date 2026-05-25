import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Pencil,
  User,
  MapPin,
  Phone,
  Briefcase,
  FileText,
  PiggyBank,
  HandCoins,
  Calendar,
} from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnggotaDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const anggota = await prisma.anggota.findUnique({
    where: { id },
    include: {
      simpananPokok: { orderBy: { tanggalBayar: "desc" } },
      simpananWajib: { orderBy: [{ tahun: "desc" }, { bulan: "desc" }] },
      simpananSukarela: { orderBy: { tanggal: "desc" } },
      pinjaman: {
        include: {
          jenisPinjaman: true,
          angsuran: { orderBy: { angsuranKe: "asc" } },
        },
        orderBy: { tanggalPengajuan: "desc" },
      },
    },
  });

  if (!anggota) notFound();

  const totalSimpananPokok = anggota.simpananPokok.reduce((s, p) => s + p.jumlah, 0);
  const totalSimpananWajib = anggota.simpananWajib.reduce((s, w) => s + w.jumlah, 0);
  const totalSimpananSukarela = anggota.simpananSukarela.reduce((s, r) => s + (r.jenis === "SETORAN" ? r.jumlah : -r.jumlah), 0);

  const statusVariant: Record<string, "success" | "warning" | "danger" | "outline" | "info"> = {
    CALON: "warning",
    AKTIF: "success",
    NONAKTIF: "danger",
    MENINGGAL: "danger",
    DIBERHENTIKAN: "outline",
  };

  const pinjamanStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "danger" | "info"> = {
    DIAJUKAN: "warning",
    DIVERIFIKASI: "info",
    DISETUJUI: "info",
    CAIR: "success",
    LUNAS: "default",
    BERMASALAH: "danger",
  };

  const fieldLabel: Record<string, string> = {
    nik: "NIK",
    nikop: "No. Induk Koperasi",
    namaLengkap: "Nama Lengkap",
    tempatLahir: "Tempat Lahir",
    tanggalLahir: "Tanggal Lahir",
    jenisKelamin: "Jenis Kelamin",
    statusPernikahan: "Status Pernikahan",
    nomorHp: "No. HP",
    email: "Email",
    unitKerja: "Unit Kerja",
    jabatan: "Jabatan",
    statusKepegawaian: "Status Kepegawaian",
    nip: "NIP",
    golonganRuang: "Golongan Ruang",
    masaKerjaTahun: "Masa Kerja (tahun)",
    tanggalDaftar: "Tanggal Daftar",
    statusKeanggotaan: "Status",
  };

  function renderField(label: string, value: string | null | undefined) {
    return (
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value || "-"}</p>
      </div>
    );
  }

  function getJKLabel(val: string) {
    return val === "LAKI_LAKI" ? "Laki-laki" : "Perempuan";
  }

  function getStatusPernikahanLabel(val: string | null) {
    if (!val) return "-";
    const labels: Record<string, string> = {
      BELUM_MENIKAH: "Belum Menikah",
      MENIKAH: "Menikah",
      CERAI_HIDUP: "Cerai Hidup",
      CERAI_MATI: "Cerai Mati",
    };
    return labels[val] || val;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/anggota">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{anggota.namaLengkap}</h1>
            <p className="text-gray-500 text-sm">Detail anggota koperasi</p>
          </div>
        </div>
        <Link href={`/anggota/${anggota.id}/edit`}>
          <Button variant="outline">
            <Pencil className="w-4 h-4 mr-1" /> Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" /> Identitas Diri
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-2">
            {renderField(fieldLabel.nik, anggota.nik)}
            {renderField(fieldLabel.nikop, anggota.nikop)}
            {renderField(fieldLabel.namaLengkap, anggota.namaLengkap)}
            {renderField(fieldLabel.tempatLahir, anggota.tempatLahir)}
            {renderField(fieldLabel.tanggalLahir, formatDate(anggota.tanggalLahir))}
            {renderField(fieldLabel.jenisKelamin, getJKLabel(anggota.jenisKelamin))}
            {renderField(fieldLabel.statusPernikahan, getStatusPernikahanLabel(anggota.statusPernikahan))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" /> Alamat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              {anggota.alamatJalan}
              {anggota.rtRw && ` RT/RW ${anggota.rtRw}`}
            </p>
            <p className="text-sm">
              {anggota.kelurahan}, {anggota.kecamatan}, {anggota.kota}
            </p>
            <p className="text-sm">
              {anggota.provinsi}{anggota.kodePos ? ` - ${anggota.kodePos}` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" /> Kontak
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-2">
            {renderField(fieldLabel.nomorHp, anggota.nomorHp)}
            {renderField("Email", anggota.email)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" /> Kepegawaian
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-2">
            {renderField(fieldLabel.statusKepegawaian, anggota.statusKepegawaian)}
            {renderField(fieldLabel.nip, anggota.nip)}
            {renderField(fieldLabel.unitKerja, anggota.unitKerja)}
            {renderField(fieldLabel.jabatan, anggota.jabatan)}
            {renderField(fieldLabel.golonganRuang, anggota.golonganRuang)}
            {renderField(fieldLabel.masaKerjaTahun, anggota.masaKerjaTahun?.toString() || null)}
            {renderField(fieldLabel.tanggalDaftar, formatDate(anggota.tanggalDaftar))}
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <Badge variant={statusVariant[anggota.statusKeanggotaan] || "outline"} className="mt-1">
                {anggota.statusKeanggotaan.charAt(0) + anggota.statusKeanggotaan.slice(1).toLowerCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" /> Dokumen
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {renderField("Foto KTP", anggota.fotoKtpUrl || null)}
          {renderField("Foto", anggota.fotoUrl || null)}
          {renderField("Surat Keterangan", anggota.suratKeteranganUrl || null)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-green-600" /> Riwayat Simpanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">
              Simpanan Pokok (Total: {formatRupiah(totalSimpananPokok)})
            </h3>
            {anggota.simpananPokok.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada data simpanan pokok</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal Bayar</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Cicilan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anggota.simpananPokok.map((sp) => (
                    <TableRow key={sp.id}>
                      <TableCell>{formatDate(sp.tanggalBayar)}</TableCell>
                      <TableCell>{formatRupiah(sp.jumlah)}</TableCell>
                      <TableCell>
                        {sp.cicilanKe && sp.totalCicilan
                          ? `${sp.cicilanKe}/${sp.totalCicilan}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sp.statusLunas ? "success" : "warning"}>
                          {sp.statusLunas ? "Lunas" : "Belum Lunas"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{sp.keterangan || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">
              Simpanan Wajib (Total: {formatRupiah(totalSimpananWajib)})
            </h3>
            {anggota.simpananWajib.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada data simpanan wajib</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Tanggal Bayar</TableHead>
                    <TableHead>Denda</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anggota.simpananWajib.map((sw) => (
                    <TableRow key={sw.id}>
                      <TableCell>{sw.bulan}/{sw.tahun}</TableCell>
                      <TableCell>{formatRupiah(sw.jumlah)}</TableCell>
                      <TableCell>{formatDate(sw.tanggalBayar)}</TableCell>
                      <TableCell>{sw.denda > 0 ? formatRupiah(sw.denda) : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={sw.statusLunas ? "success" : "warning"}>
                          {sw.statusLunas ? "Lunas" : "Belum Lunas"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{sw.keterangan || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">
              Simpanan Sukarela (Saldo: {formatRupiah(totalSimpananSukarela)})
            </h3>
            {anggota.simpananSukarela.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada data simpanan sukarela</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Saldo Setelah</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anggota.simpananSukarela.map((ss) => (
                    <TableRow key={ss.id}>
                      <TableCell>{formatDate(ss.tanggal)}</TableCell>
                      <TableCell>
                        <Badge variant={ss.jenis === "SETORAN" ? "success" : "danger"}>
                          {ss.jenis}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatRupiah(ss.jumlah)}</TableCell>
                      <TableCell>{formatRupiah(ss.saldoSetelah)}</TableCell>
                      <TableCell className="text-xs">{ss.keterangan || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-green-600" /> Riwayat Pinjaman
          </CardTitle>
        </CardHeader>
        <CardContent>
          {anggota.pinjaman.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada data pinjaman</p>
          ) : (
            <div className="space-y-4">
              {anggota.pinjaman.map((p) => {
                const totalAngsuran = p.angsuran.reduce((s, a) => s + a.jumlahPokok + a.jumlahBunga + a.denda, 0);
                const angsuranLunas = p.angsuran.filter((a) => a.statusLunas).length;
                return (
                  <Card key={p.id} className="border border-gray-200">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{p.jenisPinjaman.nama}</p>
                          <p className="text-xs text-gray-500">
                            Pengajuan: {formatDate(p.tanggalPengajuan)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700">{formatRupiah(p.jumlah)}</p>
                          <Badge variant={pinjamanStatusVariant[p.status] || "outline"}>
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Jangka Waktu</p>
                          <p>{p.jangkaWaktu} bulan</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Bunga</p>
                          <p>{p.bunga}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Angsuran/Bulan</p>
                          <p>{formatRupiah(p.angsuranPerBulan)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Angsuran: {angsuranLunas}/{p.angsuran.length} ({angsuranLunas === p.angsuran.length && p.angsuran.length > 0 ? "Lunas" : "Berjalan"})
                        </p>
                        {p.angsuran.length > 0 && (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ke-</TableHead>
                                <TableHead>Jatuh Tempo</TableHead>
                                <TableHead>Bayar</TableHead>
                                <TableHead>Pokok</TableHead>
                                <TableHead>Bunga</TableHead>
                                <TableHead>Denda</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {p.angsuran.map((a) => (
                                <TableRow key={a.id}>
                                  <TableCell>{a.angsuranKe}</TableCell>
                                  <TableCell className="text-xs">{formatDate(a.tanggalJatuhTempo)}</TableCell>
                                  <TableCell className="text-xs">
                                    {a.tanggalBayar ? formatDate(a.tanggalBayar) : "-"}
                                  </TableCell>
                                  <TableCell>{formatRupiah(a.jumlahPokok)}</TableCell>
                                  <TableCell>{formatRupiah(a.jumlahBunga)}</TableCell>
                                  <TableCell>{a.denda > 0 ? formatRupiah(a.denda) : "-"}</TableCell>
                                  <TableCell>
                                    <Badge variant={a.statusLunas ? "success" : "warning"} className="text-xs">
                                      {a.statusLunas ? "Lunas" : "Tertunda"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                      {p.tujuan && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Tujuan:</span> {p.tujuan}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
