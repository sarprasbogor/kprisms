import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { rupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SHU() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.shu.list({ tahun: "2025" }).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const total = { shuTotal: 0, shuSimpanan: 0, shuPinjaman: 0, simpananWajib: 0, totalSimpanan: 0 };
  for (const s of data) {
    total.shuTotal += s.shu_total || 0;
    total.shuSimpanan += s.shu_simpanan || 0;
    total.shuPinjaman += s.shu_pinjaman || 0;
    total.simpananWajib += s.simpanan_wajib || 0;
    total.totalSimpanan += s.total_simpanan || 0;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">SHU 2025</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total SHU", value: total.shuTotal },
          { label: "SHU Simpanan", value: total.shuSimpanan },
          { label: "SHU Pinjaman", value: total.shuPinjaman },
          { label: "Total Simpanan", value: total.totalSimpanan },
          { label: "Simpanan Wajib", value: total.simpananWajib },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-lg font-bold">{rupiah(c.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Daftar SHU Anggota</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">NIKOP</th>
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="pb-3 font-medium">Simpanan</th>
                    <th className="pb-3 font-medium">SHU Simpanan</th>
                    <th className="pb-3 font-medium">SHU Pinjaman</th>
                    <th className="pb-3 font-medium">SHU Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((s: any) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs">{s.nikop}</td>
                      <td className="py-3">{s.nama_lengkap}</td>
                      <td className="py-3">{rupiah(s.total_simpanan)}</td>
                      <td className="py-3">{rupiah(s.shu_simpanan)}</td>
                      <td className="py-3">{rupiah(s.shu_pinjaman)}</td>
                      <td className="py-3 font-semibold">{rupiah(s.shu_total)}</td>
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
