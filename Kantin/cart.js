/**
 * KantinNinGuys - Skrip Interaksi Keranjang Belanja (AJAX)
 * File: assets/js/cart.js
 * Tanggung Jawab: Orang 3
 */

// Ubah kuantitas dengan tombol (+) atau (-)
function updateQuantity(menuId, delta, maxStock = 99) {
    const row = document.getElementById('cart-row-' + menuId);
    if (!row) return;

    const input = row.querySelector('.qty-input');
    let currentQty = parseInt(input.value) || 1;
    let newQty = currentQty + delta;

    // Cegah angka nol atau negatif
    if (newQty < 1) {
        newQty = 1;
    }
    if (newQty > maxStock) {
        newQty = maxStock;
        alert('Jumlah pesanan sudah mencapai stok maksimal (' + maxStock + ').');
    }

    input.value = newQty;
    sendQuantityUpdate(menuId, newQty);
}

// Ubah kuantitas saat diketik manual di input
function setQuantity(menuId, val, maxStock = 99) {
    let newQty = parseInt(val) || 1;
    if (newQty < 1) newQty = 1;
    if (newQty > maxStock) {
        newQty = maxStock;
        alert('Jumlah melebihi stok yang tersedia (' + maxStock + ').');
    }
    const row = document.getElementById('cart-row-' + menuId);
    if (row) {
        row.querySelector('.qty-input').value = newQty;
    }
    sendQuantityUpdate(menuId, newQty);
}

// Kirim pembaruan ke server secara dinamis
function sendQuantityUpdate(menuId, qty) {
    const formData = new FormData();
    formData.append('action', 'update');
    formData.append('menu_id', menuId);
    formData.append('qty', qty);

    fetch('api/cart_action.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            const subtotalElem = document.getElementById('subtotal-' + menuId);
            if (subtotalElem) subtotalElem.textContent = data.subtotal_fmt;

            const totalBayarElem = document.getElementById('total-bayar-text');
            if (totalBayarElem) totalBayarElem.textContent = data.total_bayar_fmt;

            const subtotalAllElem = document.getElementById('subtotal-all-text');
            if (subtotalAllElem) subtotalAllElem.textContent = data.total_bayar_fmt;

            const badge = document.getElementById('cart-badge-count');
            if (badge) badge.textContent = data.total_qty;

            const totalQtyText = document.getElementById('total-qty-text');
            if (totalQtyText) totalQtyText.textContent = data.total_qty + ' porsi';
        } else {
            alert(data.message || 'Gagal mengubah jumlah.');
        }
    })
    .catch(err => console.error('Error updating cart:', err));
}

// Hapus satu item
function removeFromCart(menuId) {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini dari keranjang?')) {
        return;
    }

    const formData = new FormData();
    formData.append('action', 'remove');
    formData.append('menu_id', menuId);

    fetch('api/cart_action.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.reload();
        } else {
            alert(data.message || 'Gagal menghapus item.');
        }
    })
    .catch(err => console.error('Error removing item:', err));
}

// Kosongkan seluruh keranjang
function clearCart() {
    if (!confirm('Kosongkan semua pesanan di keranjang Anda?')) {
        return;
    }

    const formData = new FormData();
    formData.append('action', 'clear');

    fetch('api/cart_action.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.reload();
        }
    })
    .catch(err => console.error('Error clearing cart:', err));
}

// Fungsi Bantuan untuk Orang 2 (Katalog Menu)
function addToCartFromCatalog(menuId, qty = 1) {
    const formData = new FormData();
    formData.append('action', 'add');
    formData.append('menu_id', menuId);
    formData.append('qty', qty);

    fetch('api/cart_action.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            const badge = document.getElementById('cart-badge-count');
            if (badge) badge.textContent = data.cart_count;
        } else if (data.code === 'DIFFERENT_SELLER') {
            if (confirm(data.message + '\n\nBuka keranjang sekarang untuk memeriksa?')) {
                window.location.href = 'cart.php';
            }
        } else {
            alert(data.message || 'Gagal menambahkan ke keranjang.');
        }
    })
    .catch(err => console.error('Error adding to cart:', err));
}
