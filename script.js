// --- DATABASE DEFAULT MENU KANTIN FAKULTAS ---
let initialMenuData = [
    {
        id: "m-1",
        tenant: "pacil",
        tenantName: "Kantin Pacil",
        name: "Nasi Ayam Geprek Pacil",
        category: "makanan-berat",
        categoryName: "Makanan Berat",
        price: 15000,
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
        desc: "Ayam crispy pedas gurih khas Kantin Pacil disajikan dengan nasi hangat."
    },
    {
        id: "m-2",
        tenant: "feb",
        tenantName: "Kantin FEB",
        name: "Nasi Goreng Special FEB",
        category: "makanan-berat",
        categoryName: "Makanan Berat",
        price: 18000,
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80",
        desc: "Nasi goreng telor mata sapi dan sosis kesukaan mahasiswa FEB."
    },
    {
        id: "m-3",
        tenant: "fisip",
        tenantName: "Kantin FISIP",
        name: "Mie Ayam Bakso FISIP",
        category: "makanan-berat",
        categoryName: "Makanan Berat",
        price: 14000,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80",
        desc: "Mie ayam gurih manis lengkap dengan 2 bakso dan pangsit renyah."
    },
    {
        id: "m-4",
        tenant: "fkg",
        tenantName: "Kantin FKG",
        name: "Es Teh Manis Jumbo",
        category: "minuman",
        categoryName: "Minuman",
        price: 5000,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80",
        desc: "Es teh manis segar pelepas dahaga porsi jumbo."
    },
    {
        id: "m-5",
        tenant: "hukum",
        tenantName: "Kantin Hukum",
        name: "Batagor Crispy FH",
        category: "camilan",
        categoryName: "Camilan",
        price: 10000,
        image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=500&q=80",
        desc: "Batagor goreng renyah disiram bumbu kacang kental."
    }
];

// State Aplikasi
let menuList = [];
let cart = []; 
let deliveryOption = 'pickup'; // 'pickup' atau 'delivery'
let paymentMethod = 'QRIS';    // 'QRIS' atau 'Cash'

const DELIVERY_FEE = 5000;
const PROMO_THRESHOLD = 50000;
const PROMO_DISCOUNT = 5000;

let selectedTenant = 'all';
let selectedCategory = 'all';
let currentUser = null;

const tenantMap = {
    feb: "Kantin FEB",
    pacil: "Kantin Pacil",
    fkg: "Kantin FKG",
    fisip: "Kantin FISIP",
    fib: "Kantin FIB",
    fkm: "Kantin FKM",
    psi: "Kantin Psikologi",
    farmasi: "Kantin Farmasi",
    hukum: "Kantin Hukum"
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    loadStoredMenu();
    renderMenuList();
});

// --- SISTEM MODE GELAP ---
function initTheme() {
    const isDark = localStorage.getItem('color-theme') === 'dark' || 
        (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        document.documentElement.classList.add('dark');
        document.getElementById('theme-toggle-dark-icon')?.classList.add('hidden');
        document.getElementById('theme-toggle-light-icon')?.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('theme-toggle-dark-icon')?.classList.remove('hidden');
        document.getElementById('theme-toggle-light-icon')?.classList.add('hidden');
    }
}

function toggleDarkMode() {
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
        darkIcon?.classList.remove('hidden');
        lightIcon?.classList.add('hidden');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
        darkIcon?.classList.add('hidden');
        lightIcon?.classList.remove('hidden');
    }
}

// Load Menu
function loadStoredMenu() {
    const saved = localStorage.getItem("kantin_menu_list");
    if (saved) {
        menuList = JSON.parse(saved);
    } else {
        menuList = [...initialMenuData];
        saveMenuToStorage();
    }
}

function saveMenuToStorage() {
    localStorage.setItem("kantin_menu_list", JSON.stringify(menuList));
}

// --- RENDER MENU GRID ---
function renderMenuList() {
    const grid = document.getElementById("menu-grid");
    const emptyState = document.getElementById("empty-state");
    const searchVal = document.getElementById("search-input").value.toLowerCase();

    grid.innerHTML = "";
    
    let filtered = menuList.filter(item => {
        const matchTenant = selectedTenant === 'all' || item.tenant === selectedTenant;
        const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchSearch = item.name.toLowerCase().includes(searchVal) || item.desc.toLowerCase().includes(searchVal);
        return matchTenant && matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
        filtered.forEach(item => {
            const isAdmin = currentUser && currentUser.role === 'admin';
            
            const card = document.createElement("div");
            card.className = "bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between relative hover:shadow-md transition-all";
            
            card.innerHTML = `
                <div>
                    ${isAdmin ? `
                        <button onclick="deleteMenu('${item.id}')" class="absolute top-3 right-3 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white w-7 h-7 rounded-full flex items-center justify-center transition-all z-10" title="Hapus Menu">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    ` : ''}

                    <div class="relative mb-3 overflow-hidden rounded-xl aspect-video bg-gray-100 dark:bg-slate-700">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'">
                        <span class="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-xs font-semibold px-2.5 py-0.5 rounded-md shadow-sm">
                            ${item.tenantName}
                        </span>
                    </div>
                    <h3 class="font-bold text-base text-gray-800 dark:text-gray-100 mb-1">${item.name}</h3>
                    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">${item.desc}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-slate-700">
                    <span class="text-brandPink font-bold text-base">Rp ${item.price.toLocaleString('id-ID')}</span>
                    <button onclick="addToCart('${item.id}')" class="bg-brandLightPink dark:bg-slate-700 text-brandPink hover:bg-brandPink hover:text-white px-3.5 py-2 rounded-xl transition-all font-semibold text-xs sm:text-sm flex items-center space-x-1">
                        <i class="fa-solid fa-plus text-xs"></i>
                        <span>Tambah</span>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

// --- FILTERING ---
function filterTenant(tenantKey) {
    selectedTenant = tenantKey;
    document.querySelectorAll(".tenant-btn").forEach(btn => {
        btn.classList.remove("active", "bg-brandPink", "text-white");
        btn.classList.add("bg-white", "dark:bg-slate-800", "text-gray-700", "dark:text-gray-300");
    });
    event.currentTarget.classList.add("active", "bg-brandPink", "text-white");
    event.currentTarget.classList.remove("bg-white", "dark:bg-slate-800", "text-gray-700", "dark:text-gray-300");
    renderMenuList();
}

function filterCategory(catKey) {
    selectedCategory = catKey;
    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("active", "bg-gray-800", "dark:bg-slate-700", "text-white");
        btn.classList.add("bg-white", "dark:bg-slate-800", "text-gray-600", "dark:text-gray-300");
    });
    event.currentTarget.classList.add("active", "bg-gray-800", "dark:bg-slate-700", "text-white");
    event.currentTarget.classList.remove("bg-white", "dark:bg-slate-800", "text-gray-600", "dark:text-gray-300");
    renderMenuList();
}

function filterMenu() {
    renderMenuList();
}

// --- KERANJANG, PENGAMBILAN, & PEMBAYARAN ---
function addToCart(id) {
    const item = menuList.find(m => m.id === id);
    if (!item) return;

    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }

    updateCartUI();
}

function updateCartQty(id, delta) {
    const index = cart.findIndex(c => c.id === id);
    if (index !== -1) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    }
    updateCartUI();
}

function updateDeliveryOption(option) {
    deliveryOption = option;

    const pickupLabel = document.getElementById("opt-label-pickup");
    const deliveryLabel = document.getElementById("opt-label-delivery");

    if (option === 'pickup') {
        pickupLabel.className = "cursor-pointer border-2 border-brandPink bg-brandLightPink/30 dark:bg-slate-700 p-3.5 rounded-2xl flex items-center space-x-3 text-sm sm:text-base font-bold transition-all";
        deliveryLabel.className = "cursor-pointer border border-gray-200 dark:border-slate-600 p-3.5 rounded-2xl flex items-center space-x-3 text-sm sm:text-base font-bold transition-all hover:bg-gray-50 dark:hover:bg-slate-700";
    } else {
        deliveryLabel.className = "cursor-pointer border-2 border-brandPink bg-brandLightPink/30 dark:bg-slate-700 p-3.5 rounded-2xl flex items-center space-x-3 text-sm sm:text-base font-bold transition-all";
        pickupLabel.className = "cursor-pointer border border-gray-200 dark:border-slate-600 p-3.5 rounded-2xl flex items-center space-x-3 text-sm sm:text-base font-bold transition-all hover:bg-gray-50 dark:hover:bg-slate-700";
    }

    updateCartUI();
}

function updatePaymentMethod(method) {
    paymentMethod = method;
    const qrisLabel = document.getElementById("pay-label-qris");
    const cashLabel = document.getElementById("pay-label-cash");

    if (method === 'QRIS') {
        qrisLabel.className = "cursor-pointer border-2 border-brandPink bg-brandLightPink/30 dark:bg-slate-700 p-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold transition-all";
        cashLabel.className = "cursor-pointer border border-gray-200 dark:border-slate-600 p-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold transition-all hover:bg-gray-50 dark:hover:bg-slate-700";
    } else {
        cashLabel.className = "cursor-pointer border-2 border-brandPink bg-brandLightPink/30 dark:bg-slate-700 p-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold transition-all";
        qrisLabel.className = "cursor-pointer border border-gray-200 dark:border-slate-600 p-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold transition-all hover:bg-gray-50 dark:hover:bg-slate-700";
    }
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("cart-count").innerText = totalCount;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shippingCost = (deliveryOption === 'delivery' && cart.length > 0) ? DELIVERY_FEE : 0;
    
    const isPromoActive = subtotal >= PROMO_THRESHOLD;
    const discount = isPromoActive ? PROMO_DISCOUNT : 0;
    const grandTotal = Math.max(0, subtotal + shippingCost - discount);

    document.getElementById("cart-subtotal").innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById("cart-delivery-cost").innerText = `Rp ${shippingCost.toLocaleString('id-ID')}`;
    
    const promoBanner = document.getElementById("promo-banner");
    const discountRow = document.getElementById("cart-discount-row");

    if (isPromoActive) {
        promoBanner.classList.remove("hidden");
        discountRow.classList.remove("hidden");
    } else {
        promoBanner.classList.add("hidden");
        discountRow.classList.add("hidden");
    }

    document.getElementById("cart-total").innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;

    const container = document.getElementById("cart-items");
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-gray-400 text-sm">Keranjang belanjaanmu masih kosong.</div>`;
    } else {
        cart.forEach(item => {
            const row = document.createElement("div");
            row.className = "flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-700";
            row.innerHTML = `
                <div class="flex items-center space-x-3">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-xl" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'">
                    <div>
                        <h4 class="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-100">${item.name}</h4>
                        <p class="text-xs text-brandPink font-semibold">Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="updateCartQty('${item.id}', -1)" class="w-7 h-7 bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-500 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">-</button>
                    <span class="text-xs sm:text-sm font-bold w-5 text-center">${item.qty}</span>
                    <button onclick="updateCartQty('${item.id}', 1)" class="w-7 h-7 bg-brandPink text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">+</button>
                </div>
            `;
            container.appendChild(row);
        });
    }
}

function toggleCart() {
    const modal = document.getElementById("cart-modal");
    modal.classList.toggle("hidden");
    updateCartUI();
}

function processCheckout() {
    if (cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    const phoneInput = document.getElementById("buyer-phone").value.trim();
    if (!phoneInput) {
        alert("Mohon masukkan nomor HP / WhatsApp terlebih dahulu!");
        document.getElementById("buyer-phone").focus();
        return;
    }

    const methodText = deliveryOption === 'delivery' ? 'Diantar (Delivery)' : 'Ambil Sendiri (Pickup)';
    const totalPayment = document.getElementById("cart-total").innerText;

    let successMsg = `Pesanan Berhasil Dibuat!\n\n` +
                     `No. HP/WA: ${phoneInput}\n` +
                     `Metode Ambil: ${methodText}\n` +
                     `Metode Pembayaran: ${paymentMethod}\n` +
                     `Total Pembayaran: ${totalPayment}`;

    if (paymentMethod === 'QRIS') {
        successMsg += `\n\nTunjukkan bukti pembayaran QRIS ke tenant kantin untuk diverifikasi saat mengambil pesanan.`;
        pendingOrderMessage = successMsg;
        // Tampilkan layar QRIS; pesanan dibuat setelah pembeli menekan "Saya Sudah Bayar"
        document.getElementById("qris-total").innerText = totalPayment;
        document.getElementById("qris-modal").classList.remove("hidden");
        return;
    }

    successMsg += `\n\nSilakan siapkan uang pas atau bayar langsung di kasir tenant kantin.`;
    pendingOrderMessage = successMsg;
    finalizeOrder();
}

let pendingOrderMessage = '';

function closeQrisModal() {
    document.getElementById("qris-modal").classList.add("hidden");
}

function finalizeOrder() {
    closeQrisModal();
    alert(pendingOrderMessage);
    pendingOrderMessage = '';

    cart = [];
    document.getElementById("buyer-phone").value = "";
    updateCartUI();
    toggleCart();
}

// --- SYSTEM LOGIN ---
function openLoginModal() {
    if (currentUser) {
        currentUser = null;
        document.getElementById("auth-btn-text").innerText = "Masuk";
        document.getElementById("admin-panel").classList.add("hidden");
        alert("Anda telah keluar akun.");
        renderMenuList();
    } else {
        document.getElementById("login-modal").classList.remove("hidden");
    }
}

function closeLoginModal() {
    document.getElementById("login-modal").classList.add("hidden");
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (email === "admin@kantin.com" && password === "admin123") {
        currentUser = { email: email, role: "admin" };
        document.getElementById("admin-panel").classList.remove("hidden");
        document.getElementById("auth-btn-text").innerText = "Keluar (Admin)";
        alert("Login Admin Berhasil!");
    } else {
        currentUser = { email: email, role: "user" };
        document.getElementById("admin-panel").classList.add("hidden");
        document.getElementById("auth-btn-text").innerText = "Keluar";
        alert("Login Berhasil!");
    }

    closeLoginModal();
    renderMenuList();
}

// --- ADMIN MANAGEMENT MENU ---
function handleAddNewMenu(event) {
    event.preventDefault();
    
    if (!currentUser || currentUser.role !== 'admin') {
        alert("Akses ditolak. Anda bukan admin.");
        return;
    }

    const tenantKey = document.getElementById("admin-tenant").value;
    const name = document.getElementById("admin-name").value;
    const category = document.getElementById("admin-category").value;
    const price = parseInt(document.getElementById("admin-price").value);
    const img = document.getElementById("admin-img").value;
    const desc = document.getElementById("admin-desc").value;

    const newMenu = {
        id: "m-" + Date.now(),
        tenant: tenantKey,
        tenantName: tenantMap[tenantKey],
        name: name,
        category: category,
        categoryName: category === "makanan-berat" ? "Makanan Berat" : (category === "camilan" ? "Camilan" : "Minuman"),
        price: price,
        image: img,
        desc: desc
    };

    menuList.unshift(newMenu);
    saveMenuToStorage();
    renderMenuList();

    document.getElementById("add-menu-form").reset();
    alert(`Menu "${name}" berhasil ditambahkan ke ${tenantMap[tenantKey]}!`);
}

function deleteMenu(id) {
    if (confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
        menuList = menuList.filter(m => m.id !== id);
        saveMenuToStorage();
        renderMenuList();
    }
}
