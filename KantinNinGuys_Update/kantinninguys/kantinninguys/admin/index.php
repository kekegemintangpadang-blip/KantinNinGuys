<?php
/**
 * KantinNinGuys - Dashboard Admin
 * File: admin/index.php
 * Tanggung Jawab: Orang 4
 * Menampilkan jumlah pesanan, ringkasan transaksi, grafik 7 hari, menu terlaris, stok menipis.
 */
require_once __DIR__ . '/bootstrap.php';
require_merchant();
layout_start('Dashboard', 'dashboard');

$scope = order_scope_sql('o');

// ---- Ringkasan pesanan & transaksi ----
$stmt = $pdo->prepare("
    SELECT COUNT(*) AS total,
           SUM(o.status = 'menunggu')     AS menunggu,
           SUM(o.status = 'diproses')     AS diproses,
           SUM(o.status = 'siap_diambil') AS siap,
           SUM(o.status = 'selesai')      AS selesai,
           SUM(DATE(o.created_at) = CURDATE()) AS hari_ini,
           SUM(CASE WHEN p.status = 'berhasil' THEN o.total ELSE 0 END) AS omzet,
           SUM(CASE WHEN p.status = 'berhasil' AND DATE(o.created_at) = CURDATE() THEN o.total ELSE 0 END) AS omzet_hari_ini,
           SUM(CASE WHEN p.status = 'menunggu' THEN o.total ELSE 0 END) AS belum_dibayar
    FROM orders o
    LEFT JOIN payments p ON p.order_id = o.id
    WHERE $scope
");
$stmt->execute([$merchant_id]);
$s = array_map(fn($v) => (float)($v ?? 0), $stmt->fetch());

// ---- Grafik 7 hari terakhir ----
$stmt = $pdo->prepare("
    SELECT DATE(o.created_at) AS tgl, COUNT(*) AS jml,
           SUM(CASE WHEN p.status = 'berhasil' THEN o.total ELSE 0 END) AS omzet
    FROM orders o
    LEFT JOIN payments p ON p.order_id = o.id
    WHERE $scope AND o.created_at >= CURDATE() - INTERVAL 6 DAY
    GROUP BY DATE(o.created_at)
");
$stmt->execute([$merchant_id]);
$perHari = [];
foreach ($stmt->fetchAll() as $r) {
    $perHari[$r['tgl']] = $r;
}
$labels = $dataJml = $dataOmzet = [];
for ($i = 6; $i >= 0; $i--) {
    $d = date('Y-m-d', strtotime("-$i day"));
    $labels[]    = date('d M', strtotime($d));
    $dataJml[]   = (int)($perHari[$d]['jml'] ?? 0);
    $dataOmzet[] = (float)($perHari[$d]['omzet'] ?? 0);
}

// ---- Menu terlaris ----
$stmt = $pdo->prepare("
    SELECT m.name, SUM(od.jumlah) AS qty
    FROM order_details od
    JOIN menus m ON m.id = od.menu_id
    WHERE m.merchant_id = ?
    GROUP BY m.id, m.name
    ORDER BY qty DESC
    LIMIT 5
");
$stmt->execute([$merchant_id]);
$terlaris = $stmt->fetchAll();

// ---- Stok menipis (<= 5) ----
$stmt = $pdo->prepare("SELECT id, name, stock FROM menus WHERE merchant_id = ? AND stock <= 5 ORDER BY stock ASC, name LIMIT 6");
$stmt->execute([$merchant_id]);
$menipis = $stmt->fetchAll();

// ---- Jumlah menu & kategori ----
$stmt = $pdo->prepare("SELECT COUNT(*) FROM menus WHERE merchant_id = ?");
$stmt->execute([$merchant_id]);
$jumlahMenu = (int)$stmt->fetchColumn();

// ---- 5 pesanan terbaru ----
$stmt = $pdo->prepare("
    SELECT o.id, o.order_number, o.total, o.status, o.created_at, u.name AS pemesan, p.status AS bayar
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN payments p ON p.order_id = o.id
    WHERE $scope
    ORDER BY o.created_at DESC, o.id DESC
    LIMIT 5
");
$stmt->execute([$merchant_id]);
$terbaru = $stmt->fetchAll();
?>

<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
    <div>
        <h1 class="h4 fw-bold mb-1">Dashboard</h1>
        <p class="text-muted small mb-0"><?= e($merchant['name']) ?> &middot; <?= date('d M Y') ?></p>
    </div>
    <a href="orders.php?status=menunggu" class="btn btn-danger">
        <i class="bi bi-bell me-1"></i>Pesanan Menunggu
        <span class="badge bg-light text-danger ms-1"><?= (int)$s['menunggu'] ?></span>
    </a>
</div>

<!-- KARTU RINGKASAN -->
<div class="row g-3 mb-4">
    <div class="col-6 col-xl-3">
        <div class="card stat-card shadow-sm h-100"><div class="card-body d-flex align-items-center gap-3">
            <div class="stat-icon bg-danger-subtle text-danger"><i class="bi bi-receipt"></i></div>
            <div><div class="text-muted small">Total Pesanan</div><div class="fs-4 fw-bold"><?= (int)$s['total'] ?></div></div>
        </div></div>
    </div>
    <div class="col-6 col-xl-3">
        <div class="card stat-card shadow-sm h-100"><div class="card-body d-flex align-items-center gap-3">
            <div class="stat-icon bg-warning-subtle text-warning-emphasis"><i class="bi bi-calendar-day"></i></div>
            <div><div class="text-muted small">Pesanan Hari Ini</div><div class="fs-4 fw-bold"><?= (int)$s['hari_ini'] ?></div></div>
        </div></div>
    </div>
    <div class="col-6 col-xl-3">
        <div class="card stat-card shadow-sm h-100"><div class="card-body d-flex align-items-center gap-3">
            <div class="stat-icon bg-success-subtle text-success"><i class="bi bi-cash-coin"></i></div>
            <div><div class="text-muted small">Pendapatan (Lunas)</div><div class="fs-5 fw-bold"><?= rupiah($s['omzet']) ?></div>
            <div class="small text-muted">Hari ini: <?= rupiah($s['omzet_hari_ini']) ?></div></div>
        </div></div>
    </div>
    <div class="col-6 col-xl-3">
        <div class="card stat-card shadow-sm h-100"><div class="card-body d-flex align-items-center gap-3">
            <div class="stat-icon bg-secondary-subtle text-secondary"><i class="bi bi-wallet2"></i></div>
            <div><div class="text-muted small">Belum Dibayar</div><div class="fs-5 fw-bold"><?= rupiah($s['belum_dibayar']) ?></div></div>
        </div></div>
    </div>
</div>

<!-- STATUS PESANAN -->
<div class="row g-3 mb-4">
    <?php foreach ([['menunggu','menunggu'],['diproses','diproses'],['siap_diambil','siap'],['selesai','selesai']] as [$st, $key]):
        [$label, $warna, $ikon] = status_order_info($st); ?>
    <div class="col-6 col-lg-3">
        <a href="orders.php?status=<?= $st ?>" class="text-decoration-none">
            <div class="card border-0 shadow-sm h-100"><div class="card-body d-flex justify-content-between align-items-center">
                <div><div class="text-muted small"><?= e($label) ?></div><div class="fs-3 fw-bold text-dark"><?= (int)$s[$key] ?></div></div>
                <span class="badge bg-<?= $warna ?> fs-5 <?= $warna === 'warning' ? 'text-dark' : '' ?>"><i class="bi <?= $ikon ?>"></i></span>
            </div></div>
        </a>
    </div>
    <?php endforeach; ?>
</div>

<div class="row g-3 mb-4">
    <div class="col-lg-8">
        <div class="card border-0 shadow-sm h-100"><div class="card-body">
            <h2 class="h6 fw-bold mb-3">Pesanan &amp; Pendapatan 7 Hari Terakhir</h2>
            <div class="chart-box"><canvas id="grafik7Hari"></canvas></div>
        </div></div>
    </div>
    <div class="col-lg-4">
        <div class="card border-0 shadow-sm mb-3"><div class="card-body">
            <h2 class="h6 fw-bold mb-3"><i class="bi bi-trophy text-warning me-1"></i>Menu Terlaris</h2>
            <?php if (!$terlaris): ?>
                <p class="text-muted small mb-0">Belum ada penjualan.</p>
            <?php else: ?>
                <ol class="mb-0 ps-3">
                <?php foreach ($terlaris as $t): ?>
                    <li class="mb-2"><div class="d-flex justify-content-between align-items-center gap-2"><span><?= e($t['name']) ?></span><span class="badge bg-danger-subtle text-danger text-nowrap"><?= (int)$t['qty'] ?> porsi</span></div></li>
                <?php endforeach; ?>
                </ol>
            <?php endif; ?>
        </div></div>
        <div class="card border-0 shadow-sm"><div class="card-body">
            <h2 class="h6 fw-bold mb-3"><i class="bi bi-exclamation-triangle text-danger me-1"></i>Stok Menipis</h2>
            <?php if (!$menipis): ?>
                <p class="text-muted small mb-0">Semua stok aman (di atas 5).</p>
            <?php else: foreach ($menipis as $m): ?>
                <div class="d-flex justify-content-between small mb-1">
                    <span class="text-truncate me-2"><?= e($m['name']) ?></span>
                    <span class="badge <?= (int)$m['stock'] === 0 ? 'bg-danger' : 'bg-warning text-dark' ?>"><?= (int)$m['stock'] === 0 ? 'Habis' : (int)$m['stock'] ?></span>
                </div>
            <?php endforeach; endif; ?>
            <a href="menus.php" class="small d-block mt-2">Kelola menu (<?= $jumlahMenu ?> menu) &rarr;</a>
        </div></div>
    </div>
</div>

<div class="card border-0 shadow-sm">
    <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h6 fw-bold mb-0">Pesanan Terbaru</h2>
            <a href="orders.php" class="small">Lihat semua &rarr;</a>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light"><tr><th>No. Pesanan</th><th>Pemesan</th><th>Waktu</th><th class="text-end">Total</th><th>Bayar</th><th>Status</th><th></th></tr></thead>
                <tbody>
                <?php if (!$terbaru): ?>
                    <tr><td colspan="7" class="text-center text-muted py-4">Belum ada pesanan masuk.</td></tr>
                <?php else: foreach ($terbaru as $o): ?>
                    <tr>
                        <td class="fw-semibold"><?= e($o['order_number']) ?></td>
                        <td><?= e($o['pemesan']) ?></td>
                        <td class="small text-muted"><?= date('d M H:i', strtotime($o['created_at'])) ?></td>
                        <td class="text-end"><?= rupiah($o['total']) ?></td>
                        <td><?= badge_status_bayar($o['bayar']) ?></td>
                        <td><?= badge_status_order($o['status']) ?></td>
                        <td class="text-end"><a class="btn btn-sm btn-outline-danger" href="order_detail.php?id=<?= (int)$o['id'] ?>">Detail</a></td>
                    </tr>
                <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js"></script>
<script>
new Chart(document.getElementById('grafik7Hari'), {
    data: {
        labels: <?= json_encode($labels) ?>,
        datasets: [
            { type: 'bar',  label: 'Jumlah Pesanan', data: <?= json_encode($dataJml) ?>,
              backgroundColor: 'rgba(220,53,69,.75)', yAxisID: 'y', order: 2 },
            { type: 'line', label: 'Pendapatan Lunas (Rp)', data: <?= json_encode($dataOmzet) ?>,
              borderColor: '#198754', backgroundColor: '#198754', tension: .2, yAxisID: 'y1', order: 1 }
        ]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
            y:  { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Pesanan' } },
            y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false },
                  ticks: { callback: v => 'Rp ' + Number(v).toLocaleString('id-ID') } }
        }
    }
});
</script>
<?php layout_end(); ?>
