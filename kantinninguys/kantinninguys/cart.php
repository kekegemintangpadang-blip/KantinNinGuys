<?php
/**
 * KantinNinGuys - Halaman Keranjang Belanja
 * File: cart.php
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

// Sesi login mahasiswa (Integrasi dengan Modul Orang 5)
if (!isset($_SESSION['user_id'])) {
    if (file_exists(__DIR__ . '/login.php')) {
        $_SESSION['login_redirect'] = 'cart.php';
        $_SESSION['error'] = "Silakan login terlebih dahulu untuk mengakses keranjang.";
        header("Location: login.php");
        exit;
    } else {
        // Fallback untuk pengujian lokal jika modul Orang 5 belum dipasang
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

// Ambil info menu riil dari database sesuai skema resmi: menus JOIN merchants
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
            $qty = max(1, (int)$qty); // Cegah 0 atau negatif
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
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Keranjang Belanja - KantinNinGuys</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-light">

    <!-- Navbar KantinNinGuys -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-danger sticky-top shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="menu.php">
                <i class="bi bi-shop me-2"></i>KantinNinGuys
            </a>
            <div class="navbar-nav ms-auto align-items-center">
                <span class="nav-item text-white me-3 d-none d-md-inline">
                    <i class="bi bi-person-circle me-1"></i><?= htmlspecialchars($_SESSION['user_nama']) ?>
                </span>
                <a href="cart.php" class="btn btn-warning position-relative fw-semibold">
                    <i class="bi bi-cart-fill me-1"></i>Keranjang
                    <span class="badge bg-dark rounded-pill" id="cart-badge-count"><?= array_sum($_SESSION['cart']) ?></span>
                </a>
            </div>
        </div>
    </nav>

    <div class="container py-4">
        <!-- Breadcrumb Navigasi -->
        <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="menu.php" class="text-decoration-none">Daftar Menu</a></li>
                <li class="breadcrumb-item active" aria-current="page">Keranjang Belanja</li>
            </ol>
        </nav>

        <!-- Pesan Notifikasi -->
        <?php if ($error_pesan): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i><?= htmlspecialchars($error_pesan) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <?php if ($success_pesan): ?>
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i><?= htmlspecialchars($success_pesan) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h4 mb-0 fw-bold text-dark">
                <i class="bi bi-cart3 me-2 text-danger"></i>Keranjang Pesanan Anda
            </h2>
            <?php if (!empty($cart_items)): ?>
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="clearCart()">
                    <i class="bi bi-trash3 me-1"></i>Kosongkan Keranjang
                </button>
            <?php endif; ?>
        </div>

        <?php if (empty($cart_items)): ?>
            <!-- Tampilan Saat Keranjang Kosong (Ketentuan D.8) -->
            <div class="card border-0 shadow-sm text-center py-5">
                <div class="card-body">
                    <div class="mb-3 text-muted">
                        <i class="bi bi-cart-x display-1 text-secondary"></i>
                    </div>
                    <h4 class="fw-bold text-secondary">Keranjang Belanja Anda Masih Kosong</h4>
                    <p class="text-muted mb-4">Yuk pilih makanan dan minuman favoritmu dari stand kantin!</p>
                    <a href="menu.php" class="btn btn-danger px-4 py-2">
                        <i class="bi bi-arrow-left me-2"></i>Lihat Menu Kantin
                    </a>
                </div>
            </div>
        <?php else: ?>
            <!-- Info Stand Penjual (Ketentuan G: 1 Pesanan Hanya 1 Merchant) -->
            <div class="alert alert-info d-flex align-items-center py-2 px-3 mb-3 border-0 shadow-sm" role="alert">
                <i class="bi bi-info-circle-fill me-2 fs-5 text-primary"></i>
                <div>
                    <strong>Merchant:</strong> <?= htmlspecialchars($merchant_name) ?> 
                    <small class="text-muted d-block">(Sesuai aturan KantinNinGuys, satu pesanan hanya memuat menu dari satu merchant yang sama).</small>
                </div>
            </div>

            <div class="row g-4">
                <!-- Tabel Daftar Menu di Keranjang -->
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm">
                        <div class="table-responsive">
                            <table class="table align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th style="min-width: 240px;">Menu</th>
                                        <th class="text-center" style="width: 130px;">Harga Satuan</th>
                                        <th class="text-center" style="width: 150px;">Jumlah</th>
                                        <th class="text-end" style="width: 140px;">Subtotal</th>
                                        <th class="text-center" style="width: 60px;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="cart-table-body">
                                    <?php foreach ($cart_items as $item): ?>
                                    <tr id="cart-row-<?= $item['menu_id'] ?>">
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="bg-secondary-subtle rounded me-3 d-flex align-items-center justify-content-center text-secondary" style="width: 50px; height: 50px;">
                                                    <i class="bi bi-cup-hot fs-4"></i>
                                                </div>
                                                <div>
                                                    <h6 class="mb-0 fw-semibold text-dark"><?= htmlspecialchars($item['name']) ?></h6>
                                                    <small class="text-muted">Stok tersedia: <?= $item['stock'] ?></small>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="text-center text-nowrap">
                                            Rp <?= number_format($item['price'], 0, ',', '.') ?>
                                        </td>
                                        <td>
                                            <!-- Tombol Pengatur Jumlah (+/-) -->
                                            <div class="input-group input-group-sm justify-content-center">
                                                <button class="btn btn-outline-secondary" type="button" 
                                                        onclick="updateQuantity(<?= $item['menu_id'] ?>, -1)">
                                                    <i class="bi bi-dash"></i>
                                                </button>
                                                <input type="number" 
                                                       class="form-control text-center qty-input" 
                                                       style="max-width: 55px;" 
                                                       value="<?= $item['jumlah'] ?>" 
                                                       min="1" 
                                                       max="<?= $item['stock'] ?>" 
                                                       onchange="setQuantity(<?= $item['menu_id'] ?>, this.value, <?= $item['stock'] ?>)">
                                                <button class="btn btn-outline-secondary" type="button" 
                                                        onclick="updateQuantity(<?= $item['menu_id'] ?>, 1, <?= $item['stock'] ?>)">
                                                    <i class="bi bi-plus"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td class="text-end fw-semibold text-nowrap" id="subtotal-<?= $item['menu_id'] ?>">
                                            Rp <?= number_format($item['subtotal'], 0, ',', '.') ?>
                                        </td>
                                        <td class="text-center">
                                            <button type="button" class="btn btn-link text-danger p-0" 
                                                    title="Hapus menu" 
                                                    onclick="removeFromCart(<?= $item['menu_id'] ?>)">
                                                <i class="bi bi-trash3 fs-5"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="mt-3">
                        <a href="menu.php" class="btn btn-outline-secondary btn-sm">
                            <i class="bi bi-arrow-left me-1"></i>Pilih Menu Lain
                        </a>
                    </div>
                </div>

                <!-- Ringkasan & Tombol Checkout -->
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm p-3">
                        <h5 class="fw-bold mb-3 border-bottom pb-2">Ringkasan Belanja</h5>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted">Total Jumlah Menu</span>
                            <span class="fw-semibold" id="total-qty-text"><?= array_sum($_SESSION['cart']) ?> porsi</span>
                        </div>
                        <div class="d-flex justify-content-between mb-3">
                            <span class="text-muted">Subtotal Belanja</span>
                            <span class="fw-semibold" id="subtotal-all-text">Rp <?= number_format($total_bayar, 0, ',', '.') ?></span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <span class="h6 mb-0 fw-bold">Total Pembayaran</span>
                            <span class="h5 mb-0 fw-bold text-danger" id="total-bayar-text">
                                Rp <?= number_format($total_bayar, 0, ',', '.') ?>
                            </span>
                        </div>
                        <a href="checkout.php" class="btn btn-danger btn-lg w-100 fw-semibold shadow-sm">
                            Lanjut ke Checkout <i class="bi bi-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <!-- Bootstrap 5 Bundle JS & Cart Interaction Script -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/cart.js"></script>
</body>
</html>
