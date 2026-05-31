-- ============================================
-- JALANKAN SCRIPT INI DI pgAdmin4 Query Tool
-- ============================================

-- 1. Buat Database (jalankan terpisah di pgAdmin jika belum ada)
-- CREATE DATABASE nutriscan_db;

-- 2. Pastikan Anda sudah connect ke database nutriscan_db
--    lalu jalankan query di bawah ini:

-- 3. Buat tabel users
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100)        NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    password   VARCHAR(255)        NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Verifikasi tabel berhasil dibuat
SELECT * FROM users;
