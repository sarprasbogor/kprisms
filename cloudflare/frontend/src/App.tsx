import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AnggotaList from "@/pages/AnggotaList";
import Simpanan from "@/pages/Simpanan";
import Pinjaman from "@/pages/Pinjaman";
import SHU from "@/pages/SHU";
import Pengurus from "@/pages/Pengurus";
import Pengawas from "@/pages/Pengawas";
import Karyawan from "@/pages/Karyawan";
import UnitKerja from "@/pages/UnitKerja";
import Akuntansi from "@/pages/Akuntansi";
import Aset from "@/pages/Aset";
import Aturan from "@/pages/Aturan";
import Legalitas from "@/pages/Legalitas";
import RAT from "@/pages/RAT";
import Notifikasi from "@/pages/Notifikasi";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/anggota" element={<ProtectedRoute><AnggotaList /></ProtectedRoute>} />
      <Route path="/simpanan-pokok" element={<ProtectedRoute><Simpanan jenis="pokok" /></ProtectedRoute>} />
      <Route path="/simpanan-wajib" element={<ProtectedRoute><Simpanan jenis="wajib" /></ProtectedRoute>} />
      <Route path="/simpanan-sukarela" element={<ProtectedRoute><Simpanan jenis="sukarela" /></ProtectedRoute>} />
      <Route path="/pinjaman" element={<ProtectedRoute><Pinjaman /></ProtectedRoute>} />
      <Route path="/shu" element={<ProtectedRoute><SHU /></ProtectedRoute>} />
      <Route path="/pengurus" element={<ProtectedRoute><Pengurus jenis="pengurus" /></ProtectedRoute>} />
      <Route path="/pengawas" element={<ProtectedRoute><Pengawas /></ProtectedRoute>} />
      <Route path="/karyawan" element={<ProtectedRoute><Karyawan /></ProtectedRoute>} />
      <Route path="/unit-kerja" element={<ProtectedRoute><UnitKerja /></ProtectedRoute>} />
      <Route path="/akuntansi" element={<ProtectedRoute><Akuntansi /></ProtectedRoute>} />
      <Route path="/aset" element={<ProtectedRoute><Aset /></ProtectedRoute>} />
      <Route path="/aturan" element={<ProtectedRoute><Aturan /></ProtectedRoute>} />
      <Route path="/legalitas" element={<ProtectedRoute><Legalitas /></ProtectedRoute>} />
      <Route path="/rat" element={<ProtectedRoute><RAT /></ProtectedRoute>} />
      <Route path="/notifikasi" element={<ProtectedRoute><Notifikasi /></ProtectedRoute>} />
    </Routes>
  );
}
