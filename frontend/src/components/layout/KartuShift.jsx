import { motion } from 'motion/react';
import useSekarang from '../../hooks/useSekarang';
import { SHIFT, formatDurasi, progresShift } from '../../utils/waktu';
import { easeOut } from '../../utils/gerak';

// Kartu navy di dasar sidebar: garis waktu shift dengan penanda "sekarang".
export default function KartuShift() {
  const sekarang = useSekarang(30000);
  const { shift, persen, sisaMenit } = progresShift(sekarang);

  return (
    <div className="panel-garis rounded-2xl p-4 text-putih">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold">{SHIFT[shift].label}</span>
        <span className="angka text-[11px] text-putih/60">{SHIFT[shift].jam}</span>
      </div>
      <div className="relative mt-3 h-2 rounded-full bg-white/10" role="progressbar" aria-label="Progres shift" aria-valuenow={Math.round(persen * 100)} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className="h-full rounded-full bg-penunjuk" initial={{ width: 0 }} animate={{ width: `${persen * 100}%` }} transition={{ duration: 1, ease: easeOut }} />
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} aria-hidden="true" className="absolute top-0 h-2 w-px bg-panel/70" style={{ left: `${((i + 1) / 8) * 100}%` }} />
        ))}
      </div>
      <p className="angka mt-2.5 text-[11.5px] text-putih/70">Sisa {formatDurasi(sisaMenit)}</p>
    </div>
  );
}
