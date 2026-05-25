const API = import.meta.env.VITE_API_URL || "/api";

async function request(url: string, options?: RequestInit) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${url}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || "Terjadi kesalahan");
  }
  return json.data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  },

  anggota: {
    list: (params?: Record<string, string>) =>
      request(`/anggota?${new URLSearchParams(params)}`),
    get: (id: string) => request(`/anggota/${id}`),
    create: (data: any) => request("/anggota", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/anggota/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request(`/anggota/${id}`, { method: "DELETE" }),
  },

  dashboard: {
    stats: () => request("/dashboard/stats"),
  },

  unitKerja: {
    list: () => request("/unit-kerja"),
  },

  simpananPokok: {
    list: (anggota_id?: string) => request(`/simpanan-pokok${anggota_id ? `?anggota_id=${anggota_id}` : ""}`),
    create: (data: any) => request("/simpanan-pokok", { method: "POST", body: JSON.stringify(data) }),
  },

  simpananWajib: {
    list: (params?: Record<string, string>) => request(`/simpanan-wajib?${new URLSearchParams(params)}`),
    create: (data: any) => request("/simpanan-wajib", { method: "POST", body: JSON.stringify(data) }),
  },

  simpananSukarela: {
    list: (anggota_id?: string) => request(`/simpanan-sukarela${anggota_id ? `?anggota_id=${anggota_id}` : ""}`),
  },

  pinjaman: {
    list: (params?: Record<string, string>) => request(`/pinjaman?${new URLSearchParams(params)}`),
    create: (data: any) => request("/pinjaman", { method: "POST", body: JSON.stringify(data) }),
    approve: (id: string, data: any) => request(`/pinjaman/${id}/approve`, { method: "PUT", body: JSON.stringify(data) }),
    angsuran: (id: string) => request(`/pinjaman/${id}/angsuran`),
  },

  jenisPinjaman: {
    list: () => request("/jenis-pinjaman"),
  },

  shu: {
    list: (params?: Record<string, string>) => request(`/shu-anggota?${new URLSearchParams(params)}`),
  },

  pengurus: { list: () => request("/pengurus") },
  pengawas: { list: () => request("/pengawas") },
  karyawan: { list: () => request("/karyawan") },
  aset: { list: () => request("/aset") },
  aturan: { list: () => request("/aturan") },
  legalitas: { list: () => request("/legalitas") },
  rat: { list: () => request("/rat") },
  notifikasi: { list: () => request("/notifikasi") },
};
