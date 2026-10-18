<?php
/**
 * KantinNinGuys - Daftar Pesanan Masuk
 * File: admin/orders.php
 * Tanggung Jawab: Orang 4
 * Filter status, pencarian, pagination, dan tombol cepat untuk memajukan status pesanan.
 */
require_once __DIR__ . '/bootstrap.php';
require_merchant();

$validStatus = ['menunggu', 'diproses', 'siap_diambil', 'selesai'];
$status = $_GET['status'] ?? '';
if (!in_array($status, $validStatus, true)) $status = '';
$q    = trim($_GET['q'] ?? '');
$page = max(1, (int)($_GET['page'] ?? 1));
$per  = 15;

$where  = [order_scope_sql('o')];
$params = [$merchant_id];
if ($status !== '') { $where[] = 'o.status = ?'; $params[] = $status; }
if ($q !== '') {
    $where[]  = '(o.order_number LIKE ? OR u.name LIKE ?)';
    $params[] = "%$q%";
    $params[] = "%$q%";
}
$whereSql = implode(' AND ', $where);

$stmt = $pdo->prepare("SELECT COUNT(*) FROM orders o JOIN users u ON u.id = o.user_id WHERE $whereSql");
$stmt->execute($params);
$totalRows = (int)$stmt->fetchColumn();
$totalPage = max(1, (int)ceil($totalRows / $per));
$page      = min($page, $totalPage);
$offset    = ($page - 1) * $per;

$stmt = $pdo->prepare("
    SELECT o.id, o.order_number, o.total, o.status, o.notes, o.created_at,
           u.name AS pemesan, p.metode, p.status AS bayar,
           (SELECT COALESCE(SUM(jumlah), 0) FROM order_details WHERE order_id = o.id) AS jml_item
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN payments p ON p.order_id = o.id
    WHERE $whereSql
    ORDER BY FIELD(o.status, 'menunggu', 'diproses', 'siap_diambil', 'selesai'), o.created_at DESC, o.id DESC
    LIMIT $per OFFSET $offset
");
$stmt->execute($params);
$orders = $stmt->fetchAll();

// Hitung per status untuk tab
$stmt = $pdo->prepare("SELECT o.status, COUNT(*) FROM orders o WHERE " . order_scope_sql('o') . " GROUP BY o.status");
$stmt->execute([$merchant_id]);
$hitung = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
$semua  = array_sum($hitung);

function url_orders(array $o): string {
    return 'orders.php?' . http_build_query(array_filter($o, fn($v) => $v !== '' && $v !== null && $v !== 1));
}
$backUrl = url_orders(['status' => $status, 'q' => $q, 'page' => $page]);

layout_start('Pesanan Masuk', 'orders');
?>
<div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
    <div>
        <h1 class="h4 fw-bold mb-1">Pesanan Masuk</h1>
        <p class="text-muted small mb-0">Pantau dan proses pesanan mahasiswa. Pesanan yang menunggu tampil paling atas.</p>
    </div>
    <div class="d-flex align-items-center gap-3">
        <div class="form-check form-switch mb-0">
            <input class="form-check-input" type="checkbox" id="autoRefresh">
            <label class="form-check-label small" for="autoRefresh">Segarkan otomatis (30 dtk)</label>
        </div>
        <a href="<?= e($backUrl) ?>" class="btn btn-outline-secondary btn-sm"><i class="bi bi-arrow-clockwise"></i></a>
    </div>
</div>

<ul class="nav nav-pills mb-3 flex-nowrap overflow-auto">
    <li class="nav-item"><a class="nav-link <?= $status === '' ? 'active bg-danger' : 'text-dark' ?>" href="orders.php">Semua <span class="badge bg-light text-dark"><?= $semua ?></span></a></li>
    <?php foreach ($validStatus as $st): [$label] = status_order_info($st); ?>
    <li class="nav-item"><a class="nav-link text-nowrap <?= $status === $st ? 'active bg-danger' : 'text-dark' ?>" href="orders.php?status=<?= $st ?>">
        <?= e($label) ?> <span class="badge bg-light text-dark"><?= (int)($hitung[$st] ?? 0) ?></span></a></li>
    <?php endforeach; ?>
</ul>

<form class="row g-2 mb-3" method="get">
    <input type="hidden" name="status" value="<?= e($status) ?>">
    <div class="col-md-6 col-lg-5"><input type="search" name="q" value="<?= e($q) ?>" class="form-control" placeholder="Cari no. pesanan atau nama pemesan..."></div>
    <div class="col-auto"><button class="btn btn-outline-danger"><i class="bi bi-search me-1"></i>Cari</button></div>
</form>

<div class="card border-0 shadow-sm">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr><th>No. Pesanan</th><th>Pemesan</th><th>Waktu</th><th class="text-center">Item</th><th class="text-end">Total</th><th>Pembayaran</th><th>Status</th><th class="text-end">Aksi</th></tr>
            </thead>
            <tbody>
            <?php if (!$orders): ?>
                <tr><td colspan="8" class="text-center text-muted py-5"><i class="bi bi-inbox fs-1 d-block mb-2"></i>Tidak ada pesanan.</td></tr>
            <?php else: foreach ($orders as $o): $next = next_status($o['status']); ?>
                <tr>
                    <td class="fw-semibold"><?= e($o['order_number']) ?></td>
                    <td><?= e($o['pemesan']) ?><?php if ($o['notes']): ?> <i class="bi bi-chat-left-text text-muted" title="<?= e($o['notes']) ?>"></i><?php endif; ?></td>
                    <td class="small text-muted text-nowrap"><?= date('d M Y H:i', strtotime($o['created_at'])) ?></td>
                    <td class="text-center"><?= (int)$o['jml_item'] ?></td>
                    <td class="text-end text-nowrap"><?= rupiah($o['total']) ?></td>
                    <td><?= badge_status_bayar($o['bayar']) ?><div class="small text-muted"><?= e(label_metode($o['metode'])) ?></div></td>
                    <td><?= badge_status_order($o['status']) ?></td>
                    <td class="text-end text-nowrap">
                        <?php if ($next): ?>
                        <form method="post" action="order_action.php" class="d-inline">
                            <?= csrf_field() ?>
                            <input type="hidden" name="action" value="update_status">
                            <input type="hidden" name="id" value="<?= (int)$o['id'] ?>">
                            <input type="hidden" name="status" value="<?= e($next[0]) ?>">
                            <input type="hidden" name="back" value="<?= e($backUrl) ?>">
                            <button class="btn btn-sm btn-danger" title="<?= e($next[1]) ?>"><i class="bi bi-arrow-right-circle me-1"></i><?= e($next[1]) ?></button>
                        </form>
                        <?php endif; ?>
                        <a class="btn btn-sm btn-outline-secondary" href="order_detail.php?id=<?= (int)$o['id'] ?>">Detail</a>
                    </td>
                </tr>
            <?php endforeach; endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php if ($totalPage > 1): ?>
<nav class="mt-3"><ul class="pagination justify-content-center">
    <?php for ($i = 1; $i <= $totalPage; $i++): ?>
        <li class="page-item <?= $i === $page ? 'active' : '' ?>"><a class="page-link" href="<?= e(url_orders(['status' => $status, 'q' => $q, 'page' => $i])) ?>"><?= $i ?></a></li>
    <?php endfor; ?>
</ul></nav>
<?php endif; ?>

<script>
(function () {
    const cb = document.getElementById('autoRefresh');
    let t = null;
    cb.checked = localStorage.getItem('adminAutoRefresh') === '1';
    function atur() {
        clearInterval(t);
        if (cb.checked) t = setInterval(() => location.reload(), 30000);
        localStorage.setItem('adminAutoRefresh', cb.checked ? '1' : '0');
    }
    cb.addEventListener('change', atur);
    atur();
})();
</script>
<?php layout_end(); ?>
