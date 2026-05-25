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
import { PiggyBank, Plus, Search } from "lucide-react";

interface AnggotaRef {
  id: string;
  namaLengkap: string;
  nikop: string;
}

interface PokokItem {
  id: string;
  anggotaId: string;
  anggota: AnggotaRef;
  jumlah: number;
  statusLunas: boolean;
  cicilanKe: number | null;
  totalCicilan: number | null;
  tanggalBayar: string;
  keterangan: string | null;
}

interface WajibItem {
  id: string;
  anggotaId: string;
  anggota: AnggotaRef;
  bulan: number;
  tahun: number;
  jumlah: number;
  tanggalBayar: string;
  statusLunas: boolean;
  denda: number;
  keterangan: string | null;
}

interface SukarelaItem {
  id: string;
  anggotaId: string;
  anggota: AnggotaRef;
  jenis: string;
  jumlah: number;
  saldoSetelah: number;
  tanggal: string;
  keterangan: string | null;
}

interface Props {
  pokokData: PokokItem[];
  wajibData: WajibItem[];
  sukarelaData: SukarelaItem[];
  anggota: AnggotaRef[];
  totalPokok: number;
  totalWajib: number;
  totalSukarela: number;
}

type CombinedItem = {
  id: string;
  tanggal: string;
  anggotaNama: string;
  anggotaNik: string;
  jenis: string;
  jumlah: number;
  keterangan: string | null;
  detail: string;
};

export default function SimpananClient({
  pokokData,
  wajibData,
  sukarelaData,
  anggota,
  totalPokok,
  totalWajib,
  totalSukarela,
}: Props) {
  const [activeTab, setActiveTab] = useState<string>("semua");
  const [filterAnggota, setFilterAnggota] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  const combined: CombinedItem[] = [
    ...pokokData.map((p) => ({
      id: p.id,
      tanggal: p.tanggalBayar,
      anggotaNama: p.anggota.namaLengkap,
      anggotaNik: p.anggota.nikop,
      jenis: "Pokok",
      jumlah: p.jumlah,
      keterangan: p.keterangan,
      detail: p.statusLunas
        ? "Lunas"
        : `Cicilan ${p.cicilanKe || "?"}/${p.totalCicilan || "?"}`,
    })),
    ...wajibData.map((w) => ({
      id: w.id,
      tanggal: w.tanggalBayar,
      anggotaNama: w.anggota.namaLengkap,
      anggotaNik: w.anggota.nikop,
      jenis: "Wajib",
      jumlah: w.jumlah + w.denda,
      keterangan: w.keterangan,
      detail: `${w.bulan}/${w.tahun}`,
    })),
    ...sukarelaData.map((s) => ({
      id: s.id,
      tanggal: s.tanggal,
      anggotaNama: s.anggota.namaLengkap,
      anggotaNik: s.anggota.nikop,
      jenis: s.jenis === "SETORAN" ? "Sukarela (Setoran)" : "Sukarela (Penarikan)",
      jumlah: s.jenis === "SETORAN" ? s.jumlah : -s.jumlah,
      keterangan: s.keterangan,
      detail: `Saldo: ${formatRupiah(s.saldoSetelah)}`,
    })),
  ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const filtered = combined.filter((item) => {
    if (filterAnggota && !item.anggotaNama.toLowerCase().includes(filterAnggota.toLowerCase())) return false;
    if (filterJenis && !item.jenis.toLowerCase().includes(filterJenis.toLowerCase())) return false;
    if (filterDateStart && new Date(item.tanggal) < new Date(filterDateStart)) return false;
    if (filterDateEnd && new Date(item.tanggal) > new Date(filterDateEnd + "T23:59:59")) return false;
    return true;
  });

  const tabs = [
    { key: "semua", label: "Semua" },
    { key: "pokok", label: "Pokok" },
    { key: "wajib", label: "Wajib" },
    { key: "sukarela", label: "Sukarela" },
  ];

  const renderTable = (items: CombinedItem[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>Anggota</TableHead>
          <TableHead>NIK</TableHead>
          <TableHead>Jenis</TableHead>
          <TableHead>Jumlah</TableHead>
          <TableHead>Detail</TableHead>
          <TableHead>Keterangan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-500 py-8">
              Tidak ada data
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{formatDate(item.tanggal)}</TableCell>
              <TableCell className="font-medium">{item.anggotaNama}</TableCell>
              <TableCell className="text-xs text-gray-500">{item.anggotaNik}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.jenis === "Pokok"
                      ? "default"
                      : item.jenis === "Wajib"
                      ? "success"
                      : "info"
                  }
                >
                  {item.jenis}
                </Badge>
              </TableCell>
              <TableCell className={item.jumlah < 0 ? "text-red-600" : ""}>
                {formatRupiah(Math.abs(item.jumlah))}
              </TableCell>
              <TableCell className="text-xs text-gray-500">{item.detail}</TableCell>
              <TableCell className="text-xs text-gray-500 max-w-[200px] truncate">
                {item.keterangan || "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  const pokokFiltered = filtered.filter((i) => i.jenis === "Pokok");
  const wajibFiltered = filtered.filter((i) => i.jenis === "Wajib");
  const sukarelaFiltered = filtered.filter(
    (i) => i.jenis === "Sukarela (Setoran)" || i.jenis === "Sukarela (Penarikan)"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simpanan</h1>
          <p className="text-gray-500 text-sm">
            Kelola simpanan pokok, wajib, dan sukarela
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/simpanan/pokok">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> Pokok
            </Button>
          </Link>
          <Link href="/simpanan/wajib">
            <Button size="sm" variant="secondary">
              <Plus className="w-4 h-4 mr-1" /> Wajib
            </Button>
          </Link>
          <Link href="/simpanan/sukarela">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Sukarela
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Simpanan Pokok
            </CardTitle>
            <div className="p-2 rounded-full bg-green-500">
              <PiggyBank className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(totalPokok)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {pokokData.length} transaksi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Simpanan Wajib
            </CardTitle>
            <div className="p-2 rounded-full bg-yellow-500">
              <PiggyBank className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(totalWajib)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {wajibData.length} transaksi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Simpanan Sukarela
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-500">
              <PiggyBank className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(totalSukarela)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {sukarelaData.length} transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    activeTab === tab.key
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari anggota..."
                  className="pl-8 h-8 w-40"
                  value={filterAnggota}
                  onChange={(e) => setFilterAnggota(e.target.value)}
                />
              </div>
              <Input
                type="date"
                className="h-8 w-36"
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
              />
              <Input
                type="date"
                className="h-8 w-36"
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "semua" && renderTable(filtered)}
          {activeTab === "pokok" && renderTable(pokokFiltered)}
          {activeTab === "wajib" && renderTable(wajibFiltered)}
          {activeTab === "sukarela" && renderTable(sukarelaFiltered)}
        </CardContent>
      </Card>
    </div>
  );
}
