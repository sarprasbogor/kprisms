import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/components";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export default function Pengurus({ jenis }: { jenis: string }) {
  const t = jenis.charAt(0).toUpperCase() + jenis.slice(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const res = await api[jenis].list();
      setData(res);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [jenis]);

  const filtered = data.filter((r: any) =>
    !search || (r.nama || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.jabatan || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daftar {t}</h1>
        <Button onClick={() => alert(`Tambah ${t} (coming soon)`)}>
          <Plus className="h-4 w-4" /> Tambah {t}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input className="pl-9 max-w-sm" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Nama</th>
                  <th className="pb-3 font-medium">Jabatan</th>
                  <th className="pb-3 font-medium">Kontak</th>
                  <th className="pb-3 font-medium">Periode</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{r.nama}</td>
                    <td className="py-3">{r.jabatan}</td>
                    <td className="py-3 text-xs">{r.kontak || "-"}</td>
                    <td className="py-3 text-xs">
                      {r.periode_mulai?.slice(0, 10)} — {r.periode_selesai?.slice(0, 10)}
                    </td>
                    <td className="py-3">
                      <Badge variant={r.is_active ? "success" : "secondary"}>
                        {r.is_active ? "AKTIF" : "TIDAK AKTIF"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className="p-1 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                        <button className="p-1 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
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
