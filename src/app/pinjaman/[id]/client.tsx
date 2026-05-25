"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/utils";
import { updateStatusPinjaman, createAngsuran } from "@/actions/pinjaman";
import { ArrowLeft, CheckCircle2, XCircle, HandCoins } from "lucide-react";

interface AngsuranItem {
  id: string;
  angsuranKe: number;
  tanggalJatuhTempo: string;
  tanggalBayar: string | null;
  jumlahPokok: number;
  jumlahBunga: number;
  denda: number;
  statusLunas: boolean;
  keterangan: string | null;
}

interface PinjamanDetail {
  id: string;
  anggota: { id: string; namaLengkap: string; nikop: string };
  jenisPinjaman: { id: string; nama: string; deskripsi: string | null; bungaFlat: number; maksimal: number | null };
  jumlah: number;
  jangkaWaktu: number;
  bunga: number;
  angsuranPerBulan: number;
  tujuan: string | null;
  dokumenPendukung: string | null;
  status: string;
  catatan: string | null;
  tanggalPengajuan: string;
  tanggalCair: string | null;
  buktiTransfer: string | null;
  angsuran: AngsuranItem[];
}

interface Props {
  pinjaman: PinjamanDetail;
  userRole: string;
}

const statusColor: Record<string, "warning" | "info" | "success" | "default" | "danger"> = {
  DIAJUKAN: "warning",
  DIVERIFIKASI: "info",
  DISETUJUI: "success",
  CAIR: "default",
  LUNAS: "success",
  BERMASALAH: "danger",
};

const canApprove = (role: string) =>
  role === "BENDAHARA" || role === "PENGURUS" || role === "SUPER_ADMIN";

export default function DetailClient({ pinjaman, userRole }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [catatan, setCatatan] = useState(pinjaman.catatan || "");

  async function handleUpdateStatus(status: string) {
    setLoading(status);
    try {
      await updateStatusPinjaman(pinjaman.id, status, catatan);
      toast.success(`Status berhasil diubah ke ${status}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal update status");
    } finally {
      setLoading(null);
    }
  }

  async function handleBayarAngsuran(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading("bayar");
    try {
      const form = new FormData(e.currentTarget);
      await createAngsuran(form);
      toast.success("Pembayaran angsuran berhasil");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal bayar angsuran");
    } finally {
      setLoading(null);
    }
  }

  const anggotaBisaBayar = userRole === "ANGGOTA" || canApprove(userRole);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pinjaman">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Detail Pinjaman
          </h1>
          <p className="text-gray-500 text-sm">
            {pinjaman.anggota.namaLengkap} ({pinjaman.anggota.nikop})
          </p>
        </div>
        <Badge
          variant={statusColor[pinjaman.status] || "outline"}
          className="text-sm px-3 py-1"
        >
          {pinjaman.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pinjaman</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Jenis Pinjaman</span>
              <span className="text-sm font-medium">
                {pinjaman.jenisPinjaman.nama}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Jumlah</span>
              <span className="text-sm font-medium">
                {formatRupiah(pinjaman.jumlah)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Jangka Waktu</span>
              <span className="text-sm font-medium">
                {pinjaman.jangkaWaktu} bulan
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Bunga (Flat)</span>
              <span className="text-sm font-medium">{pinjaman.bunga}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Angsuran per Bulan</span>
              <span className="text-sm font-bold text-green-700">
                {formatRupiah(pinjaman.angsuranPerBulan)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tanggal Pengajuan</span>
              <span className="text-sm font-medium">
                {formatDate(pinjaman.tanggalPengajuan)}
              </span>
            </div>
            {pinjaman.tanggalCair && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tanggal Cair</span>
                <span className="text-sm font-medium">
                  {formatDate(pinjaman.tanggalCair)}
                </span>
              </div>
            )}
            {pinjaman.tujuan && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tujuan</span>
                <span className="text-sm font-medium">{pinjaman.tujuan}</span>
              </div>
            )}
            {pinjaman.dokumenPendukung && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Dokumen</span>
                <span className="text-sm font-medium">
                  {pinjaman.dokumenPendukung}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {canApprove(userRole) && (
          <Card>
            <CardHeader>
              <CardTitle>Aksi Persetujuan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan</Label>
                <textarea
                  id="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {pinjaman.status === "DIAJUKAN" && (
                  <Button
                    onClick={() => handleUpdateStatus("DIVERIFIKASI")}
                    disabled={loading !== null}
                    variant="outline"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Verifikasi
                  </Button>
                )}
                {pinjaman.status === "DIVERIFIKASI" && (
                  <Button
                    onClick={() => handleUpdateStatus("DISETUJUI")}
                    disabled={loading !== null}
                    variant="secondary"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Setujui
                  </Button>
                )}
                {pinjaman.status === "DISETUJUI" && (
                  <Button
                    onClick={() => handleUpdateStatus("CAIR")}
                    disabled={loading !== null}
                  >
                    <HandCoins className="w-4 h-4 mr-1" />
                    Cairkan
                  </Button>
                )}
                {(pinjaman.status === "DIAJUKAN" ||
                  pinjaman.status === "DIVERIFIKASI" ||
                  pinjaman.status === "DISETUJUI" ||
                  pinjaman.status === "CAIR") && (
                  <Button
                    onClick={() => handleUpdateStatus("BERMASALAH")}
                    disabled={loading !== null}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Tandai Bermasalah
                  </Button>
                )}
                {pinjaman.status === "BERMASALAH" && (
                  <Button
                    onClick={() => handleUpdateStatus("CAIR")}
                    disabled={loading !== null}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Aktifkan Kembali
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Angsuran</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ke</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
                <TableHead>Pokok</TableHead>
                <TableHead>Bunga</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Denda</TableHead>
                <TableHead>Tanggal Bayar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pinjaman.angsuran.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.angsuranKe}</TableCell>
                  <TableCell>{formatDate(a.tanggalJatuhTempo)}</TableCell>
                  <TableCell>{formatRupiah(a.jumlahPokok)}</TableCell>
                  <TableCell>{formatRupiah(a.jumlahBunga)}</TableCell>
                  <TableCell>
                    {formatRupiah(a.jumlahPokok + a.jumlahBunga)}
                  </TableCell>
                  <TableCell>
                    {a.denda > 0 ? formatRupiah(a.denda) : "-"}
                  </TableCell>
                  <TableCell>
                    {a.tanggalBayar ? formatDate(a.tanggalBayar) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.statusLunas ? "success" : "warning"}>
                      {a.statusLunas ? "Lunas" : "Belum"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {a.keterangan || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(pinjaman.status === "CAIR" || pinjaman.status === "DISETUJUI") &&
            anggotaBisaBayar && (
              <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold text-sm mb-3">
                  Bayar Angsuran
                </h3>
                <form
                  onSubmit={handleBayarAngsuran}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  <div className="space-y-1">
                    <Label htmlFor="angsuranId">Pilih Angsuran</Label>
                    <select
                      id="angsuranId"
                      name="angsuranId"
                      required
                      className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
                    >
                      <option value="">Pilih</option>
                      {pinjaman.angsuran
                        .filter((a) => !a.statusLunas)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            Angsuran ke-{a.angsuranKe} -{" "}
                            {formatRupiah(a.jumlahPokok + a.jumlahBunga)}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tanggalBayar">Tanggal Bayar</Label>
                    <Input
                      id="tanggalBayar"
                      name="tanggalBayar"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="denda">Denda</Label>
                    <Input
                      id="denda"
                      name="denda"
                      type="number"
                      min={0}
                      defaultValue={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="keterangan">Keterangan</Label>
                    <Input
                      id="keterangan"
                      name="keterangan"
                      placeholder="Opsional"
                    />
                  </div>
                  <div className="col-span-full flex justify-end">
                    <Button type="submit" disabled={loading !== null}>
                      {loading === "bayar" ? "Memproses..." : "Bayar"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
