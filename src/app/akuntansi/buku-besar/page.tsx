import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BukuBesarClient } from "./client"

export default async function BukuBesarPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const akunList = await prisma.akunAkuntansi.findMany({
    orderBy: { kodeAkun: "asc" },
  })

  return <BukuBesarClient akunList={akunList} />
}
