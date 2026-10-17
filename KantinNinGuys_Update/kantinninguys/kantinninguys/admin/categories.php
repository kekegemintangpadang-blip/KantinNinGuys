<?php
/**
 * KantinNinGuys - Pengelolaan Kategori Makanan (CRUD)
 * File: admin/categories.php
 * Tanggung Jawab: Orang 4
 * Catatan: tabel categories bersifat global (dipakai semua merchant).
 */
require_once __DIR__ . '/bootstrap.php';
require_merchant();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_valid()) {
        flash('danger', 'Sesi formulir tidak valid. Silakan coba lagi.');
        redirect('categories.php');
    }
    $action = $_POST['action'] ?? '';
    $id     = (int)($_POST['id'] ?? 0);
    $name   = trim($_POST['name'] ?? '');
    $desc   = trim($_POST['description'] ?? '');

    try {
        if (in_array($action, ['create', 'update'], true)) {
            if ($name === '' || panjang($name) > 100) {
                throw new Exception('Nama kategori wajib diisi (maksimal 100 karakter).');
            }
            // Cegah nama kategori ganda
            $cek = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE LOWER(name) = LOWER(?) AND id <> ?");
            $cek->execute([$name, $action === 'update' ? $id : 0]);
            if ($cek->fetchColumn()) {
                throw new Exception("Kategori \"$name\" sudah ada.");
            }
        }

        if ($action === 'create') {
            $pdo->prepare("INSERT INTO categories (name, description) VALUES (?, ?)")
                ->execute([$name, $desc !== '' ? $desc : null]);
            flash('success', "Kategori \"$name\" berhasil ditambahkan.");

        } elseif ($action === 'update') {
            $stmt = $pdo->prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?");
            $stmt->execute([$name, $desc !== '' ? $desc : null, $id]);
            flash('success', "Kategori \"$name\" berhasil diperbarui.");

        } elseif ($action === 'delete') {
            $stmt = $pdo->prepare("SELECT name, (SELECT COUNT(*) FROM menus WHERE category_id = categories.id) AS jml FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            $c = $stmt->fetch();
            if (!$c) throw new Exception('Kategori tidak ditemukan.');
            if ((int)$c['jml'] > 0) {
                throw new Exception("Kategori \"{$c['name']}\" masih dipakai {$c['jml']} menu. Pindahkan atau hapus menunya terlebih dahulu.");
            }
            try {
                $pdo->prepare("DELETE FROM categories WHERE id = ?")->execute([$id]);
            } catch (PDOException $e) {
                if ($e->getCode() === '23000') throw new Exception("Kategori \"{$c['name']}\" masih dipakai oleh menu.");
                throw $e;
            }
            flash('success', "Kategori \"{$c['name']}\" berhasil dihapus.");
        } else {
            throw new Exception('Aksi tidak dikenal.');
        }
    } catch (Exception $e) {
        flash('danger', $e->getMessage());
    }
    redirect('categories.php');
}

$cats = $pdo->query("
    SELECT c.*, (SELECT COUNT(*) FROM menus m WHERE m.category_id = c.id) AS jml_menu
    FROM categories c ORDER BY c.name
")->fetchAll();

layout_start('Kategori', 'categories');
?>
<div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
    <div>
        <h1 class="h4 fw-bold mb-1">Kategori Makanan</h1>
        <p class="text-muted small mb-0">Kelompokkan menu, misalnya Makanan, Minuman, Camilan.</p>
    </div>
    <button class="btn btn-danger" onclick="bukaFormKategori()"><i class="bi bi-plus-lg me-1"></i>Tambah Kategori</button>
</div>

<div class="card border-0 shadow-sm">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light"><tr><th>Nama</th><th>Deskripsi</th><th class="text-center">Jumlah Menu</th><th class="text-end">Aksi</th></tr></thead>
            <tbody>
            <?php if (!$cats): ?>
                <tr><td colspan="4" class="text-center text-muted py-5">Belum ada kategori.</td></tr>
            <?php else: foreach ($cats as $c): ?>
                <tr>
                    <td class="fw-semibold"><?= e($c['name']) ?></td>
                    <td class="text-muted small"><?= e($c['description'] ?? '-') ?></td>
                    <td class="text-center"><span class="badge bg-secondary-subtle text-secondary"><?= (int)$c['jml_menu'] ?></span></td>
                    <td class="text-end text-nowrap">
                        <button class="btn btn-sm btn-outline-primary" title="Edit"
                                data-cat="<?= e(json_encode(['id' => (int)$c['id'], 'name' => $c['name'], 'description' => $c['description']])) ?>"
                                onclick="bukaFormKategori(JSON.parse(this.dataset.cat))"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm btn-outline-danger" title="Hapus"
                                onclick="konfirmasiHapus(<?= (int)$c['id'] ?>, <?= e(json_encode($c['name'])) ?>)"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            <?php endforeach; endif; ?>
            </tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="modalKategori" tabindex="-1">
    <div class="modal-dialog">
        <form class="modal-content" method="post">
            <?= csrf_field() ?>
            <input type="hidden" name="action" id="kAction" value="create">
            <input type="hidden" name="id" id="kId">
            <div class="modal-header"><h5 class="modal-title" id="kTitle">Tambah Kategori</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
                <div class="mb-3"><label class="form-label fw-semibold">Nama Kategori <span class="text-danger">*</span></label>
                    <input type="text" name="name" id="kName" class="form-control" maxlength="100" required></div>
                <div><label class="form-label fw-semibold">Deskripsi</label>
                    <textarea name="description" id="kDesc" class="form-control" rows="3"></textarea></div>
            </div>
            <div class="modal-footer"><button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button class="btn btn-danger"><i class="bi bi-save me-1"></i>Simpan</button></div>
        </form>
    </div>
</div>

<div class="modal fade" id="modalHapus" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content" method="post">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" id="hId">
            <div class="modal-header"><h5 class="modal-title">Hapus Kategori?</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">Kategori <strong id="hNama"></strong> akan dihapus. Kategori yang masih dipakai menu tidak dapat dihapus.</div>
            <div class="modal-footer"><button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button class="btn btn-danger"><i class="bi bi-trash me-1"></i>Ya, Hapus</button></div>
        </form>
    </div>
</div>

<script>
function bukaFormKategori(c) {
    const edit = !!c;
    document.getElementById('kTitle').textContent = edit ? 'Edit Kategori' : 'Tambah Kategori';
    document.getElementById('kAction').value = edit ? 'update' : 'create';
    document.getElementById('kId').value   = edit ? c.id : '';
    document.getElementById('kName').value = edit ? c.name : '';
    document.getElementById('kDesc').value = edit ? (c.description || '') : '';
    new bootstrap.Modal(document.getElementById('modalKategori')).show();
}
function konfirmasiHapus(id, nama) {
    document.getElementById('hId').value = id;
    document.getElementById('hNama').textContent = nama;
    new bootstrap.Modal(document.getElementById('modalHapus')).show();
}
</script>
<?php layout_end(); ?>
