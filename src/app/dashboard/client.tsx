"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import {
  Users,
  PiggyBank,
  HandCoins,
  Building2,
  ShieldCheck,
  UsersRound,
  TrendingUp,
} from "lucide-react";

interface DashboardProps {
  totalAnggota: number;
  anggotaAktif: number;
  totalSimpananPokok: number;
  totalSimpananWajib: number;
  totalSimpananSukarela: number;
  pinjamanAktif: number;
  totalAset: number;
  legalitasValid: number;
  totalPengurus: number;
  anggotaPerUnit: { unitKerja: string; _count: number }[];
  anggotaPerGolongan: { golonganRuang: string | null; _count: number }[];
  anggotaPerStatus: { statusKeanggotaan: string; _count: number }[];
}

export default function DashboardClient({
  totalAnggota,
  anggotaAktif,
  totalSimpananPokok,
  totalSimpananWajib,
  totalSimpananSukarela,
  pinjamanAktif,
  totalAset,
  legalitasValid,
  totalPengurus,
  anggotaPerUnit,
  anggotaPerGolongan,
  anggotaPerStatus,
}: DashboardProps) {
  const totalSimpanan =
    totalSimpananPokok + totalSimpananWajib + totalSimpananSukarela;

  const kpiCards = [
    {
      title: "Total Anggota",
      value: totalAnggota,
      subtitle: `${anggotaAktif} Aktif`,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Simpanan",
      value: formatRupiah(totalSimpanan),
      subtitle: `Pokok: ${formatRupiah(totalSimpananPokok)}`,
      icon: PiggyBank,
      color: "bg-green-500",
    },
    {
      title: "Pinjaman Aktif",
      value: pinjamanAktif,
      subtitle: "Pinjaman sedang berjalan",
      icon: HandCoins,
      color: "bg-yellow-500",
    },
    {
      title: "Total Aset",
      value: formatRupiah(totalAset),
      subtitle: "Nilai perolehan",
      icon: Building2,
      color: "bg-purple-500",
    },
    {
      title: "Legalitas",
      value: `${legalitasValid} Valid`,
      subtitle: "Dokumen berlaku",
      icon: ShieldCheck,
      color: "bg-teal-500",
    },
    {
      title: "Pengurus Aktif",
      value: totalPengurus,
      subtitle: "Struktur organisasi",
      icon: UsersRound,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard KPRI SMS
          </h1>
          <p className="text-gray-500 text-sm">
            Selamat datang di Sistem Informasi Koperasi
          </p>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1">
          <TrendingUp className="w-4 h-4 mr-1" /> Berjalan
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${kpi.color}`}>
                <kpi.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-gray-500 mt-1">{kpi.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Anggota per Unit Kerja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anggotaPerUnit.map((item) => (
                <div key={item.unitKerja} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.unitKerja}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-green-600 rounded-full"
                      style={{
                        width: `${(item._count / totalAnggota) * 200}px`,
                        maxWidth: "200px",
                      }}
                    />
                    <span className="text-sm font-medium min-w-[3ch]">
                      {item._count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Keanggotaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anggotaPerStatus.map((item) => (
                <div key={item.statusKeanggotaan} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {item.statusKeanggotaan.toLowerCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-yellow-500 rounded-full"
                      style={{
                        width: `${(item._count / totalAnggota) * 200}px`,
                        maxWidth: "200px",
                      }}
                    />
                    <span className="text-sm font-medium min-w-[3ch]">
                      {item._count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Anggota per Golongan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anggotaPerGolongan.map((item) => (
                <div key={item.golonganRuang || "N/A"} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {item.golonganRuang || "Belum diisi"}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{
                        width: `${(item._count / totalAnggota) * 200}px`,
                        maxWidth: "200px",
                      }}
                    />
                    <span className="text-sm font-medium min-w-[3ch]">
                      {item._count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Keuangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Simpanan Pokok</span>
                <span className="font-semibold">
                  {formatRupiah(totalSimpananPokok)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Simpanan Wajib</span>
                <span className="font-semibold">
                  {formatRupiah(totalSimpananWajib)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Simpanan Sukarela</span>
                <span className="font-semibold">
                  {formatRupiah(totalSimpananSukarela)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-sm font-medium">Total Simpanan</span>
                <span className="font-bold text-green-700">
                  {formatRupiah(totalSimpanan)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
