import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Akuntansi() {
  const [akun, setAkun] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "/api"}/akun-akuntansi`)
      .then((r) => r.json()).then((j) => setAkun(j.data || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const byType: Record<string, any[]> = {};
  for (const a of akun) {
    if (!byType[a.tipe_akun]) byType[a.tipe_akun] = [];
    if (!a.induk_id) byType[a.tipe_akun].push(a);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Akuntansi</h1>
      <Card>
        <CardHeader><CardTitle>Chart of Accounts</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(byType).map(([tipe, akuns]) => (
                <div key={tipe}>
                  <h3 className="font-semibold text-lg mb-2">{tipe}</h3>
                  {akuns.map((a: any) => (
                    <div key={a.id} className="border rounded p-3 mb-2">
                      <div className="flex justify-between">
                        <span className="font-mono text-xs text-gray-500">{a.kode_akun}</span>
                        <span className="text-xs text-gray-500">{a.saldo_normal}</span>
                      </div>
                      <p className="font-medium">{a.nama_akun}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
