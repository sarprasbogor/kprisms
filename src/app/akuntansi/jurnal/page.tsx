import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { JurnalClient } from "./client"

export default async function JurnalPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const jurnalList = await prisma.jurnal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      detail: {
        include: { akun: true },
      },
    },
  })

  return <JurnalClient jurnalList={jurnalList} />
}
