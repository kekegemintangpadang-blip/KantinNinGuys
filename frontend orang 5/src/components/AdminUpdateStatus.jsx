import React, { useState } from 'react';

export default function AdminUpdateStatus({ orderId, currentStatus, onStatusUpdated }) {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e) => {
        const newStatus = e.target.value;
        const previousStatus = status;
        const token = localStorage.getItem('token');

        setStatus(newStatus);
        setIsUpdating(true);

        try {
            const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (res.ok) {
                alert(`✅ ${data.message}`);
                if (onStatusUpdated) onStatusUpdated();
            } else {
                alert(`❌ Gagal: ${data.error}`);
                setStatus(previousStatus);
            }
        } catch (error) {
            alert("Terjadi kesalahan jaringan.");
            setStatus(previousStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <select 
            value={status} 
            onChange={handleUpdate}
            disabled={isUpdating}
            className="px-3 py-1.5 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ff758f]"
        >
            <option value="menunggu">Menunggu</option>
            <option value="diproses">Diproses</option>
            <option value="siap_diambil">Siap Diambil</option>
            <option value="selesai">Selesai</option>
        </select>
    );
}