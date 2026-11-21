import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import Lampu from '../Lampu';
import { TITIK, LEBAR, TINGGI } from './geometri';
import { KOMPONEN, tingkatKomponen } from './simulasi';
import { formatNilai, catatanKomponen } from './format';

// Balon nomor di atas gambar mesin + keterangan yang muncul saat balon dipilih.
export default function TitikInspeksi({ mesin, aktif, onPilih, tampil, kurangiGerak }) {
  return (
    <div className="pointer-events-none absolute inset-0" onKeyDown={(e) => e.key === 'Escape' && onPilih(null)}>
      {KOMPONEN.map((k, i) => {
        const [x, y] = TITIK[k.id].balon;
        const dipilih = aktif === k.id;
        const kiri = x / LEBAR > 0.5;
        const tingkat = mesin ? tingkatKomponen(mesin, k) : null;
        const nilai = mesin ? formatNilai(mesin, k.id) : '';

        return (
          <div
            key={k.id}
            className="absolute"
            style={{ left: `${(x / LEBAR) * 100}%`, top: `${(y / TINGGI) * 100}%`, zIndex: dipilih ? 20 : 10 }}
          >
            <motion.button
              type="button"
              aria-expanded={dipilih}
              aria-label={`Titik ${k.no}, ${k.nama}${nilai ? `: ${nilai}` : ''}`}
              onClick={() => onPilih(dipilih ? null : k.id)}
              initial={false}
              animate={tampil ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
              transition={kurangiGerak ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 22, delay: tampil ? i * 0.08 : 0 }}
              className={`angka pointer-events-auto relative flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-kecil font-bold shadow-[0_2px_10px_rgb(19_37_68/0.25)] sm:size-9 ${
                dipilih ? 'bg-sinyal text-putih ring-4 ring-sinyal/25' : 'bg-putih text-tinta hover:bg-sinyal-muda'
              } ${tampil ? '' : 'invisible'}`}
            >
              {k.no}
              {tingkat === 'merah' && !dipilih && (
                <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-andon-merah ring-2 ring-putih" />
              )}
            </motion.button>

            <AnimatePresence>
              {dipilih && mesin && (
                <motion.div
                  role="status"
                  initial={kurangiGerak ? { opacity: 0 } : { opacity: 0, x: kiri ? 8 : -8, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  style={{ transformOrigin: kiri ? 'right top' : 'left top' }}
                  className={`pointer-events-auto absolute top-0 w-[13.5rem] -translate-y-5 rounded-2xl bg-putih p-4 text-left shadow-[0_12px_32px_rgb(19_37_68/0.22)] sm:w-60 ${
                    kiri ? 'right-6 sm:right-7' : 'left-6 sm:left-7'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-kecil text-tinta-2">
                      Titik {k.no}, {k.nama.toLowerCase()}
                    </p>
                    <button
                      type="button"
                      onClick={() => onPilih(null)}
                      aria-label="Tutup keterangan"
                      className="-m-1 rounded-full p-1 text-tinta-2 hover:bg-abu hover:text-tinta"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="angka mt-1 flex items-center gap-2 text-h3 font-bold leading-none">
                    {tingkat && <Lampu tingkat={tingkat} />}
                    {nilai}
                  </p>
                  <p className="mt-2 text-kecil text-tinta-2">{catatanKomponen(mesin, k.id, tingkat)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
