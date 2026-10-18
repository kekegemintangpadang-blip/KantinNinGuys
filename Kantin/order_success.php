<?php
/**
 * KantinNinGuys - Halaman Konfirmasi Pesanan & Struk Pengambilan
 * File: order_success.php
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

// Validasi Login Pengguna (Integrasi Orang 5)
if (!isset($_SESSION['user_id'])) {
    if (file_exists(__DIR__ . '/login.php')) {
        $_SESSION['error'] = "Silakan login terlebih dahulu untuk melihat pesanan.";
        header("Location: login.php");
        exit;
    } else {
        // Fallback untuk pengujian lokal jika modul Orang 5 belum dipasang
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

// Keamanan: Hanya izinkan melihat pesanan milik pengguna yang sedang login (o.user_id = :user_id)
// Gunakan mc.location (bukan mc.stand_location)
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

// Jika pesanan tidak ditemukan atau bukan milik pengguna yang login, cegah akses
if (!$order) {
    http_response_code(403);
    ?>
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <title>Akses Ditolak - KantinNinGuys</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light d-flex align-items-center min-vh-100">
        <div class="container text-center py-5">
            <div class="card border-0 shadow-sm p-5 mx-auto" style="max-width: 500px;">
                <div class="text-danger display-4 mb-3"><i class="bi bi-shield-x"></i>✕</div>
                <h4 class="fw-bold text-dark">Pesanan Tidak Ditemukan</h4>
                <p class="text-muted small">Pesanan dengan nomor tersebut tidak ditemukan atau Anda tidak memiliki hak akses untuk membukanya.</p>
                <div class="mt-3">
                    <a href="menu.php" class="btn btn-danger">Kembali ke Menu Kantin</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Ambil rincian menu dari tabel order_details (snapshot harga & subtotal saat pemesanan)
$stmtDetails = $pdo->prepare("
    SELECT od.id, od.jumlah, od.harga, od.subtotal, m.name AS menu_name
    FROM order_details od
    JOIN menus m ON od.menu_id = m.id
    WHERE od.order_id = :order_id
");
$stmtDetails->execute([':order_id' => $order_id]);
$details = $stmtDetails->fetchAll();

// Ambil data pembayaran dari tabel payments
$stmtPayment = $pdo->prepare("
    SELECT id, metode, jumlah, status AS status_bayar, tanggal_bayar, created_at
    FROM payments
    WHERE order_id = :order_id
    LIMIT 1
");
$stmtPayment->execute([':order_id' => $order_id]);
$payment = $stmtPayment->fetch();

$tanggal = date('d M Y, H:i', strtotime($order['created_at']));
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesanan Berhasil - #<?= htmlspecialchars($order['order_number']) ?> - KantinNinGuys</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        @media print {
            body { background: #fff !important; }
            .no-print, .btn, a.btn { display: none !important; }
            .card { border: 1px solid #000 !important; box-shadow: none !important; }
            .container { max-width: 100% !important; padding: 0 !important; }
            .badge { border: 1px solid #000 !important; color: #000 !important; }
        }
    </style>
</head>
<body class="bg-light">

    <div class="container py-5" style="max-width: 680px;">
        <div class="card border-0 shadow rounded-3 overflow-hidden">
            <!-- Header Kartu -->
            <div class="bg-success text-white text-center py-4 px-3">
                <i class="bi bi-check-circle-fill display-3 mb-2 d-block"></i>
                <h3 class="fw-bold mb-1">Pesanan Berhasil Dibuat!</h3>
                <p class="mb-0 opacity-75">Tunjukkan nomor pesanan ini ke kasir kantin saat mengambil pesanan.</p>
            </div>

            <div class="card-body p-4 p-md-5">
                <!-- Info Nomor Pesanan & Waktu -->
                <div class="text-center mb-4 pb-3 border-bottom">
                    <span class="text-muted small text-uppercase fw-semibold tracking-wider">Nomor Pesanan Unik</span>
                    <h2 class="fw-bold text-danger my-1 font-monospace"><?= htmlspecialchars($order['order_number']) ?></h2>
                    <small class="text-muted"><i class="bi bi-clock me-1"></i><?= $tanggal ?> WIB</small>
                </div>

                <!-- Status Badge Pesanan & Pembayaran Terpisah -->
                <div class="row g-2 mb-4 text-center">
                    <div class="col-6">
                        <div class="p-2 border rounded bg-light">
                            <small class="text-muted d-block mb-1">Status Pesanan</small>
                            <span class="badge bg-warning text-dark px-3 py-1 fs-6">
                                <i class="bi bi-hourglass-split me-1"></i><?= ucfirst(htmlspecialchars($order['status_order'])) ?>
                            </span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-2 border rounded bg-light">
                            <small class="text-muted d-block mb-1">Status Pembayaran</small>
                            <span class="badge bg-warning text-dark px-3 py-1 fs-6">
                                <i class="bi bi-wallet2 me-1"></i><?= ucfirst(htmlspecialchars($payment['status_bayar'] ?? 'menunggu')) ?>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Info Stand Penjual & Pemesan -->
                <div class="alert alert-secondary py-2 px-3 small mb-4">
                    <div class="d-flex justify-content-between mb-1">
                        <span><strong>Nama Pemesan:</strong> <?= htmlspecialchars($order['nama_pemesan']) ?></span>
                        <span><strong>Merchant:</strong> <?= htmlspecialchars($order['merchant_name']) ?></span>
                    </div>
                    <div class="d-flex justify-content-between text-muted">
                        <span><strong>Lokasi Stand:</strong> <?= htmlspecialchars($order['location']) ?></span>
                        <span><strong>Pengambilan:</strong> Mandiri di Stand</span>
                    </div>
                </div>

                <!-- Rincian Menu (Tabel order_details) -->
                <h6 class="fw-bold mb-3"><i class="bi bi-receipt me-2 text-danger"></i>Rincian Makanan & Minuman</h6>
                <div class="table-responsive mb-4">
                    <table class="table table-sm align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Menu</th>
                                <th class="text-center">Jumlah</th>
                                <th class="text-end">Harga</th>
                                <th class="text-end">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($details as $d): ?>
                            <tr>
                                <td class="fw-semibold"><?= htmlspecialchars($d['menu_name']) ?></td>
                                <td class="text-center"><?= (int)$d['jumlah'] ?></td>
                                <td class="text-end">Rp <?= number_format($d['harga'], 0, ',', '.') ?></td>
                                <td class="text-end fw-semibold">Rp <?= number_format($d['subtotal'], 0, ',', '.') ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                        <tfoot class="border-top">
                            <tr>
                                <td colspan="3" class="fw-bold pt-3">Total Pembayaran</td>
                                <td class="text-end fw-bold text-danger fs-5 pt-3">
                                    Rp <?= number_format($order['total'], 0, ',', '.') ?>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Info Metode Pembayaran & Catatan -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between py-1 border-bottom small">
                        <span class="text-muted">Metode Pembayaran</span>
                        <span class="fw-semibold text-uppercase">
                            <?php
                            $met = $payment['metode'] ?? 'tunai';
                            if ($met === 'tunai') echo 'Tunai di Kasir (Cash on Pickup)';
                            elseif ($met === 'qris_manual') echo 'QRIS Kantin (Verifikasi Manual)';
                            else echo 'Transfer Bank Manual';
                            ?>
                        </span>
                    </div>
                    <?php if (!empty($order['notes'])): ?>
                    <div class="py-2 small">
                        <span class="text-muted d-block">Catatan Pemesan:</span>
                        <span class="fst-italic">"<?= htmlspecialchars($order['notes']) ?>"</span>
                    </div>
                    <?php endif; ?>
                </div>

                <?php if (($payment['metode'] ?? '') === 'qris_manual' && ($payment['status_bayar'] ?? 'menunggu') !== 'berhasil'): ?>
                <!-- Pembayaran QRIS -->
                <div class="text-center border rounded p-3 mb-4">
                    <h6 class="fw-bold mb-1"><i class="bi bi-qr-code-scan me-2 text-primary"></i>Bayar dengan QRIS</h6>
                    <p class="small text-muted mb-2">
                        Scan QRIS di bawah dan bayar sebesar
                        <strong class="text-danger">Rp <?= number_format($order['total'], 0, ',', '.') ?></strong>.
                        Tunjukkan bukti pembayaran beserta nomor pesanan ke kasir.
                    </p>
                    <img src="assets/img/qris-kantinninguys.png" alt="QRIS KantinNinGuys" class="img-fluid rounded border" style="max-width: 300px;">
                    <div class="mt-2 no-print">
                        <a href="assets/img/qris-kantinninguys.png" download="QRIS-KantinNinGuys.png" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-download me-1"></i>Simpan Gambar QRIS
                        </a>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Tombol Aksi -->
                <div class="d-grid gap-2 no-print">
                    <button class="btn btn-outline-secondary" onclick="window.print()">
                        <i class="bi bi-printer me-2"></i>Cetak Struk Pesanan
                    </button>
                    <a href="menu.php" class="btn btn-danger">
                        <i class="bi bi-arrow-left me-2"></i>Pesan Menu Lainnya
                    </a>
                </div>
            </div>
        </div>
    </div>

</body>
</html>
