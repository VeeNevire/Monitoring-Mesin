import { NavLink, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Logo from '../landing/Logo';
import Lampu from '../Lampu';
import KartuShift from './KartuShift';
import { MENU } from './menu';
import { STATUS_MESIN } from '../andon';

// Sidebar putih: ubin ikon, bilah sinyal biru di menu aktif, papan andon mini per mesin.
export default function Sidebar({ aktif, daftarMesin = [], ciut = false, onCiut, onPilih, onKeluar, idBilah = 'bilah-menu' }) {
  const kurangiGerak = useReducedMotion();
  const berhenti = daftarMesin.filter((m) => m.status === 'berhenti').length;

  return (
    <div className="flex h-full flex-col">
      {/* Merek + tombol ciutkan */}
      <div className={`flex items-center ${ciut ? 'flex-col gap-3' : 'gap-3 pl-1'}`}>
        <Link to="/" aria-label="Monitoring Produksi, halaman awal" className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tinta">
            <Logo className="h-6 w-3.5 text-putih" />
          </span>
          {!ciut && (
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[14px] font-extrabold font-stretch-semi-expanded">Monitoring</span>
              <span className="block truncate text-[12px] text-tinta-2">Produksi pabrik</span>
            </span>
          )}
        </Link>
        {onCiut && (
          <button
            type="button"
            onClick={onCiut}
            aria-label={ciut ? 'Perluas menu' : 'Ciutkan menu'}
            aria-pressed={ciut}
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-tinta-2 hover:bg-permukaan hover:text-tinta ${ciut ? '' : 'ml-auto'}`}
          >
            {ciut ? <PanelLeftOpen className="size-4" aria-hidden="true" /> : <PanelLeftClose className="size-4" aria-hidden="true" />}
          </button>
        )}
      </div>

      {/* Menu utama */}
      <nav aria-label="Navigasi utama" className="mt-8">
        <ul className="space-y-1.5">
          {MENU.map(({ key, ke, label, ikon: Ikon }) => {
            const dipilih = aktif === key;
            const lencana = key === 'mesin' && berhenti > 0 ? berhenti : 0;
            return (
              <li key={key} className="relative">
                <NavLink
                  to={ke}
                  end={ke === '/dashboard'}
                  onClick={onPilih}
                  title={ciut ? label : undefined}
                  aria-label={ciut ? (lencana ? `${label}, ${lencana} mesin berhenti` : label) : undefined}
                  className={`group flex items-center gap-3 rounded-xl py-1.5 text-[13.5px] transition-colors ${ciut ? 'justify-center' : 'pl-1.5 pr-3'} ${
                    dipilih ? 'font-semibold text-tinta' : 'text-tinta-2 hover:bg-permukaan hover:text-tinta'
                  }`}
                >
                  <span
                    className={`relative flex size-[34px] shrink-0 items-center justify-center rounded-[10px] transition-colors ${
                      dipilih ? 'bg-sinyal text-putih shadow-[0_6px_14px_-6px_rgb(31_91_216/0.7)]' : 'bg-permukaan text-tinta-2 group-hover:bg-putih group-hover:text-tinta'
                    }`}
                  >
                    <Ikon className="size-[17px]" aria-hidden="true" />
                    {ciut && lencana > 0 && <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-andon-merah ring-2 ring-putih" />}
                  </span>
                  {!ciut && <span className="truncate">{label}</span>}
                  {!ciut && lencana > 0 && (
                    <span className="angka ml-auto flex items-center gap-1.5 rounded-full bg-andon-merah/10 px-2 py-0.5 text-[11px] font-semibold text-andon-merah">
                      <span className="size-1.5 rounded-full bg-andon-merah" aria-hidden="true" />
                      {lencana}
                    </span>
                  )}
                </NavLink>
                {dipilih && (
                  <motion.span
                    layoutId={idBilah}
                    aria-hidden="true"
                    className={`absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-sinyal ${ciut ? '-left-3' : '-left-4'}`}
                    transition={kurangiGerak ? { duration: 0 } : { type: 'spring', stiffness: 450, damping: 34 }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Papan andon mini */}
      {daftarMesin.length > 0 && (
        <div className={`mt-8 ${ciut ? 'flex flex-col items-center gap-2' : ''}`}>
          {!ciut && <p className="mb-2 px-1.5 text-[11.5px] font-medium text-tinta-2">Kondisi lini</p>}
          <ul className={ciut ? 'flex flex-col items-center gap-2.5' : 'space-y-0.5'}>
            {daftarMesin.map((m) => {
              const s = STATUS_MESIN[m.status];
              return (
                <li key={m.id}>
                  <Link
                    to="/mesin"
                    state={{ mesinId: m.id }}
                    onClick={onPilih}
                    title={`${m.nama}: ${s?.label ?? m.status}`}
                    className={`flex items-center gap-2.5 rounded-lg text-[12.5px] hover:bg-permukaan ${ciut ? 'p-1.5' : 'px-1.5 py-1.5'}`}
                  >
                    <Lampu tingkat={s?.tingkat} className={m.status === 'berhenti' ? 'animate-pulse motion-reduce:animate-none' : ''} />
                    {ciut ? (
                      <span className="sr-only">
                        {m.nama}: {s?.label}
                      </span>
                    ) : (
                      <>
                        <span className="angka w-14 shrink-0 font-semibold">{m.kode}</span>
                        <span className="truncate text-tinta-2">{s?.label}</span>
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-auto space-y-2 pt-6">
        {!ciut && <KartuShift />}
        <button
          type="button"
          onClick={onKeluar}
          title={ciut ? 'Keluar' : undefined}
          aria-label={ciut ? 'Keluar' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl py-2 text-[13px] text-tinta-2 transition-colors hover:bg-andon-merah/5 hover:text-andon-merah ${ciut ? 'justify-center' : 'px-3'}`}
        >
          <LogOut className="size-[17px]" aria-hidden="true" />
          {!ciut && 'Keluar'}
        </button>
      </div>
    </div>
  );
}
