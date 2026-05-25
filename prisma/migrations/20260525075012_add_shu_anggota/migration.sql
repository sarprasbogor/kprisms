-- CreateTable
CREATE TABLE "shu_anggota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tahun" INTEGER NOT NULL,
    "anggotaId" TEXT NOT NULL,
    "simpananWajib" REAL NOT NULL DEFAULT 0,
    "simpananPokok" REAL NOT NULL DEFAULT 0,
    "totalSimpanan" REAL NOT NULL DEFAULT 0,
    "shuSimpanan" REAL NOT NULL DEFAULT 0,
    "angsuranPinjaman" REAL,
    "shuPinjaman" REAL NOT NULL DEFAULT 0,
    "shuTotal" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "shu_anggota_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "shu_anggota_anggotaId_tahun_key" ON "shu_anggota"("anggotaId", "tahun");
