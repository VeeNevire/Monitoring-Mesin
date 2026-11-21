import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { easeOut } from '../utils/gerak';

// Angka yang menghitung naik saat pertama tampil. `format` mengubah angka jadi teks.
export default function AngkaNaik({ ke, format = (n) => String(Math.round(n)) }) {
  const kurangiGerak = useReducedMotion();
  const nilai = useMotionValue(kurangiGerak ? ke : 0);
  const teks = useTransform(nilai, (v) => format(v));

  useEffect(() => {
    if (kurangiGerak) {
      nilai.set(ke);
      return;
    }
    const kontrol = animate(nilai, ke, { duration: 1.1, delay: 0.2, ease: easeOut });
    return () => kontrol.stop();
  }, [ke, nilai, kurangiGerak]);

  return <motion.span>{teks}</motion.span>;
}
