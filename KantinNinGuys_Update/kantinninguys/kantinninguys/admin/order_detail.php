<?php
/**
 * KantinNinGuys - Detail Pesanan (admin)
 * File: admin/order_detail.php
 * Tanggung Jawab: Orang 4
 */
require_once __DIR__ . '/bootstrap.php';
require_merchant();

$id = (int)($_GET['id'] ?? 0);

$stmt = $pdo->prepare("
    SELECT o.*, u.name AS pemesan, u.phone, u.email,
           p.metode, p.status AS bayar, p.tanggal_bayar, p.jumlah AS jumlah_bayar
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN payments p ON p.order_id = o.id
    WHERE o.id = ? AND " . order_scope_sql('o') . "
");
$stmt->execute([$id, $merchant_id]);
$o = $stmt->fetch();

if (!$o) {
    flash('warning', 'Pesanan tidak ditemukan.');
    redirect('orders.php');
}

$stmt = $pdo->prepare("
    SELECT od.jumlah, od.harga, od.subtotal, m.name
    FROM order_details od JOIN menus m ON m.id = od.menu_id
    WHERE od.order_id = ? ORDER BY od.id
");
$stmt->execute([$id]);
$items = $stmt->fetchAll();

$next = next_status($o['status']);
$back = 'order_detail.php?id=' . $id;
$alur = ['menunggu', 'diproses', 'siap_diambil', 'selesai'];
$posisi = array_search($o['status'], $alur, true);

layout_start('Detail Pesanan ' . $o['order_number'], 'orders');
?>
<nav aria-label="breadcrumb"><ol class="breadcrumb small">
    <li class="breadcrumb-item"><a href="orders.php">Pesanan Masuk</a></li>
    <li class="breadcrumb-item active"><?= e($o['order_number']) ?></li>
</ol></nav>

<div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
    <h1 class="h4 fw-bold mb-0"><?= e($o['order_number']) ?> <?= badge_status_order($o['status']) ?></h1>
    <button class="btn btn-outline-secondary btn-sm" onclick="window.print()"><i class="bi bi-printer me-1"></i>Cetak</button>
</div>

<!-- Stepper status -->
<div class="card border-0 shadow-sm mb-3"><div class="card-body">
    <div class="row text-center g-2">
        <?php foreach ($alur as $i => $st): [$label, $warna, $ikon] = status_order_info($st); $aktif = $i <= $posisi; ?>
        <div class="col-3">
            <div class="fs-3 <?= $aktif ? 'text-danger' : 'text-muted opacity-50' ?>"><i class="bi <?= $ikon ?>"></i></div>
            <div class="small <?= $i === $posisi ? 'fw-bold' : 'text-muted' ?>"><?= e($label) ?></div>
        </div>
        <?php endforeach; ?>
    </div>
    <div class="progress mt-2" style="height:6px"><div class="progress-bar bg-danger" style="width:<?= (($posisi + 1) / count($alur)) * 100 ?>%"></div></div>
</div></div>

<div class="row g-3">
    <div class="col-lg-8">
        <div class="card border-0 shadow-sm mb-3"><div class="card-body">
            <h2 class="h6 fw-bold mb-3">Rincian Item</h2>
            <div class="table-responsive">
            <table class="table align-middle mb-0">
                <thead class="table-light"><tr><th>Menu</th><th class="text-center">Jumlah</th><th class="text-end">Harga</th><th class="text-end">Subtotal</th></tr></thead>
                <tbody>
                <?php foreach ($items as $it): ?>
                    <tr><td><?= e($it['name']) ?></td><td class="text-center"><?= (int)$it['jumlah'] ?></td>
                        <td class="text-end"><?= rupiah($it['harga']) ?></td><td class="text-end"><?= rupiah($it['subtotal']) ?></td></tr>
                <?php endforeach; ?>
                </tbody>
                <tfoot><tr class="fw-bold"><td colspan="3" class="text-end">Total</td><td class="text-end text-danger"><?= rupiah($o['total']) ?></td></tr></tfoot>
            </table>
            </div>
            <?php if ($o['notes']): ?>
                <div class="alert alert-light border mt-3 mb-0"><i class="bi bi-chat-left-text me-1"></i><strong>Catatan pemesan:</strong> <?= e($o['notes']) ?></div>
            <?php endif; ?>
        </div></div>
    </div>

    <div class="col-lg-4">
        <div class="card border-0 shadow-sm mb-3"><div class="card-body">
            <h2 class="h6 fw-bold mb-3">Pemesan</h2>
            <div class="fw-semibold"><?= e($o['pemesan']) ?></div>
            <div class="small text-muted"><?= e($o['email']) ?></div>
            <?php if ($o['phone']): ?><div class="small text-muted"><i class="bi bi-telephone me-1"></i><?= e($o['phone']) ?></div><?php endif; ?>
            <div class="small text-muted mt-2"><i class="bi bi-clock me-1"></i><?= date('d M Y H:i', strtotime($o['created_at'])) ?></div>
        </div></div>

        <div class="card border-0 shadow-sm mb-3 no-print"><div class="card-body">
            <h2 class="h6 fw-bold mb-3">Ubah Status Pesanan</h2>
            <?php if ($next): ?>
            <form method="post" action="order_action.php" class="mb-2">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="update_status">
                <input type="hidden" name="id" value="<?= $id ?>">
                <input type="hidden" name="status" value="<?= e($next[0]) ?>">
                <input type="hidden" name="back" value="<?= e($back) ?>">
                <button class="btn btn-danger w-100"><i class="bi bi-arrow-right-circle me-1"></i><?= e($next[1]) ?></button>
            </form>
            <?php else: ?>
                <p class="small text-muted">Pesanan sudah selesai.</p>
            <?php endif; ?>
            <form method="post" action="order_action.php" class="d-flex gap-2">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="update_status">
                <input type="hidden" name="id" value="<?= $id ?>">
                <input type="hidden" name="back" value="<?= e($back) ?>">
                <select name="status" class="form-select form-select-sm">
                    <?php foreach ($alur as $st): [$label] = status_order_info($st); ?>
                        <option value="<?= $st ?>" <?= $o['status'] === $st ? 'selected' : '' ?>><?= e($label) ?></option>
                    <?php endforeach; ?>
                </select>
                <button class="btn btn-outline-secondary btn-sm">Set</button>
            </form>
        </div></div>

        <div class="card border-0 shadow-sm no-print"><div class="card-body">
            <h2 class="h6 fw-bold mb-3">Pembayaran</h2>
            <div class="d-flex justify-content-between small mb-1"><span class="text-muted">Metode</span><span><?= e(label_metode($o['metode'])) ?></span></div>
            <div class="d-flex justify-content-between small mb-1"><span class="text-muted">Jumlah</span><span><?= rupiah($o['jumlah_bayar'] ?? $o['total']) ?></span></div>
            <div class="d-flex justify-content-between small mb-3"><span class="text-muted">Status</span><span><?= badge_status_bayar($o['bayar']) ?></span></div>
            <?php if ($o['tanggal_bayar']): ?><div class="small text-muted mb-3">Dibayar: <?= date('d M Y H:i', strtotime($o['tanggal_bayar'])) ?></div><?php endif; ?>
            <form method="post" action="order_action.php" class="d-flex gap-2">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="update_payment">
                <input type="hidden" name="id" value="<?= $id ?>">
                <input type="hidden" name="back" value="<?= e($back) ?>">
                <select name="payment_status" class="form-select form-select-sm">
                    <option value="menunggu" <?= $o['bayar'] === 'menunggu' ? 'selected' : '' ?>>Belum Dibayar</option>
                    <option value="berhasil" <?= $o['bayar'] === 'berhasil' ? 'selected' : '' ?>>Lunas (Berhasil)</option>
                    <option value="ditolak"  <?= $o['bayar'] === 'ditolak'  ? 'selected' : '' ?>>Ditolak</option>
                </select>
                <button class="btn btn-outline-success btn-sm">Simpan</button>
            </form>
        </div></div>
    </div>
</div>
<?php layout_end(); ?>
