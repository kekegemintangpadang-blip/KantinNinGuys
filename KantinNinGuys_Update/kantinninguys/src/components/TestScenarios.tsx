import React from 'react';
import { CheckCircle2, AlertOctagon, RefreshCw, Calculator, ShoppingBag } from 'lucide-react';

export function TestScenarios() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-2">
        <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Metodologi & Verifikasi Kualitas</span>
        <h2 className="text-lg font-bold text-slate-900">5 Skenario Pengujian Wajib untuk Modul Orang 3</h2>
        <p className="text-xs text-slate-500 max-w-3xl">
          Gunakan daftar skenario pengujian berikut saat presentasi di depan dosen atau demo kelompok untuk membuktikan bahwa seluruh ketentuan fitur dan keamanan berjalan 100% konsisten.
        </p>
      </div>

      <div className="space-y-4">
        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center">1</span>
            <h4 className="text-sm font-bold text-slate-900">Pengujian 1: Tampilan & Proteksi Keranjang Kosong</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Langkah Pengujian:</span>
              <p className="text-slate-600">Buka <code className="font-mono text-slate-800">cart.php</code> saat belum ada menu yang ditambahkan, atau klik tombol "Kosongkan Keranjang".</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Hasil yang Diharapkan:</span>
              <p className="text-slate-600">Muncul ilustrasi keranjang kosong dengan pesan ramah, tombol menuju menu, dan tidak menampilkan tabel kosong yang rusak.</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 space-y-1 text-emerald-900">
              <span className="font-semibold block">Proteksi Keamanan:</span>
              <p>Jika mahasiswa memaksa membuka <code className="font-mono">checkout.php</code> lewat URL langsung, sistem otomatis me-redirect kembali ke <code className="font-mono">cart.php</code> dengan peringatan.</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center">2</span>
            <h4 className="text-sm font-bold text-slate-900">Pengujian 2: Perubahan Jumlah & Pencegahan Nilai Nol / Negatif</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Langkah Pengujian:</span>
              <p className="text-slate-600">Tekan tombol minus (-) hingga jumlah bernilai 1, atau coba ketik angka '0', '-5', atau huruf ke dalam input kuantitas.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Hasil yang Diharapkan:</span>
              <p className="text-slate-600">Kuantitas tetap bertahan minimal 1. Sistem menolak nilai nol maupun negatif baik pada JavaScript sisi klien maupun PHP sisi server.</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 space-y-1 text-emerald-900">
              <span className="font-semibold block">Pengecekan Stok:</span>
              <p>Jika jumlah melebihi stok yang tersedia di database, input dibatasi maksimal sebesar sisa stok dengan notifikasi.</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center">3</span>
            <h4 className="text-sm font-bold text-slate-900">Pengujian 3: Otomatisasi Perhitungan Subtotal dan Grand Total</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Langkah Pengujian:</span>
              <p className="text-slate-600">Ubah jumlah pesanan menu (misal: 2 porsi Ayam Geprek @Rp 15.000 dan 2 Es Teh @Rp 4.000).</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Hasil yang Diharapkan:</span>
              <p className="text-slate-600">Subtotal baris 1 langsung menjadi Rp 30.000, baris 2 menjadi Rp 8.000, dan Total Keseluruhan langsung terbarui menjadi Rp 38.000 secara instan via AJAX tanpa reload halaman.</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 space-y-1 text-emerald-900">
              <span className="font-semibold block">Integritas Server:</span>
              <p>Di backend (<code className="font-mono">proses_checkout.php</code>), PHP menghitung ulang harga asli dari tabel database untuk mematikan manipulasi Inspect Element pada browser.</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center">4</span>
            <h4 className="text-sm font-bold text-slate-900">Pengujian 4: Checkout Berhasil & Penyimpanan Database 3 Tabel</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Langkah Pengujian:</span>
              <p className="text-slate-600">Isi catatan, pilih metode pembayaran (misal: 'Tunai di Kasir'), klik "Konfirmasi & Buat Pesanan".</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Hasil yang Diharapkan:</span>
              <p className="text-slate-600">Muncul halaman <code className="font-mono">order_success.php</code> menampilkan Nomor Pesanan unik (contoh: KNG-20261014-9812), rincian pesanan, total, serta status pesanan 'menunggu' dan pembayaran 'menunggu'. Keranjang otomatis kosong.</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 space-y-1 text-emerald-900">
              <span className="font-semibold block">Verifikasi phpMyAdmin:</span>
              <p>Periksa tabel <code className="font-mono">orders</code> (1 baris), <code className="font-mono">order_details</code> (sesuai jumlah menu), dan <code className="font-mono">payments</code> (1 baris terhubung via order_id).</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center justify-center">5</span>
            <h4 className="text-sm font-bold text-slate-900">Pengujian 5: Pembatalan Transaksi Total (PDO RollBack)</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Langkah Pengujian:</span>
              <p className="text-slate-600">Simulasikan kegagalan database (misal: aktifkan sakelar uji rollback di simulator, atau simulasikan kuantitas melebihi stok yang ada).</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Hasil yang Diharapkan:</span>
              <p className="text-slate-600">Sistem menangkap Exception, memanggil <code className="font-mono text-red-700">$pdo-&gt;rollBack()</code>, dan membatalkan seluruh operasi.</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 space-y-1 text-red-900">
              <span className="font-semibold block">Jaminan Atomisitas (ACID):</span>
              <p>Cek phpMyAdmin: tidak ada baris <code className="font-mono">orders</code> yang menggantung atau terisi separuh tanpa rincian item atau tanpa data pembayaran.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
