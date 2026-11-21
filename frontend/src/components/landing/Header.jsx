import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { LogIn, Menu, X } from 'lucide-react';
import Logo from './Logo';
import useBagianAktif from '../../hooks/useBagianAktif';

const MENU = [
  ['cuplikan', 'Cuplikan'],
  ['untuk-siapa', 'Untuk siapa'],
  ['kondisi-lini', 'Kondisi lini'],
  ['catat-downtime', 'Catat downtime'],
];
const ID_MENU = MENU.map(([id]) => id);

export default function Header() {
  const { scrollY } = useScroll();
  const [tergulir, setTergulir] = useState(false);
  const [buka, setBuka] = useState(false);
  const aktif = useBagianAktif(ID_MENU);
  const kurangiGerak = useReducedMotion();

  useMotionValueEvent(scrollY, 'change', (y) => setTergulir(y > 8));

  useEffect(() => {
    if (!buka) return;
    const tutup = (e) => e.key === 'Escape' && setBuka(false);
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [buka]);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        tergulir || buka ? 'bg-putih/85 shadow-[0_1px_0_var(--color-garis)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => window.scrollTo({ top: 0 })}>
          <Logo />
          <span className="font-extrabold font-stretch-expanded">Monitoring Produksi</span>
        </Link>

        <nav aria-label="Bagian halaman" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full bg-abu/80 p-1 text-kecil font-medium ring-1 ring-garis/60">
            {MENU.map(([id, label]) => {
              const dipilih = aktif === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={dipilih ? 'location' : undefined}
                    className={`relative block rounded-full px-4 py-1.5 transition-colors ${dipilih ? 'text-tinta' : 'text-tinta-2 hover:text-tinta'}`}
                  >
                    {dipilih && (
                      <motion.span
                        layoutId="menu-aktif"
                        className="absolute inset-0 rounded-full bg-putih shadow-[0_1px_4px_rgb(19_37_68/0.12)]"
                        transition={kurangiGerak ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden items-center gap-2 rounded-full bg-tinta px-4 py-2 text-kecil font-semibold text-putih hover:bg-panel sm:inline-flex"
          >
            <LogIn className="size-4" aria-hidden="true" />
            Masuk
          </Link>
          <button
            type="button"
            aria-label={buka ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={buka}
            aria-controls="menu-mobile"
            onClick={() => setBuka((b) => !b)}
            className="flex size-10 items-center justify-center rounded-full ring-1 ring-garis hover:bg-abu lg:hidden"
          >
            {buka ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {buka && (
          <motion.nav
            id="menu-mobile"
            aria-label="Menu"
            initial={kurangiGerak ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={kurangiGerak ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={kurangiGerak ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <ul className="mx-auto max-w-[1240px] px-4 pb-5 sm:px-8">
              {MENU.map(([id, label]) => (
                <li key={id} className="border-b border-garis">
                  <a
                    href={`#${id}`}
                    onClick={() => setBuka(false)}
                    className={`flex items-center justify-between py-3.5 text-lead font-semibold ${aktif === id ? 'text-sinyal' : 'text-tinta'}`}
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li className="pt-5 sm:hidden">
                <Link to="/login" className="flex items-center justify-center gap-2 rounded-full bg-tinta py-3 font-semibold text-putih">
                  <LogIn className="size-4" aria-hidden="true" />
                  Masuk
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
