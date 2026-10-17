import React, { useState } from 'react';
import { Database, Table, ArrowRight, ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react';
import { KANTIN_SQL } from '../data/projectFiles';

export function DatabaseSchema() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(KANTIN_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Arsitektur & Skema Relasional</span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">3 Tabel Utama Milik Orang 3</h2>
            <p className="text-xs text-slate-500">
              Sesuai ketentuan dokumen resmi proyek KantinNinGuys, nama tabel dan kolom dipertahankan tanpa perubahan.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>SQL Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Skrip SQL Lengkap</span>
              </>
            )}
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
            <div className="bg-red-50 border-b border-red-100 px-4 py-2.5 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-red-900 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-red-600" /> orders
              </span>
              <span className="text-[10px] bg-red-200/60 text-red-800 px-1.5 py-0.5 rounded font-mono">Header</span>
            </div>
            <div className="p-3 text-xs space-y-1.5 flex-1">
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-bold text-amber-700">id (PK)</span>
                <span className="text-slate-400">INT AUTO_INC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="text-blue-700">user_id (FK)</span>
                <span className="text-slate-400">INT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-semibold text-slate-800">order_number</span>
                <span className="text-slate-400">VARCHAR(40) UNIQUE</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-semibold text-slate-800">total</span>
                <span className="text-slate-400">DECIMAL(12,2)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-semibold text-slate-800">status</span>
                <span className="text-slate-400">ENUM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="text-slate-600">notes</span>
                <span className="text-slate-400">TEXT NULL</span>
              </div>
              <div className="flex justify-between py-1 font-mono">
                <span className="text-slate-600">created_at</span>
                <span className="text-slate-400">TIMESTAMP</span>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 p-2 text-[11px] text-slate-500">
              Nilai enum status: <code className="text-slate-700">menunggu</code>, <code className="text-slate-700">diproses</code>, <code className="text-slate-700">siap_diambil</code>, <code className="text-slate-700">selesai</code>.
            </div>
          </div>

          {}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-blue-600" /> order_details
              </span>
              <span className="text-[10px] bg-blue-200/60 text-blue-800 px-1.5 py-0.5 rounded font-mono">Items</span>
            </div>
            <div className="p-3 text-xs space-y-1.5 flex-1">
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-bold text-amber-700">id (PK)</span>
                <span className="text-slate-400">INT AUTO_INC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="text-red-700">order_id (FK)</span>
                <span className="text-slate-400">INT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="text-emerald-700">menu_id (FK)</span>
                <span className="text-slate-400">INT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-semibold text-slate-800">jumlah</span>
                <span className="text-slate-400">INT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-semibold text-slate-800">harga (snapshot)</span>
                <span className="text-slate-400">DECIMAL(12,2)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-semibold text-slate-800">subtotal</span>
                <span className="text-slate-400">DECIMAL(12,2)</span>
              </div>
              <div className="flex justify-between py-1 font-mono">
                <span className="text-slate-600">created_at</span>
                <span className="text-slate-400">TIMESTAMP</span>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 p-2 text-[11px] text-slate-500">
              Menyimpan snapshot harga saat transaksi agar riwayat tidak berubah jika harga di tabel menus diedit penjual.
            </div>
          </div>

          {}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
            <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-emerald-600" /> payments
              </span>
              <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded font-mono">Payment</span>
            </div>
            <div className="p-3 text-xs space-y-1.5 flex-1">
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-bold text-amber-700">id (PK)</span>
                <span className="text-slate-400">INT AUTO_INC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="text-red-700">order_id (FK)</span>
                <span className="text-slate-400">INT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-semibold text-slate-800">metode</span>
                <span className="text-slate-400">VARCHAR(50)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-semibold text-slate-800">jumlah</span>
                <span className="text-slate-400">DECIMAL(12,2)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="text-slate-600">tanggal_bayar</span>
                <span className="text-slate-400">DATETIME NULL</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="font-semibold text-slate-800">status</span>
                <span className="text-slate-400">ENUM</span>
              </div>
              <div className="flex justify-between py-1 font-mono">
                <span className="text-slate-600">created_at</span>
                <span className="text-slate-400">TIMESTAMP</span>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 p-2 text-[11px] text-slate-500">
              Nilai enum status pembayaran: <code className="text-slate-700">menunggu</code>, <code className="text-slate-700">berhasil</code>, <code className="text-slate-700">ditolak</code>.
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pemenuhan 12 Ketentuan Resmi Dokumen
          </h4>
          <ul className="text-xs space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Snapshot Harga:</strong> Disimpan ke <code>order_details.harga</code>, riwayat terlindungi jika harga master diubah.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Subtotal & Total:</strong> Dihitung otomatis (<code>harga * jumlah</code>) dan disimpan ke <code>orders.total</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Unique Order Number:</strong> <code>orders.order_number</code> di-generate unik dengan format <code>KNG-YYYYMMDD-XXXX</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Pemisahan Status:</strong> Status pesanan (<code>menunggu</code>) terpisah secara independen dari status bayar (<code>menunggu</code>).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Aturan 1 Penjual:</strong> Validasi ketat di sisi server menolak checkout jika menu berasal dari seller berbeda.</span>
            </li>
          </ul>
        </div>

        {}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-red-600" /> Alur Transaksi PDO (ACID)
          </h4>
          <div className="text-xs text-slate-600 font-mono space-y-1.5 bg-slate-900 text-slate-200 p-3.5 rounded-lg">
            <p className="text-emerald-400">1. $pdo-&gt;beginTransaction();</p>
            <p className="text-slate-300">2. Query DB: validasi stok & harga riil;</p>
            <p className="text-slate-300">3. Validasi 1 penjual (seller_id sama);</p>
            <p className="text-slate-300">4. INSERT INTO orders (order_number, total, ...);</p>
            <p className="text-slate-300">5. INSERT INTO order_details (snapshot harga);</p>
            <p className="text-slate-300">6. INSERT INTO payments (metode, jumlah, ...);</p>
            <p className="text-emerald-400">7. $pdo-&gt;commit(); // Sukses penuh</p>
            <p className="text-amber-400">// Jika terjadi Exception di langkah 2-6:</p>
            <p className="text-red-400">8. catch(Exception $e) &#123; $pdo-&gt;rollBack(); &#125;</p>
          </div>
          <p className="text-[11px] text-slate-500">
            Prinsip Atomisitas menjamin tidak ada data yang tersimpan separuh (misal: pesanan terbuat tapi itemnya kosong).
          </p>
        </div>
      </div>
    </div>
  );
}
