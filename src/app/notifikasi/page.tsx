import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NotifikasiClient } from "./client"

export default async function NotifikasiPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const notifikasiList = await prisma.notifikasi.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <NotifikasiClient notifikasiList={notifikasiList} />
}
