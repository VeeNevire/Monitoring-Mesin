import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { ChevronLeft, ChevronRight, Flame, Hammer, PaintBucket } from 'lucide-react';
import usePolling from '../../hooks/usePolling';
import { getDowntime, getMesin, getOEE } from '../../services/api';
import BadgeStatus from '../BadgeStatus';
import Lampu from '../Lampu';
import { klasifikasiOEE, persen } from '../../utils/oee';

async function muatLini() {
  const [mesin, oee, downtime] = await Promise.all([getMesin(), getOEE(), getDowntime()]);
  return { mesin, oee, downtime, waktu: new Date() };
}

const IKON = { PRS: Hammer, WLD: Flame, PNT: PaintBucket };

export default function KondisiLini() {
  const { data, loading, error, reload } = usePolling(muatLini, 15000);
  const wadah = useRef(null);
  const { scrollXProgress } = useScroll({ container: wadah });
  const [ujung, setUjung] = useState({ awal: true, akhir: false });

  useMotionValueEvent(scrollXProgress, 'change', (v) => setUjung({ awal: v <= 0.01, akhir: v >= 0.99 }));

  const geser = (arah) => {
    const el = wadah.current;
    if (!el) return;
    const kartu = el.querySelector('li');
    el.scrollBy({ left: arah * ((kartu?.offsetWidth ?? 320) + 20), behavior: 'smooth' });
  };

  return (
    <section id="kondisi-lini" aria-labelledby="judul-lini" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 pt-24 sm:px-8 lg:pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="judul-lini" className="text-h2 font-extrabold font-stretch-semi-expanded">
            Kondisi lini saat ini
          </h2>
          <p className="mt-2 text-tinta-2">Data contoh, diperbarui otomatis setiap 15 detik.</p>
        </div>
        {data && <p className="angka text-kecil text-tinta-2">Diperbarui pukul {dayjs(data.waktu).format('HH.mm.ss')}</p>}
      </div>

      {loading && !data ? (
        <ul aria-busy="true" aria-label="Memuat kondisi lini" className="mt-8 flex gap-5 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-64 w-[85%] shrink-0 animate-pulse rounded-kartu bg-abu sm:w-[22rem]" />
          ))}
        </ul>
      ) : error && !data ? (
        <div className="mt-8 rounded-kartu bg-abu p-6">
          <p className="font-semibold">Kondisi lini tidak dapat dimuat.</p>
          <p className="mt-1 text-kecil text-tinta-2">{error}</p>
          <button type="button" onClick={reload} className="mt-4 rounded-full border border-tinta px-4 py-2 font-semibold hover:bg-tinta hover:text-putih">
            Muat ulang
          </button>
        </div>
      ) : data.mesin.length === 0 ? (
        <p className="mt-8 rounded-kartu bg-abu p-6 text-tinta-2">Belum ada mesin terdaftar. Tambahkan mesin dari dashboard.</p>
      ) : (
        <>
          <ul ref={wadah} className="tanpa-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-8 sm:scroll-px-8 sm:px-8">
            {data.mesin.map((m) => (
              <KartuMesin key={m.id} mesin={m} oee={data.oee.per_mesin.find((o) => o.mesin_id === m.id)} downtime={data.downtime.find((d) => d.mesin_id === m.id && d.selesai === null)} />
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-center gap-4">
            <TombolGeser label="Mesin sebelumnya" onClick={() => geser(-1)} disabled={ujung.awal}>
              <ChevronLeft className="size-4" aria-hidden="true" />
            </TombolGeser>
            <div className="h-0.5 w-28 overflow-hidden rounded-full bg-garis" aria-hidden="true">
              <motion.div className="h-full origin-left bg-tinta" style={{ scaleX: scrollXProgress }} />
            </div>
            <TombolGeser label="Mesin berikutnya" onClick={() => geser(1)} disabled={ujung.akhir}>
              <ChevronRight className="size-4" aria-hidden="true" />
            </TombolGeser>
          </div>
        </>
      )}
    </section>
  );
}

function KartuMesin({ mesin, oee, downtime }) {
  const Ikon = IKON[mesin.kode.slice(0, 3)] ?? Hammer;
  const kelas = oee ? klasifikasiOEE(oee.oee) : null;

  return (
    <li className={`flex w-[85%] shrink-0 snap-start flex-col rounded-kartu p-6 sm:w-[22rem] ${downtime ? 'bg-andon-merah/[0.07] ring-1 ring-andon-merah/25' : 'bg-abu'}`}>
      <div className="flex items-center justify-between gap-3 text-kecil text-tinta-2">
        <span>{mesin.lini}</span>
        <span className="angka">{mesin.kode}</span>
      </div>
      <div className="mt-4">
        <BadgeStatus status={mesin.status} />
      </div>
      <p className="mt-3 min-h-12 text-tinta">
        {downtime
          ? `${downtime.alasan} sejak pukul ${dayjs(downtime.mulai).format('HH.mm')}.`
          : mesin.status === 'maintenance'
            ? 'Sedang perawatan terjadwal.'
            : 'Tidak ada downtime aktif.'}
      </p>
      <p className="angka mb-6 mt-4 flex items-center gap-2 text-kecil">
        {kelas ? (
          <>
            <Lampu tingkat={kelas.tingkat} />
            <span className="font-semibold">OEE {persen(oee.oee)}</span>
            <span className="text-tinta-2">{kelas.label.toLowerCase()}</span>
          </>
        ) : (
          <span className="text-tinta-2">OEE belum dihitung</span>
        )}
      </p>
      <div className="mt-auto flex items-center gap-3 border-t border-garis pt-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-tinta text-putih">
          <Ikon className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold">{mesin.nama}</p>
          <p className="text-kecil text-tinta-2">Kapasitas {mesin.kapasitas_per_jam} pcs/jam</p>
        </div>
      </div>
    </li>
  );
}

function TombolGeser({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-10 items-center justify-center rounded-full border border-garis text-tinta hover:border-tinta disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-garis"
    >
      {children}
    </button>
  );
}
