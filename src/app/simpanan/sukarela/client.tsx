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
import { createSimpananSukarela } from "@/actions/simpanan";
import { ArrowLeft } from "lucide-react";

interface AnggotaRef {
  id: string;
  namaLengkap: string;
  nikop: string;
}

interface Props {
  anggota: AnggotaRef[];
}

export default function SukarelaClient({ anggota }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jenis, setJenis] = useState("SETORAN");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      await createSimpananSukarela(form);
      toast.success("Simpanan Sukarela berhasil diproses");
      router.push("/simpanan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses");
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
            Simpanan Sukarela
          </h1>
          <p className="text-gray-500 text-sm">
            Setoran atau penarikan simpanan sukarela
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Form Simpanan Sukarela</CardTitle>
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

            <div className="space-y-2">
              <Label>Jenis Transaksi</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="jenis"
                    value="SETORAN"
                    checked={jenis === "SETORAN"}
                    onChange={() => setJenis("SETORAN")}
                    className="text-green-600"
                  />
                  <span className="text-sm">Setoran</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="jenis"
                    value="PENARIKAN"
                    checked={jenis === "PENARIKAN"}
                    onChange={() => setJenis("PENARIKAN")}
                    className="text-red-600"
                  />
                  <span className="text-sm">Penarikan</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlah">
                Jumlah (Rp) - {jenis === "SETORAN" ? "Setoran" : "Penarikan"}
              </Label>
              <Input
                id="jumlah"
                name="jumlah"
                type="number"
                required
                min={0}
                placeholder="500000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                name="tanggal"
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
                {loading ? "Memproses..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
