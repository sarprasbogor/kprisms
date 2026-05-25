"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRupiah } from "@/lib/utils"

export function LaporanClient({
  jmlAnggota,
  totalSimpanan,
  totalPinjaman,
  totalAset,
}: {
  jmlAnggota: number
  totalSimpanan: number
  totalPinjaman: number
  totalAset: number
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Laporan</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jumlah Anggota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{jmlAnggota}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Simpanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatRupiah(totalSimpanan)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pinjaman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatRupiah(totalPinjaman)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Aset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatRupiah(totalAset)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Laporan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => window.print()}>
            Cetak Halaman Ini
          </Button>
          <p className="text-sm text-muted-foreground">
            Info: Laporan detail dapat diakses dari masing-masing modul.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
