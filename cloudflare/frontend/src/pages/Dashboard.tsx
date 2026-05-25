import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { rupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, HandCoins, PiggyBank, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.dashboard.stats(), api.unitKerja.list()]).then(([s, u]) => {
      setStats(s);
      setUnits(u);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Memuat data...</p>;

  const cards = [
    { label: "Total Anggota", value: stats?.totalAnggota || 0, icon: Users, color: "bg-blue-500" },
    { label: "Anggota Aktif", value: stats?.anggotaAktif || 0, icon: Users, color: "bg-green-500" },
    { label: "Total Simpanan", value: rupiah(stats?.totalSimpanan || 0), icon: PiggyBank, color: "bg-purple-500" },
    { label: "Total Piutang", value: rupiah(stats?.totalPiutang || 0), icon: HandCoins, color: "bg-orange-500" },
    { label: "SHU 2025", value: rupiah(stats?.totalShu || 0), icon: TrendingUp, color: "bg-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className="text-2xl font-bold mt-1">{c.value}</p>
                </div>
                <div className={`p-3 rounded-full ${c.color} bg-opacity-10`}>
                  <c.icon className={`h-6 w-6 ${c.color.replace("bg-", "text-")}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Unit Kerja Terbanyak</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {units.slice(0, 10).map((u: any) => (
                <div key={u.nama} className="flex items-center justify-between py-1">
                  <span className="text-sm">{u.nama}</span>
                  <span className="text-sm font-semibold">{u.jumlah} anggota</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ringkasan Keuangan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span>Total Simpanan</span>
              <span className="font-semibold">{rupiah(stats?.totalSimpanan || 0)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Total Piutang</span>
              <span className="font-semibold text-orange-600">{rupiah(stats?.totalPiutang || 0)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>SHU 2025</span>
              <span className="font-semibold text-green-600">{rupiah(stats?.totalShu || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
