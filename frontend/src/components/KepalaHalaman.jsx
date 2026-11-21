import { motion, useReducedMotion } from 'motion/react';
import { easeOut } from '../utils/gerak';

export default function KepalaHalaman({ judul, deskripsi, aksi }) {
  const kurangiGerak = useReducedMotion();
  return (
    <motion.div
      initial={kurangiGerak ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOut }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4 pt-2"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{judul}</h1>
        {deskripsi && <p className="mt-1 max-w-prose text-[13.5px] text-tinta-2">{deskripsi}</p>}
      </div>
      {aksi && <div className="flex flex-wrap items-center gap-2">{aksi}</div>}
    </motion.div>
  );
}
