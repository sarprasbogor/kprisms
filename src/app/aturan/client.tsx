"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"

interface AturanItem {
  id: string
  judul: string
  jenis: string
  isi: string
  fileUrl: string | null
  tanggalBerlaku: Date
}

const labelJenis: Record<string, string> = {
  AD_ART: "AD/ART",
  INTERNAL: "Internal",
  EKSTERNAL: "Eksternal",
}

export function AturanClient({ aturanList }: { aturanList: AturanItem[] }) {
  const [selected, setSelected] = useState<AturanItem | null>(null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Aturan & Regulasi</h1>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Aturan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Tanggal Berlaku</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aturanList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada aturan
                  </TableCell>
                </TableRow>
              )}
              {aturanList.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.judul}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{labelJenis[a.jenis] || a.jenis}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(a.tanggalBerlaku)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setSelected(a)}>
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{selected.judul}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              Tutup
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Jenis:</strong> {labelJenis[selected.jenis] || selected.jenis}</p>
            <p><strong>Isi:</strong> {selected.isi}</p>
            <p><strong>Tanggal Berlaku:</strong> {formatDate(selected.tanggalBerlaku)}</p>
            {selected.fileUrl && (
              <p>
                <strong>Lampiran:</strong>{" "}
                <a href={selected.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  Download
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
