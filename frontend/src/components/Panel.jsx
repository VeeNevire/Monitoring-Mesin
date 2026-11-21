import { motion, useReducedMotion } from 'motion/react';
import { easeOut } from '../utils/gerak';

// Panel putih dashboard. Muncul pelan berurutan sesuai `index`.
export default function Panel({ children, className = '', index = 0 }) {
  const kurangiGerak = useReducedMotion();
  return (
    <motion.section
      initial={kurangiGerak ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: easeOut }}
      className={`min-w-0 rounded-[1.25rem] border border-garis bg-putih p-5 ${className}`}
    >
      {children}
    </motion.section>
  );
}

export function KepalaPanel({ judul, keterangan, aksi }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight">{judul}</h2>
        {keterangan && <p className="mt-0.5 text-[12px] text-tinta-2">{keterangan}</p>}
      </div>
      {aksi}
    </div>
  );
}
