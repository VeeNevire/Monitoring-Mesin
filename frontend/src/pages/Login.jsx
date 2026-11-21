import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '../components/landing/Logo';
import MesinPressSVG from '../components/landing/MesinPressSVG';
import { simpanPeran } from '../utils/sesi';

const PERAN = [
  ['operator', 'Operator'],
  ['manajer', 'Manajer'],
];

const kolom =
  'mt-1.5 w-full rounded-xl border border-garis bg-putih px-3.5 py-3 text-tinta placeholder:text-baja focus:border-sinyal focus:outline-none focus:ring-4 focus:ring-sinyal/15';

// Versi awal: belum ada autentikasi (README §13), kolom boleh dikosongkan.
export default function Login() {
  const navigate = useNavigate();
  const kurangiGerak = useReducedMotion();
  const [peran, setPeran] = useState('operator');
  const [lihatSandi, setLihatSandi] = useState(false);
  const [nama, setNama] = useState('');

  const masuk = (e) => {
    e.preventDefault();
    const label = PERAN.find(([v]) => v === peran)[1];
    simpanPeran(peran);
    toast.success(`Masuk sebagai ${label}`, { description: nama.trim() ? `Halo, ${nama.trim()}.` : 'Akun contoh, belum ada pemeriksaan akun.' });
    navigate('/dashboard');
  };

  return (
    <div className="grid min-h-svh bg-putih text-tinta lg:grid-cols-2">
      {/* Panel mesin */}
      <div className="relative hidden p-4 lg:block">
        <div className="panel-garis relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem_6rem_2rem_2rem] p-10 text-putih">
          <Link to="/" className="flex items-center gap-2.5 self-start">
            <Logo className="h-7 w-4 text-putih" />
            <span className="font-extrabold font-stretch-expanded">Monitoring Produksi</span>
          </Link>
          <div className="mx-auto w-full max-w-[34rem]">
            <MesinPressSVG kode="PRS-01" jalan aktif={null} lampu="hijau" motorPanas={false} counter="393" kurangiGerak={kurangiGerak} pindaiSelesai={false} onPindaiSelesai={() => {}} />
          </div>
          <p className="max-w-[30ch] text-h3 font-bold leading-snug">Setiap shift dimulai dari kondisi mesin yang jelas.</p>
        </div>
      </div>

      {/* Form */}
      <main className="flex flex-col px-4 py-6 sm:px-10">
        <Link to="/" className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-kecil font-medium text-tinta-2 ring-1 ring-garis hover:text-tinta">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Halaman awal
        </Link>

        <motion.div
          initial={kurangiGerak ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto my-auto w-full max-w-[26rem] py-12"
        >
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <Logo />
            <span className="font-extrabold font-stretch-expanded">Monitoring Produksi</span>
          </Link>
          <h1 className="mt-8 text-h2 font-extrabold font-stretch-semi-expanded lg:mt-0">Masuk</h1>
          <p className="mt-2 text-tinta-2">Pilih peran Anda, lalu masuk ke dashboard.</p>

          <form onSubmit={masuk} className="mt-8 space-y-5">
            <fieldset>
              <legend className="text-kecil font-medium">Peran</legend>
              <div role="radiogroup" className="mt-1.5 grid grid-cols-2 rounded-full bg-abu p-1">
                {PERAN.map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={peran === v}
                    onClick={() => setPeran(v)}
                    className={`relative rounded-full py-2 text-kecil font-semibold ${peran === v ? 'text-putih' : 'text-tinta-2 hover:text-tinta'}`}
                  >
                    {peran === v && (
                      <motion.span layoutId="peran-login" className="absolute inset-0 rounded-full bg-tinta" transition={kurangiGerak ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />
                    )}
                    <span className="relative">{l}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block text-kecil font-medium">
              Nama pengguna
              <input type="text" autoComplete="username" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Misalnya: budi.santoso" className={kolom} />
            </label>

            <label className="block text-kecil font-medium">
              Kata sandi
              <span className="relative block">
                <input type={lihatSandi ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" className={`${kolom} pr-12`} />
                <button
                  type="button"
                  onClick={() => setLihatSandi((v) => !v)}
                  aria-label={lihatSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-2 top-1/2 mt-[3px] flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-tinta-2 hover:bg-abu hover:text-tinta"
                >
                  {lihatSandi ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                </button>
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-kecil">
              <input type="checkbox" className="size-4 rounded accent-sinyal" />
              Ingat saya di perangkat ini
            </label>

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-sinyal py-3 font-semibold text-putih shadow-[0_8px_20px_rgb(31_91_216/0.25)] hover:bg-sinyal-tua">
              <LogIn className="size-4" aria-hidden="true" />
              Masuk
            </button>
          </form>

          <p className="mt-6 rounded-2xl bg-abu px-4 py-3 text-kecil text-tinta-2">
            Versi awal: belum ada pemeriksaan akun. Kolom boleh dikosongkan, tekan Masuk untuk lanjut.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
