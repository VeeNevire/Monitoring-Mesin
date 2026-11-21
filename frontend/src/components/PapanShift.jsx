import { motion, useReducedMotion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import AngkaNaik from './AngkaNaik';
import Lampu from './Lampu';
import useSekarang from '../hooks/useSekarang';
import { easeOut } from '../utils/gerak';
import { angka, klasifikasiOEE } from '../utils/oee';
import { SHIFT, formatDurasi, jamMenit, progresShift } from '../utils/waktu';

const MENIT_SHIFT = 480;

// Pita navy di atas Beranda: garis waktu shift (downtime ditandai merah) + 4 angka utama.
export default function PapanShift({ total, target, oee, jalan, jumlahMesin, downtime = [], memuat, diperbarui, onMuatUlang }) {
  const kurangiGerak = useReducedMotion();
  const sekarang = useSekarang(30000);
  const { shift, mulai, mulaiJam, persen, sisaMenit } = progresShift(sekarang);
  const akhir = new Date(mulai.getTime() + MENIT_SHIFT * 60000);
  const kelas = klasifikasiOEE(oee ?? 0);
  const aktif = downtime.filter((d) => d.selesai === null);

  // Potong tiap downtime ke jendela shift, ubah jadi posisi persen.
  const segmen = downtime
    .map((d) => {
      const a = Math.max(new Date(d.mulai).getTime(), mulai.getTime());
      const b = Math.min(d.selesai ? new Date(d.selesai).getTime() : sekarang.getTime(), akhir.getTime());
      if (b <= a) return null;
      return { id: d.id, kiri: ((a - mulai) / 60000 / MENIT_SHIFT) * 100, lebar: ((b - a) / 60000 / MENIT_SHIFT) * 100, judul: `${d.nama_mesin}: ${d.alasan}, ${jamMenit(d.mulai)}–${d.selesai ? jamMenit(d.selesai) : 'sekarang'}` };
    })
    .filter(Boolean);
  const totalDowntime = Math.round(segmen.reduce((s, x) => s + (x.lebar / 100) * MENIT_SHIFT, 0));

  const angkaUtama = [
    { label: 'Output hari ini', nilai: total, format: (n) => angka(n), sub: `dari target ${angka(target)} pcs` },
    { label: 'OEE keseluruhan', nilai: (oee ?? 0) * 100, format: (n) => `${n.toFixed(1).replace('.', ',')}%`, sub: kelas.label, lampu: kelas.tingkat },
    { label: 'Mesin jalan', nilai: jalan, sub: `dari ${jumlahMesin} mesin` },
    { label: 'Downtime aktif', nilai: aktif.length, sub: aktif[0] ? `${aktif[0].nama_mesin} sejak ${jamMenit(aktif[0].mulai)}` : 'Semua mesin jalan', lampu: aktif.length ? 'merah' : null },
  ];

  return (
    <motion.section
      initial={kurangiGerak ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      aria-labelledby="judul-papan"
      className="panel-garis relative overflow-hidden rounded-[1.5rem] p-5 text-putih sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="angka text-[12.5px] text-putih/65">
            {SHIFT[shift].label}, {SHIFT[shift].jam}
          </p>
          <h1 id="judul-papan" className="mt-1 text-2xl font-extrabold tracking-tight font-stretch-semi-expanded sm:text-[1.9rem]">
            Kondisi produksi saat ini
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {diperbarui && <span className="angka hidden text-[12px] text-putih/60 sm:inline">Diperbarui {dayjs(diperbarui).format('HH.mm.ss')}</span>}
          <button
            type="button"
            onClick={onMuatUlang}
            disabled={memuat}
            className="flex h-9 items-center gap-2 rounded-full bg-white/10 px-3.5 text-[12.5px] font-medium hover:bg-white/15 disabled:opacity-60"
          >
            <RefreshCw className={`size-3.5 ${memuat ? 'animate-spin' : ''}`} aria-hidden="true" />
            Muat ulang
          </button>
        </div>
      </div>

      {/* Garis waktu shift */}
      <div className="mt-7">
        <div className="flex items-baseline justify-between text-[12px] text-putih/65">
          <span>Garis waktu shift</span>
          <span className="angka">
            Downtime {formatDurasi(totalDowntime)}, sisa shift {formatDurasi(sisaMenit)}
          </span>
        </div>
        <div className="relative mt-3 h-4 rounded-full bg-white/[0.08]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-penunjuk/35"
            initial={kurangiGerak ? false : { width: 0 }}
            animate={{ width: `${persen * 100}%` }}
            transition={{ duration: 1.1, delay: 0.2, ease: easeOut }}
          />
          {segmen.map((s) => (
            <span key={s.id} title={s.judul} className="absolute inset-y-0.5 rounded-full bg-andon-merah" style={{ left: `${s.kiri}%`, width: `max(${s.lebar}%, 4px)` }}>
              <span className="sr-only">{s.judul}</span>
            </span>
          ))}
          <span aria-hidden="true" className="absolute -inset-y-1.5 w-0.5 rounded-full bg-putih" style={{ left: `${persen * 100}%` }} />
        </div>
        <div className="angka relative mt-2 h-4 text-[10.5px] text-putih/50" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={`absolute -translate-x-1/2 ${i % 2 ? 'max-sm:hidden' : ''} ${i === 0 ? 'translate-x-0' : ''} ${i === 8 ? '!-translate-x-full' : ''}`} style={{ left: `${(i / 8) * 100}%` }}>
              {String((mulaiJam + i) % 24).padStart(2, '0')}.00
            </span>
          ))}
        </div>
      </div>

      {/* Angka utama */}
      <dl className="mt-6 grid grid-cols-2 gap-y-5 border-t border-white/10 pt-5 lg:grid-cols-4">
        {angkaUtama.map((a, i) => (
          <div
            key={a.label}
            className={`min-w-0 ${i % 2 ? 'border-l border-white/10 pl-5 lg:pl-6' : ''} ${i === 2 ? 'lg:border-l lg:border-white/10 lg:pl-6' : ''}`}
          >
            <dt className="text-[12px] text-putih/60">{a.label}</dt>
            <dd className="m-0 mt-1">
              {memuat ? (
                <span className="block h-9 w-24 animate-pulse rounded-lg bg-white/10" />
              ) : (
                <span className="angka flex items-center gap-2.5 text-[1.9rem] font-semibold leading-tight tracking-tight">
                  {a.lampu && <Lampu tingkat={a.lampu} />}
                  <AngkaNaik ke={a.nilai} format={a.format} />
                </span>
              )}
              <span className="mt-0.5 block truncate text-[12px] text-putih/60">{memuat ? ' ' : a.sub}</span>
            </dd>
          </div>
        ))}
      </dl>
    </motion.section>
  );
}
