"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"

interface LegalitasItem {
  id: string
  jenis: string
  nomor: string
  tanggalTerbit: Date
  masaBerlaku: Date | null
  fileUrl: string | null
  keterangan: string | null
}

function expiryBadge(masaBerlaku: Date | null) {
  if (!masaBerlaku) return <Badge variant="secondary">Seumur Hidup</Badge>
  const now = new Date()
  const diff = new Date(masaBerlaku).getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return <Badge variant="destructive">Kadaluarsa</Badge>
  if (days <= 30) return <Badge variant="warning">Segera Kadaluarsa ({days} hari)</Badge>
  return <Badge variant="success">Berlaku</Badge>
}

export function LegalitasClient({ legalitasList }: { legalitasList: LegalitasItem[] }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Legalitas</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dokumen Legalitas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis</TableHead>
                <TableHead>Nomor</TableHead>
                <TableHead>Tanggal Terbit</TableHead>
                <TableHead>Masa Berlaku</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {legalitasList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada dokumen legalitas
                  </TableCell>
                </TableRow>
              )}
              {legalitasList.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.jenis}</TableCell>
                  <TableCell>{l.nomor}</TableCell>
                  <TableCell>{formatDate(l.tanggalTerbit)}</TableCell>
                    <TableCell>{l.masaBerlaku ? formatDate(l.masaBerlaku) : "Seumur Hidup"}</TableCell>
                    <TableCell>{expiryBadge(l.masaBerlaku)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
