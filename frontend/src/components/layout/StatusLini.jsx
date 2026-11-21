import Lampu from '../Lampu';

// Ringkasan status lini di bar atas: jumlah mesin per warna andon.
export default function StatusLini({ daftarMesin = [] }) {
  const hitung = (s) => daftarMesin.filter((m) => m.status === s).length;
  const butir = [
    ['hijau', hitung('jalan'), 'jalan'],
    ['merah', hitung('berhenti'), 'berhenti'],
    ['kuning', hitung('maintenance'), 'maintenance'],
  ];
  if (!daftarMesin.length) return null;
  return (
    <p className="angka hidden h-10 items-center gap-4 rounded-xl border border-garis bg-putih px-3.5 text-[12px] md:flex" aria-label="Status lini">
      {butir.map(([warna, n, label]) => (
        <span key={label} className="flex items-center gap-1.5">
          <Lampu tingkat={warna} />
          <span className="font-semibold">{n}</span>
          <span className="text-tinta-2">{label}</span>
        </span>
      ))}
    </p>
  );
}
