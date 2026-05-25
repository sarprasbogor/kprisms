import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnitKerja() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.unitKerja.list().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Unit Kerja</h1>
      <Card>
        <CardHeader><CardTitle>Daftar Unit Kerja ({data.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((u: any) => (
                <div key={u.nama} className="border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-medium">{u.nama}</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">{u.jumlah} anggota</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
