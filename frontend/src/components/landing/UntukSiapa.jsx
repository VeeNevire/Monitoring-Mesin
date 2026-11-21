import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';

const PERAN = [
  {
    id: 'operator',
    label: 'Operator',
    judul: 'Operator shift',
    ringkas: 'Mencatat apa yang terjadi di mesin, saat itu juga, dari tablet di lantai produksi.',
    tugas: [
      'Catat output dan reject per shift atau per jam',
      'Catat mesin berhenti beserta alasannya',
      'Tutup catatan downtime saat mesin jalan lagi',
      'Ubah status mesin ke maintenance',
    ],
  },
  {
    id: 'manajer',
    label: 'Manajer',
    judul: 'Manajer produksi',
    ringkas: 'Melihat apakah target tercapai, dan apa penyebabnya kalau tidak.',
    tugas: [
      'Bandingkan output dengan target harian per lini',
      'Lihat OEE per mesin dan keseluruhan',
      'Unduh rekap produksi, downtime, dan OEE per periode',
      'Dapat pemberitahuan saat target tercapai',
    ],
  },
];

export default function UntukSiapa() {
  const [pilih, setPilih] = useState('operator');
  const kurangiGerak = useReducedMotion();
  const peran = PERAN.find((p) => p.id === pilih);

  const pindahDenganPanah = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = PERAN.findIndex((p) => p.id === pilih);
    const berikut = PERAN[(i + (e.key === 'ArrowRight' ? 1 : PERAN.length - 1)) % PERAN.length];
    setPilih(berikut.id);
    document.getElementById(`tab-${berikut.id}`)?.focus();
  };

  return (
    <section id="untuk-siapa" aria-labelledby="judul-peran" className="mx-auto grid max-w-[1240px] scroll-mt-24 items-center gap-12 px-4 pt-24 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-32">
      <div className="relative">
        {/* Tanda air menara andon */}
        <svg aria-hidden="true" viewBox="0 0 16 28" className="pointer-events-none absolute -left-10 -top-16 h-80 w-auto opacity-60 sm:-left-20" fill="none" strokeWidth="0.25">
          <rect x="1" y="0.5" width="14" height="7" rx="1.5" className="stroke-garis" />
          <rect x="1" y="8.5" width="14" height="7" rx="1.5" className="stroke-garis" />
          <rect x="1" y="16.5" width="14" height="7" rx="1.5" className="stroke-garis" />
          <rect x="7" y="23.5" width="2" height="4" className="stroke-garis" />
        </svg>
        <div className="relative">
          <h2 id="judul-peran" className="max-w-[18ch] text-h2 font-extrabold font-stretch-semi-expanded text-balance">
            Satu sistem untuk lantai produksi dan ruang manajer
          </h2>
          <p className="mt-4 max-w-[46ch] text-tinta-2">
            Operator mengisi data dari mesin. Manajer membaca hasilnya. Keduanya melihat angka yang sama, jadi tidak ada lagi
            rekap ganda di akhir shift.
          </p>
          <div role="tablist" aria-label="Peran" onKeyDown={pindahDenganPanah} className="mt-8 inline-flex rounded-full bg-abu p-1">
            {PERAN.map((p) => (
              <button
                key={p.id}
                id={`tab-${p.id}`}
                type="button"
                role="tab"
                aria-selected={pilih === p.id}
                aria-controls="panel-peran"
                tabIndex={pilih === p.id ? 0 : -1}
                onClick={() => setPilih(p.id)}
                className={`relative rounded-full px-5 py-2 font-semibold ${pilih === p.id ? 'text-putih' : 'text-tinta-2 hover:text-tinta'}`}
              >
                {pilih === p.id && (
                  <motion.span layoutId="tab-peran" className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                )}
                <span className="relative">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div id="panel-peran" role="tabpanel" aria-labelledby={`tab-${pilih}`} className="panel-garis relative min-h-[22rem] overflow-hidden rounded-[2rem_5rem_2rem_2rem] p-7 text-putih sm:p-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={peran.id}
            initial={kurangiGerak ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={kurangiGerak ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <h3 className="text-h3 font-bold">{peran.judul}</h3>
            <p className="mt-2 max-w-[42ch] text-putih/75">{peran.ringkas}</p>
            <ul className="mt-7 space-y-3">
              {peran.tugas.map((t) => (
                <li key={t} className="flex items-start gap-3 rounded-2xl bg-white/[0.06] px-4 py-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sinyal">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
