import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Beranda from './pages/Beranda';
import Produksi from './pages/Produksi';
import Mesin from './pages/Mesin';
import Laporan from './pages/Laporan';
import LayoutDashboard from './components/LayoutDashboard';

// Rute sesuai README §7.1. Halaman aplikasi berbagi LayoutDashboard (sidebar + menu).
export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route element={<LayoutDashboard />}>
          <Route path="/dashboard" element={<Beranda />} />
          <Route path="/produksi" element={<Produksi />} />
          <Route path="/mesin" element={<Mesin />} />
          <Route path="/laporan" element={<Laporan />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
