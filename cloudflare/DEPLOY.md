# Deploy KPRI SMS to Cloudflare Workers + Pages

## Prasyarat
- Node.js 18+
- Akun Cloudflare
- `npm login --wrangler` atau `npx wrangler login`

## 1. Setup D1 Database

```bash
cd cloudflare/worker

# Buat database D1
npx wrangler d1 create kpri-sms-db

# Copy output database_id ke wrangler.toml
# Hasilnya akan seperti:
# [[d1_databases]]
# binding = "DB"
# database_name = "kpri-sms-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Setup schema
npx wrangler d1 execute kpri-sms-db --file=../data/schema.sql

# Import data
npx wrangler d1 execute kpri-sms-db --file=../data/seed.sql
```

## 2. Deploy Worker API

```bash
cd cloudflare/worker
npx wrangler deploy src/index.ts
```

## 3. Deploy Frontend ke Pages

```bash
cd cloudflare/frontend

# Build
npm run build

# Deploy via wrangler
npx wrangler pages deploy dist --project-name kpri-sms-frontend
```

Atau upload manual folder `dist/` ke Cloudflare Pages dashboard.

## 4. Set Environment Variables

Di Cloudflare dashboard → Worker → kpri-sms-api → Settings → Variables:
- `JWT_SECRET`: ganti dengan secret key acak

Di Cloudflare Pages → kpri-sms-frontend → Settings → Environment variables:
- `VITE_API_URL`: URL Worker API (https://kpri-sms-api.xxx.workers.dev)

## Struktur Proyek

```
cloudflare/
├── worker/              # Hono API backend
│   ├── src/index.ts     # Routes & logic
│   ├── wrangler.toml    # Cloudflare config
│   └── package.json
├── frontend/            # Vite + React frontend
│   ├── src/
│   │   ├── pages/       # Halaman aplikasi
│   │   ├── components/  # UI components (shadcn/ui)
│   │   ├── lib/         # API client, utils
│   │   └── App.tsx      # Routing
│   └── dist/            # Build output (static)
└── data/
    ├── schema.sql       # D1 table definitions
    └── seed.sql         # Data export (3.9 MB, 1825 anggota)
```
