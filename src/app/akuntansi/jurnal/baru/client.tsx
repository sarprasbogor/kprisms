"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatRupiah } from "@/lib/utils"

interface AkunItem {
  id: string
  kodeAkun: string
  namaAkun: string
}

interface BarisJurnal {
  akunId: string
  debit: number
  kredit: number
}

export function JurnalBaruClient({ akunList }: { akunList: AkunItem[] }) {
  const router = useRouter()
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0])
  const [keterangan, setKeterangan] = useState("")
  const [baris, setBaris] = useState<BarisJurnal[]>([
    { akunId: "", debit: 0, kredit: 0 },
    { akunId: "", debit: 0, kredit: 0 },
  ])
  const [loading, setLoading] = useState(false)

  const totalDebit = baris.reduce((s, b) => s + (b.debit || 0), 0)
  const totalKredit = baris.reduce((s, b) => s + (b.kredit || 0), 0)
  const selisih = totalDebit - totalKredit

  const tambahBaris = () => setBaris([...baris, { akunId: "", debit: 0, kredit: 0 }])

  const hapusBaris = (idx: number) => {
    if (baris.length <= 2) return
    setBaris(baris.filter((_, i) => i !== idx))
  }

  const ubahBaris = (idx: number, field: keyof BarisJurnal, value: string | number) => {
    const baru = [...baris]
    ;(baru as any)[idx][field] = value
    setBaris(baru)
  }

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/akuntansi/jurnal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tanggal, keterangan, detail: baris }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push("/akuntansi/jurnal")
      router.refresh()
    } catch (err) {
      alert("Gagal menyimpan jurnal: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Jurnal Baru</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Jurnal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Input
              id="keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Deskripsi jurnal"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detail Jurnal</CardTitle>
          <Button type="button" variant="outline" onClick={tambahBaris}>
            Tambah Baris
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Akun</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Kredit</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {baris.map((b, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={b.akunId}
                      onChange={(e) => ubahBaris(i, "akunId", e.target.value)}
                    >
                      <option value="">Pilih akun</option>
                      {akunList.map((akun) => (
                        <option key={akun.id} value={akun.id}>
                          {akun.kodeAkun} - {akun.namaAkun}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={b.debit || ""}
                      onChange={(e) => ubahBaris(i, "debit", Number(e.target.value))}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={b.kredit || ""}
                      onChange={(e) => ubahBaris(i, "kredit", Number(e.target.value))}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => hapusBaris(i)}
                      disabled={baris.length <= 2}
                    >
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-medium">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{formatRupiah(totalDebit)}</TableCell>
                <TableCell className="text-right">{formatRupiah(totalKredit)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              {selisih !== 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-destructive">
                    Selisih: {formatRupiah(selisih)} (debit dan kredit harus sama)
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button
              onClick={submit}
              disabled={loading || selisih !== 0 || !keterangan || baris.some((b) => !b.akunId)}
            >
              {loading ? "Menyimpan..." : "Simpan Jurnal"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
