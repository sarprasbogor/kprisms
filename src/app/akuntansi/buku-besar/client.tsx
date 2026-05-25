"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatRupiah, formatDate } from "@/lib/utils"

interface AkunItem {
  id: string
  kodeAkun: string
  namaAkun: string
}

interface JurnalDetail {
  id: string
  debit: number
  kredit: number
  jurnal: { tanggal: Date; keterangan: string }
}

export function BukuBesarClient({ akunList }: { akunList: AkunItem[] }) {
  const [akunId, setAkunId] = useState(akunList[0]?.id || "")
  const [tanggalMulai, setTanggalMulai] = useState("")
  const [tanggalSelesai, setTanggalSelesai] = useState("")
  const [data, setData] = useState<JurnalDetail[]>([])
  const [loading, setLoading] = useState(false)

  const selectedAkun = akunList.find((a) => a.id === akunId)

  const cari = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ akunId })
      if (tanggalMulai) params.set("mulai", tanggalMulai)
      if (tanggalSelesai) params.set("selesai", tanggalSelesai)
      const res = await fetch(`/api/akuntansi/buku-besar?${params}`)
      if (!res.ok) throw new Error(await res.text())
      setData(await res.json())
    } catch (err) {
      alert("Gagal memuat data: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (akunId) cari()
  }, [])

  let saldo = 0
  const rowsWithSaldo = data.map((d) => {
    saldo += d.debit - d.kredit
    return { ...d, saldo }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Buku Besar</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="akun">Akun</Label>
              <select
                id="akun"
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={akunId}
                onChange={(e) => setAkunId(e.target.value)}
              >
                {akunList.map((akun) => (
                  <option key={akun.id} value={akun.id}>
                    {akun.kodeAkun} - {akun.namaAkun}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mulai">Tanggal Mulai</Label>
              <Input
                id="mulai"
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selesai">Tanggal Selesai</Label>
              <Input
                id="selesai"
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
              />
            </div>
            <Button onClick={cari} disabled={loading}>
              {loading ? "Memuat..." : "Cari"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedAkun && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedAkun.kodeAkun} - {selectedAkun.namaAkun}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Kredit</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rowsWithSaldo.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Tidak ada transaksi
                    </TableCell>
                  </TableRow>
                )}
                {rowsWithSaldo.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{formatDate(d.jurnal.tanggal)}</TableCell>
                    <TableCell>{d.jurnal.keterangan}</TableCell>
                    <TableCell className="text-right">
                      {d.debit > 0 ? formatRupiah(d.debit) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {d.kredit > 0 ? formatRupiah(d.kredit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatRupiah(d.saldo)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
