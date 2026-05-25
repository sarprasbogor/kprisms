-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ANGGOTA',
    "anggotaId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "anggota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nik" TEXT NOT NULL,
    "nikop" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" DATETIME NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "statusPernikahan" TEXT,
    "alamatJalan" TEXT NOT NULL,
    "rtRw" TEXT,
    "kelurahan" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kota" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kodePos" TEXT,
    "nomorHp" TEXT NOT NULL,
    "email" TEXT,
    "unitKerja" TEXT NOT NULL,
    "jabatan" TEXT,
    "statusKepegawaian" TEXT NOT NULL,
    "nip" TEXT,
    "golonganRuang" TEXT,
    "masaKerjaTahun" INTEGER,
    "tmtPns" DATETIME,
    "tmtJabatan" DATETIME,
    "nomorIndukNonPns" TEXT,
    "jenisNonPns" TEXT,
    "tanggalMulaiKontrak" DATETIME,
    "tanggalBerakhirKontrak" DATETIME,
    "penghasilanTetap" REAL,
    "tanggalDaftar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalAktif" DATETIME,
    "tanggalNonaktif" DATETIME,
    "statusKeanggotaan" TEXT NOT NULL DEFAULT 'CALON',
    "alasanNonaktif" TEXT,
    "tanggalPensiun" DATETIME,
    "tanggalMeninggal" DATETIME,
    "namaAhliWaris" TEXT,
    "hubunganAhliWaris" TEXT,
    "hpAhliWaris" TEXT,
    "nomorRekening" TEXT,
    "namaBank" TEXT,
    "fotoUrl" TEXT,
    "fotoKtpUrl" TEXT,
    "suratKeteranganUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "simpanan_pokok" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anggotaId" TEXT NOT NULL,
    "jumlah" REAL NOT NULL,
    "statusLunas" BOOLEAN NOT NULL DEFAULT false,
    "cicilanKe" INTEGER,
    "totalCicilan" INTEGER,
    "tanggalBayar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "simpanan_pokok_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "simpanan_wajib" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anggotaId" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "jumlah" REAL NOT NULL DEFAULT 100000,
    "tanggalBayar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusLunas" BOOLEAN NOT NULL DEFAULT false,
    "denda" REAL NOT NULL DEFAULT 0,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "simpanan_wajib_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "simpanan_sukarela" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anggotaId" TEXT NOT NULL,
    "jenis" TEXT NOT NULL DEFAULT 'SETORAN',
    "jumlah" REAL NOT NULL,
    "saldoSetelah" REAL NOT NULL,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "simpanan_sukarela_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "jenis_pinjaman" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "bungaFlat" REAL NOT NULL DEFAULT 0,
    "bungaEfektif" REAL NOT NULL DEFAULT 0,
    "maksimal" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pinjaman" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anggotaId" TEXT NOT NULL,
    "jenisPinjamanId" TEXT NOT NULL,
    "jumlah" REAL NOT NULL,
    "jangkaWaktu" INTEGER NOT NULL,
    "bunga" REAL NOT NULL DEFAULT 0,
    "angsuranPerBulan" REAL NOT NULL,
    "tujuan" TEXT,
    "dokumenPendukung" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DIAJUKAN',
    "catatan" TEXT,
    "tanggalPengajuan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalCair" DATETIME,
    "buktiTransfer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pinjaman_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pinjaman_jenisPinjamanId_fkey" FOREIGN KEY ("jenisPinjamanId") REFERENCES "jenis_pinjaman" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "angsuran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pinjamanId" TEXT NOT NULL,
    "angsuranKe" INTEGER NOT NULL,
    "tanggalJatuhTempo" DATETIME NOT NULL,
    "tanggalBayar" DATETIME,
    "jumlahPokok" REAL NOT NULL,
    "jumlahBunga" REAL NOT NULL,
    "denda" REAL NOT NULL DEFAULT 0,
    "statusLunas" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "angsuran_pinjamanId_fkey" FOREIGN KEY ("pinjamanId") REFERENCES "pinjaman" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "akun_akuntansi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kodeAkun" TEXT NOT NULL,
    "namaAkun" TEXT NOT NULL,
    "tipeAkun" TEXT NOT NULL,
    "saldoNormal" TEXT NOT NULL,
    "deskripsi" TEXT,
    "indukId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "akun_akuntansi_indukId_fkey" FOREIGN KEY ("indukId") REFERENCES "akun_akuntansi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "jurnal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "noJurnal" TEXT NOT NULL,
    "keterangan" TEXT,
    "sumber" TEXT,
    "isPosting" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "jurnal_detail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jurnalId" TEXT NOT NULL,
    "akunId" TEXT NOT NULL,
    "debit" REAL NOT NULL DEFAULT 0,
    "kredit" REAL NOT NULL DEFAULT 0,
    "keterangan" TEXT,
    CONSTRAINT "jurnal_detail_jurnalId_fkey" FOREIGN KEY ("jurnalId") REFERENCES "jurnal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jurnal_detail_akunId_fkey" FOREIGN KEY ("akunId") REFERENCES "akun_akuntansi" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pengurus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "foto" TEXT,
    "kontak" TEXT,
    "tugasPokok" TEXT,
    "periodeMulai" DATETIME NOT NULL,
    "periodeSelesai" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pengawas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "foto" TEXT,
    "kontak" TEXT,
    "tugasPokok" TEXT,
    "periodeMulai" DATETIME NOT NULL,
    "periodeSelesai" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "karyawan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "unitKerja" TEXT,
    "nik" TEXT,
    "noTelepon" TEXT,
    "alamat" TEXT,
    "gajiPokok" REAL,
    "tanggalMasuk" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "rapat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenis" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "agenda" TEXT,
    "notulen" TEXT,
    "lokasi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "aturan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenis" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "fileUrl" TEXT,
    "tanggalBerlaku" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "legalitas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenis" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "tanggalTerbit" DATETIME NOT NULL,
    "masaBerlaku" DATETIME,
    "fileUrl" TEXT,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "aset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "namaAset" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "tanggalPerolehan" DATETIME NOT NULL,
    "nilaiPerolehan" REAL NOT NULL,
    "umurEkonomis" INTEGER NOT NULL,
    "nilaiPenyusutan" REAL NOT NULL DEFAULT 0,
    "nilaiBuku" REAL NOT NULL,
    "lokasi" TEXT,
    "foto" TEXT,
    "kondisi" TEXT NOT NULL DEFAULT 'BAIK',
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "rat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tahun" INTEGER NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "agenda" TEXT,
    "notulen" TEXT,
    "daftarHadir" TEXT,
    "laporanPj" TEXT,
    "sisaHasilUsaha" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'INFO',
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_anggotaId_key" ON "users"("anggotaId");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_nik_key" ON "anggota"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_nikop_key" ON "anggota"("nikop");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_nomorHp_key" ON "anggota"("nomorHp");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_nip_key" ON "anggota"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_nomorIndukNonPns_key" ON "anggota"("nomorIndukNonPns");

-- CreateIndex
CREATE UNIQUE INDEX "simpanan_wajib_anggotaId_bulan_tahun_key" ON "simpanan_wajib"("anggotaId", "bulan", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "jenis_pinjaman_nama_key" ON "jenis_pinjaman"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "akun_akuntansi_kodeAkun_key" ON "akun_akuntansi"("kodeAkun");

-- CreateIndex
CREATE UNIQUE INDEX "jurnal_noJurnal_key" ON "jurnal"("noJurnal");

-- CreateIndex
CREATE UNIQUE INDEX "karyawan_nik_key" ON "karyawan"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "rat_tahun_key" ON "rat"("tahun");
