"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatRupiah, formatDate } from "@/lib/utils";
import { HandCoins, Plus, Search, CheckCircle2, AlertTriangle, Ban } from "lucide-react";

interface PinjamanItem {
  id: string;
  anggota: { id: string; namaLengkap: string; nikop: string };
  jenisPinjaman: { id: string; nama: string };
  jumlah: number;
  jangkaWaktu: number;
  angsuranPerBulan: number;
  status: string;
  tanggalPengajuan: string;
  tanggalCair: string | null;
  tujuan: string | null;
}

interface Props {
  pinjaman: PinjamanItem[];
  totalCair: number;
  aktifCount: number;
  lunasCount: number;
  bermasalahCount: number;
}

const statusColor: Record<string, "warning" | "info" | "success" | "default" | "destructive" | "danger"> = {
  DIAJUKAN: "warning",
  DIVERIFIKASI: "info",
  DISETUJUI: "success",
  CAIR: "default",
  LUNAS: "success",
  BERMASALAH: "danger",
};

export default function PinjamanClient({
  pinjaman,
  totalCair,
  aktifCount,
  lunasCount,
  bermasalahCount,
}: Props) {
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  const jenisPinjamanList = [...new Set(pinjaman.map((p) => p.jenisPinjaman.nama))];

  const filtered = pinjaman.filter((p) => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterJenis && p.jenisPinjaman.nama !== filterJenis) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pinjaman</h1>
          <p className="text-gray-500 text-sm">
            Kelola pengajuan dan pembayaran pinjaman
          </p>
        </div>
        <Link href="/pinjaman/baru">
          <Button>
            <Plus className="w-4 h-4 mr-1" /> Pengajuan Baru
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Cair
            </CardTitle>
            <div className="p-2 rounded-full bg-green-500">
              <HandCoins className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalCair)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pinjaman Aktif
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-500">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aktifCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pinjaman Lunas
            </CardTitle>
            <div className="p-2 rounded-full bg-green-700">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lunasCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pinjaman Bermasalah
            </CardTitle>
            <div className="p-2 rounded-full bg-red-600">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{bermasalahCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex gap-2 items-center flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <select
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="DIAJUKAN">Diajukan</option>
                <option value="DIVERIFIKASI">Diverifikasi</option>
                <option value="DISETUJUI">Disetujui</option>
                <option value="CAIR">Cair</option>
                <option value="LUNAS">Lunas</option>
                <option value="BERMASALAH">Bermasalah</option>
              </select>
              <select
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600"
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
              >
                <option value="">Semua Jenis</option>
                {jenisPinjamanList.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Anggota</TableHead>
                <TableHead>Jenis Pinjaman</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Jangka Waktu</TableHead>
                <TableHead>Angsuran/Bulan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    Tidak ada data pinjaman
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.tanggalPengajuan)}</TableCell>
                    <TableCell className="font-medium">
                      {p.anggota.namaLengkap}
                    </TableCell>
                    <TableCell>{p.jenisPinjaman.nama}</TableCell>
                    <TableCell>{formatRupiah(p.jumlah)}</TableCell>
                    <TableCell>{p.jangkaWaktu} bulan</TableCell>
                    <TableCell>{formatRupiah(p.angsuranPerBulan)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor[p.status] || "outline"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/pinjaman/${p.id}`}>
                        <Button variant="outline" size="sm">
                          Detail
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
