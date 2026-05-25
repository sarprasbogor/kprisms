"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPinjaman } from "@/actions/pinjaman";
import { formatRupiah } from "@/lib/utils";
import { ArrowLeft, Search } from "lucide-react";

interface AnggotaRef {
  id: string;
  namaLengkap: string;
  nikop: string;
}

interface JenisPinjamanRef {
  id: string;
  nama: string;
  deskripsi: string | null;
  bungaFlat: number;
  bungaEfektif: number;
  maksimal: number | null;
}

interface Props {
  anggota: AnggotaRef[];
  jenisPinjaman: JenisPinjamanRef[];
}

export default function BaruClient({ anggota, jenisPinjaman }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchAnggota, setSearchAnggota] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [jangkaWaktu, setJangkaWaktu] = useState("");

  const filteredAnggota = anggota.filter(
    (a) =>
      a.namaLengkap.toLowerCase().includes(searchAnggota.toLowerCase()) ||
      a.nikop.toLowerCase().includes(searchAnggota.toLowerCase())
  );

  const selectedJenisData = jenisPinjaman.find((j) => j.id === selectedJenis);

  const angsuranPerBulan = useMemo(() => {
    const jml = parseFloat(jumlah);
    const jk = parseInt(jangkaWaktu);
    const bunga = selectedJenisData?.bungaFlat || 0;
    if (!jml || !jk || jk <= 0) return 0;
    const pokok = jml / jk;
    const bungaVal = (jml * bunga) / 100;
    return Math.round((pokok + bungaVal) * 100) / 100;
  }, [jumlah, jangkaWaktu, selectedJenisData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      await createPinjaman(form);
      toast.success("Pengajuan pinjaman berhasil dikirim");
      router.push("/pinjaman");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengajukan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pinjaman">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pengajuan Pinjaman Baru
          </h1>
          <p className="text-gray-500 text-sm">
            Ajukan pinjaman baru untuk anggota
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Form Pengajuan Pinjaman</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anggotaId">Anggota</Label>
              <div className="relative mb-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari anggota..."
                  className="pl-8 h-9"
                  value={searchAnggota}
                  onChange={(e) => setSearchAnggota(e.target.value)}
                />
              </div>
              <select
                id="anggotaId"
                name="anggotaId"
                required
                size={4}
                className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
              >
                {filteredAnggota.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.namaLengkap} ({a.nikop})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenisPinjamanId">Jenis Pinjaman</Label>
              <select
                id="jenisPinjamanId"
                name="jenisPinjamanId"
                required
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value)}
                className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
              >
                <option value="">Pilih Jenis Pinjaman</option>
                {jenisPinjaman.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nama}
                  </option>
                ))}
              </select>
              {selectedJenisData && (
                <div className="text-xs text-gray-500 space-y-1 mt-1 bg-gray-50 p-2 rounded">
                  <p>{selectedJenisData.deskripsi}</p>
                  <p>
                    Bunga: Flat {selectedJenisData.bungaFlat}% | Efektif{" "}
                    {selectedJenisData.bungaEfektif}%
                  </p>
                  {selectedJenisData.maksimal && (
                    <p>Maksimal: {formatRupiah(selectedJenisData.maksimal)}</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jumlah">Jumlah Pinjaman (Rp)</Label>
                <Input
                  id="jumlah"
                  name="jumlah"
                  type="number"
                  required
                  min={1}
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  placeholder="10000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jangkaWaktu">Jangka Waktu (bulan)</Label>
                <Input
                  id="jangkaWaktu"
                  name="jangkaWaktu"
                  type="number"
                  required
                  min={1}
                  value={jangkaWaktu}
                  onChange={(e) => setJangkaWaktu(e.target.value)}
                  placeholder="12"
                />
              </div>
            </div>

            {jumlah && jangkaWaktu && selectedJenisData && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-1">
                <p className="text-sm font-medium text-green-800">
                  Estimasi Angsuran
                </p>
                <p className="text-sm text-green-700">
                  Pokok: {formatRupiah(parseFloat(jumlah) / parseInt(jangkaWaktu))}
                </p>
                <p className="text-sm text-green-700">
                  Bunga (Flat {selectedJenisData.bungaFlat}%):{" "}
                  {formatRupiah(
                    (parseFloat(jumlah) * selectedJenisData.bungaFlat) / 100
                  )}
                </p>
                <p className="text-sm font-bold text-green-800">
                  Per Bulan: {formatRupiah(angsuranPerBulan)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tujuan">Tujuan Pinjaman</Label>
              <textarea
                id="tujuan"
                name="tujuan"
                rows={3}
                className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
                placeholder="Biaya pendidikan, renovasi rumah, dll."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dokumenPendukung">
                Dokumen Pendukung (URL/nama file)
              </Label>
              <Input
                id="dokumenPendukung"
                name="dokumenPendukung"
                placeholder="Contoh: scan_ktp.pdf, slip_gaji.jpg"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Link href="/pinjaman">
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Mengirim..." : "Ajukan Pinjaman"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
