import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { JurnalBaruClient } from "./client"

export default async function JurnalBaruPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const akunList = await prisma.akunAkuntansi.findMany({
    orderBy: { kodeAkun: "asc" },
  })

  return <JurnalBaruClient akunList={akunList} />
}
