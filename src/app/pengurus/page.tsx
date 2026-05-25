import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PengurusClient } from "./client"

export default async function PengurusPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [pengurusList, pengawasList, karyawanList] = await Promise.all([
    prisma.pengurus.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.pengawas.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.karyawan.findMany({ orderBy: { createdAt: "desc" } }),
  ])

  return <PengurusClient pengurusList={pengurusList} pengawasList={pengawasList} karyawanList={karyawanList} />
}
