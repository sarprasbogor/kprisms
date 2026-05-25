import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { LaporanKeuanganClient } from "./client"

export default async function LaporanKeuanganPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const akunList = await prisma.akunAkuntansi.findMany({
    orderBy: { kodeAkun: "asc" },
  })

  const detailList = await prisma.jurnalDetail.findMany({
    include: { akun: true, jurnal: true },
  })

  return <LaporanKeuanganClient akunList={akunList} detailList={detailList} />
}
