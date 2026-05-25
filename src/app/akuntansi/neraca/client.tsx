"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
}

export function NeracaClient({
  akunList,
  detailList,
}: {
  akunList: AkunItem[]
  detailList: JurnalDetail[]
}) {
  const saldoPerAkun = useMemo(() => {
    const map: Record<string, number> = {}
    for (const d of detailList) {
      const prev = map[d.akunId] || 0
      if (d.akun.tipeAkun === "ASET" || d.akun.tipeAkun === "BEBAN") {
        map[d.akunId] = prev + d.debit - d.kredit
      } else {
        map[d.akunId] = prev + d.kredit - d.debit
      }
    }
    return map
  }, [detailList])

  const kelompok = (tipe: string) =>
    akunList
      .filter((a) => a.tipeAkun === tipe && !a.indukId)
      .map((a) => ({ ...a, saldo: saldoPerAkun[a.id] || 0 }))

  const aset = kelompok("ASET")
  const kewajiban = kelompok("KEWAJIBAN")
  const modal = kelompok("MODAL")
  const totalAset = aset.reduce((s, a) => s + a.saldo, 0)
  const totalKewajiban = kewajiban.reduce((s, a) => s + a.saldo, 0)
  const totalModal = modal.reduce((s, a) => s + a.saldo, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Neraca</h1>
      <p className="text-muted-foreground">
        Per {new Date().toLocaleDateString("id-ID")}
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aset</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Akun</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aset.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.kodeAkun} - {a.namaAkun}</TableCell>
                    <TableCell className="text-right">{formatRupiah(a.saldo)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total Aset</TableCell>
                  <TableCell className="text-right">{formatRupiah(totalAset)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kewajiban</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Akun</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kewajiban.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.kodeAkun} - {a.namaAkun}</TableCell>
                      <TableCell className="text-right">{formatRupiah(a.saldo)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Kewajiban</TableCell>
                    <TableCell className="text-right">{formatRupiah(totalKewajiban)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Akun</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modal.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.kodeAkun} - {a.namaAkun}</TableCell>
                      <TableCell className="text-right">{formatRupiah(a.saldo)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Modal</TableCell>
                    <TableCell className="text-right">{formatRupiah(totalModal)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Aset</p>
              <p className="text-xl font-bold">{formatRupiah(totalAset)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Kewajiban</p>
              <p className="text-xl font-bold">{formatRupiah(totalKewajiban)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Modal</p>
              <p className="text-xl font-bold">{formatRupiah(totalModal)}</p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Aset = Kewajiban + Modal: {formatRupiah(totalAset)} = {formatRupiah(totalKewajiban + totalModal)}
            {totalAset === totalKewajiban + totalModal ? " ✓" : " ✗ (tidak balance)"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
