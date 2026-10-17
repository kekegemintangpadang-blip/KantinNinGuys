# Dashboard Admin — Orang 4

## Cara pasang
1. Salin folder `admin/`, `assets/css/admin.css`, dan `assets/uploads/` ke proyek (struktur sama dengan zip).
2. Database: impor `database_orang3.sql` (skema resmi). *Opsional:* impor `database_orang4.sql` untuk data demo pesanan.
3. Buka `http://localhost/<folder-proyek>/admin/`.

## Halaman
| File | Fungsi |
|---|---|
| `admin/index.php` | Dashboard: jumlah pesanan, ringkasan transaksi, grafik 7 hari, menu terlaris, stok menipis |
| `admin/menus.php` + `menu_action.php` | CRUD menu (tambah/edit/hapus, upload foto, cari & filter kategori) |
| `admin/categories.php` | CRUD kategori makanan |
| `admin/orders.php` | Pesanan masuk: filter status, cari, pagination, tombol cepat ubah status |
| `admin/order_detail.php` + `order_action.php` | Detail pesanan, ubah status pesanan & status pembayaran |
| `admin/bootstrap.php` | Guard admin, helper (CSRF, flash, rupiah), layout sidebar |

## Aturan yang dipakai
- Akses hanya untuk `users.role = 'admin'` (dicek ke database). Admin hanya melihat/mengubah menu & pesanan **stand miliknya** (`merchants.user_id = users.id`).
- Alur status: `menunggu → diproses → siap_diambil → selesai` (enum `orders.status`).
- Pendapatan = total pesanan dengan `payments.status = 'berhasil'`.
- Menu yang sudah pernah dipesan **tidak bisa dihapus** (FK `order_details.menu_id` = RESTRICT); ubah stok jadi 0 agar tersembunyi dari mahasiswa.
- Kategori yang masih dipakai menu tidak bisa dihapus.
- Foto menu disimpan di `assets/uploads/menus/` (kolom `menus.photo_url` berisi nama file).

## Integrasi Orang 5 (login)
Selama `login.php` belum ada, `admin/bootstrap.php` otomatis masuk sebagai admin Stand 01 (users.id=2) untuk testing.
Begitu `login.php` ada, admin dialihkan ke login bila belum masuk. Pastikan login menyimpan `$_SESSION['user_id']`.
Opsional: tambahkan `logout.php` — tombol "Keluar" muncul otomatis.
