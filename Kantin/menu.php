<?php
/**
 * KantinNinGuys - Halaman Menu Kantin (Simulasi Modul Orang 2)
 * File: menu.php
 * Struktur Tabel Sesuai Dokumen Resmi Word:
 * - menus: id, merchant_id, category_id, name, description, price, photo_url, stock, created_at
 * - merchants: id, user_id, name, description, location, created_at
 * - categories: id, name, description, created_at
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config/database.php';

// Validasi Sesi Mahasiswa (Disediakan oleh Orang 5)
// Jika pengguna belum login, arahkan ke login.php.
// Untuk pengujian lokal mandiri sebelum integrasi Orang 5 selesai, fallback session dapat diset.
if (!isset($_SESSION['user_id'])) {
    if (file_exists(__DIR__ . '/login.php')) {
        $_SESSION['login_redirect'] = 'menu.php';
        header("Location: login.php");
        exit;
    } else {
        // Fallback sementara untuk pengujian lokal jika modul Orang 5 belum dipasang
        $_SESSION['user_id'] = 1;
        $_SESSION['user_nama'] = 'Ahmad Fauzi (Mahasiswa)';
        $_SESSION['user_role'] = 'student';
    }
}

if (!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// Ambil daftar menu dari database sesuai skema resmi 7 tabel:
// Gunakan m.photo_url (bukan m.image) dan mc.location (bukan mc.stand_location)
// Kondisi ketersediaan menu berdasarkan kolom stock (karena kolom is_active tidak ada di skema resmi)
$stmt = $pdo->query("
    SELECT m.id, m.name, m.description, m.price, m.stock, m.photo_url, 
           c.name AS category_name,
           mc.name AS merchant_name, mc.location
    FROM menus m
    JOIN merchants mc ON m.merchant_id = mc.id
    JOIN categories c ON m.category_id = c.id
    WHERE m.stock > 0
    ORDER BY mc.id, m.id
");
$menus = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Menu - KantinNinGuys</title>
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
            <div class="navbar-nav ms-auto align-items-center">
                <span class="nav-item text-white me-3 d-none d-md-inline">
                    <i class="bi bi-person-circle me-1"></i><?= htmlspecialchars($_SESSION['user_nama'] ?? 'Mahasiswa') ?>
                </span>
                <a href="cart.php" class="btn btn-warning position-relative fw-semibold">
                    <i class="bi bi-cart-fill me-1"></i>Keranjang
                    <span class="badge bg-dark rounded-pill" id="cart-badge-count"><?= array_sum($_SESSION['cart']) ?></span>
                </a>
            </div>
        </div>
    </nav>

    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="h4 mb-1 fw-bold text-dark">Menu Makanan & Minuman Kantin</h2>
                <p class="text-muted small mb-0">Klik "Tambah ke Keranjang" untuk memesan menu favoritmu.</p>
            </div>
            <a href="cart.php" class="btn btn-danger">
                <i class="bi bi-cart3 me-1"></i>Lihat Keranjang
            </a>
        </div>

        <div class="row g-4">
            <?php foreach ($menus as $m): ?>
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-secondary-subtle text-secondary text-uppercase"><?= htmlspecialchars($m['category_name']) ?></span>
                                <span class="badge <?= $m['stock'] <= 5 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success' ?>">
                                    Stok: <?= (int)$m['stock'] ?>
                                </span>
                            </div>
                            <h5 class="card-title fw-bold text-dark mb-1"><?= htmlspecialchars($m['name']) ?></h5>
                            <?php if (!empty($m['description'])): ?>
                                <p class="text-muted small mb-2 text-truncate" title="<?= htmlspecialchars($m['description']) ?>">
                                    <?= htmlspecialchars($m['description']) ?>
                                </p>
                            <?php endif; ?>
                            <p class="text-muted small mb-2">
                                <i class="bi bi-shop text-danger me-1"></i><?= htmlspecialchars($m['merchant_name']) ?> (<?= htmlspecialchars($m['location']) ?>)
                            </p>
                            <h6 class="text-danger fw-bold fs-5 mb-3">
                                Rp <?= number_format($m['price'], 0, ',', '.') ?>
                            </h6>
                        </div>

                        <!-- Tombol Tambah ke Keranjang Integrasi Orang 2 dengan Orang 3 -->
                        <button class="btn btn-outline-danger w-100 fw-semibold" onclick="addToCartFromCatalog(<?= (int)$m['id'] ?>)">
                            <i class="bi bi-cart-plus me-1"></i>Tambah ke Keranjang
                        </button>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/cart.js"></script>
</body>
</html>
