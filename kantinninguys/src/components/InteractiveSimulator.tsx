import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Store, 
  CreditCard, 
  Receipt, 
  RotateCcw,
  ShieldCheck,
  Printer,
  Info
} from 'lucide-react';

interface MenuItem {
  id: number;
  seller_id: number;
  seller_name: string;
  stand: string;
  nama_menu: string;
  kategori: string;
  harga: number;
  stok: number;
  foto_icon: string;
}

const DUMMY_MENUS: MenuItem[] = [
  {
    id: 1,
    seller_id: 1,
    seller_name: 'Kantin Bu Siti - Aneka Nasi',
    stand: 'Stand 01 - Lantai 1',
    nama_menu: 'Nasi Ayam Geprek Sambal Bawang',
    kategori: 'Makanan',
    harga: 15000,
    stok: 25,
    foto_icon: '🍗'
  },
  {
    id: 2,
    seller_id: 1,
    seller_name: 'Kantin Bu Siti - Aneka Nasi',
    stand: 'Stand 01 - Lantai 1',
    nama_menu: 'Nasi Goreng Spesial Telur',
    kategori: 'Makanan',
    harga: 13000,
    stok: 20,
    foto_icon: '🍳'
  },
  {
    id: 3,
    seller_id: 1,
    seller_name: 'Kantin Bu Siti - Aneka Nasi',
    stand: 'Stand 01 - Lantai 1',
    nama_menu: 'Tahu & Tempe Mendoan (Porsi)',
    kategori: 'Snack',
    harga: 6000,
    stok: 30,
    foto_icon: '🥟'
  },
  {
    id: 4,
    seller_id: 1,
    seller_name: 'Kantin Bu Siti - Aneka Nasi',
    stand: 'Stand 01 - Lantai 1',
    nama_menu: 'Es Teh Manis Jumbo',
    kategori: 'Minuman',
    harga: 4000,
    stok: 40,
    foto_icon: '🍹'
  },

  {
    id: 5,
    seller_id: 2,
    seller_name: 'Kedai Mas Eko - Mie & Minuman',
    stand: 'Stand 02 - Lantai 1',
    nama_menu: 'Mie Dok-Dok Kuah Pedas',
    kategori: 'Makanan',
    harga: 12000,
    stok: 15,
    foto_icon: '🍜'
  },
  {
    id: 6,
    seller_id: 2,
    seller_name: 'Kedai Mas Eko - Mie & Minuman',
    stand: 'Stand 02 - Lantai 1',
    nama_menu: 'Kopi Susu Gula Aren Dingin',
    kategori: 'Minuman',
    harga: 8000,
    stok: 20,
    foto_icon: '☕'
  }
];

export function InteractiveSimulator() {

  const [activeStep, setActiveStep] = useState<'catalog' | 'cart' | 'checkout' | 'processing' | 'success'>('cart');
  

  const [cart, setCart] = useState<{ [id: number]: number }>({
    1: 2,
    4: 2
  });

  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris_manual' | 'transfer_manual'>('tunai');
  const [simulateRollback, setSimulateRollback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const getCartItems = () => {
    return Object.entries(cart)
      .map(([idStr, qty]) => {
        const id = parseInt(idStr);
        const item = DUMMY_MENUS.find(m => m.id === id);
        if (!item) return null;
        return {
          ...item,
          jumlah: qty,
          subtotal: item.harga * qty
        };
      })
      .filter(Boolean) as (MenuItem & { jumlah: number; subtotal: number })[];
  };

  const cartItems = getCartItems();
  const totalBayar = cartItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalQty = cartItems.reduce((acc, curr) => acc + curr.jumlah, 0);
  const currentSeller = cartItems.length > 0 ? cartItems[0].seller_name : null;

  const handleAddToCart = (item: MenuItem) => {
    setErrorMessage(null);
    if (cartItems.length > 0) {
      const existingSellerId = cartItems[0].seller_id;
      if (item.seller_id !== existingSellerId) {
        setErrorMessage(
          `Aturan KantinNinGuys: Keranjang Anda saat ini berisi menu dari "${cartItems[0].seller_name}". Anda tidak dapat mencampur pesanan dengan "${item.seller_name}". Selesaikan atau kosongkan pesanan terlebih dahulu!`
        );
        return;
      }
    }

    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const handleUpdateQty = (menuId: number, delta: number) => {
    setCart(prev => {
      const current = prev[menuId] || 1;
      const next = current + delta;
      if (next < 1) return prev;
      return { ...prev, [menuId]: next };
    });
  };

  const handleRemoveItem = (menuId: number) => {
    setCart(prev => {
      const copy = { ...prev };
      delete copy[menuId];
      return copy;
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setErrorMessage('Keranjang masih kosong!');
      return;
    }

    setActiveStep('processing');

    setTimeout(() => {
      if (simulateRollback) {
        setActiveStep('checkout');
        setErrorMessage(
          'Simulasi Gagal: Terjadi kesalahan database (PDOException: General error). Transaksi dibatalkan secara atomik (ROLLBACK). Tidak ada data tersimpan di tabel orders, order_details, maupun payments!'
        );
      } else {
        const orderNumber = 'KNG-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
        const orderRecord = {
          order_id: 101,
          order_number: orderNumber,
          total: totalBayar,
          status_order: 'menunggu',
          notes: notes,
          created_at: new Date().toLocaleString('id-ID'),
          nama_pemesan: 'Ahmad Fauzi (Mahasiswa)',
          nama_toko: cartItems[0].seller_name,
          lokasi_stand: cartItems[0].stand,
          items: [...cartItems],
          payment: {
            metode: paymentMethod,
            jumlah: totalBayar,
            status_bayar: 'menunggu'
          }
        };

        setCompletedOrder(orderRecord);
        setCart({});
        setActiveStep('success');
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">KantinNinGuys Interactive Sandbox</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">Tanggung Jawab: Orang 3</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">Simulasi Alur Keranjang, Checkout & Transaksi Database</h2>
        </div>

        {}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveStep('catalog')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeStep === 'catalog' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            1. Menu (Orang 2)
          </button>
          <button
            onClick={() => setActiveStep('cart')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeStep === 'cart' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            2. Keranjang ({totalQty})
          </button>
          <button
            onClick={() => {
              if (cartItems.length > 0) setActiveStep('checkout');
            }}
            disabled={cartItems.length === 0}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeStep === 'checkout'
                ? 'bg-red-600 text-white shadow-sm'
                : cartItems.length === 0
                ? 'text-slate-500 cursor-not-allowed'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            3. Checkout
          </button>
          {completedOrder && (
            <button
              onClick={() => setActiveStep('success')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeStep === 'success' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-400 hover:text-white'
              }`}
            >
              4. Nota Sukses
            </button>
          )}
        </div>
      </div>

      {}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Perhatian Validasi:</p>
            <p className="text-red-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {}
      {activeStep === 'catalog' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Simulasi Sisi Orang 2</span>
              <h3 className="text-lg font-bold text-slate-900">Katalog Menu & Tombol Tambah ke Keranjang</h3>
              <p className="text-xs text-slate-600">
                Uji tombol "Tambah ke Keranjang" yang nantinya dipasang oleh Orang 2 di halaman menu. Perhatikan ketentuan satu pesanan satu penjual!
              </p>
            </div>
            <button
              onClick={() => setActiveStep('cart')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              <ShoppingCart className="w-4 h-4" /> Buka Keranjang ({totalQty})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DUMMY_MENUS.map(menu => {
              const inCartQty = cart[menu.id] || 0;
              return (
                <div key={menu.id} className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 transition-all bg-white">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-3xl p-2 bg-slate-50 rounded-lg">{menu.foto_icon}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">{menu.kategori}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mt-3 text-sm">{menu.nama_menu}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Store className="w-3.5 h-3.5 text-slate-400" /> {menu.seller_name}
                    </p>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-red-600 font-bold text-base">{formatRupiah(menu.harga)}</span>
                      <span className="text-xs text-slate-400">Stok: {menu.stok}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleAddToCart(menu)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {inCartQty > 0 ? `Tambah Lagi (${inCartQty} di Keranjang)` : 'Tambah ke Keranjang'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      {activeStep === 'cart' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Halaman cart.php</span>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-red-600" /> Keranjang Belanja Mahasiswa
              </h3>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" /> Kosongkan Keranjang
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Keranjang Belanja Masih Kosong</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Belum ada makanan atau minuman yang dipilih. Silakan kembali ke katalog menu untuk memilih menu lezat kantin!
              </p>
              <button
                onClick={() => setActiveStep('catalog')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
              >
                <ArrowLeft className="w-4 h-4" /> Pilih Menu dari Kantin
              </button>
            </div>
          ) : (
            <>
              {}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-center gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <strong>Stand Terpilih:</strong> {currentSeller}
                  <span className="block text-blue-700 mt-0.5">
                    Sesuai ketentuan proyek KantinNinGuys, satu pesanan hanya berisi menu dari satu penjual.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {}
                <div className="lg:col-span-2 space-y-4">
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                        <tr>
                          <th className="py-3 px-4">Menu</th>
                          <th className="py-3 px-3 text-center">Harga Satuan</th>
                          <th className="py-3 px-3 text-center">Jumlah</th>
                          <th className="py-3 px-4 text-right">Subtotal</th>
                          <th className="py-3 px-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cartItems.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl p-1.5 bg-slate-100 rounded">{item.foto_icon}</span>
                                <div>
                                  <div className="font-semibold text-slate-900 text-sm">{item.nama_menu}</div>
                                  <div className="text-xs text-slate-500">Stok: {item.stok}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center text-xs tabular-nums text-slate-700">
                              {formatRupiah(item.harga)}
                            </td>
                            <td className="py-3.5 px-3">
                              {}
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(item.id, -1)}
                                  className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors"
                                  title="Kurangi 1"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="text"
                                  readOnly
                                  value={item.jumlah}
                                  className="w-10 h-7 text-center text-xs font-bold border border-slate-200 rounded bg-slate-50 tabular-nums"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(item.id, 1)}
                                  className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors"
                                  title="Tambah 1"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-xs tabular-nums">
                              {formatRupiah(item.subtotal)}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                                title="Hapus dari keranjang"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setActiveStep('catalog')}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Tambah Menu Lainnya
                    </button>
                    <span className="text-xs text-slate-400">
                      Rumus Subtotal = Harga Satuan × Jumlah
                    </span>
                  </div>
                </div>

                {}
                <div className="lg:col-span-1">
                  <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                      Ringkasan Belanja
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Total Porsi</span>
                        <span className="font-semibold text-slate-900">{totalQty} porsi</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal Seluruh Menu</span>
                        <span className="font-semibold text-slate-900">{formatRupiah(totalBayar)}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between items-baseline mb-4">
                        <span className="text-sm font-bold text-slate-900">Total Pembayaran</span>
                        <span className="text-lg font-extrabold text-red-600 tabular-nums">
                          {formatRupiah(totalBayar)}
                        </span>
                      </div>

                      <button
                        onClick={() => setActiveStep('checkout')}
                        className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                      >
                        Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {}
      {activeStep === 'checkout' && (
        <form onSubmit={handleCheckoutSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Halaman checkout.php</span>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" /> Checkout & Konfirmasi Pembayaran
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveStep('cart')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Keranjang
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {}
            <div className="lg:col-span-2 space-y-5">
              {}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Informasi Pemesan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Nama Mahasiswa (Sesi Login)</label>
                    <input
                      type="text"
                      readOnly
                      value="Ahmad Fauzi (Mahasiswa)"
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Stand Penjual</label>
                    <input
                      type="text"
                      readOnly
                      value={currentSeller || ''}
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {}
              <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Catatan Pesanan (Disimpan di tabel orders.notes)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Sambal dipisah ya bu, jangan pakai bawang goreng..."
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-red-500 focus:outline-none"
                />
              </div>

              {}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pilihan Metode Pembayaran (Tabel payments.metode)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Status awal pembayaran dicatat sebagai <span className="font-mono bg-slate-100 px-1 rounded">menunggu</span>.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'tunai' ? 'border-red-600 bg-red-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="metode"
                      value="tunai"
                      checked={paymentMethod === 'tunai'}
                      onChange={() => setPaymentMethod('tunai')}
                      className="mt-1"
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>💵 Tunai saat Mengambil Pesanan (Cash on Pickup)</span>
                        <span className="text-emerald-700 text-[10px] font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">Rekomendasi</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">Bayar dengan uang pas langsung ke kasir stand saat mengambil makanan.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'qris_manual' ? 'border-red-600 bg-red-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="metode"
                      value="qris_manual"
                      checked={paymentMethod === 'qris_manual'}
                      onChange={() => setPaymentMethod('qris_manual')}
                      className="mt-1"
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-slate-900">📱 QRIS Kantin (Verifikasi Manual di Kasir)</div>
                      <p className="text-slate-500 mt-0.5">Scan kode QRIS yang tersedia di etalase stand saat mengambil pesanan.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'transfer_manual' ? 'border-red-600 bg-red-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="metode"
                      value="transfer_manual"
                      checked={paymentMethod === 'transfer_manual'}
                      onChange={() => setPaymentMethod('transfer_manual')}
                      className="mt-1"
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-slate-900">🏦 Transfer Bank Manual</div>
                      <p className="text-slate-500 mt-0.5">Transfer rekening stand dan tunjukkan bukti transfer di kasir.</p>
                    </div>
                  </label>
                </div>

                {}
                <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-[11px] text-amber-900">
                  <strong>Pemberitahuan Sistem:</strong> Sistem KantinNinGuys belum terhubung ke payment gateway online otomatis. Pembayaran diselesaikan dan diverifikasi manual oleh kasir stand.
                </div>
              </div>

              {}
              <div className="p-3 border border-purple-200 bg-purple-50 rounded-lg text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-900">Mode Uji Skenario Kegagalan (PDO rollBack):</span>
                  <p className="text-purple-700 text-[11px]">
                    Aktifkan untuk mensimulasikan kegagalan SQL (menguji pembatalan transaksi ACID).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateRollback}
                    onChange={(e) => setSimulateRollback(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-purple-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {}
            <div className="lg:col-span-1">
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  Rincian Menu ({totalQty} item)
                </h4>

                <div className="space-y-2.5 text-xs">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-slate-900">{item.nama_menu}</div>
                        <div className="text-slate-400 text-[11px]">
                          {item.jumlah} × {formatRupiah(item.harga)}
                        </div>
                      </div>
                      <div className="font-semibold text-slate-900 tabular-nums">
                        {formatRupiah(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatRupiah(totalBayar)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Layanan</span>
                    <span className="font-semibold text-emerald-600">Gratis (Rp 0)</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
                    <span className="text-lg font-extrabold text-red-600 tabular-nums">
                      {formatRupiah(totalBayar)}
                    </span>
                  </div>

                  {}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Konfirmasi & Buat Pesanan
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Transaksi diamankan dengan PDO Database Transaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {}
      {activeStep === 'processing' && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
          <h3 className="text-lg font-bold text-slate-900">Memproses Transaksi Database (ACID)...</h3>
          <div className="max-w-md mx-auto text-xs text-slate-500 space-y-1 font-mono text-left bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-emerald-700">✓ 1. $pdo-&gt;beginTransaction()</p>
            <p className="text-emerald-700">✓ 2. Ambil & kunci harga riil dari tabel `menus`</p>
            <p className="text-emerald-700">✓ 3. Validasi aturan 1 penjual & stok</p>
            <p className="text-amber-700">⏳ 4. INSERT INTO `orders` (status: menunggu)</p>
            <p className="text-amber-700">⏳ 5. INSERT INTO `order_details` (snapshot harga)</p>
            <p className="text-amber-700">⏳ 6. INSERT INTO `payments` (status: menunggu)</p>
            <p className="text-slate-400">{simulateRollback ? '⚠️ 7. Meniru kegagalan SQL -> $pdo->rollBack()' : '⏳ 7. $pdo->commit()'}</p>
          </div>
        </div>
      )}

      {}
      {activeStep === 'success' && completedOrder && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
          {}
          <div className="bg-emerald-600 text-white p-6 text-center space-y-1">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-100 mb-1" />
            <h3 className="text-xl font-bold">Pesanan Berhasil Dibuat!</h3>
            <p className="text-xs text-emerald-100">
              Silakan tunjukkan nomor pesanan ini ke kasir kantin saat mengambil makanan.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {}
            <div className="text-center pb-4 border-b border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">
                Nomor Pesanan Unik (orders.order_number)
              </span>
              <div className="text-2xl font-mono font-extrabold text-red-600 mt-1">
                {completedOrder.order_number}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Waktu Transaksi: {completedOrder.created_at} WIB
              </span>
            </div>

            {}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
                <span className="text-[11px] text-slate-500 block mb-1">Status Pesanan (orders.status)</span>
                <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded">
                  ⏳ Menunggu
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
                <span className="text-[11px] text-slate-500 block mb-1">Status Bayar (payments.status)</span>
                <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded">
                  💳 Menunggu
                </span>
              </div>
            </div>

            {}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex justify-between">
              <div>
                <span className="text-slate-400 block">Stand Penjual:</span>
                <span className="font-bold text-slate-800">{completedOrder.nama_toko}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Lokasi:</span>
                <span className="font-bold text-slate-800">{completedOrder.lokasi_stand}</span>
              </div>
            </div>

            {}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-red-600" /> Rincian Menu (Tabel order_details)
              </h5>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">Menu</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Harga Snapshot</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedOrder.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 font-medium text-slate-900">{item.nama_menu}</td>
                        <td className="py-2 px-2 text-center tabular-nums">{item.jumlah}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-600">{formatRupiah(item.harga)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 text-slate-900">Total Pembayaran (orders.total)</td>
                      <td className="py-2.5 px-3 text-right text-red-600 text-sm tabular-nums">
                        {formatRupiah(completedOrder.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {}
            <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Pembayaran:</span>
                <span className="font-bold text-slate-900 uppercase">{completedOrder.payment.metode}</span>
              </div>
              {completedOrder.notes && (
                <div className="border-t border-slate-200 pt-1.5 mt-1.5">
                  <span className="text-slate-500 block">Catatan untuk Penjual:</span>
                  <span className="text-slate-800 italic">"{completedOrder.notes}"</span>
                </div>
              )}
            </div>

            {}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 border border-slate-300 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Cetak Nota / Struk
              </button>
              <button
                onClick={() => {
                  setCompletedOrder(null);
                  setActiveStep('catalog');
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Buat Pesanan Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
