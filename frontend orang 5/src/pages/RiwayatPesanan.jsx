import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RiwayatPesanan() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const studentName = localStorage.getItem('name') || 'Mahasiswa';

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/orders/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal mengambil data pesanan.');

            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'menunggu':
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Menunggu</span>;
            case 'diproses':
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Diproses</span>;
            case 'siap_diambil':
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Siap Diambil</span>;
            case 'selesai':
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Selesai</span>;
            default:
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">KantinNinGuys</h1>
                        <p className="text-sm text-gray-500">Selamat datang, <span className="font-semibold text-[#ff758f]">{studentName}</span></p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition font-medium"
                    >
                        Keluar
                    </button>
                </div>

                <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-700">Riwayat Pesanan Anda</h2>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Memuat riwayat pesanan...</div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">Belum ada riwayat pesanan.</div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
                                    <div>
                                        <span className="font-bold text-gray-800">{order.order_number}</span>
                                        <span className="text-xs text-gray-400 ml-3">
                                            {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs px-2.5 py-0.5 rounded bg-gray-100 font-medium text-gray-600">
                                            Bayar: {order.payment_method} ({order.payment_status})
                                        </span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-3">
                                    {order.items && order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.quantity}x {item.menu_name}</span>
                                            <span className="font-medium text-gray-800">Rp {Number(item.subtotal).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
                                    <span className="font-medium text-gray-500">Total Pembayaran</span>
                                    <span className="font-bold text-lg text-[#ff758f]">Rp {Number(order.total).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}