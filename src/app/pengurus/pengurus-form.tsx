"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPengurus, updatePengurus, createPengawas, updatePengawas, createKaryawan, updateKaryawan } from "./actions";
import { toast } from "sonner";

interface Props {
  type: "pengurus" | "pengawas" | "karyawan";
  initialData?: Record<string, any> | null;
  onClose: () => void;
}

function getFormConfig(type: string) {
  const common: { name: string; label: string; type: string; required: boolean }[] = [
    { name: "nama", label: "Nama Lengkap", type: "text", required: true },
    { name: "jabatan", label: "Jabatan", type: "text", required: true },
  ];
  if (type === "karyawan") {
    return {
      label: "Karyawan",
      createAction: createKaryawan,
      updateAction: updateKaryawan,
      fields: [
        ...common,
        { name: "unitKerja", label: "Unit Kerja", type: "text", required: false },
        { name: "nik", label: "NIK", type: "text", required: false },
        { name: "noTelepon", label: "No. Telepon", type: "text", required: false },
        { name: "alamat", label: "Alamat", type: "text", required: false },
        { name: "gajiPokok", label: "Gaji Pokok", type: "number", required: false },
        { name: "tanggalMasuk", label: "Tanggal Masuk", type: "date", required: true },
      ],
    };
  }
  return {
    label: type === "pengurus" ? "Pengurus" : "Pengawas",
    createAction: type === "pengurus" ? createPengurus : createPengawas,
    updateAction: type === "pengurus" ? updatePengurus : updatePengawas,
    fields: [
      ...common,
      { name: "kontak", label: "Kontak (Telepon/Email)", type: "text", required: false },
      { name: "tugasPokok", label: "Tugas Pokok", type: "text", required: false },
      { name: "periodeMulai", label: "Periode Mulai", type: "date", required: true },
      { name: "periodeSelesai", label: "Periode Selesai", type: "date", required: true },
    ],
  };
}

export function PengurusForm({ type, initialData, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const config = getFormConfig(type);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      formData.set("isActive", initialData?.isActive !== false ? "true" : "false");
      const result = initialData?.id
        ? await config.updateAction(initialData.id, formData)
        : await config.createAction(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(initialData?.id ? `${config.label} berhasil diperbarui` : `${config.label} berhasil ditambahkan`);
        onClose();
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{initialData?.id ? `Edit ${config.label}` : `Tambah ${config.label}`}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>Tutup</Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  defaultValue={initialData?.[f.name]?.toString().split("T")[0] || ""}
                  required={f.required}
                />
              </div>
            ))}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : initialData?.id ? "Simpan Perubahan" : "Tambah"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
