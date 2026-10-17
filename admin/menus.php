<?php
/**
 * KantinNinGuys - Kelola Menu (Read + form Tambah/Edit/Hapus)
 * File: admin/menus.php
 * Tanggung Jawab: Orang 4
 */
require_once __DIR__ . '/bootstrap.php';
require_merchant();

$q   = trim($_GET['q'] ?? '');
$cat = (int)($_GET['cat'] ?? 0);

$where  = ['m.merchant_id = ?'];
$params = [$merchant_id];
if ($q !== '') {
    $where[]  = 'm.name LIKE ?';
    $params[] = '%' . $q . '%';
}
if ($cat > 0) {
    $where[]  = 'm.category_id = ?';
    $params[] = $cat;
}

$stmt = $pdo->prepare("
    SELECT m.*, c.name AS category_name
    FROM menus m
    JOIN categories c ON c.id = m.category_id
    WHERE " . implode(' AND ', $where) . "
    ORDER BY c.name, m.name
");
$stmt->execute($params);
$menus = $stmt->fetchAll();

$categories = $pdo->query("SELECT id, name FROM categories ORDER BY name")->fetchAll();

$back = http_build_query(array_filter(['q' => $q, 'cat' => $cat ?: null]));

layout_start('Kelola Menu', 'menus');
?>
<div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
    <div>
        <h1 class="h4 fw-bold mb-1">Kelola Menu</h1>
        <p class="text-muted small mb-0">Tambah, ubah, dan hapus menu di <?= e($merchant['name']) ?>.</p>
    </div>
    <button class="btn btn-danger" onclick="bukaFormMenu()" <?= $categories ? '' : 'disabled' ?>>
        <i class="bi bi-plus-lg me-1"></i>Tambah Menu
    </button>
</div>

<?php if (!$categories): ?>
    <div class="alert alert-warning">Belum ada kategori. <a href="categories.php">Buat kategori dulu</a> sebelum menambah menu.</div>
<?php endif; ?>

<form class="row g-2 mb-3" method="get">
    <div class="col-md-5"><input type="search" name="q" value="<?= e($q) ?>" class="form-control" placeholder="Cari nama menu..."></div>
    <div class="col-md-4">
        <select name="cat" class="form-select" onchange="this.form.submit()">
            <option value="0">Semua kategori</option>
            <?php foreach ($categories as $c): ?>
                <option value="<?= (int)$c['id'] ?>" <?= $cat === (int)$c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
            <?php endforeach; ?>
        </select>
    </div>
    <div class="col-md-3 d-flex gap-2">
        <button class="btn btn-outline-danger flex-fill"><i class="bi bi-search me-1"></i>Cari</button>
        <?php if ($q !== '' || $cat): ?><a href="menus.php" class="btn btn-outline-secondary">Reset</a><?php endif; ?>
    </div>
</form>

<div class="card border-0 shadow-sm">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr><th style="width:72px">Foto</th><th>Nama Menu</th><th>Kategori</th><th class="text-end">Harga</th><th class="text-center">Stok</th><th class="text-end">Aksi</th></tr>
            </thead>
            <tbody>
            <?php if (!$menus): ?>
                <tr><td colspan="6" class="text-center text-muted py-5">
                    <i class="bi bi-egg-fried fs-1 d-block mb-2"></i>Belum ada menu<?= ($q !== '' || $cat) ? ' yang cocok dengan pencarian' : '' ?>.
                </td></tr>
            <?php else: foreach ($menus as $m): $foto = foto_menu_url($m['photo_url']); ?>
                <tr>
                    <td><?php if ($foto): ?><img src="<?= e($foto) ?>" class="menu-thumb" alt=""><?php else: ?><div class="menu-thumb-ph"><i class="bi bi-image"></i></div><?php endif; ?></td>
                    <td>
                        <div class="fw-semibold"><?= e($m['name']) ?></div>
                        <div class="small text-muted text-truncate" style="max-width:340px"><?= e($m['description'] ?? '') ?></div>
                    </td>
                    <td><span class="badge bg-secondary-subtle text-secondary"><?= e($m['category_name']) ?></span></td>
                    <td class="text-end"><?= rupiah($m['price']) ?></td>
                    <td class="text-center">
                        <?php $st = (int)$m['stock']; ?>
                        <span class="badge <?= $st === 0 ? 'bg-danger' : ($st <= 5 ? 'bg-warning text-dark' : 'bg-success-subtle text-success') ?>">
                            <?= $st === 0 ? 'Habis' : $st ?>
                        </span>
                    </td>
                    <td class="text-end text-nowrap">
                        <button class="btn btn-sm btn-outline-primary" title="Edit"
                                data-menu="<?= e(json_encode([
                                    'id' => (int)$m['id'], 'name' => $m['name'], 'description' => $m['description'],
                                    'category_id' => (int)$m['category_id'], 'price' => (float)$m['price'],
                                    'stock' => (int)$m['stock'], 'foto' => $foto,
                                ])) ?>" onclick="bukaFormMenu(JSON.parse(this.dataset.menu))">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" title="Hapus"
                                onclick="konfirmasiHapus(<?= (int)$m['id'] ?>, <?= e(json_encode($m['name'])) ?>)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            <?php endforeach; endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- MODAL TAMBAH / EDIT -->
<div class="modal fade" id="modalMenu" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <form class="modal-content" method="post" action="menu_action.php" enctype="multipart/form-data">
            <?= csrf_field() ?>
            <input type="hidden" name="action" id="fAction" value="create">
            <input type="hidden" name="id" id="fId" value="">
            <input type="hidden" name="back" value="<?= e($back) ?>">
            <div class="modal-header">
                <h5 class="modal-title" id="modalMenuTitle">Tambah Menu</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3">
                    <div class="col-md-8">
                        <label class="form-label fw-semibold">Nama Menu <span class="text-danger">*</span></label>
                        <input type="text" name="name" id="fName" class="form-control" maxlength="100" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Kategori <span class="text-danger">*</span></label>
                        <select name="category_id" id="fCat" class="form-select" required>
                            <?php foreach ($categories as $c): ?><option value="<?= (int)$c['id'] ?>"><?= e($c['name']) ?></option><?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Harga (Rp) <span class="text-danger">*</span></label>
                        <input type="number" name="price" id="fPrice" class="form-control" min="1" step="100" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Stok (porsi) <span class="text-danger">*</span></label>
                        <input type="number" name="stock" id="fStock" class="form-control" min="0" step="1" value="50" required>
                        <div class="form-text">Stok 0 = menu tidak tampil di halaman mahasiswa.</div>
                    </div>
                    <div class="col-12">
                        <label class="form-label fw-semibold">Deskripsi</label>
                        <textarea name="description" id="fDesc" class="form-control" rows="3"></textarea>
                    </div>
                    <div class="col-12">
                        <label class="form-label fw-semibold">Foto Menu</label>
                        <div class="d-flex align-items-center gap-3">
                            <img id="fPreview" class="menu-thumb d-none" alt="">
                            <input type="file" name="photo" id="fPhoto" class="form-control" accept="image/jpeg,image/png,image/webp">
                        </div>
                        <div class="form-text">JPG / PNG / WEBP, maksimal 2 MB. Kosongkan jika tidak ingin mengubah.</div>
                        <div class="form-check mt-2 d-none" id="wrapHapusFoto">
                            <input class="form-check-input" type="checkbox" name="hapus_foto" value="1" id="fHapusFoto">
                            <label class="form-check-label" for="fHapusFoto">Hapus foto saat ini</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-danger"><i class="bi bi-save me-1"></i>Simpan</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL HAPUS -->
<div class="modal fade" id="modalHapus" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content" method="post" action="menu_action.php">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" id="hId">
            <input type="hidden" name="back" value="<?= e($back) ?>">
            <div class="modal-header"><h5 class="modal-title">Hapus Menu?</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">Menu <strong id="hNama"></strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-danger"><i class="bi bi-trash me-1"></i>Ya, Hapus</button>
            </div>
        </form>
    </div>
</div>

<script>
function bukaFormMenu(m) {
    const edit = !!m;
    document.getElementById('modalMenuTitle').textContent = edit ? 'Edit Menu' : 'Tambah Menu';
    document.getElementById('fAction').value = edit ? 'update' : 'create';
    document.getElementById('fId').value     = edit ? m.id : '';
    document.getElementById('fName').value   = edit ? m.name : '';
    document.getElementById('fDesc').value   = edit ? (m.description || '') : '';
    document.getElementById('fPrice').value  = edit ? Math.round(m.price) : '';
    document.getElementById('fStock').value  = edit ? m.stock : 50;
    if (edit) document.getElementById('fCat').value = m.category_id;
    else document.getElementById('fCat').selectedIndex = 0;
    document.getElementById('fPhoto').value = '';
    document.getElementById('fHapusFoto').checked = false;
    const prev = document.getElementById('fPreview');
    prev.classList.toggle('d-none', !(edit && m.foto));
    if (edit && m.foto) prev.src = m.foto;
    document.getElementById('wrapHapusFoto').classList.toggle('d-none', !(edit && m.foto));
    new bootstrap.Modal(document.getElementById('modalMenu')).show();
}
document.getElementById('fPhoto').addEventListener('change', function () {
    const prev = document.getElementById('fPreview');
    if (this.files[0]) { prev.src = URL.createObjectURL(this.files[0]); prev.classList.remove('d-none'); }
});
function konfirmasiHapus(id, nama) {
    document.getElementById('hId').value = id;
    document.getElementById('hNama').textContent = nama;
    new bootstrap.Modal(document.getElementById('modalHapus')).show();
}
</script>
<?php layout_end(); ?>
