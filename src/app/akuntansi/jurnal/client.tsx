"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatRupiah, formatDate } from "@/lib/utils"
import Link from "next/link"

interface JurnalItem {
  id: string
  tanggal: Date
  keterangan: string | null
  detail: { akun: { namaAkun: string }; debit: number; kredit: number }[]
}

export function JurnalClient({ jurnalList }: { jurnalList: JurnalItem[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jurnal Umum</h1>
        <Link href="/akuntansi/jurnal/baru">
          <Button>Jurnal Baru</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jurnal</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Akun</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Kredit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jurnalList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada jurnal
                  </TableCell>
                </TableRow>
              )}
              {jurnalList.map((jurnal) => {
                const totalDebit = jurnal.detail.reduce((s, d) => s + d.debit, 0)
                const totalKredit = jurnal.detail.reduce((s, d) => s + d.kredit, 0)
                return (
                  <TableRow key={jurnal.id}>
                    <TableCell>{formatDate(jurnal.tanggal)}</TableCell>
                    <TableCell className="font-medium">{jurnal.keterangan}</TableCell>
                    <TableCell>
                      {jurnal.detail.map((d) => d.akun.namaAkun).join(", ")}
                    </TableCell>
                    <TableCell className="text-right">{formatRupiah(totalDebit)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(totalKredit)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
