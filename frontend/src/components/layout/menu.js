import { Cog, FileText, LayoutDashboard, Package } from 'lucide-react';

// Menu sesuai README §7.1.
export const MENU = [
  { key: 'beranda', ke: '/dashboard', label: 'Beranda', ikon: LayoutDashboard },
  { key: 'produksi', ke: '/produksi', label: 'Produksi', ikon: Package },
  { key: 'mesin', ke: '/mesin', label: 'Mesin', ikon: Cog },
  { key: 'laporan', ke: '/laporan', label: 'Laporan', ikon: FileText },
];

export const NAMA_PERAN = {
  operator: { nama: 'Operator shift', singkat: 'OP' },
  manajer: { nama: 'Manajer produksi', singkat: 'MP' },
};
