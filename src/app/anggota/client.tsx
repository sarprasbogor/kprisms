"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search, Eye, Pencil, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

type AnggotaListItem = {
  id: string;
  nik: string;
  nikop: string;
  namaLengkap: string;
  unitKerja: string;
  golonganRuang: string | null;
  statusKeanggotaan: string;
  nomorHp: string;
  tanggalDaftar: string;
  createdAt: string;
  updatedAt: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  statusPernikahan: string | null;
  alamatJalan: string;
  rtRw: string | null;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string | null;
  email: string | null;
  jabatan: string | null;
  masaKerjaTahun: number | null;
  fotoKtpUrl: string | null;
  fotoUrl: string | null;
  statusKepegawaian: string | null;
  nip: string | null;
};

interface AnggotaClientProps {
  anggota: AnggotaListItem[];
  unitKerjaList: string[];
  currentSearch: string;
  currentStatus: string;
  currentUnitKerja: string;
}

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "CALON", label: "Calon" },
  { value: "AKTIF", label: "Aktif" },
  { value: "NONAKTIF", label: "Nonaktif" },
  { value: "MENINGGAL", label: "Meninggal" },
  { value: "DIBERHENTIKAN", label: "Diberhentikan" },
];

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline" | "info"> = {
  CALON: "warning",
  AKTIF: "success",
  NONAKTIF: "danger",
  MENINGGAL: "danger",
  DIBERHENTIKAN: "outline",
};

export default function AnggotaClient({
  anggota,
  unitKerjaList,
  currentSearch,
  currentStatus,
  currentUnitKerja,
}: AnggotaClientProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(currentSearch);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    if (currentSearch) params.set("search", currentSearch);
    if (currentStatus) params.set("statusKeanggotaan", currentStatus);
    if (currentUnitKerja) params.set("unitKerja", currentUnitKerja);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/anggota?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue) params.set("search", searchValue);
    if (currentStatus) params.set("statusKeanggotaan", currentStatus);
    if (currentUnitKerja) params.set("unitKerja", currentUnitKerja);
    router.push(`/anggota?${params.toString()}`);
  }

  function resetFilters() {
    setSearchValue("");
    router.push("/anggota");
  }

  const hasFilters = currentSearch || currentStatus || currentUnitKerja;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keanggotaan</h1>
          <p className="text-gray-500 text-sm">Kelola data anggota koperasi</p>
        </div>
        <Link href="/anggota/baru">
          <Button>
            <Plus className="w-4 h-4 mr-1" /> Tambah Anggota
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <form onSubmit={handleSearch} className="flex gap-2 items-end">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Cari Nama / NIK / No. Induk
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ketik kata kunci..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-60"
                  />
                  <Button type="submit" size="icon" variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </form>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select
                className="flex h-9 w-44 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm"
                value={currentStatus}
                onChange={(e) => updateFilter("statusKeanggotaan", e.target.value)}
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Unit Kerja</label>
              <select
                className="flex h-9 w-44 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm"
                value={currentUnitKerja}
                onChange={(e) => updateFilter("unitKerja", e.target.value)}
              >
                <option value="">Semua Unit</option>
                {unitKerjaList.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="w-4 h-4 mr-1" /> Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Induk</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>Unit Kerja</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anggota.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Tidak ada data anggota
                  </TableCell>
                </TableRow>
              ) : (
                anggota.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">
                      {a.nikop}
                    </TableCell>
                    <TableCell className="font-medium">{a.namaLengkap}</TableCell>
                    <TableCell className="font-mono text-xs">{a.nik}</TableCell>
                    <TableCell>{a.unitKerja}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[a.statusKeanggotaan] || "outline"}>
                        {a.statusKeanggotaan.charAt(0) + a.statusKeanggotaan.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/anggota/${a.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/anggota/${a.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
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
