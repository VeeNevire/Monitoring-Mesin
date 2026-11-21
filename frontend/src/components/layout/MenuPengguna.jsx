import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, LogOut } from 'lucide-react';
import useKlikLuar from '../../hooks/useKlikLuar';
import { easeOut } from '../../utils/gerak';
import { SHIFT, shiftSekarang } from '../../utils/waktu';

export default function MenuPengguna({ peran, onKeluar }) {
  const [buka, setBuka] = useState(false);
  const tutup = () => setBuka(false);
  const ref = useKlikLuar(tutup);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={buka}
        aria-haspopup="menu"
        onClick={() => setBuka((v) => !v)}
        className="flex items-center gap-2.5 rounded-xl border border-garis bg-putih py-1 pl-1 pr-2.5 transition-colors hover:bg-permukaan"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-sinyal/10 text-[12px] font-semibold text-sinyal">{peran.singkat}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-[12.5px] font-medium">{peran.nama}</span>
          <span className="block text-[11px] text-tinta-2">{SHIFT[shiftSekarang()].label}</span>
        </span>
        <ChevronDown className={`hidden size-3.5 text-tinta-2 transition-transform sm:block ${buka ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {buka && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: easeOut }}
            className="absolute right-0 z-40 mt-2 w-56 origin-top-right rounded-2xl border border-garis bg-putih p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]"
          >
            <div className="px-3 py-2">
              <p className="text-[13px] font-medium">{peran.nama}</p>
              <p className="text-[11px] text-tinta-2">Akun contoh, belum ada autentikasi.</p>
            </div>
            <div className="my-1 h-px bg-black/5" />
            <button
              type="button"
              role="menuitem"
              onClick={onKeluar}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-andon-merah transition-colors hover:bg-andon-merah/5"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Keluar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
