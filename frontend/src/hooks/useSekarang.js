import { useEffect, useState } from 'react';

// Waktu sekarang yang diperbarui tiap `ms` milidetik.
export default function useSekarang(ms = 1000) {
  const [sekarang, setSekarang] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setSekarang(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return sekarang;
}
