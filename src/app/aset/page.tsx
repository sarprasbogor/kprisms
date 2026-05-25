import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AsetClient } from "./client"

export default async function AsetPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const asetList = await prisma.aset.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <AsetClient asetList={asetList} />
}
