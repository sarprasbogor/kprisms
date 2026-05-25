import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AturanClient } from "./client"

export default async function AturanPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const aturanList = await prisma.aturan.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <AturanClient aturanList={aturanList} />
}
