import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    console.error("❌ JWT_SECRET wajib dikonfigurasi di file .env!");
}

// Middleware Autentikasi JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(403).json({ error: 'Akses ditolak. Token tidak ditemukan.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token tidak valid.' });
        req.user = decoded;
        next();
    });
};

// API Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
        res.json({ token, role: user.role, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Riwayat Pesanan Mahasiswa (JOIN Query)
router.get('/orders/history', verifyToken, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Akses khusus mahasiswa.' });
    try {
        const query = `
            SELECT 
                o.id,
                o.order_number,
                o.total,
                o.status,
                o.notes,
                o.created_at,
                COALESCE(p.status, 'menunggu') AS payment_status,
                COALESCE(p.payment_method, 'QRIS') AS payment_method,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'detail_id', od.id,
                            'menu_name', m.name,
                            'quantity', od.quantity,
                            'price', od.price,
                            'subtotal', od.subtotal
                        )
                    ) FILTER (WHERE od.id IS NOT NULL), '[]'
                ) AS items
            FROM orders o
            LEFT JOIN payments p ON p.order_id = o.id
            LEFT JOIN order_details od ON od.order_id = o.id
            LEFT JOIN menus m ON m.id = od.menu_id
            WHERE o.user_id = $1
            GROUP BY o.id, p.status, p.payment_method
            ORDER BY o.created_at DESC;
        `;
        const result = await pool.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Daftar Semua Pesanan untuk Dashboard Admin
router.get('/orders', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Akses khusus admin.' });
    try {
        const query = `
            SELECT 
                o.id,
                o.order_number,
                u.name AS student_name,
                o.total,
                o.status,
                o.notes,
                o.created_at,
                COALESCE(p.status, 'menunggu') AS payment_status,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'menu_name', m.name,
                            'quantity', od.quantity,
                            'price', od.price,
                            'subtotal', od.subtotal
                        )
                    ) FILTER (WHERE od.id IS NOT NULL), '[]'
                ) AS items
            FROM orders o
            JOIN users u ON u.id = o.user_id
            LEFT JOIN payments p ON p.order_id = o.id
            LEFT JOIN order_details od ON od.order_id = o.id
            LEFT JOIN menus m ON m.id = od.menu_id
            GROUP BY o.id, u.name, p.status
            ORDER BY o.created_at DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Update Status Pesanan oleh Admin
router.put('/orders/:id/status', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Akses ditolak. Khusus Admin.' });
    
    const { id } = req.params;
    const { status } = req.body; 
    
    const allowedStatuses = ['menunggu', 'diproses', 'siap_diambil', 'selesai'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status pesanan tidak valid.' });
    }
    
    try {
        const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
        }
        res.json({ message: `Status diperbarui menjadi ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;