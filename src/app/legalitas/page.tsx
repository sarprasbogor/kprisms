import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { LegalitasClient } from "./client"

export default async function LegalitasPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const legalitasList = await prisma.legalitas.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <LegalitasClient legalitasList={legalitasList} />
}
