"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatRupiah } from "@/lib/utils"

interface AkunItem {
  id: string
  kodeAkun: string
  namaAkun: string
  tipeAkun: string
  indukId: string | null
}

interface JurnalDetail {
  debit: number
  kredit: number
  akunId: string
  akun: AkunItem
  jurnal: { tanggal: Date }
}

export function LaporanKeuanganClient({
  akunList,
  detailList,
}: {
  akunList: AkunItem[]
  detailList: JurnalDetail[]
}) {
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())

  const filteredDetail = useMemo(() => {
    if (!tahun) return detailList
    return detailList.filter((d) => {
      const t = new Date(d.jurnal.tanggal).getFullYear().toString()
      return t === tahun
    })
  }, [detailList, tahun])

  const saldoPerAkun = useMemo(() => {
    const map: Record<string, number> = {}
    for (const d of filteredDetail) {
      const prev = map[d.akunId] || 0
      if (d.akun.tipeAkun === "ASET" || d.akun.tipeAkun === "BEBAN") {
        map[d.akunId] = prev + d.debit - d.kredit
      } else {
        map[d.akunId] = prev + d.kredit - d.debit
      }
    }
    return map
  }, [filteredDetail])

  const pendapatan = akunList
    .filter((a) => a.tipeAkun === "PENDAPATAN" && !a.indukId)
    .map((a) => ({ ...a, saldo: saldoPerAkun[a.id] || 0 }))
  const beban = akunList
    .filter((a) => a.tipeAkun === "BEBAN" && !a.indukId)
    .map((a) => ({ ...a, saldo: saldoPerAkun[a.id] || 0 }))
  const totalPendapatan = pendapatan.reduce((s, a) => s + a.saldo, 0)
  const totalBeban = beban.reduce((s, a) => s + a.saldo, 0)
  const labaRugi = totalPendapatan - totalBeban

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="tahun">Tahun</Label>
          <Input
            id="tahun"
            type="number"
            className="w-24"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Laba Rugi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-green-700">Pendapatan</h3>
              {pendapatan.map((a) => (
                <div key={a.id} className="flex justify-between py-1">
                  <span>{a.kodeAkun} - {a.namaAkun}</span>
                  <span>{formatRupiah(a.saldo)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-1 font-bold text-green-700">
                <span>Total Pendapatan</span>
                <span>{formatRupiah(totalPendapatan)}</span>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-red-700">Beban</h3>
              {beban.map((a) => (
                <div key={a.id} className="flex justify-between py-1">
                  <span>{a.kodeAkun} - {a.namaAkun}</span>
                  <span>{formatRupiah(a.saldo)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-1 font-bold text-red-700">
                <span>Total Beban</span>
                <span>{formatRupiah(totalBeban)}</span>
              </div>
            </div>
            <div className="flex justify-between border-t-2 pt-2 text-lg font-bold">
              <span>Laba / Rugi</span>
              <span className={labaRugi >= 0 ? "text-green-700" : "text-red-700"}>
                {formatRupiah(labaRugi)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Print / Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => window.print()}>
                Cetak Laporan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
