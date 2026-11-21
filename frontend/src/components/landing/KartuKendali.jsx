import { motion } from 'motion/react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import Lampu from '../Lampu';
import { oeeMesin } from './simulasi';
import { klasifikasiOEE, persen } from '../../utils/oee';

const BAR = { hijau: 'bg-andon-hijau', kuning: 'bg-andon-kuning', merah: 'bg-andon-merah' };

// Kartu melayang di sudut panel hero: pilih mesin, OEE live, hentikan/jalankan.
export default function KartuKendali({ daftar, mesin, onPilihMesin, onAlih, onUlang, error, onMuatUlang, className = '' }) {
  const dasar = `rounded-kartu bg-putih p-5 shadow-[0_18px_48px_rgb(19_37_68/0.18)] ring-1 ring-garis ${className}`;

  if (error) {
    return (
      <div className={dasar}>
        <p className="font-semibold">Data mesin tidak dapat dimuat.</p>
        <p className="mt-1 text-kecil text-tinta-2">{error}</p>
        <button type="button" onClick={onMuatUlang} className="mt-3 rounded-full border border-tinta px-4 py-2 text-kecil font-semibold hover:bg-tinta hover:text-putih">
          Muat ulang
        </button>
      </div>
    );
  }

  if (!mesin) {
    return (
      <div className={dasar} aria-busy="true" aria-label="Memuat data mesin">
        <div className="h-9 animate-pulse rounded-full bg-abu" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded-lg bg-abu" />
        <div className="mt-4 h-8 animate-pulse rounded-lg bg-abu" />
      </div>
    );
  }

  const hasil = oeeMesin(mesin);
  const kelas = klasifikasiOEE(hasil.oee);
  const lama = mesin.jalan ? 0 : mesin.menit - mesin.berhentiSejak;

  return (
    <div className={dasar}>
      <div role="radiogroup" aria-label="Pilih mesin" className="relative grid grid-cols-2 rounded-full bg-abu p-1">
        {daftar.map((m) => {
          const dipilih = m.id === mesin.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={dipilih}
              onClick={() => onPilihMesin(m.id)}
              className={`relative flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-kecil font-semibold ${dipilih ? 'text-putih' : 'text-tinta'}`}
            >
              {dipilih && (
                <motion.span layoutId="pilihan-mesin" className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative flex items-center gap-2">
                <Lampu tingkat={m.jalan ? 'hijau' : 'merah'} />
                {m.nama.replace('Mesin ', '')}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-kecil text-tinta-2">OEE shift ini</p>
          <p className="angka text-[2rem] font-extrabold leading-none font-stretch-semi-expanded">{persen(hasil.oee)}</p>
        </div>
        <button
          type="button"
          onClick={() => onAlih(mesin.id)}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-kecil font-semibold ${
            mesin.jalan ? 'border border-tinta text-tinta hover:bg-tinta hover:text-putih' : 'bg-sinyal text-putih hover:bg-sinyal-tua'
          }`}
        >
          {mesin.jalan ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
          {mesin.jalan ? 'Hentikan mesin' : 'Jalankan lagi'}
        </button>
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-kecil" aria-live="polite">
        <Lampu tingkat={kelas.tingkat} />
        <span className="text-tinta-2">{kelas.label}.</span>
        <span className="font-semibold">{mesin.jalan ? 'Mesin jalan.' : `Berhenti ${lama} menit, ${mesin.alasan.toLowerCase()}.`}</span>
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        {[
          ['Availability', hasil.availability],
          ['Performance', hasil.performance],
          ['Quality', hasil.quality],
        ].map(([label, nilai]) => (
          <div key={label} className="min-w-0">
            <dt className="truncate text-[0.7rem] text-tinta-2">{label}</dt>
            <dd className="angka m-0 text-kecil font-semibold">{persen(nilai)}</dd>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-abu">
              <div className={`h-full rounded-full transition-[width] duration-300 ${BAR[kelas.tingkat]}`} style={{ width: `${Math.min(100, nilai * 100)}%` }} />
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-garis pt-3 text-[0.75rem] text-tinta-2">
        <span>Simulasi, 1 detik = 1 menit shift.</span>
        <button type="button" onClick={onUlang} className="inline-flex shrink-0 items-center gap-1 font-medium hover:text-tinta">
          <RotateCcw className="size-3" aria-hidden="true" />
          Ulangi
        </button>
      </div>
    </div>
  );
}
