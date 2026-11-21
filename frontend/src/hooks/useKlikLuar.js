import { useEffect, useRef } from 'react';

// Memanggil onLuar saat klik terjadi di luar elemen yang memakai ref ini.
export default function useKlikLuar(onLuar) {
  const ref = useRef(null);
  const panggil = useRef(onLuar);
  useEffect(() => {
    panggil.current = onLuar;
  });
  useEffect(() => {
    const tangani = (e) => {
      if (ref.current && !ref.current.contains(e.target)) panggil.current();
    };
    document.addEventListener('mousedown', tangani);
    return () => document.removeEventListener('mousedown', tangani);
  }, []);
  return ref;
}
