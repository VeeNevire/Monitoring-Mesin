import { useCallback, useEffect, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import MesinPressSVG from './MesinPressSVG';
import TitikInspeksi from './TitikInspeksi';
import KartuKendali from './KartuKendali';
import { reducer, bentukAwal, DURASI_TICK_MS, KOMPONEN, tingkatKomponen } from './simulasi';
import { getMesin, getSensor } from '../../services/api';
import { angka } from '../../utils/oee';

const ID_PRESS = [1, 2];
const MODUL = ['Status mesin', 'Output dan reject', 'Downtime', 'Target shift', 'OEE', 'Laporan'];
// Panel navy mulai di 19% tinggi gambar, sehingga motor & menara andon menembus keluar.
const AWAL_PANEL = 0.19;

async function muatPress() {
  const [daftarMesin, ...sensor] = await Promise.all([getMesin(), ...ID_PRESS.map(getSensor)]);
  return ID_PRESS.map((id, i) => bentukAwal(daftarMesin.find((m) => m.id === id), sensor[i]));
}

export default function HeroInspeksi() {
  const kurangiGerak = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, null);
  const [error, setError] = useState(null);
  const [idMesin, setIdMesin] = useState(1);
  const [aktif, setAktif] = useState(null);
  const [pindaiSelesai, setPindaiSelesai] = useState(false);

  const muat = useCallback(async () => {
    setError(null);
    try {
      dispatch({ type: 'muat', daftar: await muatPress() });
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- memuat data awal sekali
    muat();
  }, [muat]);

  const siap = state !== null;
  useEffect(() => {
    if (!siap) return;
    const t = setInterval(() => dispatch({ type: 'tick', acak: ID_PRESS.map(() => Math.random()) }), DURASI_TICK_MS);
    return () => clearInterval(t);
  }, [siap]);

  const mesin = state?.mesin.find((m) => m.id === idMesin) ?? null;
  const tampilTitik = pindaiSelesai || kurangiGerak;
  const selesaiPindai = () => {
    setPindaiSelesai(true);
    setAktif((a) => a ?? 'motor'); // buka satu keterangan sebagai petunjuk interaksi
  };

  const masuk = (urutan) =>
    kurangiGerak
      ? {}
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: urutan * 0.08, ease: [0.22, 1, 0.36, 1] } };

  return (
    <section className="mx-auto grid max-w-[1240px] items-center gap-x-10 gap-y-12 px-4 pb-16 pt-8 sm:px-8 lg:grid-cols-12 lg:pb-24 lg:pt-12">
      <div className="lg:col-span-5">
        <motion.h1
          {...masuk(0)}
          className="text-[clamp(2.4rem,1.6rem+3vw,3.6rem)] font-extrabold leading-[1.03] tracking-[-0.02em] font-stretch-semi-expanded text-balance"
        >
          Lihat kondisi setiap mesin sebelum target meleset.
        </motion.h1>
        <motion.p {...masuk(1)} className="mt-5 max-w-[32rem] text-lead text-tinta-2">
          Status mesin, output, reject, dan downtime tiap shift tercatat di satu tempat, lengkap dengan OEE-nya. Klik
          titik bernomor pada mesin, atau hentikan mesinnya dan lihat OEE turun.
        </motion.p>
        <motion.div {...masuk(2)} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to="/login" className="rounded-full bg-sinyal px-6 py-3 font-semibold text-putih shadow-[0_8px_20px_rgb(31_91_216/0.3)] hover:bg-sinyal-tua">
            Masuk ke dashboard
          </Link>
          <a href="#kondisi-lini" className="font-semibold text-tinta underline decoration-baja underline-offset-4 hover:decoration-tinta">
            Lihat kondisi lini
          </a>
        </motion.div>
        <motion.ul {...masuk(3)} aria-label="Yang dipantau" className="mt-10 flex max-w-[30rem] flex-wrap gap-2">
          {MODUL.map((m) => (
            <li key={m} className="rounded-full border border-garis px-3.5 py-1.5 text-kecil text-tinta-2">
              {m}
            </li>
          ))}
        </motion.ul>
      </div>

      <div className="relative lg:col-span-7">
        {/* --bawah: ruang panel di bawah gambar; di desktop tempat kartu kendali */}
        <div className="relative pb-[var(--bawah)] [--bawah:3rem] lg:[--bawah:10rem]">
          <motion.div
            aria-hidden="true"
            initial={kurangiGerak ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="panel-garis absolute inset-x-0 bottom-0 rounded-[2rem_6rem_2rem_6rem] sm:rounded-[2.5rem_8rem_2.5rem_8rem]"
            style={{ top: `calc((100% - var(--bawah)) * ${AWAL_PANEL})` }}
          />
          <div className="relative px-1 sm:px-4">
          <figure className="relative m-0" aria-label={mesin ? `Gambar ${mesin.nama}, ${mesin.jalan ? 'sedang jalan' : 'berhenti'}` : 'Gambar mesin press'}>
            <MesinPressSVG
              kode={mesin?.kode ?? 'PRS-01'}
              jalan={mesin ? mesin.jalan : true}
              aktif={aktif}
              lampu={mesin && !mesin.jalan ? 'merah' : 'hijau'}
              motorPanas={mesin ? tingkatKomponen(mesin, KOMPONEN[0]) === 'merah' : false}
              counter={mesin ? angka(mesin.hasil) : '—'}
              kurangiGerak={kurangiGerak}
              pindaiSelesai={tampilTitik}
              onPindaiSelesai={selesaiPindai}
            />
            <TitikInspeksi mesin={mesin} aktif={aktif} onPilih={setAktif} tampil={tampilTitik} kurangiGerak={kurangiGerak} />
          </figure>
          </div>
        </div>

          <KartuKendali
            className="relative z-30 mx-3 -mt-8 sm:mx-10 lg:absolute lg:-bottom-6 lg:left-[-2.5rem] lg:mx-0 lg:mt-0 lg:w-[21rem]"
            daftar={state?.mesin ?? []}
            mesin={mesin}
            onPilihMesin={setIdMesin}
            onAlih={(id) => dispatch({ type: 'alih', id })}
            onUlang={() => dispatch({ type: 'ulang' })}
            error={error}
            onMuatUlang={muat}
          />
      </div>
    </section>
  );
}
