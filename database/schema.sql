-- Hapus tabel jika sudah ada (urut berdasarkan dependensi foreign key)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_details CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Tabel Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin', 'merchant')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Merchants
CREATE TABLE merchants (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    description TEXT
);

-- 4. Tabel Menus
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    merchant_id INT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(30) UNIQUE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diproses', 'siap_diambil', 'selesai')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Order Details
CREATE TABLE order_details (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id INT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- 7. Tabel Payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'berhasil', 'ditolak')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DATA DUMMY (Password untuk semua akun: 123456)
-- Hash Bcrypt Asli: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW
INSERT INTO users (name, email, password, phone, role) VALUES 
('Keke Student', 'mahasiswa@kantin.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', '081234567890', 'student'),
('Admin Utama', 'admin@kantin.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', '081298765432', 'admin'),
('Kantin Mbok Sri', 'merchant@kantin.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', '081311223344', 'merchant');

INSERT INTO merchants (user_id, merchant_name, description) VALUES
(3, 'Kantin Mbok Sri', 'Menyediakan Makanan Khas Nusantara');

INSERT INTO categories (category_name, description) VALUES
('Makanan Utama', 'Menu Makanan Berat'),
('Minuman', 'Aneka Minuman Segar');

INSERT INTO menus (merchant_id, category_id, name, description, price, is_available) VALUES
(1, 1, 'Nasi Ayam Penyet', 'Nasi + Ayam Penyet + Sambal + Lalapan', 18000.00, TRUE),
(1, 1, 'Mie Goreng Spesial', 'Mie Goreng + Telur + Bakso', 15000.00, TRUE),
(1, 2, 'Es Teh Manis', 'Es Teh Segar Manis', 5000.00, TRUE);

-- Orders Dummy
INSERT INTO orders (user_id, order_number, total, status, notes) VALUES
(1, 'ORD-20261019-001', 23000.00, 'diproses', 'Pedas sedang ya mbok'),
(1, 'ORD-20261019-002', 15000.00, 'selesai', 'Tanpa sayur');

-- Order Details Dummy
INSERT INTO order_details (order_id, menu_id, quantity, price, subtotal) VALUES
(1, 1, 1, 18000.00, 18000.00),
(1, 3, 1, 5000.00, 5000.00),
(2, 2, 1, 15000.00, 15000.00);

-- Payments Dummy
INSERT INTO payments (order_id, amount, payment_method, status, paid_at) VALUES
(1, 23000.00, 'QRIS', 'berhasil', CURRENT_TIMESTAMP),
(2, 15000.00, 'Tunai', 'berhasil', CURRENT_TIMESTAMP);