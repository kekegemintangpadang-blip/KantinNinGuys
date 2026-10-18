<?php
/**
 * KantinNinGuys - Proses CRUD Menu (Create, Update, Delete)
 * File: admin/menu_action.php
 * Tanggung Jawab: Orang 4
 * Dipanggil dengan POST dari admin/menus.php. Field `action`: create | update | delete
 */
require_once __DIR__ . '/bootstrap.php';
require_merchant();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('menus.php');
}
if (!csrf_valid()) {
    flash('danger', 'Sesi formulir tidak valid. Silakan coba lagi.');
    redirect('menus.php');
}

const UPLOAD_DIR = __DIR__ . '/../assets/uploads/menus/';
const MAX_FOTO   = 2 * 1024 * 1024; // 2 MB

/** Simpan foto upload. Return nama file baru, null bila tidak ada upload, atau lempar Exception. */
function simpan_foto(): ?string
{
    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $f = $_FILES['photo'];
    if ($f['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Upload foto gagal (kode ' . $f['error'] . '). Maksimal 2 MB.');
    }
    if ($f['size'] > MAX_FOTO) {
        throw new Exception('Ukuran foto maksimal 2 MB.');
    }
    $info = @getimagesize($f['tmp_name']);
    $ext  = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'][$info[2] ?? 0] ?? null;
    if (!$ext) {
        throw new Exception('Format foto harus JPG, PNG, atau WEBP.');
    }
    if (!is_dir(UPLOAD_DIR) && !mkdir(UPLOAD_DIR, 0755, true)) {
        throw new Exception('Folder upload tidak bisa dibuat.');
    }
    $nama = 'menu_' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], UPLOAD_DIR . $nama)) {
        throw new Exception('Foto gagal disimpan di server.');
    }
    return $nama;
}

function hapus_file_foto(?string $nama): void
{
    if (!$nama) return;
    $path = UPLOAD_DIR . basename($nama);
    if (is_file($path)) @unlink($path);
}

/** Validasi & rapikan input form menu. Lempar Exception bila tidak valid. */
function ambil_input_menu(PDO $pdo): array
{
    $name  = trim($_POST['name'] ?? '');
    $desc  = trim($_POST['description'] ?? '');
    $cat   = (int)($_POST['category_id'] ?? 0);
    $price = $_POST['price'] ?? '';
    $stock = $_POST['stock'] ?? '';

    if ($name === '' || panjang($name) > 100) {
        throw new Exception('Nama menu wajib diisi (maksimal 100 karakter).');
    }
    if (!is_numeric($price) || (float)$price <= 0 || (float)$price > 99999999) {
        throw new Exception('Harga harus berupa angka lebih dari 0.');
    }
    if (filter_var($stock, FILTER_VALIDATE_INT) === false || (int)$stock < 0) {
        throw new Exception('Stok harus berupa bilangan bulat 0 atau lebih.');
    }
    $q = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE id = ?");
    $q->execute([$cat]);
    if (!$q->fetchColumn()) {
        throw new Exception('Kategori yang dipilih tidak valid.');
    }
    return [
        'name' => $name, 'description' => $desc !== '' ? $desc : null,
        'category_id' => $cat, 'price' => round((float)$price, 2), 'stock' => (int)$stock,
    ];
}

$action = $_POST['action'] ?? '';
$fotoBaru = null;

try {
    // ---------------- CREATE ----------------
    if ($action === 'create') {
        $d = ambil_input_menu($pdo);
        $fotoBaru = simpan_foto();

        $stmt = $pdo->prepare("
            INSERT INTO menus (merchant_id, category_id, name, description, price, photo_url, stock)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$merchant_id, $d['category_id'], $d['name'], $d['description'], $d['price'], $fotoBaru, $d['stock']]);
        flash('success', "Menu \"{$d['name']}\" berhasil ditambahkan.");

    // ---------------- UPDATE ----------------
    } elseif ($action === 'update') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $pdo->prepare("SELECT id, photo_url FROM menus WHERE id = ? AND merchant_id = ?");
        $stmt->execute([$id, $merchant_id]);
        $lama = $stmt->fetch();
        if (!$lama) throw new Exception('Menu tidak ditemukan atau bukan milik stand Anda.');

        $d = ambil_input_menu($pdo);
        $fotoBaru = simpan_foto();
        $hapusFoto = !empty($_POST['hapus_foto']);
        $photo = $lama['photo_url'];
        if ($fotoBaru) {
            $photo = $fotoBaru;
        } elseif ($hapusFoto) {
            $photo = null;
        }

        $stmt = $pdo->prepare("
            UPDATE menus SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, photo_url = ?
            WHERE id = ? AND merchant_id = ?
        ");
        $stmt->execute([$d['category_id'], $d['name'], $d['description'], $d['price'], $d['stock'], $photo, $id, $merchant_id]);

        if ($photo !== $lama['photo_url']) {
            hapus_file_foto($lama['photo_url']); // bersihkan foto lama yang sudah tidak dipakai
        }
        flash('success', "Menu \"{$d['name']}\" berhasil diperbarui.");

    // ---------------- DELETE ----------------
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $pdo->prepare("SELECT name, photo_url FROM menus WHERE id = ? AND merchant_id = ?");
        $stmt->execute([$id, $merchant_id]);
        $m = $stmt->fetch();
        if (!$m) throw new Exception('Menu tidak ditemukan atau bukan milik stand Anda.');

        try {
            $pdo->prepare("DELETE FROM menus WHERE id = ? AND merchant_id = ?")->execute([$id, $merchant_id]);
        } catch (PDOException $e) {
            // order_details.menu_id memakai ON DELETE RESTRICT: menu yang pernah dipesan tidak boleh dihapus
            if ($e->getCode() === '23000') {
                throw new Exception("Menu \"{$m['name']}\" sudah pernah dipesan sehingga tidak bisa dihapus (riwayat transaksi harus tetap utuh). Ubah stoknya menjadi 0 agar tidak tampil di halaman mahasiswa.");
            }
            throw $e;
        }
        hapus_file_foto($m['photo_url']);
        flash('success', "Menu \"{$m['name']}\" berhasil dihapus.");

    } else {
        throw new Exception('Aksi tidak dikenal.');
    }
} catch (Exception $e) {
    if ($fotoBaru) hapus_file_foto($fotoBaru); // batalkan upload bila proses gagal
    flash('danger', $e->getMessage());
}

redirect('menus.php' . (!empty($_POST['back']) ? '?' . ltrim($_POST['back'], '?') : ''));
