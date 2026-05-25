"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatRupiah, formatDate } from "@/lib/utils"

interface AsetItem {
  id: string
  namaAset: string
  kategori: string
  nilaiPerolehan: number
  nilaiBuku: number
  umurEkonomis: number
  nilaiPenyusutan: number
  tanggalPerolehan: Date
  kondisi: string
  status: string
  lokasi: string | null
}

function kondisiBadge(kondisi: string) {
  const map: Record<string, "success" | "warning" | "destructive"> = {
    BAIK: "success",
    RUSAK: "warning",
    HILANG: "destructive",
  }
  return <Badge variant={map[kondisi] || "secondary"}>{kondisi}</Badge>
}

function statusBadge(status: string) {
  return status === "AKTIF" ? (
    <Badge variant="success">Aktif</Badge>
  ) : (
    <Badge variant="destructive">Dihapuskan</Badge>
  )
}

export function AsetClient({ asetList }: { asetList: AsetItem[] }) {
  const totalNilai = asetList
    .filter((a) => a.status === "AKTIF")
    .reduce((s, a) => s + a.nilaiPerolehan, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aset</h1>
        <p className="text-lg font-semibold">
          Total Nilai: {formatRupiah(totalNilai)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Aset</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Aset</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Nilai Perolehan</TableHead>
                <TableHead>Nilai Sisa</TableHead>
                <TableHead>Tgl Perolehan</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {asetList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Belum ada aset
                  </TableCell>
                </TableRow>
              )}
              {asetList.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.namaAset}</TableCell>
                  <TableCell>{a.kategori}</TableCell>
                  <TableCell>{formatRupiah(a.nilaiPerolehan)}</TableCell>
                  <TableCell>{formatRupiah(a.nilaiBuku)}</TableCell>
                  <TableCell>{formatDate(a.tanggalPerolehan)}</TableCell>
                  <TableCell>{kondisiBadge(a.kondisi)}</TableCell>
                  <TableCell>{statusBadge(a.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
