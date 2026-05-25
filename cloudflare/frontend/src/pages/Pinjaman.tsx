import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { rupiah } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/components";

export default function Pinjaman() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.pinjaman.list().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalPiutang = data.filter((p: any) => ["CAIR", "BERMASALAH"].includes(p.status))
    .reduce((s: number, p: any) => s + p.jumlah, 0);

  const statusVariant: Record<string, string> = {
    DIAJUKAN: "warning", DIVERIFIKASI: "warning", DISETUJUI: "default",
    CAIR: "success", LUNAS: "secondary", BERMASALAH: "destructive",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pinjaman</h1>
        <div className="text-lg font-semibold">Total Piutang: {rupiah(totalPiutang)}</div>
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
                    <th className="pb-3 font-medium">Jenis</th>
                    <th className="pb-3 font-medium">Jumlah</th>
                    <th className="pb-3 font-medium">Angsuran</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Tgl Pengajuan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((p: any) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs">{p.nikop}</td>
                      <td className="py-3 font-medium">{p.nama_lengkap}</td>
                      <td className="py-3 text-xs">{p.jenis_pinjaman_nama}</td>
                      <td className="py-3 font-medium">{rupiah(p.jumlah)}</td>
                      <td className="py-3">{rupiah(p.angsuran_per_bulan)}</td>
                      <td className="py-3">
                        <Badge variant={(statusVariant[p.status] || "default") as any}>{p.status}</Badge>
                      </td>
                      <td className="py-3 text-xs text-gray-500">{p.tanggal_pengajuan?.slice(0, 10)}</td>
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
