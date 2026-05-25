import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/components";

const pages: Record<string, { title: string; apiName: keyof typeof api; cols: { key: string; label: string; render?: (v: any, r: any) => React.ReactNode }[] }> = {
  aset: {
    title: "Aset", apiName: "aset",
    cols: [
      { key: "nama_aset", label: "Nama Aset" },
      { key: "kategori", label: "Kategori" },
      { key: "nilai_perolehan", label: "Nilai Perolehan", render: (v) => `Rp ${Math.round(v || 0).toLocaleString()}` },
      { key: "nilai_buku", label: "Nilai Buku", render: (v) => `Rp ${Math.round(v || 0).toLocaleString()}` },
      { key: "kondisi", label: "Kondisi", render: (v) => <Badge variant={v === "BAIK" ? "success" : v === "RUSAK" ? "destructive" : "warning"}>{v}</Badge> },
    ],
  },
  aturan: {
    title: "Aturan", apiName: "aturan",
    cols: [
      { key: "judul", label: "Judul" },
      { key: "jenis", label: "Jenis" },
      { key: "tanggal_berlaku", label: "Tanggal Berlaku" },
      { key: "is_active", label: "Status", render: (v) => <Badge variant={v ? "success" : "secondary"}>{v ? "AKTIF" : "NONAKTIF"}</Badge> },
    ],
  },
  legalitas: {
    title: "Legalitas", apiName: "legalitas",
    cols: [
      { key: "jenis", label: "Jenis" },
      { key: "nomor", label: "Nomor" },
      { key: "tanggal_terbit", label: "Tanggal Terbit" },
      { key: "masa_berlaku", label: "Masa Berlaku" },
    ],
  },
  rat: {
    title: "RAT", apiName: "rat",
    cols: [
      { key: "tahun", label: "Tahun" },
      { key: "tanggal", label: "Tanggal" },
      { key: "sisa_hasil_usaha", label: "SHU", render: (v) => v ? `Rp ${Math.round(v || 0).toLocaleString()}` : "-" },
    ],
  },
  notifikasi: {
    title: "Notifikasi", apiName: "notifikasi",
    cols: [
      { key: "judul", label: "Judul" },
      { key: "tipe", label: "Tipe", render: (v) => <Badge variant={v === "PENTING" ? "destructive" : "default"}>{v}</Badge> },
      { key: "tanggal", label: "Tanggal" },
    ],
  },
};

export default function GenericPage({ page }: { page: string }) {
  const cfg = pages[page];
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // @ts-ignore
    api[cfg.apiName]().then(setData).catch(console.error).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{cfg.title}</h1>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  {cfg.cols.map((c) => <th key={c.key} className="pb-3 font-medium">{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.map((r: any) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    {cfg.cols.map((c) => (
                      <td key={c.key} className="py-3">
                        {c.render ? c.render(r[c.key], r) : r[c.key] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
