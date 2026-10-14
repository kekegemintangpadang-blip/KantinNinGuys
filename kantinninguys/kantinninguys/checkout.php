<?php
/**
 * KantinNinGuys - Halaman Checkout & Pemilihan Pembayaran
 * File: checkout.php
 * Tanggung Jawab: Orang 3
 * Struktur Database Sesuai Dokumen Resmi Word:
 * - menus: id, merchant_id, category_id, name, description, price, photo_url, stock, created_at
 * - merchants: id, user_id, name, description, location, created_at
 * - orders: id, user_id, order_number, total, status, notes, created_at
 * - order_details: id, order_id, menu_id, jumlah, harga, subtotal, created_at
 * - payments: id, order_id, metode, jumlah, tanggal_bayar, status, created_at
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config/database.php';

// Pastikan user login (Integrasi dengan Modul Orang 5)
if (!isset($_SESSION['user_id'])) {
    if (file_exists(__DIR__ . '/login.php')) {
        $_SESSION['login_redirect'] = 'checkout.php';
        $_SESSION['error'] = "Silakan login terlebih dahulu untuk melakukan checkout.";
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
$stmtUser = $pdo->prepare("SELECT id, name, email FROM users WHERE id = ?");
$stmtUser->execute([$user_id]);
$currentUser = $stmtUser->fetch();
$student_name = $currentUser ? $currentUser['name'] : ($_SESSION['user_nama'] ?? 'Mahasiswa');

// Validasi E.1: Keranjang tidak boleh kosong
if (empty($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['error'] = "Keranjang belanja Anda masih kosong. Silakan pilih menu terlebih dahulu.";
    header("Location: cart.php");
    exit;
}

// CSRF Token (Pencegahan pengiriman ganda tidak disengaja - E.9)
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Ambil data menu terverifikasi dari database: menus JOIN merchants
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

$error_pesan = $_SESSION['error'] ?? null;
unset($_SESSION['error']);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout Pesanan - KantinNinGuys</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-light">

    <nav class="navbar navbar-expand-lg navbar-dark bg-danger sticky-top shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="menu.php">
                <i class="bi bi-shop me-2"></i>KantinNinGuys
            </a>
            <span class="navbar-text text-white">
                <i class="bi bi-shield-check me-1"></i>Checkout Aman
            </span>
        </div>
    </nav>

    <div class="container py-4">
        <nav aria-label="breadcrumb" class="mb-3">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="cart.php">Keranjang</a></li>
                <li class="breadcrumb-item active" aria-current="page">Checkout & Pembayaran</li>
            </ol>
        </nav>

        <?php if ($error_pesan): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i><?= htmlspecialchars($error_pesan) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <div class="row g-4">
            <!-- Formulir Pemesanan & Pembayaran -->
            <div class="col-lg-7">
                <form id="form-checkout" action="proses_checkout.php" method="POST" onsubmit="return handleFormSubmit(this)">
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">

                    <!-- Identitas Pemesan (Bisa diisi / diedit sendiri) -->
                    <div class="card border-0 shadow-sm p-4 mb-3">
                        <h5 class="fw-bold mb-3"><i class="bi bi-person-badge me-2 text-danger"></i>Informasi Pemesan</h5>
                        <div class="mb-3">
                            <label class="form-label text-muted small mb-1">Nama Mahasiswa (Akun Profil)</label>
                            <input type="text" class="form-control bg-light fw-semibold" value="<?= htmlspecialchars($student_name) ?>" readonly>
                            <small class="text-muted">Nama pemesan otomatis terhubung dengan akun profil login Anda.</small>
                        </div>
                        <div class="mb-0">
                            <label class="form-label text-muted small mb-1">Merchant Penjual</label>
                            <input type="text" class="form-control bg-light" value="<?= htmlspecialchars($merchant_name) ?>" readonly>
                        </div>
                    </div>

                    <!-- Catatan Tambahan (orders.notes) -->
                    <div class="card border-0 shadow-sm p-4 mb-3">
                        <h5 class="fw-bold mb-2"><i class="bi bi-card-text me-2 text-danger"></i>Catatan Pesanan</h5>
                        <p class="text-muted small">Contoh: "Jangan terlalu pedas ya bu", "Es teh sedikit gula", dsb.</p>
                        <textarea name="notes" class="form-control" rows="3" placeholder="Tuliskan catatan khusus untuk merchant (opsional)..." maxlength="300"></textarea>
                    </div>

                    <!-- Pilihan Metode Pembayaran (payments.metode) -->
                    <div class="card border-0 shadow-sm p-4 mb-4">
                        <h5 class="fw-bold mb-3"><i class="bi bi-credit-card-2-front me-2 text-danger"></i>Metode Pembayaran</h5>
                        <p class="text-muted small">Pilih cara pembayaran yang diinginkan. Status pembayaran awal tercatat sebagai <code>menunggu</code>.</p>

                        <div class="form-check payment-option p-3 border rounded mb-2">
                            <input class="form-check-input" type="radio" name="metode" id="metode_tunai" value="tunai" checked>
                            <label class="form-check-label w-100 cursor-pointer" for="metode_tunai">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="fw-bold d-block"><i class="bi bi-cash-stack text-success me-2"></i>Tunai di Kasir (Cash on Pickup)</span>
                                        <small class="text-muted">Bayar langsung dengan uang tunai saat mengambil pesanan di stand.</small>
                                    </div>
                                    <span class="badge bg-success-subtle text-success">Paling Praktis</span>
                                </div>
                            </label>
                        </div>

                        <div class="form-check payment-option p-3 border rounded mb-2">
                            <input class="form-check-input" type="radio" name="metode" id="metode_qris" value="qris_manual">
                            <label class="form-check-label w-100 cursor-pointer" for="metode_qris">
                                <div>
                                    <span class="fw-bold d-block"><i class="bi bi-qr-code-scan text-primary me-2"></i>QRIS Kantin (Verifikasi Manual)</span>
                                    <small class="text-muted">Scan QRIS statis di etalase kasir stand saat mengambil makanan.</small>
                                </div>
                            </label>
                        </div>

                        <div class="form-check payment-option p-3 border rounded">
                            <input class="form-check-input" type="radio" name="metode" id="metode_transfer" value="transfer_manual">
                            <label class="form-check-label w-100 cursor-pointer" for="metode_transfer">
                                <div>
                                    <span class="fw-bold d-block"><i class="bi bi-bank text-secondary me-2"></i>Transfer Bank Manual</span>
                                    <small class="text-muted">Tunjukkan bukti transfer ke merchant saat pengambilan makanan.</small>
                                </div>
                            </label>
                        </div>

                        <!-- Transparansi Ketentuan F.10 -->
                        <div class="alert alert-warning py-2 px-3 mt-3 mb-0 small" role="alert">
                            <i class="bi bi-shield-exclamation me-1"></i>
                            <strong>Pemberitahuan:</strong> KantinNinGuys belum terhubung ke payment gateway online otomatis. Konfirmasi bayar diselesaikan secara manual di kasir stand merchant.
                        </div>
                    </div>

                    <button type="submit" id="btn-submit-order" class="btn btn-danger btn-lg w-100 py-3 fw-bold shadow-sm">
                        <i class="bi bi-check2-circle me-2"></i>Konfirmasi & Buat Pesanan
                    </button>
                </form>
            </div>

            <!-- Ringkasan Rincian Pesanan (Kanan) -->
            <div class="col-lg-5">
                <div class="card border-0 shadow-sm p-4 sticky-top" style="top: 80px;">
                    <h5 class="fw-bold mb-3 border-bottom pb-2">Rincian Menu Pesanan</h5>
                    <ul class="list-group list-group-flush mb-3">
                        <?php foreach ($checkout_items as $item): ?>
                        <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                            <div>
                                <h6 class="my-0 fw-semibold"><?= htmlspecialchars($item['name']) ?></h6>
                                <small class="text-muted"><?= $item['jumlah'] ?> × Rp <?= number_format($item['price'], 0, ',', '.') ?></small>
                            </div>
                            <span class="fw-semibold text-dark">Rp <?= number_format($item['subtotal'], 0, ',', '.') ?></span>
                        </li>
                        <?php endforeach; ?>
                    </ul>

                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Subtotal</span>
                        <span class="fw-semibold">Rp <?= number_format($total_bayar, 0, ',', '.') ?></span>
                    </div>
                    <div class="d-flex justify-content-between mb-3">
                        <span class="text-muted">Biaya Layanan Kampus</span>
                        <span class="fw-semibold text-success">Gratis</span>
                    </div>

                    <div class="border-top pt-3 d-flex justify-content-between align-items-center">
                        <div>
                            <span class="h6 mb-0 fw-bold d-block">Total Pembayaran</span>
                            <small class="text-muted">Pajak sudah termasuk</small>
                        </div>
                        <span class="h4 mb-0 fw-bold text-danger">
                            Rp <?= number_format($total_bayar, 0, ',', '.') ?>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
    // Pencegahan pengiriman formulir berulang yang tidak disengaja (Ketentuan E.9)
    function handleFormSubmit(form) {
        const btn = document.getElementById('btn-submit-order');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Menyimpan Pesanan...';
        return true;
    }
    </script>
</body>
</html>
