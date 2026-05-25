"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface NotifikasiItem {
  id: string
  judul: string
  isi: string
  tipe: string
  tanggal: Date
}

export function NotifikasiClient({
  notifikasiList,
}: {
  notifikasiList: NotifikasiItem[]
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifikasi & Pengumuman</h1>
      </div>

      {notifikasiList.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Tidak ada notifikasi
          </CardContent>
        </Card>
      )}

      {notifikasiList.map((n) => (
        <Card
          key={n.id}
          className={n.tipe === "PENTING" ? "border-l-4 border-l-red-500" : ""}
        >
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-base">{n.judul}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {formatDate(n.tanggal)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {n.tipe === "PENTING" && (
                <Badge variant="destructive">Penting</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{n.isi}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
