<?php
/**
 * KantinNinGuys - Pemroses Checkout & Transaksi Database (ACID)
 * File: proses_checkout.php
 * Tanggung Jawab: Orang 3
 * Struktur Tabel Sesuai Dokumen Resmi Word:
 * - users: id, name, email, password, phone, role, created_at
 * - merchants: id, user_id, name, description, location, created_at
 * - categories: id, name, description, created_at
 * - menus: id, merchant_id, category_id, name, description, price, photo_url, stock, created_at
 * - orders: id, user_id, order_number, total, status, notes, created_at
 * - order_details: id, order_id, menu_id, jumlah, harga, subtotal, created_at
 * - payments: id, order_id, metode, jumlah, tanggal_bayar, status, created_at
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config/database.php';

// 1. Validasi Metode HTTP POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: cart.php");
    exit;
}

// 2. Validasi Sesi Login Mahasiswa (Integrasi dengan Modul Orang 5)
if (!isset($_SESSION['user_id'])) {
    if (file_exists(__DIR__ . '/login.php')) {
        $_SESSION['login_redirect'] = 'checkout.php';
        $_SESSION['error'] = "Silakan login terlebih dahulu untuk melanjutkan pemesanan.";
        header("Location: login.php");
        exit;
    } else {
        // Fallback untuk pengujian lokal jika modul Orang 5 belum dipasang
        $_SESSION['user_id'] = 1;
        $_SESSION['user_nama'] = 'Ahmad Fauzi';
        $_SESSION['user_role'] = 'student';
    }
}
$user_id = (int)$_SESSION['user_id'];

// Verifikasi keberadaan data pengguna pada tabel users
$stmtUser = $pdo->prepare("SELECT id, name FROM users WHERE id = ?");
$stmtUser->execute([$user_id]);
$currentUser = $stmtUser->fetch();
if (!$currentUser) {
    $_SESSION['error'] = "Identitas akun mahasiswa tidak ditemukan dalam sistem.";
    header("Location: cart.php");
    exit;
}

// 3. Validasi CSRF Token
if (empty($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'])) {
    $_SESSION['error'] = "Sesi formulir kadaluarsa atau tidak valid. Silakan coba kembali.";
    header("Location: checkout.php");
    exit;
}

// 4. Validasi Keranjang Belanja Tidak Kosong
if (empty($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['error'] = "Keranjang belanja Anda kosong. Silakan pilih menu terlebih dahulu.";
    header("Location: cart.php");
    exit;
}

// 5. Sanitasi Input Form
// Catatan: Nama pemesan diambil dari profil login resmi (tidak mengubah users.name di database)
$notes = isset($_POST['notes']) ? trim(strip_tags($_POST['notes'])) : null;
$metode = isset($_POST['metode']) ? trim($_POST['metode']) : 'tunai';
$allowed_metode = ['tunai', 'qris_manual', 'transfer_manual'];
if (!in_array($metode, $allowed_metode)) {
    $metode = 'tunai';
}

// =====================================================================
// EKSEKUSI TRANSAKSI DATABASE PDO (ACID)
// =====================================================================
try {
    // A. Mulai Transaksi Atomik
    $pdo->beginTransaction();

    $cart = $_SESSION['cart'];
    $menu_ids = array_keys($cart);

    if (empty($menu_ids)) {
        throw new Exception("Keranjang belanja kosong.");
    }

    // B. Ambil harga asli & stok terkini dari database menggunakan lock baris (FOR UPDATE)
    $placeholders = implode(',', array_fill(0, count($menu_ids), '?'));
    $stmt = $pdo->prepare("
        SELECT id, merchant_id, name, price, stock 
        FROM menus 
        WHERE id IN ($placeholders)
        FOR UPDATE
    ");
    $stmt->execute($menu_ids);
    $menus_db = $stmt->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);

    // C. Validasi Integritas Data, Stok, dan Aturan 1 Merchant
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

        // Validasi stok di server
        if ((int)$menu['stock'] < $jumlah) {
            throw new Exception("Stok untuk menu '" . $menu['name'] . "' tidak mencukupi (Tersedia: " . $menu['stock'] . " porsi).");
        }

        // Aturan Resmi: 1 Pesanan Hanya 1 Merchant
        if ($current_merchant_id === null) {
            $current_merchant_id = $menu['merchant_id'];
        } elseif ($current_merchant_id !== $menu['merchant_id']) {
            throw new Exception("Satu pesanan hanya boleh berisi menu dari satu merchant yang sama.");
        }

        // Perhitungan subtotal dan total dihitung ulang di server (tidak mempercayai input klien)
        $harga_satuan = (float)$menu['price'];
        $subtotal = $harga_satuan * $jumlah;
        $grand_total += $subtotal;

        $items_to_insert[] = [
            'menu_id'  => $menu_id,
            'jumlah'   => $jumlah,
            'harga'    => $harga_satuan, // Snapshot harga riil ke order_details.harga
            'subtotal' => $subtotal     // Snapshot subtotal ke order_details.subtotal
        ];
    }

    // D. Buat Order Number Unik (Format: KNG-YYYYMMDD-XXXX)
    $order_number = 'KNG-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

    // E. SIMPAN KE TABEL 1: 'orders'
    // Status pesanan awal: 'menunggu' (nilai enum: menunggu, diproses, siap_diambil, selesai)
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

    // F. SIMPAN KE TABEL 2: 'order_details' & POTONG STOK MENU
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

    // G. SIMPAN KE TABEL 3: 'payments'
    // Status pembayaran awal: 'menunggu' (nilai enum: menunggu, berhasil, ditolak)
    // tanggal_bayar diset NULL karena pembayaran belum diverifikasi di kasir stand
    $stmtPayment = $pdo->prepare("
        INSERT INTO payments (order_id, metode, jumlah, tanggal_bayar, status, created_at)
        VALUES (:order_id, :metode, :jumlah, NULL, 'menunggu', NOW())
    ");
    $stmtPayment->execute([
        ':order_id' => $order_id,
        ':metode'   => $metode,
        ':jumlah'   => $grand_total
    ]);

    // H. COMMIT: Semua data pesanan, rincian, dan pembayaran berhasil disimpan
    $pdo->commit();

    // I. Kosongkan keranjang belanja hanya setelah transaksi sukses
    unset($_SESSION['cart']);
    unset($_SESSION['csrf_token']);

    // J. Arahkan ke Halaman Konfirmasi Pesanan
    header("Location: order_success.php?order_id=" . $order_id);
    exit;

} catch (Exception $e) {
    // K. ROLLBACK: Batalkan seluruh perubahan jika terjadi error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    $_SESSION['error'] = "Transaksi gagal diproses: " . $e->getMessage();
    header("Location: checkout.php");
    exit;
}
?>
