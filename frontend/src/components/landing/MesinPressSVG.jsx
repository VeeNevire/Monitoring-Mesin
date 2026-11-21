import { motion } from 'motion/react';
import { TITIK, LEBAR, TINGGI, LANGKAH_RAM } from './geometri';

// Mesin press bergaya objek solid: badan terang bergaris navy, supaya terbaca
// di atas latar putih maupun panel navy (bagian atas mesin menembus keluar panel).

const LAMPU_ISI = {
  merah: 'fill-andon-merah',
  kuning: 'fill-andon-kuning',
  hijau: 'fill-andon-hijau',
};

const garis = (aktif, id) => (aktif === id ? 'stroke-sinyal' : 'stroke-tinta');
const tebal = (aktif, id) => (aktif === id ? 2.25 : 1.5);

export default function MesinPressSVG({ kode, jalan, aktif, lampu, motorPanas, counter, kurangiGerak, pindaiSelesai, onPindaiSelesai }) {
  const bergerak = jalan && !kurangiGerak;

  return (
    <svg
      viewBox={`0 0 ${LEBAR} ${TINGGI}`}
      className="relative block h-auto w-full"
      aria-hidden="true"
      fill="none"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        <linearGradient id="jejak-pindai" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fa3ee" stopOpacity="0" />
          <stop offset="1" stopColor="#7fa3ee" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      {/* Lantai, arsiran, dan garis ukur (di dalam panel navy) */}
      <ellipse cx="270" cy="472" rx="190" ry="10" className="fill-black/30" stroke="none" />
      <line x1="30" y1="470" x2="590" y2="470" className="stroke-white/40" />
      {Array.from({ length: 28 }, (_, i) => (
        <line key={i} x1={44 + i * 20} y1="471" x2={34 + i * 20} y2="481" className="stroke-white/15" strokeWidth="1" />
      ))}
      <g className="stroke-white/35" strokeWidth="1">
        <line x1="120" y1="476" x2="120" y2="506" />
        <line x1="400" y1="476" x2="400" y2="506" />
        <line x1="120" y1="500" x2="400" y2="500" />
        <polyline points="128,496 120,500 128,504" />
        <polyline points="392,496 400,500 392,504" />
      </g>
      <text x="260" y="494" textAnchor="middle" fontSize="11" className="fill-white/60 angka" stroke="none">
        2800 mm
      </text>

      {/* Sabuk motor ke roda gila */}
      <g className="stroke-tinta" strokeWidth="2.5">
        <line x1="250" y1="31" x2="104" y2="72" />
        <line x1="250" y1="53" x2="104" y2="152" />
      </g>

      {/* Kolom */}
      <g className="stroke-tinta">
        <path d="M190 150 L200 144 L200 398 L190 404 Z" className="fill-badan-2" />
        <path d="M370 150 L380 144 L380 398 L370 404 Z" className="fill-badan-2" />
        <rect x="150" y="150" width="40" height="254" className="fill-badan" />
        <rect x="330" y="150" width="40" height="254" className="fill-badan" />
        <line x1="158" y1="160" x2="158" y2="396" className="stroke-white" strokeWidth="3" />
        <line x1="338" y1="160" x2="338" y2="396" className="stroke-white" strokeWidth="3" />
      </g>

      {/* Alas */}
      <g className="stroke-tinta">
        <path d="M120 420 L144 404 L424 404 L400 420 Z" className="fill-white" />
        <path d="M400 420 L424 404 L424 454 L400 470 Z" className="fill-badan-2" />
        <rect x="120" y="420" width="280" height="50" className="fill-badan" />
        <line x1="120" y1="434" x2="400" y2="434" strokeWidth="1" />
        {[140, 380].map((x) => (
          <circle key={x} cx={x} cy="452" r="5" className="fill-white" />
        ))}
      </g>

      {/* Ram + dies atas (bergerak) */}
      <motion.g
        initial={false}
        animate={bergerak ? { y: [0, LANGKAH_RAM, 0] } : { y: 0 }}
        transition={bergerak ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.42, 1] } : { duration: 0.6, ease: 'easeOut' }}
      >
        <rect x="254" y="150" width="12" height="68" className="fill-white stroke-tinta" />
        <g className={garis(aktif, 'dies')} strokeWidth={tebal(aktif, 'dies')}>
          <rect x="195" y="215" width="130" height="50" rx="2" className="fill-badan" />
          <rect x="195" y="215" width="130" height="10" rx="2" className="fill-white" />
          <circle cx="212" cy="240" r="4" className="fill-white" />
          <circle cx="308" cy="240" r="4" className="fill-white" />
          <rect x="215" y="265" width="90" height="16" className="fill-badan-2" />
        </g>
      </motion.g>

      {/* Crown */}
      <g className="stroke-tinta">
        <path d="M120 80 L144 64 L424 64 L400 80 Z" className="fill-white" />
        <path d="M400 80 L424 64 L424 134 L400 150 Z" className="fill-badan-2" />
        <rect x="120" y="80" width="280" height="70" className="fill-badan" />
        <line x1="120" y1="138" x2="400" y2="138" strokeWidth="1" />
        <rect x="300" y="96" width="84" height="30" rx="4" className="fill-tinta" />
        <text x="342" y="116" textAnchor="middle" fontSize="13" fontWeight="800" className="fill-white" stroke="none" style={{ fontStretch: '125%' }}>
          {kode}
        </text>
      </g>

      {/* Silinder hidrolik */}
      <g className={garis(aktif, 'hidrolik')} strokeWidth={tebal(aktif, 'hidrolik')}>
        <rect x="230" y="150" width="60" height="10" className="fill-badan-2" />
        <rect x="236" y="160" width="48" height="58" rx="4" className="fill-badan" />
        <rect x="242" y="164" width="8" height="50" rx="3" className="fill-white" stroke="none" />
        <rect x="284" y="176" width="9" height="9" className="fill-badan-2" />
      </g>

      {/* Motor penggerak */}
      <g className={garis(aktif, 'motor')} strokeWidth={tebal(aktif, 'motor')}>
        <rect x="272" y="62" width="14" height="6" className="fill-badan-2" />
        <rect x="338" y="62" width="14" height="6" className="fill-badan-2" />
        <rect x="262" y="22" width="100" height="40" rx="8" className={motorPanas ? 'fill-[#f6d5cf]' : 'fill-badan'} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={276 + i * 8} y1="28" x2={276 + i * 8} y2="56" strokeWidth="1" />
        ))}
        <rect x="362" y="28" width="10" height="28" rx="3" className="fill-badan-2" />
        <line x1="250" y1="42" x2="262" y2="42" />
        <circle cx="250" cy="42" r="12" className="fill-white" />
      </g>

      {/* Roda gila */}
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={bergerak ? { rotate: 360 } : undefined}
        transition={bergerak ? { duration: 1.6, repeat: Infinity, ease: 'linear' } : undefined}
        className="stroke-tinta"
      >
        <circle cx="104" cy="112" r="40" className="fill-badan" />
        <circle cx="104" cy="112" r="33" className="fill-white" />
        <circle cx="104" cy="112" r="10" className="fill-badan-2" />
        {[0, 72, 144, 216, 288].map((sudut) => {
          const r = (sudut * Math.PI) / 180;
          return (
            <line
              key={sudut}
              x1={104 + Math.cos(r) * 10}
              y1={112 + Math.sin(r) * 10}
              x2={104 + Math.cos(r) * 33}
              y2={112 + Math.sin(r) * 33}
              strokeWidth="3"
            />
          );
        })}
      </motion.g>

      {/* Dies bawah, benda kerja, bolster */}
      <g className={garis(aktif, 'dies')} strokeWidth={tebal(aktif, 'dies')}>
        <rect x="225" y="348" width="70" height="6" className="fill-sinyal-muda" />
        <rect x="215" y="354" width="90" height="20" className="fill-badan-2" />
      </g>
      <g className="stroke-tinta">
        <rect x="200" y="374" width="120" height="14" className="fill-badan" />
        <rect x="180" y="388" width="160" height="16" className="fill-white" />
      </g>

      {/* Kabel panel ke mesin */}
      <path d="M440 296 C 408 296 400 330 370 330" className="stroke-white/50" strokeWidth="2" />

      {/* Tiang, panel kontrol, menara andon */}
      <g className="stroke-tinta">
        <rect x="477" y="310" width="6" height="160" className="fill-badan" />
        <rect x="458" y="464" width="44" height="6" className="fill-badan-2" />
        <rect x="478" y="204" width="4" height="18" className="fill-badan" />

        <g className={garis(aktif, 'counter')} strokeWidth={tebal(aktif, 'counter')}>
          <rect x="440" y="222" width="80" height="88" rx="6" className="fill-badan" />
          <rect x="450" y="234" width="60" height="26" rx="3" className="fill-tinta" />
          <circle cx="462" cy="286" r="7" className="fill-white" />
          <circle cx="484" cy="286" r="7" className="fill-white" />
          <circle cx="506" cy="286" r="8" className="fill-tinta" />
        </g>
        <text x="504" y="252" textAnchor="end" fontSize="13" fontWeight="600" className="fill-white angka" stroke="none">
          {counter}
        </text>

        <rect x="468" y="144" width="24" height="6" rx="2" className="fill-tinta" />
        {[
          ['merah', 150],
          ['kuning', 168],
          ['hijau', 186],
        ].map(([warna, y]) => (
          <rect key={warna} x="466" y={y} width="28" height="18" rx="2" className={lampu === warna ? LAMPU_ISI[warna] : 'fill-badan'} />
        ))}
      </g>

      {/* Garis penunjuk ke titik inspeksi */}
      <motion.g initial={kurangiGerak ? false : { opacity: 0 }} animate={{ opacity: pindaiSelesai ? 1 : 0 }} transition={{ duration: 0.4 }}>
        {Object.entries(TITIK).map(([id, { anchor, balon }]) => (
          <g key={id} className="stroke-penunjuk fill-penunjuk">
            <line x1={anchor[0]} y1={anchor[1]} x2={balon[0]} y2={balon[1]} strokeWidth={aktif === id ? 2 : 1.25} />
            <circle cx={anchor[0]} cy={anchor[1]} r="3.5" strokeWidth="0" />
          </g>
        ))}
      </motion.g>

      {/* Sapuan pemindai: satu-satunya gerak otomatis saat halaman dimuat */}
      {!kurangiGerak && !pindaiSelesai && (
        <motion.g
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 480, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.9, ease: 'easeInOut', times: [0, 0.1, 0.85, 1], delay: 0.5 }}
          onAnimationComplete={onPindaiSelesai}
        >
          <rect x="20" y="-56" width="560" height="56" fill="url(#jejak-pindai)" stroke="none" />
          <rect x="20" y="0" width="560" height="2" className="fill-penunjuk" stroke="none" />
        </motion.g>
      )}
    </svg>
  );
}
