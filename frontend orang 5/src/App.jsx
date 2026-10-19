import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RiwayatPesanan from './pages/RiwayatPesanan';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route 
        path="/mahasiswa/riwayat" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <RiwayatPesanan />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div className="p-10 text-center font-bold">Halaman Dashboard Admin</div>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}