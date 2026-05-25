"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatRupiah, formatDate } from "@/lib/utils"
import Link from "next/link"

interface JurnalTerbaru {
  id: string
  tanggal: Date
  keterangan: string | null
  detail: { akun: { namaAkun: string }; debit: number; kredit: number }[]
}

export function AkuntansiClient({
  akunCount,
  jurnalCount,
  jurnalTerbaru,
}: {
  akunCount: number
  jurnalCount: number
  jurnalTerbaru: JurnalTerbaru[]
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Akuntansi</h1>
        <Link href="/akuntansi/jurnal/baru">
          <Button>Jurnal Baru</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Akun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{akunCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jurnal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{jurnalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menu Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/akuntansi/buku-besar" className="block">
              <Button variant="outline" className="w-full justify-start">
                Buku Besar
              </Button>
            </Link>
            <Link href="/akuntansi/neraca" className="block">
              <Button variant="outline" className="w-full justify-start">
                Neraca
              </Button>
            </Link>
            <Link href="/akuntansi/laporan" className="block">
              <Button variant="outline" className="w-full justify-start">
                Laporan Keuangan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jurnal Terbaru</CardTitle>
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
              {jurnalTerbaru.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada jurnal
                  </TableCell>
                </TableRow>
              )}
              {jurnalTerbaru.map((jurnal) => {
                const totalDebit = jurnal.detail.reduce((s, d) => s + d.debit, 0)
                const totalKredit = jurnal.detail.reduce((s, d) => s + d.kredit, 0)
                return (
                  <TableRow key={jurnal.id}>
                    <TableCell>{formatDate(jurnal.tanggal)}</TableCell>
                    <TableCell className="font-medium">{jurnal.keterangan || "-"}</TableCell>
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
