import Lampu from './Lampu';
import StatusData from './StatusData';
import Panel from './Panel';
import { klasifikasiOEE, persen } from '../utils/oee';

const BATANG = { hijau: 'bg-andon-hijau', kuning: 'bg-andon-kuning', merah: 'bg-andon-merah' };

// README §7.2: angka OEE besar + 3 komponen, warna sesuai klasifikasi.
// Tiga komponen ditampilkan sebagai "tangga kerugian": tiap baris = sisa waktu produktif
// setelah dikalikan komponen tersebut, sehingga terlihat di mana kerugian terbesar.
export default function KartuOEE({ index = 0, availability, performance, quality, oee, judul = 'OEE', keterangan, loading, error, onCobaLagi }) {
  const adaData = [availability, performance, quality, oee].every((n) => typeof n === 'number');

  return (
    <Panel index={index}>
      <h2 className="text-[15px] font-semibold tracking-tight">{judul}</h2>
      {keterangan && <p className="mt-0.5 text-[12px] text-tinta-2">{keterangan}</p>}
      <div className="mt-5">
        <StatusData loading={loading} error={error} onCobaLagi={onCobaLagi} kosong={!loading && !error && !adaData} pesanKosong="OEE belum dihitung." tinggi="h-56">
          {adaData && <Isi a={availability} p={performance} q={quality} oee={oee} />}
        </StatusData>
      </div>
    </Panel>
  );
}

function Isi({ a, p, q, oee }) {
  const kelas = klasifikasiOEE(oee);
  const tangga = [
    { label: 'Availability', nilai: a, sisa: a, rugi: 'waktu berhenti' },
    { label: 'Performance', nilai: p, sisa: a * p, rugi: 'jalan lambat' },
    { label: 'Quality', nilai: q, sisa: a * p * q, rugi: 'produk reject' },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
        <p className="angka text-[3rem] font-extrabold leading-none font-stretch-semi-expanded">{persen(oee)}</p>
        <p className="mb-1 flex items-center gap-2 text-kecil font-semibold">
          <Lampu tingkat={kelas.tingkat} />
          {kelas.label}
        </p>
      </div>

      <ol className="mt-6 space-y-3.5" aria-label="Komponen OEE">
        {tangga.map((t, i) => (
          <li key={t.label}>
            <div className="flex items-baseline justify-between gap-3 text-kecil">
              <span className="text-tinta-2">
                {i > 0 && <span aria-hidden="true">× </span>}
                {t.label}
              </span>
              <span className="angka font-semibold">{persen(t.nilai)}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-abu" title={`Berkurang karena ${t.rugi}`}>
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${i === tangga.length - 1 ? BATANG[kelas.tingkat] : 'bg-tinta'}`}
                style={{ width: `${Math.max(0, Math.min(100, t.sisa * 100))}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[0.75rem] text-tinta-2">Panjang batang adalah sisa waktu produktif setelah tiap kerugian.</p>
    </>
  );
}
