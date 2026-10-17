<?php
/**
 * KantinNinGuys - Proses Ubah Status Pesanan & Pembayaran
 * File: admin/order_action.php
 * Tanggung Jawab: Orang 4
 * Field `action`: update_status | update_payment
 */
require_once __DIR__ . '/bootstrap.php';
require_merchant();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect('orders.php');

// Tujuan redirect: hanya halaman admin internal (cegah open redirect)
$back = $_POST['back'] ?? '';
if (!preg_match('#^(orders|order_detail)\.php(\?[A-Za-z0-9_=&%.\-]*)?$#', $back)) {
    $back = 'orders.php';
}

if (!csrf_valid()) {
    flash('danger', 'Sesi formulir tidak valid. Silakan coba lagi.');
    redirect($back);
}

$id     = (int)($_POST['id'] ?? 0);
$action = $_POST['action'] ?? '';

try {
    // Pastikan pesanan ini memang berisi menu milik merchant admin yang login
    $stmt = $pdo->prepare("SELECT o.id, o.order_number, o.status, o.total FROM orders o WHERE o.id = ? AND " . order_scope_sql('o'));
    $stmt->execute([$id, $merchant_id]);
    $order = $stmt->fetch();
    if (!$order) throw new Exception('Pesanan tidak ditemukan.');

    if ($action === 'update_status') {
        $baru = $_POST['status'] ?? '';
        if (!in_array($baru, ['menunggu', 'diproses', 'siap_diambil', 'selesai'], true)) {
            throw new Exception('Status pesanan tidak valid.');
        }
        $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?")->execute([$baru, $id]);
        [$label] = status_order_info($baru);
        flash('success', "Pesanan {$order['order_number']} diubah menjadi \"$label\".");

    } elseif ($action === 'update_payment') {
        $baru = $_POST['payment_status'] ?? '';
        if (!in_array($baru, ['menunggu', 'berhasil', 'ditolak'], true)) {
            throw new Exception('Status pembayaran tidak valid.');
        }
        // tanggal_bayar terisi hanya saat pembayaran dinyatakan berhasil
        $pdo->prepare("
            UPDATE payments
            SET status = ?, tanggal_bayar = CASE WHEN ? = 'berhasil' THEN COALESCE(tanggal_bayar, NOW()) ELSE NULL END
            WHERE order_id = ?
        ")->execute([$baru, $baru, $id]);
        flash('success', "Status pembayaran pesanan {$order['order_number']} diperbarui.");

    } else {
        throw new Exception('Aksi tidak dikenal.');
    }
} catch (Exception $e) {
    flash('danger', $e->getMessage());
}
redirect($back);
