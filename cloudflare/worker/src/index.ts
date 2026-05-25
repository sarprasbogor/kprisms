import { Hono } from "hono";
import { cors } from "hono/cors";
import { sign, verify } from "hono/jwt";
import type { D1Database } from "@cloudflare/workers-types";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  userId: string;
  userRole: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("/api/*", cors({ origin: "*", credentials: true }));

// ─── helpers ──────────────────────────────────────────────
const hashPassword = async (password: string, salt: string): Promise<string> => {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" },
    key, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
};

const sha256Hash = async (password: string, salt: string): Promise<string> => {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(password + salt));
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
};

const genId = (): string => crypto.randomUUID();

const ok = (data: any) => new Response(JSON.stringify({ success: true, data }), {
  headers: { "Content-Type": "application/json" },
});
const err = (msg: string, status = 400) => new Response(JSON.stringify({ success: false, error: msg }), {
  status, headers: { "Content-Type": "application/json" },
});

// ─── AUTH ─────────────────────────────────────────────────
const SALT = "kpri-sms-2026";

app.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return err("Email dan password wajib diisi");

  const user = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first<any>();
  if (!user) return err("Email tidak ditemukan", 401);

  const hash = await hashPassword(password, SALT);
  if (hash === user.password) {
    // PBKDF2 match
  } else {
    // Try SHA256 legacy (imported from seed)
    const sha256 = await sha256Hash(password, SALT);
    if (sha256 === user.password) {
      // Migrate to PBKDF2
      await c.env.DB.prepare("UPDATE users SET password = ? WHERE id = ?").bind(hash, user.id).run();
    } else {
      // Try bcrypt legacy
      const { default: bcrypt } = await import("bcryptjs");
      const match = await bcrypt.compare(password, user.password);
      if (!match) return err("Password salah", 401);
      // Migrate to new hash
      await c.env.DB.prepare("UPDATE users SET password = ? WHERE id = ?").bind(hash, user.id).run();
    }
  }

  const token = await sign(
    { sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 86400 * 7 },
    c.env.JWT_SECRET
  );
  return ok({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post("/api/auth/register", async (c) => {
  const { email, password, name } = await c.req.json();
  if (!email || !password || !name) return err("Semua field wajib diisi");

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return err("Email sudah terdaftar");

  const hash = await hashPassword(password, SALT);
  const id = genId();

  await c.env.DB.prepare(
    "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, 'ANGGOTA')"
  ).bind(id, email, hash, name).run();

  return ok({ id, email, name });
});

app.use("/api/*", async (c, next) => {
  const auth = c.req.header("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const token = auth.slice(7);
    const payload = await verify(token, c.env.JWT_SECRET, "HS256");
    c.set("userId", payload.sub as string);
    c.set("userRole", payload.role as string);
    await next();
  } catch {
    return c.json({ error: "Token tidak valid" }, 401);
  }
});

// ─── ANGGOTA ──────────────────────────────────────────────
app.get("/api/anggota", async (c) => {
  const { search, unit, status, limit = "50", offset = "0" } = c.req.query();
  let sql = "SELECT * FROM anggota WHERE 1=1";
  const bind: any[] = [];

  if (search) { sql += " AND (nama_lengkap LIKE ? OR nikop LIKE ?)"; bind.push(`%${search}%`, `%${search}%`); }
  if (unit) { sql += " AND unit_kerja = ?"; bind.push(unit); }
  if (status) { sql += " AND status_keanggotaan = ?"; bind.push(status); }

  sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  bind.push(parseInt(limit), parseInt(offset));

  const { results } = await c.env.DB.prepare(sql).bind(...bind).all();
  return ok(results);
});

app.get("/api/anggota/:id", async (c) => {
  const anggota = await c.env.DB.prepare("SELECT * FROM anggota WHERE id = ?").bind(c.req.param("id")).first();
  if (!anggota) return err("Anggota tidak ditemukan", 404);
  return ok(anggota);
});

app.post("/api/anggota", async (c) => {
  const body = await c.req.json();
  const id = genId();
  const fields = Object.keys(body).map(k => k).join(", ");
  const vals = Object.keys(body).map((_, i) => `?`).join(", ");
  // Must match column order from schema
  await c.env.DB.prepare(`INSERT INTO anggota (id, ${fields}, created_at, updated_at) VALUES (?, ${vals}, datetime('now'), datetime('now'))`)
    .bind(id, ...Object.values(body)).run();
  return ok({ id });
});

app.put("/api/anggota/:id", async (c) => {
  const body = await c.req.json();
  const sets = Object.keys(body).map(k => `${k} = ?`).join(", ");
  await c.env.DB.prepare(`UPDATE anggota SET ${sets}, updated_at = datetime('now') WHERE id = ?`)
    .bind(...Object.values(body), c.req.param("id")).run();
  return ok({ success: true });
});

app.delete("/api/anggota/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM anggota WHERE id = ?").bind(c.req.param("id")).run();
  return ok({ success: true });
});

// ─── DASHBOARD ────────────────────────────────────────────
app.get("/api/dashboard/stats", async (c) => {
  const [total] = (await c.env.DB.prepare("SELECT COUNT(*) as count FROM anggota").all()).results;
  const [aktif] = (await c.env.DB.prepare("SELECT COUNT(*) as count FROM anggota WHERE status_keanggotaan = 'AKTIF'").all()).results;
  const [totalSimpanan] = (await c.env.DB.prepare("SELECT COALESCE(SUM(jumlah),0) as total FROM simpanan_wajib").all()).results;
  const [totalPiutang] = (await c.env.DB.prepare("SELECT COALESCE(SUM(jumlah),0) as total FROM pinjaman WHERE status IN ('CAIR','BERMASALAH')").all()).results;
  const [totalShu] = (await c.env.DB.prepare("SELECT COALESCE(SUM(shu_total),0) as total FROM shu_anggota WHERE tahun = 2025").all()).results;

  return ok({
    totalAnggota: (total as any).count,
    anggotaAktif: (aktif as any).count,
    totalSimpanan: (totalSimpanan as any).total,
    totalPiutang: (totalPiutang as any).total,
    totalShu: (totalShu as any).total,
  });
});

// ─── UNIT KERJA ───────────────────────────────────────────
app.get("/api/unit-kerja", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT unit_kerja as nama, COUNT(*) as jumlah FROM anggota GROUP BY unit_kerja ORDER BY jumlah DESC"
  ).all();
  return ok(results);
});

// ─── SIMPANAN ─────────────────────────────────────────────
app.get("/api/simpanan-pokok", async (c) => {
  const { anggota_id } = c.req.query();
  let sql = "SELECT sp.*, a.nama_lengkap, a.nikop FROM simpanan_pokok sp JOIN anggota a ON a.id = sp.anggota_id";
  const bind: any[] = [];
  if (anggota_id) { sql += " WHERE sp.anggota_id = ?"; bind.push(anggota_id); }
  sql += " ORDER BY sp.tanggal_bayar DESC";
  const { results } = await c.env.DB.prepare(sql).bind(...bind).all();
  return ok(results);
});

app.post("/api/simpanan-pokok", async (c) => {
  const { anggota_id, jumlah, keterangan } = await c.req.json();
  const id = genId();
  await c.env.DB.prepare(
    "INSERT INTO simpanan_pokok (id, anggota_id, jumlah, status_lunas, tanggal_bayar, keterangan) VALUES (?, ?, ?, 1, datetime('now'), ?)"
  ).bind(id, anggota_id, jumlah, keterangan || null).run();
  return ok({ id });
});

app.get("/api/simpanan-wajib", async (c) => {
  const { anggota_id, tahun, bulan } = c.req.query();
  let sql = "SELECT sw.*, a.nama_lengkap, a.nikop FROM simpanan_wajib sw JOIN anggota a ON a.id = sw.anggota_id WHERE 1=1";
  const bind: any[] = [];
  if (anggota_id) { sql += " AND sw.anggota_id = ?"; bind.push(anggota_id); }
  if (tahun) { sql += " AND sw.tahun = ?"; bind.push(parseInt(tahun)); }
  if (bulan) { sql += " AND sw.bulan = ?"; bind.push(parseInt(bulan)); }
  sql += " ORDER BY sw.tahun DESC, sw.bulan DESC";
  const { results } = await c.env.DB.prepare(sql).bind(...bind).all();
  return ok(results);
});

app.post("/api/simpanan-wajib", async (c) => {
  const { anggota_id, bulan, tahun, jumlah, denda } = await c.req.json();
  const id = genId();
  await c.env.DB.prepare(
    "INSERT INTO simpanan_wajib (id, anggota_id, bulan, tahun, jumlah, status_lunas, tanggal_bayar, denda) VALUES (?, ?, ?, ?, ?, 1, datetime('now'), ?)"
  ).bind(id, anggota_id, bulan, tahun, jumlah, denda || 0).run();
  return ok({ id });
});

app.get("/api/simpanan-sukarela", async (c) => {
  const { anggota_id } = c.req.query();
  let sql = "SELECT ss.*, a.nama_lengkap, a.nikop FROM simpanan_sukarela ss JOIN anggota a ON a.id = ss.anggota_id";
  const bind: any[] = [];
  if (anggota_id) { sql += " WHERE ss.anggota_id = ?"; bind.push(anggota_id); }
  sql += " ORDER BY ss.tanggal DESC";
  const { results } = await c.env.DB.prepare(sql).bind(...bind).all();
  return ok(results);
});

// ─── PINJAMAN ─────────────────────────────────────────────
app.get("/api/pinjaman", async (c) => {
  const { status, anggota_id } = c.req.query();
  let sql = "SELECT p.*, a.nama_lengkap, a.nikop, jp.nama as jenis_pinjaman_nama FROM pinjaman p JOIN anggota a ON a.id = p.anggota_id JOIN jenis_pinjaman jp ON jp.id = p.jenis_pinjaman_id WHERE 1=1";
  const bind: any[] = [];
  if (status) { sql += " AND p.status = ?"; bind.push(status); }
  if (anggota_id) { sql += " AND p.anggota_id = ?"; bind.push(anggota_id); }
  sql += " ORDER BY p.tanggal_pengajuan DESC";
  const { results } = await c.env.DB.prepare(sql).bind(...bind).all();
  return ok(results);
});

app.post("/api/pinjaman", async (c) => {
  const body = await c.req.json();
  const id = genId();
  const angsuran = body.jumlah / body.jangka_waktu + (body.jumlah * (body.bunga || 0) / 100);
  await c.env.DB.prepare(
    "INSERT INTO pinjaman (id, anggota_id, jenis_pinjaman_id, jumlah, jangka_waktu, bunga, angsuran_per_bulan, tujuan, status, tanggal_pengajuan, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DIAJUKAN', datetime('now'), ?)"
  ).bind(id, body.anggota_id, body.jenis_pinjaman_id, body.jumlah, body.jangka_waktu, body.bunga || 0, angsuran, body.tujuan || null, body.catatan || null).run();
  return ok({ id });
});

app.put("/api/pinjaman/:id/approve", async (c) => {
  const { status, catatan, tanggal_cair } = await c.req.json();
  await c.env.DB.prepare("UPDATE pinjaman SET status = ?, catatan = ?, tanggal_cair = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(status, catatan || null, tanggal_cair || null, c.req.param("id")).run();
  return ok({ success: true });
});

app.get("/api/pinjaman/:id/angsuran", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM angsuran WHERE pinjaman_id = ? ORDER BY angsuran_ke")
    .bind(c.req.param("id")).all();
  return ok(results);
});

// ─── JENIS PINJAMAN ───────────────────────────────────────
app.get("/api/jenis-pinjaman", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM jenis_pinjaman ORDER BY nama").all();
  return ok(results);
});

// ─── SHU ──────────────────────────────────────────────────
app.get("/api/shu-anggota", async (c) => {
  const { tahun, anggota_id } = c.req.query();
  let sql = "SELECT s.*, a.nama_lengkap, a.nikop FROM shu_anggota s JOIN anggota a ON a.id = s.anggota_id WHERE 1=1";
  const bind: any[] = [];
  if (tahun) { sql += " AND s.tahun = ?"; bind.push(parseInt(tahun)); }
  if (anggota_id) { sql += " AND s.anggota_id = ?"; bind.push(anggota_id); }
  sql += " ORDER BY a.nama_lengkap";
  const { results } = await c.env.DB.prepare(sql).bind(...bind).all();
  return ok(results);
});

// ─── PENGURUS ─────────────────────────────────────────────
const crud = (table: string) => ({
  list: async (c: any) => {
    const { results } = await c.env.DB.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC`).all();
    return ok(results);
  },
  get: async (c: any) => {
    const row = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(c.req.param("id")).first();
    return row ? ok(row) : err("Not found", 404);
  },
  create: async (c: any) => {
    const body = await c.req.json();
    const id = genId();
    const keys = Object.keys(body).join(", ");
    const vals = Object.keys(body).map(() => "?").join(", ");
    await c.env.DB.prepare(`INSERT INTO ${table} (id, ${keys}) VALUES (?, ${vals})`).bind(id, ...Object.values(body)).run();
    return ok({ id });
  },
  update: async (c: any) => {
    const body = await c.req.json();
    const sets = Object.keys(body).map(k => `${k} = ?`).join(", ");
    await c.env.DB.prepare(`UPDATE ${table} SET ${sets}, updated_at = datetime('now') WHERE id = ?`)
      .bind(...Object.values(body), c.req.param("id")).run();
    return ok({ success: true });
  },
  remove: async (c: any) => {
    await c.env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(c.req.param("id")).run();
    return ok({ success: true });
  },
});

["pengurus", "pengawas", "karyawan"].forEach(t => {
  const h = crud(t);
  app.get(`/api/${t}`, h.list);
  app.get(`/api/${t}/:id`, h.get);
  app.post(`/api/${t}`, h.create);
  app.put(`/api/${t}/:id`, h.update);
  app.delete(`/api/${t}/:id`, h.remove);
});

// ─── ASET, ATURAN, LEGALITAS, RAPAT, RAT, NOTIFIKASI ─────
["aset", "aturan", "legalitas", "rapat", "rat", "notifikasi"].forEach(t => {
  const h = crud(t);
  app.get(`/api/${t}`, h.list);
  app.get(`/api/${t}/:id`, h.get);
  app.post(`/api/${t}`, h.create);
  app.put(`/api/${t}/:id`, h.update);
  app.delete(`/api/${t}/:id`, h.remove);
});

// ─── AKUNTANSI ────────────────────────────────────────────
app.get("/api/akun-akuntansi", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM akun_akuntansi ORDER BY kode_akun").all();
  return ok(results);
});

app.get("/api/jurnal", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT j.*, jd.id as detail_id, jd.akun_id, jd.debit, jd.kredit, jd.keterangan as detail_keterangan, a.nama_akun, a.kode_akun FROM jurnal j LEFT JOIN jurnal_detail jd ON jd.jurnal_id = j.id LEFT JOIN akun_akuntansi a ON a.id = jd.akun_id ORDER BY j.tanggal DESC"
  ).all();
  return ok(results);
});

// ─── STATIC ───────────────────────────────────────────────
export default app;
