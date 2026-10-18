import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Store, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  CreditCard, 
  Printer, 
  Info,
  AlertCircle,
  User,
  Search,
  Copy,
  Check,
  X,
  FileText
} from 'lucide-react';

interface MenuItem {
  id: number;
  merchant_id: number;
  merchant_name: string;
  location: string;
  category_id: number;
  category_name: 'Makanan' | 'Minuman' | 'Camilan';
  name: string;
  price: number;
  stock: number;
  photo_url?: string;
  emoji: string;
  description: string;
}

interface OrderRecord {
  id: number;
  order_number: string;
  user_id: number;
  nama_pemesan: string;
  merchant_name: string;
  location: string;
  total: number;
  status: 'menunggu' | 'diproses' | 'siap_diambil' | 'selesai';
  notes: string;
  created_at: string;
  items: {
    menu_id: number;
    name: string;
    harga: number; // Snapshot ke order_details.harga
    jumlah: number;
    subtotal: number; // Snapshot ke order_details.subtotal
  }[];
  payment: {
    metode: 'tunai' | 'qris_manual' | 'transfer_manual';
    jumlah: number;
    tanggal_bayar: string | null;
    status: 'menunggu' | 'berhasil' | 'ditolak';
  };
}

// Data Menu Sesuai Struktur Resmi 7 Tabel: menus, merchants, categories
const MENU_CATALOG: MenuItem[] = [
  {
    id: 1,
    merchant_id: 1,
    merchant_name: 'Kantin Bu Siti - Aneka Nasi',
    location: 'Stand 01 - Lantai 1',
    category_id: 1,
    category_name: 'Makanan',
    name: 'Nasi Ayam Geprek Sambal Bawang',
    price: 15000,
    stock: 25,
    photo_url: 'ayam_geprek.jpg',
    emoji: '🍗',
    description: 'Ayam krispi digeprek dengan sambal bawang pedas khas Bu Siti, disajikan dengan nasi hangat dan lalapan.'
  },
  {
    id: 2,
    merchant_id: 1,
    merchant_name: 'Kantin Bu Siti - Aneka Nasi',
    location: 'Stand 01 - Lantai 1',
    category_id: 1,
    category_name: 'Makanan',
    name: 'Nasi Goreng Spesial Telur',
    price: 13000,
    stock: 20,
    photo_url: 'nasgor.jpg',
    emoji: '🍳',
    description: 'Nasi goreng racikan bumbu khas kantin dengan suwiran ayam, bakso, dan telur mata sapi renyah.'
  },
  {
    id: 3,
    merchant_id: 1,
    merchant_name: 'Kantin Bu Siti - Aneka Nasi',
    location: 'Stand 01 - Lantai 1',
    category_id: 3,
    category_name: 'Camilan',
    name: 'Tahu & Tempe Mendoan (Porsi)',
    price: 6000,
    stock: 35,
    photo_url: 'mendoan.jpg',
    emoji: '🥟',
    description: 'Gorengan mendoan hangat gurih lengkap dengan sambal kecap rawit pedas manis.'
  },
  {
    id: 4,
    merchant_id: 1,
    merchant_name: 'Kantin Bu Siti - Aneka Nasi',
    location: 'Stand 01 - Lantai 1',
    category_id: 2,
    category_name: 'Minuman',
    name: 'Es Teh Manis Jumbo',
    price: 4000,
    stock: 50,
    photo_url: 'es_teh.jpg',
    emoji: '🍹',
    description: 'Es teh melati segar porsi jumbo, pas untuk menemani istirahat kuliah siang.'
  },
  {
    id: 5,
    merchant_id: 2,
    merchant_name: 'Kedai Mas Eko - Mie & Minuman',
    location: 'Stand 02 - Lantai 1',
    category_id: 1,
    category_name: 'Makanan',
    name: 'Mie Dok-Dok Kuah Pedas',
    price: 12000,
    stock: 18,
    photo_url: 'mie_dokdok.jpg',
    emoji: '🍜',
    description: 'Mie kuah nyemek bumbu rempah pedas gurih dengan campuran telur kocok dan sayuran segar.'
  },
  {
    id: 6,
    merchant_id: 2,
    merchant_name: 'Kedai Mas Eko - Mie & Minuman',
    location: 'Stand 02 - Lantai 1',
    category_id: 2,
    category_name: 'Minuman',
    name: 'Kopi Susu Gula Aren Dingin',
    price: 8000,
    stock: 30,
    photo_url: 'kopi_susu.jpg',
    emoji: '☕',
    description: 'Espresso susu creamy dengan pemanis gula aren asli, penambah semangat kuliah.'
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'cart' | 'checkout' | 'success' | 'orders'>('menu');

  const [cart, setCart] = useState<{ [id: number]: number }>({
    1: 2,
    4: 2
  });

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Makanan' | 'Minuman' | 'Camilan'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [customerName, setCustomerName] = useState('Ahmad Fauzi');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris_manual' | 'transfer_manual'>('tunai');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [conflictModal, setConflictModal] = useState<{
    pendingItem: MenuItem;
    currentMerchantName: string;
  } | null>(null);

  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderRecord | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const getReceiptText = (order: OrderRecord) => {
    const divider = '==========================================';
    const subdivider = '------------------------------------------';
    const itemsText = order.items.map(it => 
      `${it.name}\n  ${it.jumlah} x ${formatRupiah(it.harga)} = ${formatRupiah(it.subtotal)}`
    ).join('\n');

    return `${divider}
       KANTINNINGUYS - BUKTI NOTA PESANAN
${divider}
No. Pesanan   : ${order.order_number}
Tanggal/Waktu : ${order.created_at} WIB
Nama Pemesan  : ${order.nama_pemesan}
Merchant Stand: ${order.merchant_name}
Lokasi Stand  : ${order.location}
${subdivider}
RINCIAN PESANAN:
${itemsText}
${subdivider}
TOTAL BAYAR   : ${formatRupiah(order.total)}
Metode Bayar  : ${order.payment.metode === 'tunai' ? 'Tunai di Kasir Stand' : order.payment.metode === 'qris_manual' ? 'QRIS Kantin' : 'Transfer Bank'}
Status Bayar  : MENUNGGU VERIFIKASI KASIR
${order.notes ? `Catatan       : "${order.notes}"\n` : ''}${divider}
* Tunjukkan bukti nota ini kepada petugas kasir
  saat mengambil makanan di stand kantin.
${divider}`;
  };

  const handleOpenReceiptModal = (order: OrderRecord) => {
    setSelectedReceiptOrder(order);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = (order: OrderRecord) => {
    setSelectedReceiptOrder(order);
    setShowReceiptModal(true);
    try {
      window.print();
    } catch {

    }
  };

  const handleCopyReceipt = (order: OrderRecord) => {
    const text = getReceiptText(order);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2500);
    }).catch(() => {
    });
  };

  const cartItemList = Object.entries(cart)
    .map(([idStr, qty]) => {
      const id = parseInt(idStr);
      const menu = MENU_CATALOG.find(m => m.id === id);
      if (!menu) return null;
      return {
        ...menu,
        jumlah: qty,
        subtotal: menu.price * qty
      };
    })
    .filter(Boolean) as (MenuItem & { jumlah: number; subtotal: number })[];

  const totalBayar = cartItemList.reduce((sum, item) => sum + item.subtotal, 0);
  const totalJumlahPorsi = cartItemList.reduce((sum, item) => sum + item.jumlah, 0);
  const currentMerchant = cartItemList.length > 0 ? cartItemList[0].merchant_name : null;
  const currentLocation = cartItemList.length > 0 ? cartItemList[0].location : null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (cartItemList.length > 0) {
      const activeMerchantId = cartItemList[0].merchant_id;
      if (item.merchant_id !== activeMerchantId) {
        setConflictModal({
          pendingItem: item,
          currentMerchantName: cartItemList[0].merchant_name
        });
        return;
      }
    }

    setCart(prev => {
      const cur = prev[item.id] || 0;
      if (cur >= item.stock) {
        showToast(`Stok ${item.name} tidak mencukupi (Maks. ${item.stock}).`);
        return prev;
      }
      return { ...prev, [item.id]: cur + 1 };
    });

    showToast(`✓ Ditambahkan ke keranjang: ${item.name}`);
  };

  const handleSwitchMerchantAndAdd = () => {
    if (!conflictModal) return;
    const item = conflictModal.pendingItem;
    setCart({ [item.id]: 1 });
    setConflictModal(null);
    showToast(`Keranjang diganti dengan menu dari ${item.merchant_name}`);
  };

  const handleUpdateQty = (menuId: number, delta: number) => {
    const item = MENU_CATALOG.find(m => m.id === menuId);
    if (!item) return;

    setCart(prev => {
      const currentQty = prev[menuId] || 1;
      const nextQty = currentQty + delta;
      
      if (nextQty < 1) return prev;
      if (nextQty > item.stock) {
        showToast(`Maksimal pesanan ${item.stock} porsi sesuai stok stand.`);
        return prev;
      }

      return { ...prev, [menuId]: nextQty };
    });
  };

  const handleDirectQtyChange = (menuId: number, valueStr: string) => {
    const item = MENU_CATALOG.find(m => m.id === menuId);
    if (!item) return;

    let val = parseInt(valueStr);
    if (isNaN(val) || val < 1) val = 1;
    if (val > item.stock) {
      val = item.stock;
      showToast(`Stok maksimal hanya ${item.stock} porsi.`);
    }

    setCart(prev => ({ ...prev, [menuId]: val }));
  };

  const handleRemoveItem = (menuId: number) => {
    setCart(prev => {
      const copy = { ...prev };
      delete copy[menuId];
      return copy;
    });
    showToast('Menu dihapus dari keranjang.');
  };

  const handleClearCart = () => {
    if (window.confirm('Kosongkan semua pesanan di keranjang belanja Anda?')) {
      setCart({});
      showToast('Keranjang belanja telah dikosongkan.');
    }
  };

  const handleConfirmCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItemList.length === 0) {
      alert('Keranjang belanja Anda masih kosong.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const uniqueCode = Math.floor(1000 + Math.random() * 9000);
      const newOrderNumber = `KNG-${todayStr}-${uniqueCode}`;

      const newOrder: OrderRecord = {
        id: Date.now(),
        order_number: newOrderNumber,
        user_id: 1,
        nama_pemesan: customerName.trim() || 'Ahmad Fauzi',
        merchant_name: currentMerchant || 'Stand Kantin',
        location: currentLocation || 'Stand 01 - Lantai 1',
        total: totalBayar,
        status: 'menunggu',
        notes: notes.trim(),
        created_at: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        items: cartItemList.map(item => ({
          menu_id: item.id,
          name: item.name,
          harga: item.price,
          jumlah: item.jumlah,
          subtotal: item.subtotal
        })),
        payment: {
          metode: paymentMethod,
          jumlah: totalBayar,
          tanggal_bayar: null,
          status: 'menunggu'
        }
      };

      setOrderHistory(prev => [newOrder, ...prev]);
      setLastOrder(newOrder);
      setCart({});
      setNotes('');
      setIsSubmitting(false);
      setCurrentView('success');
    }, 1000);
  };

  const filteredMenus = MENU_CATALOG.filter(menu => {
    const matchesCat = categoryFilter === 'all' || menu.category_name === categoryFilter;
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          menu.merchant_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button 
            onClick={() => setCurrentView('menu')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-xs group-hover:bg-red-700 transition-colors">
              K
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                KantinNinGuys
              </span>
              <span className="text-[11px] text-slate-500 block">
                Pemesanan Makanan Kantin Kampus
              </span>
            </div>
          </button>

          <nav className="flex items-center gap-1 sm:gap-2 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('menu')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'menu' ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Menu Kantin</span>
            </button>

            <button
              onClick={() => setCurrentView('cart')}
              className={`relative px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'cart' || currentView === 'checkout'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {totalJumlahPorsi > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                  currentView === 'cart' || currentView === 'checkout' ? 'bg-white text-red-700' : 'bg-red-600 text-white'
                }`}>
                  {totalJumlahPorsi}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('orders')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'orders' ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Pesanan Saya</span>
            </button>
          </nav>
        </div>
      </header>

      {}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {}
        {currentView === 'menu' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl space-y-2">
                <span className="text-xs uppercase font-bold text-red-200 tracking-wider">Lapar Pas Jam Istirahat?</span>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Pesan Makanan & Minuman Kantin Lebih Cepat Tanpa Antre
                </h1>
                <p className="text-xs sm:text-sm text-red-100">
                  Pilih menu favorit dari merchant kantin kampus, tentukan jumlah porsi, dan ambil pesanan langsung saat siap.
                </p>
              </div>

              {cartItemList.length > 0 && (
                <button
                  onClick={() => setCurrentView('cart')}
                  className="bg-white text-red-700 hover:bg-red-50 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shrink-0 transition-transform active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Lihat Keranjang ({totalJumlahPorsi} Porsi · {formatRupiah(totalBayar)})
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === 'all' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Kategori
                </button>
                <button
                  onClick={() => setCategoryFilter('Makanan')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === 'Makanan' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Makanan
                </button>
                <button
                  onClick={() => setCategoryFilter('Minuman')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === 'Minuman' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Minuman
                </button>
                <button
                  onClick={() => setCategoryFilter('Camilan')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === 'Camilan' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Camilan
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari makanan / minuman..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMenus.map(menu => {
                const inCartQty = cart[menu.id] || 0;
                return (
                  <div
                    key={menu.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner shrink-0">
                          {menu.emoji}
                        </div>
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {menu.category_name}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">
                          {menu.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Store className="w-3 h-3 text-slate-400" />
                          <span>{menu.merchant_name} · {menu.location}</span>
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {menu.description}
                      </p>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-2">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Harga Satuan</span>
                        <span className="text-base font-extrabold text-red-600 tabular-nums">
                          {formatRupiah(menu.price)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(menu)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs ${
                          inCartQty > 0
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {inCartQty > 0 ? `Tambah (${inCartQty})` : 'Pesan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {}
        {currentView === 'cart' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-red-600" />
                  Keranjang Belanja Mahasiswa
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Periksa menu yang dipesan, atur jumlah porsi, atau hapus menu sebelum checkout.
                </p>
              </div>

              {cartItemList.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Kosongkan Keranjang
                </button>
              )}
            </div>

            {cartItemList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-2xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Keranjang Belanja Anda Masih Kosong</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Yuk pilih makanan atau minuman favoritmu terlebih dahulu dari katalog menu kantin!
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('menu')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Buka Menu Kantin
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Merchant: {currentMerchant} ({currentLocation})</span>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        Satu pesanan hanya memuat menu dari satu merchant yang sama agar pesanan dapat disiapkan dan diambil sekaligus.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                          <tr>
                            <th className="py-3 px-4">Menu Makanan</th>
                            <th className="py-3 px-3 text-center">Harga Satuan</th>
                            <th className="py-3 px-3 text-center">Jumlah</th>
                            <th className="py-3 px-4 text-right">Subtotal</th>
                            <th className="py-3 px-3 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {cartItemList.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl p-2 bg-slate-100 rounded-lg">{item.emoji}</span>
                                  <div>
                                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">Stok: {item.stock} porsi</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-3 text-center text-xs tabular-nums text-slate-700">
                                {formatRupiah(item.price)}
                              </td>
                              <td className="py-4 px-3 text-center">
                                <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, -1)}
                                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <input
                                    type="text"
                                    value={item.jumlah}
                                    onChange={(e) => handleDirectQtyChange(item.id, e.target.value)}
                                    className="w-10 h-7 text-center text-xs font-bold bg-white border-x border-slate-200 focus:outline-none tabular-nums"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, 1)}
                                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right font-extrabold text-slate-900 text-xs sm:text-sm tabular-nums">
                                {formatRupiah(item.subtotal)}
                              </td>
                              <td className="py-4 px-3 text-center">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-slate-400 hover:text-red-600 p-1.5 transition-colors"
                                  title="Hapus menu"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setCurrentView('menu')}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Tambah Menu Lainnya
                    </button>
                  </div>
                </div>

                {}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 sticky top-20">
                    <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5">
                      Ringkasan Pembayaran
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Total Jumlah Porsi</span>
                        <span className="font-bold text-slate-900 tabular-nums">{totalJumlahPorsi} porsi</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal Belanja</span>
                        <span className="font-bold text-slate-900 tabular-nums">{formatRupiah(totalBayar)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Biaya Layanan Kantin</span>
                        <span className="font-bold text-emerald-600">Gratis (Rp 0)</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex justify-between items-baseline mb-4">
                        <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
                        <span className="text-lg font-black text-red-600 tabular-nums">
                          {formatRupiah(totalBayar)}
                        </span>
                      </div>

                      <button
                        onClick={() => setCurrentView('checkout')}
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {currentView === 'checkout' && (
          <form onSubmit={handleConfirmCheckout} className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-red-600" />
                  Checkout & Pemilihan Pembayaran
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Konfirmasi pesanan dan pilih cara pembayaran sebelum transaksi disimpan ke sistem.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('cart')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Keranjang
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-red-600" /> Data Pemesan (Sesi Mahasiswa)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-500 block mb-1">Nama Pemesan / Mahasiswa</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ketik nama Anda..."
                        className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 bg-white focus:border-red-600 focus:outline-none text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Merchant Stand</span>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800">
                        {currentMerchant} · {currentLocation}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Catatan untuk Merchant (Opsional)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Tuliskan permintaan khusus (misal: "Ayam geprek jangan pedas", "Es teh sedikit gula", "Mendoan kering").
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Tuliskan catatan pesanan Anda di sini..."
                    className="w-full text-xs border border-slate-200 rounded-lg p-3 focus:border-red-600 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Metode Pembayaran
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Status pembayaran awal tercatat sebagai <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Menunggu</span> dan diverifikasi saat pengambilan di stand.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <label className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'tunai' ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="tunai"
                        checked={paymentMethod === 'tunai'}
                        onChange={() => setPaymentMethod('tunai')}
                        className="mt-1"
                      />
                      <div className="text-xs flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">💵 Bayar Tunai di Kasir (Cash on Pickup)</span>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Praktis</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Bayar langsung dengan uang tunai ke kasir stand saat mengambil pesanan makanan.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'qris_manual' ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="qris_manual"
                        checked={paymentMethod === 'qris_manual'}
                        onChange={() => setPaymentMethod('qris_manual')}
                        className="mt-1"
                      />
                      <div className="text-xs flex-1">
                        <span className="font-bold text-slate-900">📱 QRIS Kantin (Verifikasi Manual di Kasir)</span>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Scan barcode QRIS statis yang ada di meja kasir stand saat Anda mengambil makanan.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'transfer_manual' ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="transfer_manual"
                        checked={paymentMethod === 'transfer_manual'}
                        onChange={() => setPaymentMethod('transfer_manual')}
                        className="mt-1"
                      />
                      <div className="text-xs flex-1">
                        <span className="font-bold text-slate-900">🏦 Transfer Bank Manual</span>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Transfer ke rekening merchant dan tunjukkan bukti transaksi saat mengambil makanan di stand.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 sticky top-20">
                  <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5">
                    Rincian Menu ({totalJumlahPorsi} porsi)
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    {cartItemList.map(item => (
                      <div key={item.id} className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-slate-400 text-[11px]">
                            {item.jumlah} × {formatRupiah(item.price)}
                          </div>
                        </div>
                        <div className="font-bold text-slate-900 tabular-nums">
                          {formatRupiah(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal Belanja</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatRupiah(totalBayar)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Pelayanan</span>
                      <span className="font-bold text-emerald-600">Gratis (Rp 0)</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-sm font-bold text-slate-900">Total Pembayaran</span>
                      <span className="text-xl font-black text-red-600 tabular-nums">
                        {formatRupiah(totalBayar)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      {isSubmitting ? (
                        <span>Menyimpan Pesanan...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Konfirmasi & Buat Pesanan
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                      Pesanan langsung diteruskan ke kasir stand merchant.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {}
        {currentView === 'success' && lastOrder && (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-emerald-600 text-white text-center p-6 space-y-1">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-100 mb-1" />
                <h2 className="text-xl font-black">Pesanan Anda Berhasil Dibuat!</h2>
                <p className="text-xs text-emerald-100">
                  Tunjukkan nomor pesanan ini ke kasir kantin saat mengambil makanan.
                </p>
              </div>

              <div className="p-6 space-y-5">
                <div className="text-center pb-4 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nomor Pesanan Unik
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-red-600 my-1">
                    {lastOrder.order_number}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Waktu Pesan: {lastOrder.created_at} WIB
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50">
                    <span className="text-[11px] text-slate-500 block mb-1">Status Pesanan</span>
                    <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                      ⏳ Menunggu
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50">
                    <span className="text-[11px] text-slate-500 block mb-1">Status Pembayaran</span>
                    <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                      💳 Menunggu
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs grid grid-cols-3 gap-2 text-center sm:text-left">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nama Pemesan</span>
                    <span className="font-bold text-slate-900">{lastOrder.nama_pemesan}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Merchant Stand</span>
                    <span className="font-bold text-slate-900">{lastOrder.merchant_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Pengambilan</span>
                    <span className="font-bold text-slate-900">{lastOrder.location}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-red-600" /> Rincian Menu yang Dipesan
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                        <tr>
                          <th className="py-2.5 px-3">Menu</th>
                          <th className="py-2.5 px-2 text-center">Porsi</th>
                          <th className="py-2.5 px-3 text-right">Harga</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lastOrder.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-medium text-slate-900">{it.name}</td>
                            <td className="py-2.5 px-2 text-center tabular-nums">{it.jumlah}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{formatRupiah(it.harga)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">{formatRupiah(it.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                        <tr>
                          <td colSpan={3} className="py-2.5 px-3 text-slate-900">Total Pembayaran</td>
                          <td className="py-2.5 px-3 text-right text-red-600 text-sm tabular-nums">
                            {formatRupiah(lastOrder.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Metode Pembayaran:</span>
                    <span className="font-bold text-slate-900 uppercase">
                      {lastOrder.payment.metode === 'tunai' ? 'Tunai di Kasir' : lastOrder.payment.metode === 'qris_manual' ? 'QRIS Kantin' : 'Transfer Bank'}
                    </span>
                  </div>
                  {lastOrder.notes && (
                    <div className="border-t border-slate-200 pt-2 text-[11px]">
                      <span className="text-slate-400 block">Catatan Anda:</span>
                      <span className="text-slate-800 italic">"{lastOrder.notes}"</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2 no-print">
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(lastOrder)}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Cetak Bukti Nota
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('menu')}
                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Store className="w-4 h-4" /> Pesan Menu Lainnya
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {currentView === 'orders' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-red-600" />
                  Daftar Pesanan Mahasiswa
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Semua transaksi pesanan Anda yang tercatat di sistem kantin.
                </p>
              </div>

              <button
                onClick={() => setCurrentView('menu')}
                className="px-3.5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
              >
                + Buat Pesanan Baru
              </button>
            </div>

            {orderHistory.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-2xs space-y-3">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Belum Ada Pesanan yang Dibuat</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Silakan pilih menu favoritmu di katalog menu untuk membuat pesanan pertamamu!
                </p>
                <button
                  onClick={() => setCurrentView('menu')}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg"
                >
                  Pilih Menu Kantin
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map(ord => (
                  <div key={ord.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[11px] font-mono text-slate-400">Nomor Pesanan</span>
                        <h4 className="text-base font-mono font-bold text-red-600">{ord.order_number}</h4>
                        <span className="text-[11px] text-slate-500">{ord.created_at} WIB · {ord.merchant_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                          Pesanan: {ord.status}
                        </span>
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                          Bayar: {ord.payment.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      {ord.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-slate-700">
                          <span>{it.name} × {it.jumlah}</span>
                          <span className="font-semibold">{formatRupiah(it.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2 no-print">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          Metode: <strong className="uppercase">{ord.payment.metode === 'tunai' ? 'Tunai Kasir' : ord.payment.metode === 'qris_manual' ? 'QRIS' : 'Transfer'}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenReceiptModal(ord)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" /> Cetak Bukti Nota
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 mr-2">Total</span>
                        <span className="text-base font-extrabold text-red-600 tabular-nums">
                          {formatRupiah(ord.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {}
      {conflictModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pilih Menu dari Stand yang Sama
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Keranjang Anda saat ini berisi menu dari <strong>"{conflictModal.currentMerchantName}"</strong>.
                Satu pesanan hanya boleh memuat menu dari satu merchant yang sama.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
              Menu baru yang ingin ditambahkan:<br />
              <strong>{conflictModal.pendingItem.name}</strong> dari <em>{conflictModal.pendingItem.merchant_name}</em>.
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConflictModal(null)}
                className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Tetap di Stand Lama
              </button>
              <button
                type="button"
                onClick={handleSwitchMerchantAndAdd}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Ganti ke Stand Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showReceiptModal && selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Bukti Nota Transaksi Kantin</h3>
                  <span className="text-[11px] text-slate-500">Struk Resmi Pengambilan di Kasir</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {}
            <div className="print-area bg-amber-50/40 border border-dashed border-slate-300 rounded-xl p-4 sm:p-5 space-y-3 font-mono text-xs text-slate-800">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <span className="font-black text-sm text-slate-900 tracking-wider">KANTINNINGUYS</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Sistem Pemesanan Kantin Kampus</p>
                <div className="text-[11px] font-semibold text-slate-700 mt-1">
                  Stand: {selectedReceiptOrder.merchant_name} ({selectedReceiptOrder.location})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">No. Nota:</span>
                  <p className="font-bold text-red-600">{selectedReceiptOrder.order_number}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Tanggal/Jam:</span>
                  <p className="font-medium text-slate-700">{selectedReceiptOrder.created_at} WIB</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Nama Pemesan:</span>
                  <p className="font-bold text-slate-800">{selectedReceiptOrder.nama_pemesan}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Status Bayar:</span>
                  <p className="font-bold text-amber-700">Menunggu Kasir</p>
                </div>
              </div>

              <div className="space-y-1.5 py-1">
                <div className="flex justify-between font-bold text-[11px] text-slate-600 border-b border-slate-200 pb-1">
                  <span>Menu</span>
                  <span>Subtotal</span>
                </div>
                {selectedReceiptOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <div>
                      <span className="font-bold">{it.name}</span>
                      <span className="text-slate-500 block text-[10px]">
                        {it.jumlah} × {formatRupiah(it.harga)}
                      </span>
                    </div>
                    <span className="font-bold tabular-nums">{formatRupiah(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
                <div className="flex justify-between font-black text-sm text-slate-900">
                  <span>TOTAL BAYAR</span>
                  <span className="text-red-600 tabular-nums">{formatRupiah(selectedReceiptOrder.total)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Metode Bayar</span>
                  <span className="font-bold uppercase">
                    {selectedReceiptOrder.payment.metode === 'tunai' ? 'Tunai di Kasir Stand' : selectedReceiptOrder.payment.metode === 'qris_manual' ? 'QRIS Kantin' : 'Transfer Bank'}
                  </span>
                </div>
                {selectedReceiptOrder.notes && (
                  <div className="text-[10px] text-slate-600 pt-1">
                    <span className="font-semibold text-slate-500">Catatan: </span>
                    <span className="italic">"{selectedReceiptOrder.notes}"</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 tracking-wider">*** BUKTI PENGAMBILAN RESMI ***</p>
                <p>Tunjukkan struk ini kepada kasir stand untuk konfirmasi pembayaran dan pengambilan menu Anda.</p>
              </div>
            </div>

            {}
            <div className="space-y-2.5 pt-1 no-print">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.print();
                    } catch {
                      // fallback
                    }
                  }}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4" /> Cetak / Print Struk
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyReceipt(selectedReceiptOrder)}
                  className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedReceipt ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" /> Tersalin ke Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Salin Teks Nota
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-500 text-center leading-relaxed">
                💡 Jika browser Anda membatasi jendela dialog cetak (karena berjalan di dalam mode preview), Anda dapat langsung menunjukkan tampilan nota ini atau menyalin teksnya untuk ditunjukkan ke kasir stand.
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">KantinNinGuys</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            <span>Jam Operasional: 08.00 - 16.00 WIB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
