import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AkuntansiClient } from "./client"

export default async function AkuntansiPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const akunCount = await prisma.akunAkuntansi.count()
  const jurnalCount = await prisma.jurnal.count()
  const jurnalTerbaru = await prisma.jurnal.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { detail: { include: { akun: true } } },
  })

  return (
    <AkuntansiClient
      akunCount={akunCount}
      jurnalCount={jurnalCount}
      jurnalTerbaru={jurnalTerbaru}
    />
  )
}
