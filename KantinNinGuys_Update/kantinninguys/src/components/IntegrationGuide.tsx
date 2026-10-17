import React from 'react';
import { Users, Code, Server, CheckCircle2, ArrowRight } from 'lucide-react';

export function IntegrationGuide() {
  return (
    <div className="space-y-6">
      {}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-2">
        <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Batas Tanggung Jawab & Integrasi Kelompok</span>
        <h2 className="text-lg font-bold text-slate-900">Panduan Menghubungkan Modul Orang 3 dengan Anggota Lain</h2>
        <p className="text-xs text-slate-500 max-w-3xl">
          Sebagai <strong>Orang 3</strong>, Anda bertanggung jawab penuh atas keranjang, checkout, dan penyimpanan transaksi ke database. Berikut adalah panduan antarmuka (interface contract) agar pekerjaan Anda menyatu secara mulus dengan anggota kelompok lainnya tanpa bentrok.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Server className="w-4 h-4 text-red-600" />
            <h4 className="text-sm font-bold text-slate-900">1. Integrasi dengan Orang 1 (Database & Config)</h4>
          </div>
          <div className="text-xs text-slate-600 space-y-2">
            <p>
              Orang 1 bertanggung jawab menyediakan koneksi database utama. Kita menggunakan file <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">config/database.php</code>.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block text-[11px]">Hal yang harus disepakati dengan Orang 1:</span>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Nama database: default <code className="text-slate-800 font-mono">kantinninguys</code>.</li>
                <li>Variabel koneksi PDO: harus bernama <code className="text-red-700 font-mono">$pdo</code>.</li>
                <li>Atribut PDO wajib menyertakan <code className="text-slate-800 font-mono">PDO::ATTR_ERRMODE =&gt; PDO::ERRMODE_EXCEPTION</code> agar mekanisme RollBack berfungsi saat ada kesalahan query.</li>
                <li>Pastikan tabel <code className="text-slate-800 font-mono">users</code> dan <code className="text-slate-800 font-mono">menus</code> sudah ada dan memiliki relasi foreign key yang sesuai.</li>
              </ul>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-slate-900">2. Integrasi dengan Orang 2 (Halaman Menu & Tombol Beli)</h4>
          </div>
          <div className="text-xs text-slate-600 space-y-2">
            <p>
              Orang 2 membuat halaman daftar menu (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">menu.php</code>). Berikan kode tombol dan fungsi JavaScript berikut kepada Orang 2:
            </p>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
              <p className="text-slate-400">// Pada kartu menu di menu.php milik Orang 2:</p>
              <p className="text-amber-300">&lt;button class="btn btn-danger btn-sm" onclick="addToCartFromCatalog(&lt;?= $menu['id'] ?&gt;)"&gt;</p>
              <p className="text-amber-300 pl-4">&lt;i class="bi bi-cart-plus"&gt;&lt;/i&gt; Tambah ke Keranjang</p>
              <p className="text-amber-300">&lt;/button&gt;</p>
              <p className="text-slate-400 mt-2">// Muat skrip Orang 3 di footer menu.php:</p>
              <p className="text-emerald-400">&lt;script src="assets/js/cart.js"&gt;&lt;/script&gt;</p>
            </div>
            <p className="text-[11px] text-slate-500">
              Fungsi <code className="font-mono">addToCartFromCatalog(menuId)</code> secara otomatis mengirimkan request ke <code className="font-mono">api/cart_action.php</code>, mengupdate badge keranjang, serta menolak jika menu berasal dari stand yang berbeda.
            </p>
          </div>
        </div>

        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Code className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">3. Integrasi dengan Orang 4 (Dashboard Penjual)</h4>
          </div>
          <div className="text-xs text-slate-600 space-y-2">
            <p>
              Orang 4 mengelola pesanan masuk di sisi penjual. Pesanan yang dibuat oleh Orang 3 tersimpan di tabel <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">orders</code> dengan status awal <code className="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded">menunggu</code>.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
              <span className="font-bold text-slate-800 block">Alur Kerja yang Dilanjutkan oleh Orang 4:</span>
              <p>• Penjual melihat pesanan masuk dengan status <code className="text-amber-700">menunggu</code>.</p>
              <p>• Saat mulai dimasak, Orang 4 mengubah status menjadi <code className="text-blue-700">diproses</code>.</p>
              <p>• Saat makanan selesai dimasak, status diubah menjadi <code className="text-indigo-700">siap_diambil</code>.</p>
              <p>• Saat mahasiswa membayar dan mengambil pesanan, Orang 4 mengubah status pesanan menjadi <code className="text-emerald-700">selesai</code> dan status pembayaran menjadi <code className="text-emerald-700">berhasil</code>.</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">4. Integrasi dengan Orang 5 (Autentikasi & Sesi)</h4>
          </div>
          <div className="text-xs text-slate-600 space-y-2">
            <p>
              Orang 3 membutuhkan ID mahasiswa yang sedang login untuk mengisi kolom <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">orders.user_id</code>.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
              <span className="font-bold text-slate-800 block">Variabel Session yang Harus Disediakan Orang 5:</span>
              <ul className="list-disc pl-4 space-y-1 font-mono text-slate-700">
                <li>$_SESSION['user_id'] = (int) $user['id'];</li>
                <li>$_SESSION['user_nama'] = (string) $user['nama'];</li>
                <li>$_SESSION['user_role'] = 'mahasiswa';</li>
              </ul>
              <p className="text-slate-500 pt-1 text-[10px]">
                *Catatan: Pada kode Orang 3 sudah disediakan fallback otomatis ke user dummy jika Orang 5 belum menyelesaikan fitur login, sehingga Anda bisa menguji kapan saja tanpa menunggu!
              </p>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <h3 className="text-base font-bold text-white">Langkah Menjalankan dan Menguji di XAMPP Lokal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700 space-y-1.5">
            <span className="font-bold text-emerald-400 block text-xs">Langkah 1: Letakkan File</span>
            <p className="text-slate-300">
              Buat folder <code className="text-amber-300 font-mono">kantinninguys</code> di dalam <code className="text-amber-300 font-mono">C:/xampp/htdocs/</code>. Ekstrak atau salin semua file Orang 3 ke dalamnya.
            </p>
          </div>

          <div className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700 space-y-1.5">
            <span className="font-bold text-emerald-400 block text-xs">Langkah 2: Start Apache & MySQL</span>
            <p className="text-slate-300">
              Buka <strong>XAMPP Control Panel</strong>, klik tombol <strong>Start</strong> pada modul <strong>Apache</strong> dan <strong>MySQL</strong> hingga berwarna hijau.
            </p>
          </div>

          <div className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700 space-y-1.5">
            <span className="font-bold text-emerald-400 block text-xs">Langkah 3: Import Database</span>
            <p className="text-slate-300">
              Buka browser ke <code className="text-amber-300 font-mono">http://localhost/phpmyadmin/</code>. Klik tab <strong>Import</strong> dan pilih file <code className="text-amber-300 font-mono">database_orang3.sql</code>.
            </p>
          </div>

          <div className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700 space-y-1.5">
            <span className="font-bold text-emerald-400 block text-xs">Langkah 4: Jalankan Fitur</span>
            <p className="text-slate-300">
              Buka browser dan kunjungi: <br />
              <code className="text-emerald-300 font-mono text-[11px]">http://localhost/kantinninguys/cart.php</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
