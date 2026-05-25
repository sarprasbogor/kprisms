# KPRI Sehat Mandiri Sejahtera (SMS)

Sistem Informasi Koperasi untuk KPRI SMS Dinas Kesehatan Kabupaten Bogor.

## Teknologi

- **Framework:** Next.js 16 (App Router)
- **Bahasa:** TypeScript
- **Database:** SQLite (via Prisma ORM 7)
- **Autentikasi:** NextAuth.js v5
- **UI:** Tailwind CSS + shadcn/ui components
- **Form:** React Hook Form + Zod

## Modul

1. **Keanggotaan** — CRUD anggota, upload dokumen, filter/pencarian, dashboard statistik
2. **Simpanan** — Simpanan Pokok, Wajib (bulanan), Sukarela (tabungan)
3. **Pinjaman** — Pengajuan, workflow persetujuan, angsuran, denda
4. **Akuntansi** — Bagan akun, jurnal umum, buku besar, neraca saldo, laporan laba rugi
5. **Pengurus & Pengawas** — Struktur organisasi, periode kepengurusan
6. **Aturan** — AD/ART, aturan internal, eksternal
7. **Legalitas** — Akta pendirian, SK Kemenkumham, NPWP, SIUP, NIB
8. **Aset** — Inventaris aset, penyusutan, penghapusan
9. **RAT** — Rapat Anggota Tahunan, agenda, notulen, SHU
10. **Laporan** — Laporan komprehensif
11. **Notifikasi** — Pengumuman dan pemberitahuan

## Panduan Instalasi

### 1. Clone repositori

```bash
git clone <repo-url> kpri-sms
cd kpri-sms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Inisialisasi database

```bash
npx prisma migrate dev --name init
```

### 4. Jalankan seed data

```bash
npx tsx prisma/seed.ts
```

### 5. Jalankan aplikasi

```bash
npm run dev
```

Akses di **http://localhost:3000**

## Akun Default

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@koperasisms.com | admin123 |

## Struktur Proyek

```
src/
├── app/
│   ├── (auth)/login/       # Halaman login
│   ├── dashboard/          # Dashboard utama
│   ├── anggota/            # Modul Keanggotaan
│   ├── simpanan/           # Modul Simpanan
│   ├── pinjaman/           # Modul Pinjaman
│   ├── akuntansi/          # Modul Akuntansi
│   ├── pengurus/           # Modul Pengurus & Pengawas
│   ├── aturan/             # Modul Aturan
│   ├── legalitas/          # Modul Legalitas
│   ├── aset/               # Modul Aset
│   ├── rat/                # Modul RAT
│   ├── laporan/            # Modul Laporan
│   └── notifikasi/         # Modul Notifikasi
├── components/
│   ├── layout/             # Sidebar
│   └── ui/                 # UI components
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Utility functions
└── generated/prisma/       # Generated Prisma client
```
