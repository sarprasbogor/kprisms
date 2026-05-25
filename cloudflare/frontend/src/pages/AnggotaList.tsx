import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { rupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";

export default function AnggotaList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    api.unitKerja.list().then(setUnits).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: "100" };
    if (search) params.search = search;
    if (filterUnit) params.unit = filterUnit;
    api.anggota.list(params).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [search, filterUnit]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Anggota</h1>
        <Button onClick={() => alert("Tambah anggota (coming soon)")}>
          <Plus className="h-4 w-4" /> Tambah Anggota
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Cari nama atau NIKOP..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 text-sm" value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)}>
              <option value="">Semua Unit</option>
              {units.map((u: any) => (
                <option key={u.nama} value={u.nama}>{u.nama} ({u.jumlah})</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">NIKOP</th>
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="pb-3 font-medium">Unit Kerja</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">HP</th>
                    <th className="pb-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((a: any) => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs">{a.nikop}</td>
                      <td className="py-3 font-medium">{a.nama_lengkap}</td>
                      <td className="py-3">{a.unit_kerja}</td>
                      <td className="py-3">
                        <Badge variant={a.status_keanggotaan === "AKTIF" ? "success" : a.status_keanggotaan === "CALON" ? "warning" : "destructive"}>
                          {a.status_keanggotaan}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs">{a.nomor_hp}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button className="p-1 hover:text-blue-600"><Eye className="h-4 w-4" /></button>
                          <button className="p-1 hover:text-green-600"><Pencil className="h-4 w-4" /></button>
                          <button className="p-1 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
