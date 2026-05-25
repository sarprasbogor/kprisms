"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatRupiah, formatDate } from "@/lib/utils"

interface RATItem {
  id: string
  tahun: number
  tanggal: Date
  agenda: string | null
  notulen: string | null
  sisaHasilUsaha: number | null
}

export function RATClient({ ratList }: { ratList: RATItem[] }) {
  const [selected, setSelected] = useState<RATItem | null>(null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">RAT (Rapat Anggota Tahunan)</h1>

      <Card>
        <CardHeader>
          <CardTitle>Daftar RAT</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tahun</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>SHU</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Belum ada data RAT
                  </TableCell>
                </TableRow>
              )}
              {ratList.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.tahun}</TableCell>
                  <TableCell>{formatDate(r.tanggal)}</TableCell>
                  <TableCell>
                    {r.sisaHasilUsaha != null ? formatRupiah(r.sisaHasilUsaha) : "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setSelected(r)}>
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
            <CardTitle>RAT {selected.tahun}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              Tutup
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Tanggal:</strong> {formatDate(selected.tanggal)}</p>
            <p><strong>SHU:</strong> {selected.sisaHasilUsaha != null ? formatRupiah(selected.sisaHasilUsaha) : "-"}</p>
            {selected.agenda && <p><strong>Agenda:</strong> {selected.agenda}</p>}
            {selected.notulen && <p><strong>Notulen:</strong> {selected.notulen}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
