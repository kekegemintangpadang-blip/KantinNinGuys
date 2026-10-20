import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

export const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'kantinninguys',
    password: process.env.DB_PASSWORD || '12345',
    port: process.env.DB_PORT || 5432,
});

pool.query('SELECT 1')
    .then(() => console.log('✅ Berhasil terhubung ke PostgreSQL (KantinNinGuys)'))
    .catch(err => console.error('❌ Gagal terhubung ke database:', err.stack));