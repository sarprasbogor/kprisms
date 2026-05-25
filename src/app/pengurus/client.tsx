"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/utils";
import { PengurusForm } from "./pengurus-form";
import { deletePengurus, deletePengawas, deleteKaryawan } from "./actions";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Item {
  id: string;
  nama: string;
  jabatan: string;
  kontak?: string | null;
  tugasPokok?: string | null;
  periodeMulai?: Date;
  periodeSelesai?: Date;
  isActive: boolean;
  unitKerja?: string | null;
  nik?: string | null;
  noTelepon?: string | null;
  alamat?: string | null;
  gajiPokok?: number | null;
  tanggalMasuk?: Date;
}

function statusBadge(active: boolean) {
  return active ? (
    <Badge variant="success">Aktif</Badge>
  ) : (
    <Badge variant="destructive">Nonaktif</Badge>
  );
}

export function PengurusClient({
  pengurusList,
  pengawasList,
  karyawanList,
}: {
  pengurusList: Item[];
  pengawasList: Item[];
  karyawanList: Item[];
}) {
  const [showForm, setShowForm] = useState<{ type: "pengurus" | "pengawas" | "karyawan"; edit?: Item } | null>(null);

  async function handleDelete(type: string, id: string, nama: string) {
    if (!confirm(`Hapus ${nama}?`)) return;
    try {
      const actions: Record<string, Function> = { pengurus: deletePengurus, pengawas: deletePengawas, karyawan: deleteKaryawan };
      await actions[type](id);
      toast.success("Berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengurus, Pengawas & Karyawan</h1>
      </div>

      {showForm && (
        <PengurusForm
          type={showForm.type}
          initialData={showForm.edit}
          onClose={() => setShowForm(null)}
        />
      )}

      {/* Karyawan Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Karyawan</CardTitle>
          <Button size="sm" onClick={() => setShowForm({ type: "karyawan" })}>
            <Plus className="w-4 h-4 mr-1" /> Tambah
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Unit Kerja</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>No. Telepon</TableHead>
                <TableHead>Gaji Pokok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {karyawanList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">Belum ada data karyawan</TableCell>
                </TableRow>
              )}
              {karyawanList.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.nama}</TableCell>
                  <TableCell>{k.jabatan}</TableCell>
                  <TableCell>{k.unitKerja || "-"}</TableCell>
                  <TableCell>{k.nik || "-"}</TableCell>
                  <TableCell>{k.noTelepon || "-"}</TableCell>
                  <TableCell>{k.gajiPokok ? formatRupiah(k.gajiPokok) : "-"}</TableCell>
                  <TableCell>{statusBadge(k.isActive)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setShowForm({ type: "karyawan", edit: k })}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete("karyawan", k.id, k.nama)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pengurus Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pengurus</CardTitle>
          <Button size="sm" onClick={() => setShowForm({ type: "pengurus" })}>
            <Plus className="w-4 h-4 mr-1" /> Tambah
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pengurusList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Belum ada data pengurus</TableCell>
                </TableRow>
              )}
              {pengurusList.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nama}</TableCell>
                  <TableCell>{p.jabatan}</TableCell>
                  <TableCell>{p.kontak || "-"}</TableCell>
                  <TableCell>{p.periodeMulai ? `${formatDate(p.periodeMulai)} - ${formatDate(p.periodeSelesai!)}` : "-"}</TableCell>
                  <TableCell>{statusBadge(p.isActive)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setShowForm({ type: "pengurus", edit: p })}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete("pengurus", p.id, p.nama)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pengawas Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pengawas</CardTitle>
          <Button size="sm" onClick={() => setShowForm({ type: "pengawas" })}>
            <Plus className="w-4 h-4 mr-1" /> Tambah
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pengawasList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Belum ada data pengawas</TableCell>
                </TableRow>
              )}
              {pengawasList.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nama}</TableCell>
                  <TableCell>{p.jabatan}</TableCell>
                  <TableCell>{p.kontak || "-"}</TableCell>
                  <TableCell>{p.periodeMulai ? `${formatDate(p.periodeMulai)} - ${formatDate(p.periodeSelesai!)}` : "-"}</TableCell>
                  <TableCell>{statusBadge(p.isActive)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setShowForm({ type: "pengawas", edit: p })}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete("pengawas", p.id, p.nama)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
