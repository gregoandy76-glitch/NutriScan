const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || 'nutriscan',
    user:     process.env.DB_USER     || 'postgres',
    // Gunakan null jika password kosong agar pg tidak error SASL
    password: process.env.DB_PASSWORD || null,
    // Mencegah koneksi idle yang terputus crash server
    keepAlive: true,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Handle error pada koneksi idle agar server tidak crash
pool.on('error', (err, client) => {
    console.error('⚠️ Koneksi PostgreSQL terputus (idle):', err.message);
    // Tidak throw error — biarkan pool reconnect otomatis
});

pool.connect()
    .then(() => console.log('✅ Terhubung ke PostgreSQL'))
    .catch(err => {
        console.error('❌ Gagal koneksi PostgreSQL:', err.message);
        if (err.message.includes('password')) {
            console.error('   → Periksa DB_PASSWORD di file .env backend');
        }
        if (err.message.includes('does not exist')) {
            console.error('   → Database belum dibuat. Buka pgAdmin → buat database "nutriscan"');
        }
    });

module.exports = pool;
