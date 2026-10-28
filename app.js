const defaultMenuItems = [
    { id: '1', tenant: 'feb', name: 'Nasi Ayam Geprek Sambal Ijo', price: 18000, category: 'makanan-berat', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', desc: 'Ayam krispi renyah digeprek dengan sambal cabai hijau pedas gurih khas FEB.' },
    { id: '2', tenant: 'pacil', name: 'Ramen Chashu Spicy Pacil', price: 25000, category: 'makanan-berat', img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80', desc: 'Mie ramen kuah kental gurih khas Jepang lengkap dengan telur ajitsuke.' },
    { id: '3', tenant: 'fkg', name: 'Soto Ayam Lamongan FKG', price: 16000, category: 'makanan-berat', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80', desc: 'Soto kuah kuning koya gurih melimpah dengan suwiran ayam segar.' },
    { id: '4', tenant: 'fisip', name: 'Kebab Beef Cheese FISIP', price: 15000, category: 'camilan', img: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80', desc: 'Daging sapi olahan pilihan dipadu keju lumer dan saus spesial.' },
    { id: '5', tenant: 'fib', name: 'Matcha Latte Ice FIB', price: 12000, category: 'minuman', img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80', desc: 'Minuman matcha asli khas Jepang dikocok segar dengan susu murni.' },
    { id: '6', tenant: 'fkm', name: 'Salad Buah Healthy FKM', price: 14000, category: 'camilan', img: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=600&q=80', desc: 'Potongan buah segar kaya vitamin disiram saus mayo keju creamy manis.' }
];

let currentTenant = 'all';
let currentCategory = 'all';

function getStoredMenu() {
    const stored = localStorage.getItem('kng_custom_menu');
    return stored ? JSON.parse(stored) : defaultMenuItems;
}

function getCart() {
    return JSON.parse(localStorage.getItem('kng_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('kng_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = totalQty;
}

function renderMenu() {
    const grid = document.getElementById('menu-grid');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    
    if (!grid) return; 

    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const menuList = getStoredMenu();

    const filtered = menuList.filter(item => {
        const matchTenant = (currentTenant === 'all' || item.tenant === currentTenant);
        const matchCategory = (currentCategory === 'all' || item.category === currentCategory);
        const matchSearch = item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
        return matchTenant && matchCategory && matchSearch;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        
        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = "bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-pink-100 flex flex-col justify-between menu-card";
            card.innerHTML = `
                <div>
                    <div class="relative h-44 overflow-hidden">
                        <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover">
                        <span class="absolute top-3 left-3 badge-tenant text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase">
                            Kantin ${item.tenant.toUpperCase()}
                        </span>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-base text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">${item.name}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">${item.desc}</p>
                    </div>
                </div>
                <div class="p-4 pt-0 flex items-center justify-between border-t border-gray-50 dark:border-slate-700 mt-2">
                    <span class="font-bold text-[#ff758f] text-base">Rp ${item.price.toLocaleString('id-ID')}</span>
                    <button onclick="addToCart('${item.id}')" class="bg-[#fff0f3] dark:bg-slate-700 text-[#ff758f] hover:bg-[#ff758f] hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm">
                        <i class="fa-solid fa-plus"></i>
                        <span>Tambah</span>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

function addToCart(menuId) {
    const menuList = getStoredMenu();
    const item = menuList.find(m => m.id === menuId);
    if (!item) return;

    let cart = getCart();
    const existingIndex = cart.findIndex(c => c.id === menuId);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }

    saveCart(cart);
    alert(`${item.name} berhasil ditambahkan ke keranjang!`);
}

function filterTenant(tenant, btnElement) {
    currentTenant = tenant;
    document.querySelectorAll('.tenant-btn').forEach(btn => {
        btn.classList.remove('bg-[#ff758f]', 'text-white');
        btn.classList.add('bg-white', 'text-gray-700');
    });
    if (btnElement) {
        btnElement.classList.remove('bg-white', 'text-gray-700');
        btnElement.classList.add('bg-[#ff758f]', 'text-white');
    }
    renderMenu();
}

function filterCategory(cat, btnElement) {
    currentCategory = cat;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-gray-800', 'text-white');
        btn.classList.add('bg-white', 'text-gray-600');
    });
    if (btnElement) {
        btnElement.classList.remove('bg-white', 'text-gray-600');
        btnElement.classList.add('bg-gray-800', 'text-white');
    }
    renderMenu();
}


document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderMenu();
});