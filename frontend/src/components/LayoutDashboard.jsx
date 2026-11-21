import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import usePolling from '../hooks/usePolling';
import { getDowntime, getMesin } from '../services/api';
import Sidebar from './layout/Sidebar';
import StatusLini from './layout/StatusLini';
import MenuNotifikasi from './layout/MenuNotifikasi';
import MenuPengguna from './layout/MenuPengguna';
import { MENU, NAMA_PERAN } from './layout/menu';
import { ambilPeran, hapusPeran } from '../utils/sesi';
import { SHIFT, shiftSekarang, tanggalPanjang } from '../utils/waktu';

const KUNCI_CIUT = 'mp-sidebar-ciut';
const muatDowntime = () => getDowntime();

function bacaCiut() {
  try {
    return localStorage.getItem(KUNCI_CIUT) === '1';
  } catch {
    return false;
  }
}

// Kerangka halaman aplikasi: sidebar, bar atas, dan konten (Outlet).
export default function LayoutDashboard() {
  const navigate = useNavigate();
  const lokasi = useLocation();
  const kurangiGerak = useReducedMotion();
  const [laci, setLaci] = useState(false);
  const [ciut, setCiut] = useState(bacaCiut);
  const peran = NAMA_PERAN[ambilPeran()] ?? NAMA_PERAN.operator;

  // Data bersama untuk sidebar (papan andon), status lini, dan pemberitahuan.
  const mesin = usePolling(getMesin, 15000);
  const downtime = usePolling(muatDowntime, 15000);
  const { reload: muatMesin } = mesin;
  const { reload: muatDt } = downtime;
  const segarkan = useCallback(() => {
    muatMesin();
    muatDt();
  }, [muatMesin, muatDt]);

  const menuAktif = MENU.find((m) => (m.ke === '/dashboard' ? lokasi.pathname === m.ke : lokasi.pathname.startsWith(m.ke)));

  const ubahCiut = () =>
    setCiut((v) => {
      try {
        localStorage.setItem(KUNCI_CIUT, v ? '0' : '1');
      } catch {
        /* storage tidak tersedia */
      }
      return !v;
    });

  const keluar = () => {
    hapusPeran();
    navigate('/');
  };

  useEffect(() => {
    if (!laci) return;
    const tangani = (e) => e.key === 'Escape' && setLaci(false);
    window.addEventListener('keydown', tangani);
    return () => window.removeEventListener('keydown', tangani);
  }, [laci]);

  return (
    <div className="min-h-svh bg-permukaan text-tinta">
      <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r border-garis bg-putih py-5 transition-[width] duration-300 ease-out lg:block ${ciut ? 'w-[76px] px-3' : 'w-64 px-4'}`}>
        <Sidebar aktif={menuAktif?.key} daftarMesin={mesin.data ?? []} ciut={ciut} onCiut={ubahCiut} onKeluar={keluar} />
      </aside>

      <AnimatePresence>
        {laci && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLaci(false)} className="fixed inset-0 z-40 bg-tinta/30 lg:hidden" />
            <motion.aside
              role="dialog"
              aria-label="Menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={kurangiGerak ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-putih px-4 py-5 shadow-2xl lg:hidden"
            >
              <button type="button" aria-label="Tutup menu" onClick={() => setLaci(false)} className="absolute right-4 top-6 z-10 rounded-lg p-1.5 text-tinta-2 hover:bg-permukaan">
                <X className="size-4" aria-hidden="true" />
              </button>
              <Sidebar aktif={menuAktif?.key} daftarMesin={mesin.data ?? []} idBilah="bilah-laci" onPilih={() => setLaci(false)} onKeluar={keluar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={`transition-[padding] duration-300 ease-out ${ciut ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-30 border-b border-garis bg-permukaan/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1480px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button type="button" aria-label="Buka menu" aria-expanded={laci} onClick={() => setLaci(true)} className="flex size-10 items-center justify-center rounded-xl border border-garis bg-putih lg:hidden">
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{tanggalPanjang(new Date())}</p>
              <p className="angka truncate text-[12px] text-tinta-2">
                {SHIFT[shiftSekarang()].label}, {SHIFT[shiftSekarang()].jam}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <StatusLini daftarMesin={mesin.data ?? []} />
              <MenuNotifikasi daftarMesin={mesin.data ?? []} downtime={downtime.data ?? []} />
              <MenuPengguna peran={peran} onKeluar={keluar} />
            </div>
          </div>
        </header>

        <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1480px]">
            <Outlet context={{ segarkanShell: segarkan, daftarMesin: mesin.data }} />
          </div>
        </main>
      </div>
    </div>
  );
}
