const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || 'nutriscan',
    user:     process.env.DB_USER     || 'postgres',
    // Gunakan null jika password kosong agar pg tidak error SASL
    password: process.env.DB_PASSWORD || null,
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
