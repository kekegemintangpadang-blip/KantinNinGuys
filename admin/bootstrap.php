<?php
/**
 * KantinNinGuys - Bootstrap Modul Admin (sesi, autentikasi admin, helper)
 * File: admin/bootstrap.php
 * Tanggung Jawab: Orang 4
 *
 * Di-include oleh semua halaman admin. Isinya:
 *  - koneksi database ($pdo)
 *  - penjagaan akses (hanya users.role = 'admin')
 *  - penentuan merchant milik admin yang login ($merchant)
 *  - helper: e(), rupiah(), CSRF, flash message, label status
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/database.php';

// ---------------------------------------------------------------------
// 1. AUTENTIKASI (integrasi dengan modul login Orang 5)
// ---------------------------------------------------------------------
$loginAda = file_exists(__DIR__ . '/../login.php');

if (!$loginAda) {
    // Fallback pengujian lokal bila login.php (Orang 5) belum dipasang:
    // paksa sesi menjadi admin Stand 01 (users.id = 2 pada data dummy).
    if (($_SESSION['user_role'] ?? '') !== 'admin') {
        $_SESSION['user_id']   = 2;
        $_SESSION['user_nama'] = 'Ibu Siti (Stand 01)';
        $_SESSION['user_role'] = 'admin';
    }
}

if (!isset($_SESSION['user_id'])) {
    $_SESSION['login_redirect'] = 'admin/index.php';
    $_SESSION['error'] = 'Silakan login sebagai admin terlebih dahulu.';
    header('Location: ../login.php');
    exit;
}

// Validasi role langsung ke database (jangan hanya percaya isi session)
$stmt = $pdo->prepare("SELECT id, name, role FROM users WHERE id = ?");
$stmt->execute([(int)$_SESSION['user_id']]);
$adminUser = $stmt->fetch();

if (!$adminUser || $adminUser['role'] !== 'admin') {
    http_response_code(403);
    $_SESSION['error'] = 'Akses ditolak. Halaman ini hanya untuk admin kantin.';
    header('Location: ../menu.php');
    exit;
}

// ---------------------------------------------------------------------
// 2. MERCHANT MILIK ADMIN (satu admin = satu stand/merchant)
// ---------------------------------------------------------------------
$stmt = $pdo->prepare("SELECT * FROM merchants WHERE user_id = ? LIMIT 1");
$stmt->execute([$adminUser['id']]);
$merchant = $stmt->fetch() ?: null;
$merchant_id = $merchant ? (int)$merchant['id'] : 0;

// ---------------------------------------------------------------------
// 3. HELPER
// ---------------------------------------------------------------------
function e($v): string
{
    return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
}

/** Panjang string UTF-8 tanpa bergantung pada ekstensi mbstring */
function panjang(string $s): int
{
    return (int)preg_match_all('/./us', $s);
}

function rupiah($angka): string
{
    return 'Rp ' . number_format((float)$angka, 0, ',', '.');
}

function csrf_token(): string
{
    if (empty($_SESSION['admin_csrf'])) {
        $_SESSION['admin_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['admin_csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf_token" value="' . e(csrf_token()) . '">';
}

function csrf_valid(): bool
{
    return !empty($_POST['csrf_token'])
        && hash_equals($_SESSION['admin_csrf'] ?? '', $_POST['csrf_token']);
}

function flash(string $type, string $msg): void
{
    $_SESSION['admin_flash'] = ['type' => $type, 'msg' => $msg];
}

function redirect(string $url): void
{
    header('Location: ' . $url);
    exit;
}

/** Label & warna badge status pesanan (enum orders.status) */
function status_order_info(string $s): array
{
    $map = [
        'menunggu'     => ['Menunggu',     'warning',   'bi-hourglass-split'],
        'diproses'     => ['Diproses',     'primary',   'bi-fire'],
        'siap_diambil' => ['Siap Diambil', 'success',   'bi-bag-check'],
        'selesai'      => ['Selesai',      'secondary', 'bi-check2-all'],
    ];
    return $map[$s] ?? [$s, 'dark', 'bi-question-circle'];
}

function badge_status_order(string $s): string
{
    [$label, $warna, $ikon] = status_order_info($s);
    $teks = $warna === 'warning' ? 'text-dark' : 'text-white';
    return "<span class=\"badge bg-{$warna} {$teks}\"><i class=\"bi {$ikon} me-1\"></i>" . e($label) . "</span>";
}

/** Label & warna badge status pembayaran (enum payments.status) */
function badge_status_bayar(?string $s): string
{
    $map = [
        'menunggu' => ['Belum Dibayar', 'warning text-dark'],
        'berhasil' => ['Lunas',         'success'],
        'ditolak'  => ['Ditolak',       'danger'],
    ];
    [$label, $kelas] = $map[$s ?? ''] ?? ['-', 'secondary'];
    return "<span class=\"badge bg-{$kelas}\">" . e($label) . "</span>";
}

function label_metode(?string $m): string
{
    $map = ['tunai' => 'Tunai di Kasir', 'qris_manual' => 'QRIS Manual', 'transfer_manual' => 'Transfer Manual'];
    return $map[$m ?? ''] ?? ($m ?: '-');
}

/** Alur status pesanan: status sekarang => [status berikutnya, label tombol] */
function next_status(string $s): ?array
{
    $alur = [
        'menunggu'     => ['diproses',     'Proses Pesanan'],
        'diproses'     => ['siap_diambil', 'Tandai Siap Diambil'],
        'siap_diambil' => ['selesai',      'Selesaikan Pesanan'],
    ];
    return $alur[$s] ?? null;
}

/**
 * Potongan WHERE: hanya pesanan yang berisi menu milik merchant admin.
 * Pakai SATU placeholder posisi (?) = merchant_id, letakkan paling awal di parameter.
 */
function order_scope_sql(string $alias = 'o'): string
{
    return "{$alias}.id IN (
        SELECT od.order_id FROM order_details od
        JOIN menus mm ON mm.id = od.menu_id
        WHERE mm.merchant_id = ?
    )";
}

/** URL foto menu (atau null bila belum ada file) */
function foto_menu_url(?string $file): ?string
{
    if (!$file) return null;
    $nama = basename($file);
    $path = __DIR__ . '/../assets/uploads/menus/' . $nama;
    return is_file($path) ? '../assets/uploads/menus/' . rawurlencode($nama) : null;
}

/** Hentikan halaman bila admin belum terhubung ke merchant mana pun */
function require_merchant(): void
{
    global $merchant;
    if ($merchant) return;
    layout_start('Merchant Tidak Ditemukan', '');
    echo '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>
          Akun admin ini belum terhubung ke merchant (stand). Isi kolom <code>merchants.user_id</code>
          dengan ID akun ini agar bisa mengelola menu dan pesanan.</div>';
    layout_end();
    exit;
}

// ---------------------------------------------------------------------
// 4. LAYOUT (sidebar + konten)
// ---------------------------------------------------------------------
function layout_start(string $judul, string $aktif): void
{
    global $adminUser, $merchant, $loginAda, $pdo, $merchant_id;

    $menuNav = [
        'dashboard' => ['index.php',      'bi-speedometer2', 'Dashboard'],
        'orders'    => ['orders.php',     'bi-receipt',      'Pesanan Masuk'],
        'menus'     => ['menus.php',      'bi-egg-fried',    'Kelola Menu'],
        'categories'=> ['categories.php', 'bi-tags',         'Kategori'],
    ];

    // Badge jumlah pesanan baru (status menunggu) di sidebar
    $baru = 0;
    if ($merchant_id) {
        $q = $pdo->prepare("SELECT COUNT(*) FROM orders o WHERE " . order_scope_sql('o') . " AND o.status = 'menunggu'");
        $q->execute([$merchant_id]);
        $baru = (int)$q->fetchColumn();
    }

    $flash = $_SESSION['admin_flash'] ?? null;
    unset($_SESSION['admin_flash']);
    ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($judul) ?> - Admin KantinNinGuys</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body class="bg-light">

<nav class="navbar navbar-dark bg-danger d-lg-none sticky-top shadow-sm">
    <div class="container-fluid">
        <button class="btn btn-outline-light" data-bs-toggle="offcanvas" data-bs-target="#sidebarAdmin" aria-label="Buka menu">
            <i class="bi bi-list"></i>
        </button>
        <span class="navbar-brand fw-bold mb-0"><i class="bi bi-shop me-2"></i>Admin Kantin</span>
        <span></span>
    </div>
</nav>

<div class="admin-wrapper">
    <aside class="offcanvas-lg offcanvas-start admin-sidebar text-white" tabindex="-1" id="sidebarAdmin">
        <div class="offcanvas-header d-lg-none">
            <h5 class="offcanvas-title">Menu Admin</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarAdmin"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column p-0">
            <div class="p-3 border-bottom border-light border-opacity-25">
                <div class="fw-bold fs-5"><i class="bi bi-shop me-2"></i>KantinNinGuys</div>
                <div class="small opacity-75">Panel Admin</div>
            </div>
            <div class="p-3 border-bottom border-light border-opacity-25 small">
                <div class="fw-semibold"><i class="bi bi-person-circle me-1"></i><?= e($adminUser['name']) ?></div>
                <div class="opacity-75"><?= $merchant ? e($merchant['name']) : 'Belum ada merchant' ?></div>
                <?php if ($merchant): ?><div class="opacity-75"><i class="bi bi-geo-alt me-1"></i><?= e($merchant['location']) ?></div><?php endif; ?>
            </div>
            <ul class="nav nav-pills flex-column p-2 gap-1">
                <?php foreach ($menuNav as $key => [$href, $ikon, $label]): ?>
                <li class="nav-item">
                    <a class="nav-link admin-link <?= $aktif === $key ? 'active' : '' ?>" href="<?= $href ?>">
                        <i class="bi <?= $ikon ?> me-2"></i><?= $label ?>
                        <?php if ($key === 'orders' && $baru > 0): ?>
                            <span class="badge bg-warning text-dark rounded-pill float-end"><?= $baru ?></span>
                        <?php endif; ?>
                    </a>
                </li>
                <?php endforeach; ?>
            </ul>
            <div class="mt-auto p-2 border-top border-light border-opacity-25">
                <a class="nav-link admin-link" href="../menu.php"><i class="bi bi-box-arrow-up-right me-2"></i>Lihat Halaman Mahasiswa</a>
                <?php if ($loginAda && file_exists(__DIR__ . '/../logout.php')): ?>
                <a class="nav-link admin-link" href="../logout.php"><i class="bi bi-box-arrow-right me-2"></i>Keluar</a>
                <?php endif; ?>
            </div>
        </div>
    </aside>

    <main class="admin-content">
        <div class="container-fluid py-4 px-3 px-lg-4">
            <?php if ($flash): ?>
                <div class="alert alert-<?= e($flash['type']) ?> alert-dismissible fade show" role="alert">
                    <?= e($flash['msg']) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
<?php
}

function layout_end(): void
{
    ?>
        </div>
    </main>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php
}
