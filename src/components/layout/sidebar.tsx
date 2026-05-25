"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  PiggyBank,
  HandCoins,
  BookOpen,
  UsersRound,
  Scale,
  ShieldCheck,
  Building2,
  FileText,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Keanggotaan", icon: Users, href: "/anggota" },
  { label: "Simpanan", icon: PiggyBank, href: "/simpanan" },
  { label: "Pinjaman", icon: HandCoins, href: "/pinjaman" },
  { label: "Akuntansi", icon: BookOpen, href: "/akuntansi" },
  { label: "Pengurus & Karyawan", icon: UsersRound, href: "/pengurus" },
  { label: "Aturan", icon: Scale, href: "/aturan" },
  { label: "Legalitas", icon: ShieldCheck, href: "/legalitas" },
  { label: "Aset", icon: Building2, href: "/aset" },
  { label: "RAT", icon: FileText, href: "/rat" },
  { label: "Laporan", icon: FileText, href: "/laporan" },
  { label: "Notifikasi", icon: Bell, href: "/notifikasi" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-700 text-white rounded-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-green-800 text-white transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-green-700">
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">KPRI SMS</h1>
              <p className="text-xs text-green-200">Sehat Mandiri Sejahtera</p>
            </div>
          )}
          {collapsed && <h1 className="font-bold text-lg mx-auto">K</h1>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-1 rounded-md hover:bg-green-700"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-green-700 text-yellow-400 border-r-2 border-yellow-400"
                    : "text-green-100 hover:bg-green-700 hover:text-white"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-green-700">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 text-sm text-green-200 hover:text-white w-full"
          >
            <LogOut size={20} />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
