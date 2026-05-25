import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { LaporanClient } from "./client"

export default async function LaporanPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [jmlAnggota, simpananPokok, simpananWajib, simpananSukarela, jmlPinjaman, jmlAset] = await Promise.all([
    prisma.anggota.count({ where: { statusKeanggotaan: "AKTIF" } }),
    prisma.simpananPokok.aggregate({ _sum: { jumlah: true } }),
    prisma.simpananWajib.aggregate({ _sum: { jumlah: true } }),
    prisma.simpananSukarela.aggregate({ _sum: { jumlah: true } }),
    prisma.pinjaman.aggregate({ _sum: { jumlah: true } }),
    prisma.aset.aggregate({ _sum: { nilaiPerolehan: true } }),
  ])

  const totalSimpanan = (simpananPokok._sum.jumlah || 0) + (simpananWajib._sum.jumlah || 0) + (simpananSukarela._sum.jumlah || 0);

  return (
    <LaporanClient
      jmlAnggota={jmlAnggota}
      totalSimpanan={totalSimpanan}
      totalPinjaman={jmlPinjaman._sum.jumlah || 0}
      totalAset={jmlAset._sum.nilaiPerolehan || 0}
    />
  )
}
