<?php
/**
 * KantinNinGuys - API Aksi Keranjang Belanja (AJAX Endpoint)
 * File: api/cart_action.php
 * Tanggung Jawab: Orang 3
 * Struktur Tabel Sesuai Dokumen Resmi Word:
 * - menus: id, merchant_id, category_id, name, description, price, photo_url, stock, created_at
 * - merchants: id, user_id, name, description, location, created_at
 * - orders: id, user_id, order_number, total, status, notes, created_at
 * - order_details: id, order_id, menu_id, jumlah, harga, subtotal, created_at
 * - payments: id, order_id, metode, jumlah, tanggal_bayar, status, created_at
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

try {
    switch ($action) {
        // A. Tambah Menu ke Keranjang
        case 'add':
            $menu_id = isset($_POST['menu_id']) ? (int)$_POST['menu_id'] : 0;
            $qty     = isset($_POST['qty']) ? max(1, (int)$_POST['qty']) : 1;

            if ($menu_id <= 0) {
                throw new Exception("ID Menu tidak valid.");
            }

            // Ambil data menu resmi (tanpa is_active karena tidak ada dalam struktur tabel)
            $stmt = $pdo->prepare("SELECT id, merchant_id, name, price, stock FROM menus WHERE id = ?");
            $stmt->execute([$menu_id]);
            $menu = $stmt->fetch();

            if (!$menu) {
                throw new Exception("Menu tidak ditemukan.");
            }

            // Validasi ketersediaan stok
            $stock = (int)$menu['stock'];
            if ($stock <= 0) {
                throw new Exception("Maaf, stok menu '" . $menu['name'] . "' sedang habis.");
            }

            // Validasi Aturan Resmi: 1 Pesanan Hanya 1 Merchant
            if (!empty($_SESSION['cart'])) {
                $existing_ids = array_keys($_SESSION['cart']);
                $placeholders = implode(',', array_fill(0, count($existing_ids), '?'));
                $stmtCheck = $pdo->prepare("
                    SELECT DISTINCT m.merchant_id, mc.name AS merchant_name, mc.location
                    FROM menus m
                    JOIN merchants mc ON m.merchant_id = mc.id
                    WHERE m.id IN ($placeholders)
                ");
                $stmtCheck->execute($existing_ids);
                $existing_merchants = $stmtCheck->fetchAll();

                if (!empty($existing_merchants) && $existing_merchants[0]['merchant_id'] != $menu['merchant_id']) {
                    $curMerchantName = $existing_merchants[0]['merchant_name'];
                    echo json_encode([
                        'status'  => 'error',
                        'code'    => 'DIFFERENT_SELLER',
                        'message' => 'Keranjang Anda saat ini berisi menu dari "' . $curMerchantName . '". Satu pesanan hanya boleh memuat menu dari satu merchant yang sama.'
                    ]);
                    exit;
                }
            }

            $current_qty = $_SESSION['cart'][$menu_id] ?? 0;
            $new_qty = $current_qty + $qty;

            if ($new_qty > $stock) {
                throw new Exception("Jumlah melebihi stok yang tersedia (Tersedia: " . $stock . " porsi).");
            }

            $_SESSION['cart'][$menu_id] = $new_qty;

            echo json_encode([
                'status'     => 'success',
                'message'    => "Menu '" . $menu['name'] . "' berhasil ditambahkan ke keranjang!",
                'cart_count' => array_sum($_SESSION['cart'])
            ]);
            break;

        // B. Ubah Kuantitas
        case 'update':
            $menu_id = isset($_POST['menu_id']) ? (int)$_POST['menu_id'] : 0;
            $qty     = isset($_POST['qty']) ? (int)$_POST['qty'] : 1;

            if ($menu_id <= 0) {
                throw new Exception("ID Menu tidak valid.");
            }

            // Cegah angka nol atau negatif
            if ($qty < 1) {
                $qty = 1;
            }

            $stmt = $pdo->prepare("SELECT id, name, stock, price FROM menus WHERE id = ?");
            $stmt->execute([$menu_id]);
            $menu = $stmt->fetch();

            if (!$menu) {
                unset($_SESSION['cart'][$menu_id]);
                throw new Exception("Menu tidak ditemukan.");
            }

            $stock = (int)$menu['stock'];
            if ($qty > $stock) {
                $qty = max(1, $stock);
                $stockWarning = "Jumlah dibatasi hingga stok maksimal (" . $stock . " porsi).";
            }

            $_SESSION['cart'][$menu_id] = $qty;

            $subtotal_item = (float)$menu['price'] * $qty;
            $total_bayar = 0;
            $total_qty = 0;

            if (!empty($_SESSION['cart'])) {
                $ids = array_keys($_SESSION['cart']);
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $stmtAll = $pdo->prepare("SELECT id, price FROM menus WHERE id IN ($placeholders)");
                $stmtAll->execute($ids);
                $all_menus = $stmtAll->fetchAll(PDO::FETCH_KEY_PAIR);

                foreach ($_SESSION['cart'] as $id => $q) {
                    if (isset($all_menus[$id])) {
                        $total_bayar += (float)$all_menus[$id] * $q;
                        $total_qty += $q;
                    }
                }
            }

            echo json_encode([
                'status'          => 'success',
                'menu_id'         => $menu_id,
                'qty'             => $qty,
                'subtotal_item'   => $subtotal_item,
                'subtotal_fmt'    => 'Rp ' . number_format($subtotal_item, 0, ',', '.'),
                'total_bayar'     => $total_bayar,
                'total_bayar_fmt' => 'Rp ' . number_format($total_bayar, 0, ',', '.'),
                'total_qty'       => $total_qty,
                'warning'         => $stockWarning ?? null
            ]);
            break;

        // C. Hapus Satu Menu
        case 'remove':
            $menu_id = isset($_POST['menu_id']) ? (int)$_POST['menu_id'] : 0;
            unset($_SESSION['cart'][$menu_id]);

            $total_bayar = 0;
            $total_qty = 0;
            if (!empty($_SESSION['cart'])) {
                $ids = array_keys($_SESSION['cart']);
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $stmtAll = $pdo->prepare("SELECT id, price FROM menus WHERE id IN ($placeholders)");
                $stmtAll->execute($ids);
                $all_menus = $stmtAll->fetchAll(PDO::FETCH_KEY_PAIR);

                foreach ($_SESSION['cart'] as $id => $q) {
                    if (isset($all_menus[$id])) {
                        $total_bayar += (float)$all_menus[$id] * $q;
                        $total_qty += $q;
                    }
                }
            }

            echo json_encode([
                'status'          => 'success',
                'message'         => 'Menu berhasil dihapus dari keranjang.',
                'cart_count'      => array_sum($_SESSION['cart']),
                'total_bayar'     => $total_bayar,
                'total_bayar_fmt' => 'Rp ' . number_format($total_bayar, 0, ',', '.'),
                'total_qty'       => $total_qty
            ]);
            break;

        // D. Kosongkan Seluruh Keranjang
        case 'clear':
            $_SESSION['cart'] = [];
            echo json_encode([
                'status'  => 'success',
                'message' => 'Keranjang belanja berhasil dikosongkan.'
            ]);
            break;

        default:
            throw new Exception("Aksi tidak dikenali.");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
}
