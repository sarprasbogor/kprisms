import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnggotaForm from "../anggota-form";

export default async function NewAnggotaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <AnggotaForm />;
}
