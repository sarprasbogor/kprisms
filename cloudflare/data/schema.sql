CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ANGGOTA' CHECK(role IN ('SUPER_ADMIN','ADMIN_KEANGGOTAAN','BENDAHARA','PENGURUS','ANGGOTA')),
  anggota_id TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (anggota_id) REFERENCES anggota(id)
);

CREATE TABLE IF NOT EXISTS anggota (
  id TEXT PRIMARY KEY,
  nik TEXT NOT NULL UNIQUE,
  nikop TEXT NOT NULL UNIQUE,
  nama_lengkap TEXT NOT NULL,
  tempat_lahir TEXT NOT NULL DEFAULT '-',
  tanggal_lahir TEXT NOT NULL,
  jenis_kelamin TEXT NOT NULL CHECK(jenis_kelamin IN ('LAKI_LAKI','PEREMPUAN')),
  status_pernikahan TEXT CHECK(status_pernikahan IN ('BELUM_MENIKAH','MENIKAH','CERAI_HIDUP','CERAI_MATI')),
  alamat_jalan TEXT NOT NULL DEFAULT '-',
  rt_rw TEXT,
  kelurahan TEXT NOT NULL DEFAULT '-',
  kecamatan TEXT NOT NULL DEFAULT '-',
  kota TEXT NOT NULL DEFAULT 'Kabupaten Bogor',
  provinsi TEXT NOT NULL DEFAULT 'Jawa Barat',
  kode_pos TEXT,
  nomor_hp TEXT NOT NULL UNIQUE,
  email TEXT,
  unit_kerja TEXT NOT NULL DEFAULT '-',
  jabatan TEXT,
  status_kepegawaian TEXT NOT NULL DEFAULT 'HONORER' CHECK(status_kepegawaian IN ('PNS','PPPK','KONTRAK','HONORER')),
  nip TEXT UNIQUE,
  golongan_ruang TEXT,
  masa_kerja_tahun INTEGER,
  tmt_pns TEXT,
  tmt_jabatan TEXT,
  nomor_induk_non_pns TEXT UNIQUE,
  jenis_non_pns TEXT,
  tanggal_mulai_kontrak TEXT,
  tanggal_berakhir_kontrak TEXT,
  penghasilan_tetap REAL,
  tanggal_daftar TEXT NOT NULL DEFAULT (datetime('now')),
  tanggal_aktif TEXT,
  tanggal_nonaktif TEXT,
  status_keanggotaan TEXT NOT NULL DEFAULT 'CALON' CHECK(status_keanggotaan IN ('CALON','AKTIF','NONAKTIF','MENINGGAL','DIBERHENTIKAN')),
  alasan_nonaktif TEXT,
  tanggal_pensiun TEXT,
  tanggal_meninggal TEXT,
  nama_ahli_waris TEXT,
  hubungan_ahli_waris TEXT,
  hp_ahli_waris TEXT,
  nomor_rekening TEXT,
  nama_bank TEXT,
  foto_url TEXT,
  foto_ktp_url TEXT,
  surat_keterangan_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS simpanan_pokok (
  id TEXT PRIMARY KEY,
  anggota_id TEXT NOT NULL,
  jumlah REAL NOT NULL,
  status_lunas INTEGER NOT NULL DEFAULT 0,
  cicilan_ke INTEGER,
  total_cicilan INTEGER,
  tanggal_bayar TEXT NOT NULL DEFAULT (datetime('now')),
  keterangan TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (anggota_id) REFERENCES anggota(id)
);

CREATE TABLE IF NOT EXISTS simpanan_wajib (
  id TEXT PRIMARY KEY,
  anggota_id TEXT NOT NULL,
  bulan INTEGER NOT NULL,
  tahun INTEGER NOT NULL,
  jumlah REAL NOT NULL DEFAULT 100000,
  tanggal_bayar TEXT NOT NULL DEFAULT (datetime('now')),
  status_lunas INTEGER NOT NULL DEFAULT 0,
  denda REAL NOT NULL DEFAULT 0,
  keterangan TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (anggota_id) REFERENCES anggota(id),
  UNIQUE(anggota_id, bulan, tahun)
);

CREATE TABLE IF NOT EXISTS simpanan_sukarela (
  id TEXT PRIMARY KEY,
  anggota_id TEXT NOT NULL,
  jenis TEXT NOT NULL DEFAULT 'SETORAN',
  jumlah REAL NOT NULL,
  saldo_setelah REAL NOT NULL,
  tanggal TEXT NOT NULL DEFAULT (datetime('now')),
  keterangan TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (anggota_id) REFERENCES anggota(id)
);

CREATE TABLE IF NOT EXISTS jenis_pinjaman (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  bunga_flat REAL NOT NULL DEFAULT 0,
  bunga_efektif REAL NOT NULL DEFAULT 0,
  maksimal REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pinjaman (
  id TEXT PRIMARY KEY,
  anggota_id TEXT NOT NULL,
  jenis_pinjaman_id TEXT NOT NULL,
  jumlah REAL NOT NULL,
  jangka_waktu INTEGER NOT NULL,
  bunga REAL NOT NULL DEFAULT 0,
  angsuran_per_bulan REAL NOT NULL,
  tujuan TEXT,
  dokumen_pendukung TEXT,
  status TEXT NOT NULL DEFAULT 'DIAJUKAN' CHECK(status IN ('DIAJUKAN','DIVERIFIKASI','DISETUJUI','CAIR','LUNAS','BERMASALAH')),
  catatan TEXT,
  tanggal_pengajuan TEXT NOT NULL DEFAULT (datetime('now')),
  tanggal_cair TEXT,
  bukti_transfer TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (anggota_id) REFERENCES anggota(id),
  FOREIGN KEY (jenis_pinjaman_id) REFERENCES jenis_pinjaman(id)
);

CREATE TABLE IF NOT EXISTS angsuran (
  id TEXT PRIMARY KEY,
  pinjaman_id TEXT NOT NULL,
  angsuran_ke INTEGER NOT NULL,
  tanggal_jatuh_tempo TEXT NOT NULL,
  tanggal_bayar TEXT,
  jumlah_pokok REAL NOT NULL,
  jumlah_bunga REAL NOT NULL,
  denda REAL NOT NULL DEFAULT 0,
  status_lunas INTEGER NOT NULL DEFAULT 0,
  keterangan TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (pinjaman_id) REFERENCES pinjaman(id)
);

CREATE TABLE IF NOT EXISTS shu_anggota (
  id TEXT PRIMARY KEY,
  tahun INTEGER NOT NULL,
  anggota_id TEXT NOT NULL,
  simpanan_wajib REAL NOT NULL DEFAULT 0,
  simpanan_pokok REAL NOT NULL DEFAULT 0,
  total_simpanan REAL NOT NULL DEFAULT 0,
  shu_simpanan REAL NOT NULL DEFAULT 0,
  angsuran_pinjaman REAL,
  shu_pinjaman REAL NOT NULL DEFAULT 0,
  shu_total REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (anggota_id) REFERENCES anggota(id),
  UNIQUE(anggota_id, tahun)
);

CREATE TABLE IF NOT EXISTS akun_akuntansi (
  id TEXT PRIMARY KEY,
  kode_akun TEXT NOT NULL UNIQUE,
  nama_akun TEXT NOT NULL,
  tipe_akun TEXT NOT NULL CHECK(tipe_akun IN ('ASET','KEWAJIBAN','EKUITAS','PENDAPATAN','BEBAN')),
  saldo_normal TEXT NOT NULL,
  deskripsi TEXT,
  induk_id TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (induk_id) REFERENCES akun_akuntansi(id)
);

CREATE TABLE IF NOT EXISTS jurnal (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL DEFAULT (datetime('now')),
  no_jurnal TEXT NOT NULL UNIQUE,
  keterangan TEXT,
  sumber TEXT,
  is_posting INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jurnal_detail (
  id TEXT PRIMARY KEY,
  jurnal_id TEXT NOT NULL,
  akun_id TEXT NOT NULL,
  debit REAL NOT NULL DEFAULT 0,
  kredit REAL NOT NULL DEFAULT 0,
  keterangan TEXT,
  FOREIGN KEY (jurnal_id) REFERENCES jurnal(id),
  FOREIGN KEY (akun_id) REFERENCES akun_akuntansi(id)
);

CREATE TABLE IF NOT EXISTS pengurus (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  foto TEXT,
  kontak TEXT,
  tugas_pokok TEXT,
  periode_mulai TEXT NOT NULL,
  periode_selesai TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pengawas (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  foto TEXT,
  kontak TEXT,
  tugas_pokok TEXT,
  periode_mulai TEXT NOT NULL,
  periode_selesai TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS karyawan (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  unit_kerja TEXT,
  nik TEXT UNIQUE,
  no_telepon TEXT,
  alamat TEXT,
  gaji_pokok REAL,
  tanggal_masuk TEXT NOT NULL DEFAULT (datetime('now')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rapat (
  id TEXT PRIMARY KEY,
  jenis TEXT NOT NULL,
  judul TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  agenda TEXT,
  notulen TEXT,
  lokasi TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS aturan (
  id TEXT PRIMARY KEY,
  jenis TEXT NOT NULL,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  file_url TEXT,
  tanggal_berlaku TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS legalitas (
  id TEXT PRIMARY KEY,
  jenis TEXT NOT NULL,
  nomor TEXT NOT NULL,
  tanggal_terbit TEXT NOT NULL,
  masa_berlaku TEXT,
  file_url TEXT,
  keterangan TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS aset (
  id TEXT PRIMARY KEY,
  nama_aset TEXT NOT NULL,
  kategori TEXT NOT NULL,
  tanggal_perolehan TEXT NOT NULL,
  nilai_perolehan REAL NOT NULL,
  umur_ekonomis INTEGER NOT NULL,
  nilai_penyusutan REAL NOT NULL DEFAULT 0,
  nilai_buku REAL NOT NULL,
  lokasi TEXT,
  foto TEXT,
  kondisi TEXT NOT NULL DEFAULT 'BAIK' CHECK(kondisi IN ('BAIK','RUSAK','HILANG')),
  status TEXT NOT NULL DEFAULT 'AKTIF' CHECK(status IN ('AKTIF','DIHAPUSKAN')),
  keterangan TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rat (
  id TEXT PRIMARY KEY,
  tahun INTEGER NOT NULL UNIQUE,
  tanggal TEXT NOT NULL,
  agenda TEXT,
  notulen TEXT,
  daftar_hadir TEXT,
  laporan_pj TEXT,
  sisa_hasil_usaha REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifikasi (
  id TEXT PRIMARY KEY,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  tipe TEXT NOT NULL DEFAULT 'INFO',
  tanggal TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_anggota_unit_kerja ON anggota(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_anggota_status ON anggota(status_keanggotaan);
CREATE INDEX IF NOT EXISTS idx_simpanan_pokok_anggota ON simpanan_pokok(anggota_id);
CREATE INDEX IF NOT EXISTS idx_simpanan_wajib_anggota ON simpanan_wajib(anggota_id);
CREATE INDEX IF NOT EXISTS idx_simpanan_sukarela_anggota ON simpanan_sukarela(anggota_id);
CREATE INDEX IF NOT EXISTS idx_pinjaman_anggota ON pinjaman(anggota_id);
CREATE INDEX IF NOT EXISTS idx_pinjaman_status ON pinjaman(status);
CREATE INDEX IF NOT EXISTS idx_angsuran_pinjaman ON angsuran(pinjaman_id);
CREATE INDEX IF NOT EXISTS idx_shu_anggota ON shu_anggota(anggota_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_tanggal ON jurnal(tanggal);
CREATE INDEX IF NOT EXISTS idx_jurnal_detail_akun ON jurnal_detail(akun_id);
