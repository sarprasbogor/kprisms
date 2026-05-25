import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Wallet, HandCoins, PiggyBank, Building2,
  UserCheck, ShieldCheck, Briefcase, FileText, Scale, ScrollText,
  BarChart3, Bell, LogOut, Menu, X,
} from "lucide-react";

const menu = [
  { group: "Utama", items: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  ]},
  { group: "Keanggotaan", items: [
    { label: "Anggota", icon: Users, path: "/anggota" },
    { label: "Unit Kerja", icon: Building2, path: "/unit-kerja" },
  ]},
  { group: "Simpanan", items: [
    { label: "Simpanan Pokok", icon: PiggyBank, path: "/simpanan-pokok" },
    { label: "Simpanan Wajib", icon: Wallet, path: "/simpanan-wajib" },
    { label: "Simpanan Sukarela", icon: Wallet, path: "/simpanan-sukarela" },
  ]},
  { group: "Pinjaman", items: [
    { label: "Pinjaman", icon: HandCoins, path: "/pinjaman" },
  ]},
  { group: "Manajemen", items: [
    { label: "Pengurus", icon: UserCheck, path: "/pengurus" },
    { label: "Pengawas", icon: ShieldCheck, path: "/pengawas" },
    { label: "Karyawan", icon: Briefcase, path: "/karyawan" },
  ]},
  { group: "Keuangan", items: [
    { label: "SHU", icon: BarChart3, path: "/shu" },
    { label: "Akuntansi", icon: FileText, path: "/akuntansi" },
    { label: "Aset", icon: Building2, path: "/aset" },
  ]},
  { group: "Dokumen", items: [
    { label: "Aturan", icon: Scale, path: "/aturan" },
    { label: "Legalitas", icon: ScrollText, path: "/legalitas" },
    { label: "RAT", icon: FileText, path: "/rat" },
  ]},
  { group: "Lainnya", items: [
    { label: "Notifikasi", icon: Bell, path: "/notifikasi" },
  ]},
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-sidebar text-sidebar-text flex flex-col transition-all duration-300",
        sidebarOpen ? "w-64" : "w-0 -ml-64"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-green-700">
          <h1 className="text-lg font-bold tracking-tight">KPRI SMS</h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {menu.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-semibold uppercase text-green-300 px-3 mb-2">{group.group}</p>
              {group.items.map((item) => {
                const active = item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      active ? "bg-green-600 text-white font-medium" : "text-green-100 hover:bg-sidebar-hover"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-green-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-green-100 hover:bg-sidebar-hover w-full">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b bg-white flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h2 className="font-semibold text-lg">
            KPRI Sehat Mandiri Sejahtera
          </h2>
          <div className="flex-1" />
          <span className="text-sm text-gray-500">Kabupaten Bogor</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
