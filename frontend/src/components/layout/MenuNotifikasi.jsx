import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell } from 'lucide-react';
import useKlikLuar from '../../hooks/useKlikLuar';
import { easeOut } from '../../utils/gerak';
import { jamMenit } from '../../utils/waktu';

// Pemberitahuan dari kondisi lini: mesin berhenti dan mesin dalam maintenance.
export default function MenuNotifikasi({ daftarMesin = [], downtime = [] }) {
  const [buka, setBuka] = useState(false);
  const tutup = () => setBuka(false);
  const ref = useKlikLuar(tutup);

  const butir = [
    ...downtime
      .filter((d) => d.selesai === null)
      .map((d) => ({ id: `d${d.id}`, warna: 'bg-andon-merah', judul: `${d.nama_mesin} berhenti`, isi: `${d.alasan}, sejak pukul ${jamMenit(d.mulai)}.`, mesinId: d.mesin_id })),
    ...daftarMesin
      .filter((m) => m.status === 'maintenance')
      .map((m) => ({ id: `m${m.id}`, warna: 'bg-andon-kuning', judul: `${m.nama} dalam maintenance`, isi: m.lini, mesinId: m.id })),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Pemberitahuan, ${butir.length} butir`}
        aria-expanded={buka}
        onClick={() => setBuka((v) => !v)}
        className="relative flex size-10 items-center justify-center rounded-xl border border-garis bg-putih text-tinta/60 transition-colors hover:text-tinta"
      >
        <Bell className="size-[18px]" aria-hidden="true" />
        {butir.length > 0 && <span className="absolute right-2.5 top-2 size-2 rounded-full bg-andon-merah ring-2 ring-putih" />}
      </button>
      <AnimatePresence>
        {buka && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: easeOut }}
            className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-garis bg-putih p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[13px] font-semibold">Pemberitahuan</span>
              <span className="text-[11px] text-tinta-2">{butir.length} butir</span>
            </div>
            <ul>
              {butir.length === 0 && <li className="px-3 py-4 text-[12px] text-tinta-2">Semua mesin jalan. Tidak ada yang perlu ditindak.</li>}
              {butir.map((b) => (
                <li key={b.id}>
                  <Link to="/mesin" state={{ mesinId: b.mesinId }} onClick={tutup} className="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-permukaan">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${b.warna}`} aria-hidden="true" />
                    <span>
                      <span className="block text-[12.5px] font-medium leading-snug">{b.judul}</span>
                      <span className="mt-0.5 block text-[11px] text-tinta-2">{b.isi}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
