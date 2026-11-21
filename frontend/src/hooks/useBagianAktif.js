import { useEffect, useState } from 'react';

// Mengembalikan id bagian halaman yang sedang berada di tengah layar.
export default function useBagianAktif(ids) {
  const [aktif, setAktif] = useState(null);
  const kunci = ids.join(',');

  useEffect(() => {
    const elemen = kunci
      .split(',')
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!elemen.length) return;

    const obs = new IntersectionObserver(
      (entri) => {
        const terlihat = entri.filter((e) => e.isIntersecting);
        if (terlihat.length) setAktif(terlihat[0].target.id);
        else if (window.scrollY < 200) setAktif(null);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    elemen.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [kunci]);

  return aktif;
}
