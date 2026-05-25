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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSimpananWajib } from "@/actions/simpanan";
import { ArrowLeft } from "lucide-react";

interface AnggotaRef {
  id: string;
  namaLengkap: string;
  nikop: string;
}

interface Props {
  anggota: AnggotaRef[];
}

const months = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

export default function WajibClient({ anggota }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      await createSimpananWajib(form);
      toast.success("Simpanan Wajib berhasil ditambahkan");
      router.push("/simpanan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/simpanan">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Simpanan Wajib
          </h1>
          <p className="text-gray-500 text-sm">
            Tambah pembayaran simpanan wajib anggota
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Form Simpanan Wajib</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anggotaId">Anggota</Label>
              <select
                id="anggotaId"
                name="anggotaId"
                required
                className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
              >
                <option value="">Pilih Anggota</option>
                {anggota.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.namaLengkap} ({a.nikop})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulan">Bulan</Label>
                <select
                  id="bulan"
                  name="bulan"
                  required
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
                >
                  <option value="">Pilih Bulan</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahun">Tahun</Label>
                <select
                  id="tahun"
                  name="tahun"
                  required
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
                >
                  <option value="">Pilih Tahun</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah (Rp)</Label>
              <Input
                id="jumlah"
                name="jumlah"
                type="number"
                min={0}
                defaultValue={100000}
                placeholder="100000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="denda">Denda (Rp)</Label>
              <Input
                id="denda"
                name="denda"
                type="number"
                min={0}
                defaultValue={0}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalBayar">Tanggal Bayar</Label>
              <Input
                id="tanggalBayar"
                name="tanggalBayar"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <textarea
                id="keterangan"
                name="keterangan"
                rows={3}
                className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Link href="/simpanan">
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
