/**
 * Kode Lengkap & Dokumentasi Resmi Proyek KantinNinGuys
 * Bagian: Orang 3 — Keranjang, Checkout, dan Pembayaran
 * Sesuai Struktur Resmi 7 Tabel: users, merchants, categories, menus, orders, order_details, payments
 */

export interface ProjectFile {
  path: string;
  filename: string;
  role: string;
  description: string;
  language: 'php' | 'sql' | 'javascript' | 'css' | 'html';
  code: string;
}

export const KANTIN_SQL = `-- =====================================================================
-- KANTINNINGUYS - SKEMA DATABASE RESMI SESUAI DOKUMEN WORD
-- Tujuh Tabel Utama: users, merchants, categories, menus, orders, order_details, payments
-- =====================================================================

CREATE DATABASE IF NOT EXISTS \`kantinninguys\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`kantinninguys\`;

-- 1. TABEL: users (Tanggung jawab Orang 5)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`phone\` VARCHAR(20) NULL,
  \`role\` ENUM('student', 'admin') DEFAULT 'student',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. TABEL: merchants (Tanggung jawab Orang 4)
CREATE TABLE IF NOT EXISTS \`merchants\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`description\` TEXT NULL,
  \`location\` VARCHAR(150) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. TABEL: categories (Tanggung jawab Orang 4)
CREATE TABLE IF NOT EXISTS \`categories\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`description\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. TABEL: menus (Tanggung jawab Orang 2 & Orang 4)
CREATE TABLE IF NOT EXISTS \`menus\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`merchant_id\` INT NOT NULL,
  \`category_id\` INT NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`description\` TEXT NULL,
  \`price\` DECIMAL(10, 2) NOT NULL,
  \`photo_url\` VARCHAR(255) NULL,
  \`stock\` INT NOT NULL DEFAULT 50,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`merchant_id\`) REFERENCES \`merchants\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. TABEL: orders (Tanggung jawab Orang 3)
CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT NOT NULL,
  \`order_number\` VARCHAR(30) NOT NULL UNIQUE,
  \`total\` DECIMAL(10, 2) NOT NULL,
  \`status\` ENUM('menunggu', 'diproses', 'siap_diambil', 'selesai') DEFAULT 'menunggu',
  \`notes\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. TABEL: order_details (Tanggung jawab Orang 3)
CREATE TABLE IF NOT EXISTS \`order_details\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`order_id\` INT NOT NULL,
  \`menu_id\` INT NOT NULL,
  \`jumlah\` INT NOT NULL,
  \`harga\` DECIMAL(10, 2) NOT NULL,
  \`subtotal\` DECIMAL(10, 2) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 7. TABEL: payments (Tanggung jawab Orang 3)
CREATE TABLE IF NOT EXISTS \`payments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`order_id\` INT NOT NULL,
  \`metode\` VARCHAR(30) NOT NULL,
  \`jumlah\` DECIMAL(10, 2) NOT NULL,
  \`tanggal_bayar\` TIMESTAMP NULL DEFAULT NULL,
  \`status\` ENUM('menunggu', 'berhasil', 'ditolak') DEFAULT 'menunggu',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- DATA DUMMY AWAL
INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password\`, \`phone\`, \`role\`) VALUES
(1, 'Ahmad Fauzi', 'ahmad@kampus.ac.id', '$2y$10$abcdefghijklmnopqrstuv', '081234567890', 'student'),
(2, 'Ibu Siti (Stand 01)', 'siti@kantin.ac.id', '$2y$10$abcdefghijklmnopqrstuv', '081298765432', 'admin'),
(3, 'Mas Eko (Stand 02)', 'eko@kantin.ac.id', '$2y$10$abcdefghijklmnopqrstuv', '081345678901', 'admin')
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);

INSERT INTO \`merchants\` (\`id\`, \`user_id\`, \`name\`, \`description\`, \`location\`) VALUES
(1, 2, 'Kantin Bu Siti - Aneka Nasi', 'Aneka olahan nasi, ayam krispi, geprek, dan gorengan hangat.', 'Stand 01 - Lantai 1'),
(2, 3, 'Kedai Mas Eko - Mie & Minuman', 'Spesialis mie dok-dok, racikan kopi susu gula aren, dan aneka minuman dingin.', 'Stand 02 - Lantai 1')
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);

INSERT INTO \`categories\` (\`id\`, \`name\`, \`description\`) VALUES
(1, 'Makanan', 'Aneka hidangan berat dan makanan utama'),
(2, 'Minuman', 'Aneka minuman segar dingin dan hangat'),
(3, 'Camilan', 'Aneka snack dan gorengan')
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);

INSERT INTO \`menus\` (\`id\`, \`merchant_id\`, \`category_id\`, \`name\`, \`description\`, \`price\`, \`photo_url\`, \`stock\`) VALUES
(1, 1, 1, 'Nasi Ayam Geprek Sambal Bawang', 'Ayam krispi digeprek dengan sambal bawang pedas khas Bu Siti, disajikan dengan nasi hangat dan lalapan.', 15000.00, 'ayam_geprek.jpg', 30),
(2, 1, 1, 'Nasi Goreng Spesial Telur', 'Nasi goreng racikan bumbu khas kantin dengan suwiran ayam, bakso, dan telur mata sapi renyah.', 13000.00, 'nasgor.jpg', 25),
(3, 1, 3, 'Tahu & Tempe Mendoan (Porsi)', 'Gorengan mendoan hangat gurih lengkap dengan sambal kecap rawit pedas manis.', 6000.00, 'mendoan.jpg', 40),
(4, 1, 2, 'Es Teh Manis Jumbo', 'Es teh melati segar porsi jumbo, pas untuk menemani istirahat kuliah siang.', 4000.00, 'es_teh.jpg', 50),
(5, 2, 1, 'Mie Dok-Dok Kuah Pedas', 'Mie kuah nyemek bumbu rempah pedas gurih dengan campuran telur kocok dan sayuran segar.', 12000.00, 'mie_dokdok.jpg', 20),
(6, 2, 2, 'Kopi Susu Gula Aren Dingin', 'Espresso susu creamy dengan pemanis gula aren asli, penambah semangat kuliah.', 8000.00, 'kopi_susu.jpg', 35)
ON DUPLICATE KEY UPDATE \`price\` = VALUES(\`price\`);
`;

export const PROJECT_FILES: ProjectFile[] = [
  {
    path: 'config/database.php',
    filename: 'database.php',
    role: 'Orang 1 & Orang 3',
    description: 'Konfigurasi koneksi PDO MySQL dengan error mode exception dan native prepared statement.',
    language: 'php',
    code: `<?php
/**
 * KantinNinGuys - Konfigurasi Koneksi Database MySQL (PDO)
 * File: config/database.php
 * Tanggung Jawab: Orang 1 (Integrasi dengan Orang 3)
 */

$db_host = 'localhost';
$db_port = '3306';
$db_name = 'kantinninguys';
$db_user = 'root';
$db_pass = ''; // Default XAMPP kosong tanpa password

try {
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Melempar PDOException untuk mekanisme Rollback
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Mengembalikan array asosiatif
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Menggunakan native prepared statements
    ];

    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    die("Koneksi database gagal: " . htmlspecialchars($e->getMessage()));
}
?>`
  },
  {
    path: 'cart.php',
    filename: 'cart.php',
    role: 'Orang 3',
    description: 'Halaman Keranjang Belanja mahasiswa, tabel menu, foto, harga satuan, pengatur kuantitas, subtotal, dan total tagihan.',
    language: 'php',
    code: `<?php
/**
 * KantinNinGuys - Halaman Keranjang Belanja
 * File: cart.php
 * Tanggung Jawab: Orang 3
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config/database.php';

// Sesi login mahasiswa (Integrasi dengan Modul Orang 5)
if (!isset($_SESSION['user_id'])) {
    if (file_exists(__DIR__ . '/login.php')) {
        $_SESSION['login_redirect'] = 'cart.php';
        $_SESSION['error'] = "Silakan login terlebih dahulu untuk mengakses keranjang.";
        header("Location: login.php");
        exit;
    } else {
        $_SESSION['user_id'] = 1;
        $_SESSION['user_nama'] = 'Ahmad Fauzi';
        $_SESSION['user_role'] = 'student';
    }
}

if (!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$cart_items = [];
$total_bayar = 0;
$merchant_id = null;
$merchant_name = null;
$error_pesan = $_SESSION['error'] ?? null;
$success_pesan = $_SESSION['success'] ?? null;
unset($_SESSION['error'], $_SESSION['success']);

if (!empty($_SESSION['cart'])) {
    $menu_ids = array_keys($_SESSION['cart']);
    $placeholders = implode(',', array_fill(0, count($menu_ids), '?'));

    $stmt = $pdo->prepare("
        SELECT m.id, m.merchant_id, m.category_id, m.name, m.price, m.stock, m.photo_url, 
               mc.name AS merchant_name, mc.location
        FROM menus m
        JOIN merchants mc ON m.merchant_id = mc.id
        WHERE m.id IN ($placeholders)
    ");
    $stmt->execute($menu_ids);
    $db_menus = $stmt->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);

    foreach ($_SESSION['cart'] as $id => $qty) {
        if (isset($db_menus[$id])) {
            $menu = $db_menus[$id];
            $qty = max(1, (int)$qty);
            $price = (float)$menu['price'];
            $subtotal = $price * $qty;
            $total_bayar += $subtotal;

            if ($merchant_id === null) {
                $merchant_id = $menu['merchant_id'];
                $merchant_name = $menu['merchant_name'] . ' (' . $menu['location'] . ')';
            }

            $cart_items[] = [
                'menu_id'       => $id,
                'name'          => $menu['name'],
                'price'         => $price,
                'stock'         => (int)$menu['stock'],
                'photo_url'     => $menu['photo_url'],
                'merchant_name' => $menu['merchant_name'],
                'jumlah'        => $qty,
                'subtotal'      => $subtotal
            ];
        } else {
            unset($_SESSION['cart'][$id]);
        }
    }
}
?>`
  },
  {
    path: 'checkout.php',
    filename: 'checkout.php',
    role: 'Orang 3',
    description: 'Halaman Checkout & Pemilihan Pembayaran (Tunai, QRIS Manual, Transfer Manual) serta catatan pesanan.',
    language: 'php',
    code: `<?php
/**
 * KantinNinGuys - Halaman Checkout & Pemilihan Pembayaran
 * File: checkout.php
 * Tanggung Jawab: Orang 3
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config/database.php';

if (!isset($_SESSION['user_id'])) {
    if (file_exists(__DIR__ . '/login.php')) {
        $_SESSION['login_redirect'] = 'checkout.php';
        $_SESSION['error'] = "Silakan login terlebih dahulu untuk melakukan checkout.";
        header("Location: login.php");
        exit;
    } else {
        $_SESSION['user_id'] = 1;
        $_SESSION['user_nama'] = 'Ahmad Fauzi';
        $_SESSION['user_role'] = 'student';
    }
}

$user_id = (int)$_SESSION['user_id'];
$stmtUser = $pdo->prepare("SELECT id, name, email FROM users WHERE id = ?");
$stmtUser->execute([$user_id]);
$currentUser = $stmtUser->fetch();
$student_name = $currentUser ? $currentUser['name'] : ($_SESSION['user_nama'] ?? 'Mahasiswa');

if (empty($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['error'] = "Keranjang belanja Anda masih kosong. Silakan pilih menu terlebih dahulu.";
    header("Location: cart.php");
    exit;
}

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$menu_ids = array_keys($_SESSION['cart']);
$placeholders = implode(',', array_fill(0, count($menu_ids), '?'));

$stmt = $pdo->prepare("
    SELECT m.id, m.merchant_id, m.name, m.price, m.stock, 
           mc.name AS merchant_name, mc.location 
    FROM menus m
    JOIN merchants mc ON m.merchant_id = mc.id
    WHERE m.id IN ($placeholders)
");
$stmt->execute($menu_ids);
$db_menus = $stmt->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);

$checkout_items = [];
$total_bayar = 0;
$merchant_id = null;
$merchant_name = null;

foreach ($_SESSION['cart'] as $id => $qty) {
    if (isset($db_menus[$id])) {
        $m = $db_menus[$id];
        $qty = max(1, (int)$qty);
        $price = (float)$m['price'];
        $subtotal = $price * $qty;
        $total_bayar += $subtotal;

        if ($merchant_id === null) {
            $merchant_id = $m['merchant_id'];
            $merchant_name = $m['merchant_name'] . ' (' . $m['location'] . ')';
        }

        $checkout_items[] = [
            'menu_id'  => $id,
            'name'     => $m['name'],
            'price'    => $price,
            'jumlah'   => $qty,
            'subtotal' => $subtotal
        ];
    }
}
?>`
  },
  {
    path: 'proses_checkout.php',
    filename: 'proses_checkout.php',
    role: 'Orang 3',
    description: 'Pemroses transaksi ACID (orders, order_details, payments) dengan PDO Transaction, lock baris, dan rollback.',
    language: 'php',
    code: `<?php
/**
 * KantinNinGuys - Pemroses Checkout & Transaksi Database (ACID)
 * File: proses_checkout.php
 * Tanggung Jawab: Orang 3
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: cart.php");
    exit;
}

if (!isset($_SESSION['user_id'])) {
    if (file_exists(__DIR__ . '/login.php')) {
        $_SESSION['login_redirect'] = 'checkout.php';
        $_SESSION['error'] = "Silakan login terlebih dahulu untuk melanjutkan pemesanan.";
        header("Location: login.php");
        exit;
    } else {
        $_SESSION['user_id'] = 1;
        $_SESSION['user_nama'] = 'Ahmad Fauzi';
        $_SESSION['user_role'] = 'student';
    }
}
$user_id = (int)$_SESSION['user_id'];

if (empty($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'])) {
    $_SESSION['error'] = "Sesi formulir kadaluarsa atau tidak valid. Silakan coba kembali.";
    header("Location: checkout.php");
    exit;
}

if (empty($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['error'] = "Keranjang belanja Anda kosong. Silakan pilih menu terlebih dahulu.";
    header("Location: cart.php");
    exit;
}

$notes = isset($_POST['notes']) ? trim(strip_tags($_POST['notes'])) : null;
$metode = isset($_POST['metode']) ? trim($_POST['metode']) : 'tunai';
$allowed_metode = ['tunai', 'qris_manual', 'transfer_manual'];
if (!in_array($metode, $allowed_metode)) {
    $metode = 'tunai';
}

try {
    $pdo->beginTransaction();

    $cart = $_SESSION['cart'];
    $menu_ids = array_keys($cart);

    $placeholders = implode(',', array_fill(0, count($menu_ids), '?'));
    $stmt = $pdo->prepare("
        SELECT id, merchant_id, name, price, stock 
        FROM menus 
        WHERE id IN ($placeholders)
        FOR UPDATE
    ");
    $stmt->execute($menu_ids);
    $menus_db = $stmt->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);

    $grand_total = 0;
    $current_merchant_id = null;
    $items_to_insert = [];

    foreach ($cart as $menu_id => $jumlah) {
        $jumlah = (int)$jumlah;
        if ($jumlah <= 0) {
            throw new Exception("Jumlah pesanan untuk setiap menu harus lebih dari 0.");
        }

        if (!isset($menus_db[$menu_id])) {
            throw new Exception("Salah satu menu yang dipilih sudah tidak tersedia di kantin.");
        }

        $menu = $menus_db[$menu_id];

        if ((int)$menu['stock'] < $jumlah) {
            throw new Exception("Stok untuk menu '" . $menu['name'] . "' tidak mencukupi (Tersedia: " . $menu['stock'] . " porsi).");
        }

        if ($current_merchant_id === null) {
            $current_merchant_id = $menu['merchant_id'];
        } elseif ($current_merchant_id !== $menu['merchant_id']) {
            throw new Exception("Satu pesanan hanya boleh berisi menu dari satu merchant yang sama.");
        }

        $harga_satuan = (float)$menu['price'];
        $subtotal = $harga_satuan * $jumlah;
        $grand_total += $subtotal;

        $items_to_insert[] = [
            'menu_id'  => $menu_id,
            'jumlah'   => $jumlah,
            'harga'    => $harga_satuan,
            'subtotal' => $subtotal
        ];
    }

    $order_number = 'KNG-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

    $stmtOrder = $pdo->prepare("
        INSERT INTO orders (user_id, order_number, total, status, notes, created_at)
        VALUES (:user_id, :order_number, :total, 'menunggu', :notes, NOW())
    ");
    $stmtOrder->execute([
        ':user_id'      => $user_id,
        ':order_number' => $order_number,
        ':total'        => $grand_total,
        ':notes'        => $notes
    ]);

    $order_id = (int)$pdo->lastInsertId();

    $stmtDetail = $pdo->prepare("
        INSERT INTO order_details (order_id, menu_id, jumlah, harga, subtotal, created_at)
        VALUES (:order_id, :menu_id, :jumlah, :harga, :subtotal, NOW())
    ");

    $stmtUpdateStock = $pdo->prepare("
        UPDATE menus SET stock = stock - :jumlah WHERE id = :menu_id
    ");

    foreach ($items_to_insert as $item) {
        $stmtDetail->execute([
            ':order_id' => $order_id,
            ':menu_id'  => $item['menu_id'],
            ':jumlah'   => $item['jumlah'],
            ':harga'    => $item['harga'],
            ':subtotal' => $item['subtotal']
        ]);

        $stmtUpdateStock->execute([
            ':jumlah'  => $item['jumlah'],
            ':menu_id' => $item['menu_id']
        ]);
    }

    $stmtPayment = $pdo->prepare("
        INSERT INTO payments (order_id, metode, jumlah, tanggal_bayar, status, created_at)
        VALUES (:order_id, :metode, :jumlah, NULL, 'menunggu', NOW())
    ");
    $stmtPayment->execute([
        ':order_id' => $order_id,
        ':metode'   => $metode,
        ':jumlah'   => $grand_total
    ]);

    $pdo->commit();

    unset($_SESSION['cart']);
    unset($_SESSION['csrf_token']);

    header("Location: order_success.php?order_id=" . $order_id);
    exit;

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    $_SESSION['error'] = "Transaksi gagal diproses: " . $e->getMessage();
    header("Location: checkout.php");
    exit;
}
?>`
  },
  {
    path: 'order_success.php',
    filename: 'order_success.php',
    role: 'Orang 3',
    description: 'Halaman Konfirmasi Pesanan & Struk Pengambilan dengan validasi kepemilikan akun pengguna.',
    language: 'php',
    code: `<?php
/**
 * KantinNinGuys - Halaman Konfirmasi Pesanan & Struk Pengambilan
 * File: order_success.php
 * Tanggung Jawab: Orang 3
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config/database.php';

if (!isset($_SESSION['user_id'])) {
    if (file_exists(__DIR__ . '/login.php')) {
        $_SESSION['error'] = "Silakan login terlebih dahulu untuk melihat pesanan.";
        header("Location: login.php");
        exit;
    } else {
        $_SESSION['user_id'] = 1;
        $_SESSION['user_nama'] = 'Ahmad Fauzi';
        $_SESSION['user_role'] = 'student';
    }
}
$current_user_id = (int)$_SESSION['user_id'];

$order_id = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;

if ($order_id <= 0) {
    header("Location: menu.php");
    exit;
}

$stmtOrder = $pdo->prepare("
    SELECT o.id, o.order_number, o.user_id, o.total, o.status AS status_order, o.notes, o.created_at,
           u.name AS nama_pemesan,
           mc.name AS merchant_name, mc.location
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN order_details od ON od.order_id = o.id
    JOIN menus m ON od.menu_id = m.id
    JOIN merchants mc ON m.merchant_id = mc.id
    WHERE o.id = :order_id AND o.user_id = :user_id
    LIMIT 1
");
$stmtOrder->execute([
    ':order_id' => $order_id,
    ':user_id'  => $current_user_id
]);
$order = $stmtOrder->fetch();

if (!$order) {
    http_response_code(403);
    echo "Pesanan tidak ditemukan atau Anda tidak memiliki akses untuk melihat pesanan ini.";
    exit;
}
?>`
  },
  {
    path: 'api/cart_action.php',
    filename: 'cart_action.php',
    role: 'Orang 3',
    description: 'Endpoint AJAX untuk operasi keranjang belanja (tambah, perbarui kuantitas, hapus item, kosongkan keranjang).',
    language: 'php',
    code: `<?php
/**
 * KantinNinGuys - API Aksi Keranjang Belanja (AJAX Endpoint)
 * File: api/cart_action.php
 * Tanggung Jawab: Orang 3
 */

header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';
?>`
  },
  {
    path: 'assets/js/cart.js',
    filename: 'cart.js',
    role: 'Orang 3',
    description: 'Skrip JavaScript untuk tombol kuantitas (+/-), input angka, hapus item, kalkulasi otomatis, dan AJAX.',
    language: 'javascript',
    code: `/**
 * KantinNinGuys - Skrip Interaksi Keranjang Belanja (AJAX)
 * File: assets/js/cart.js
 * Tanggung Jawab: Orang 3
 */

function updateQuantity(menuId, delta, maxStock = 99) {
    const row = document.getElementById('cart-row-' + menuId);
    if (!row) return;

    const input = row.querySelector('.qty-input');
    let currentQty = parseInt(input.value) || 1;
    let newQty = currentQty + delta;

    if (newQty < 1) newQty = 1;
    if (newQty > maxStock) {
        newQty = maxStock;
        alert('Jumlah pesanan sudah mencapai stok maksimal (' + maxStock + ').');
    }

    input.value = newQty;
    sendQuantityUpdate(menuId, newQty);
}
`
  }
];
