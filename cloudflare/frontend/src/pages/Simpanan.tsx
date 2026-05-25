import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { rupiah } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Simpanan({ jenis }: { jenis: "pokok" | "wajib" | "sukarela" }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const titles: Record<string, string> = {
    pokok: "Simpanan Pokok",
    wajib: "Simpanan Wajib",
    sukarela: "Simpanan Sukarela",
  };

  const load = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const res = await api[`simpanan${jenis.charAt(0).toUpperCase() + jenis.slice(1)}`].list();
      setData(res);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [jenis]);

  const filtered = data.filter((r: any) =>
    !search || (r.nama_lengkap || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.nikop || "").toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.reduce((s: number, r: any) => s + (r.jumlah || 0), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{titles[jenis]}</h1>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Cari anggota..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="text-sm">
          Total: <span className="font-semibold">{rupiah(total)}</span>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">NIKOP</th>
                    <th className="pb-3 font-medium">Nama</th>
                    {jenis === "wajib" && <th className="pb-3 font-medium">Periode</th>}
                    <th className="pb-3 font-medium">Jumlah</th>
                    {jenis !== "sukarela" && <th className="pb-3 font-medium">Status</th>}
                    <th className="pb-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r: any) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs">{r.nikop}</td>
                      <td className="py-3 font-medium">{r.nama_lengkap}</td>
                      {jenis === "wajib" && <td className="py-3">{r.bulan}/{r.tahun}</td>}
                      <td className="py-3 font-medium">{rupiah(r.jumlah)}</td>
                      {jenis !== "sukarela" && (
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.status_lunas ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {r.status_lunas ? "LUNAS" : "BELUM"}
                          </span>
                        </td>
                      )}
                      <td className="py-3 text-xs text-gray-500">
                        {r.tanggal_bayar || r.tanggal || "-"}
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
