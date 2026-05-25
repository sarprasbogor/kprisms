import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { RATClient } from "./client"

export default async function RATPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const ratList = await prisma.rAT.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <RATClient ratList={ratList} />
}
