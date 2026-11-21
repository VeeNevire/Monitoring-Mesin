import { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Clock, OctagonAlert, Undo2 } from 'lucide-react';
import usePolling from '../../hooks/usePolling';
import { getMesin } from '../../services/api';

const KATEGORI = [
  ['rusak', 'Rusak'],
  ['setup', 'Setup atau ganti dies'],
  ['material', 'Menunggu material'],
  ['istirahat', 'Istirahat'],
  ['lainnya', 'Lainnya'],
];

const kolom =
  'mt-1.5 w-full rounded-xl border border-garis bg-putih px-3.5 py-2.5 text-tinta placeholder:text-baja focus:border-sinyal focus:outline-none focus:ring-4 focus:ring-sinyal/15';

export default function CatatDowntime() {
  const { data: mesin } = usePolling(getMesin, 60000);
  const [form, setForm] = useState({ mesinId: '', kategori: 'rusak', mulai: dayjs().format('HH:mm'), alasan: '' });
  const [salah, setSalah] = useState({});

  const ubah = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const kirim = (e) => {
    e.preventDefault();
    const s = {};
    if (!form.mesinId) s.mesinId = 'Pilih mesin yang berhenti.';
    if (form.alasan.trim().length < 3) s.alasan = 'Tulis alasan singkat, misalnya "Motor overheat".';
    setSalah(s);
    if (Object.keys(s).length) return;

    const nama = mesin.find((m) => String(m.id) === form.mesinId)?.nama;
    toast.success('Downtime tercatat', {
      description: `${nama} berhenti sejak pukul ${form.mulai.replace(':', '.')}. Ini contoh, data belum dikirim ke server.`,
    });
    setForm((f) => ({ ...f, alasan: '' }));
  };

  return (
    <section id="catat-downtime" aria-labelledby="judul-catat" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32">
      <h2 id="judul-catat" className="text-h2 font-extrabold font-stretch-semi-expanded">
        Catat mesin berhenti
      </h2>
      <p className="mt-2 max-w-prose text-tinta-2">Begini operator mencatat downtime dari tablet. Coba isi formnya.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-10">
        <aside className="relative overflow-hidden rounded-kartu bg-abu p-7 lg:col-span-5">
          <ul className="relative space-y-6">
            <Info ikon={Clock} judul="Shift berjalan">
              Shift 1, pukul 07.00 sampai 15.00.
            </Info>
            <Info ikon={OctagonAlert} judul="Sedang berhenti">
              Mesin Press B sejak pukul 10.15 karena motor overheat.
            </Info>
            <Info ikon={Undo2} judul="Setelah mesin jalan lagi">
              Tutup catatan downtime dari halaman Mesin supaya durasinya dihitung ke OEE.
            </Info>
          </ul>
          <svg aria-hidden="true" viewBox="0 0 16 28" className="pointer-events-none absolute -bottom-10 -right-6 h-56 w-auto" fill="none" strokeWidth="0.25">
            {[0.5, 8.5, 16.5].map((y) => (
              <rect key={y} x="1" y={y} width="14" height="7" rx="1.5" className="stroke-garis" />
            ))}
          </svg>
        </aside>

        <form onSubmit={kirim} noValidate className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          <label className="block text-kecil font-medium">
            Mesin
            <select value={form.mesinId} onChange={ubah('mesinId')} aria-invalid={!!salah.mesinId} aria-describedby={salah.mesinId ? 'salah-mesin' : undefined} className={kolom}>
              <option value="">{mesin ? 'Pilih mesin' : 'Memuat mesin…'}</option>
              {mesin?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.kode}, {m.nama}
                </option>
              ))}
            </select>
            {salah.mesinId && (
              <span id="salah-mesin" className="mt-1.5 block text-andon-merah">
                {salah.mesinId}
              </span>
            )}
          </label>
          <label className="block text-kecil font-medium">
            Kategori
            <select value={form.kategori} onChange={ubah('kategori')} className={kolom}>
              {KATEGORI.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-kecil font-medium sm:col-span-2">
            Mulai berhenti
            <input type="time" value={form.mulai} onChange={ubah('mulai')} className={`${kolom} angka sm:max-w-48`} />
          </label>
          <label className="block text-kecil font-medium sm:col-span-2">
            Alasan
            <textarea
              rows={4}
              value={form.alasan}
              onChange={ubah('alasan')}
              placeholder="Misalnya: sensor tekanan hidrolik error"
              aria-invalid={!!salah.alasan}
              aria-describedby={salah.alasan ? 'salah-alasan' : undefined}
              className={`${kolom} resize-y`}
            />
            {salah.alasan && (
              <span id="salah-alasan" className="mt-1.5 block text-andon-merah">
                {salah.alasan}
              </span>
            )}
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-full bg-sinyal px-6 py-3 font-semibold text-putih shadow-[0_8px_20px_rgb(31_91_216/0.25)] hover:bg-sinyal-tua">
              Catat downtime
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Info({ ikon: Ikon, judul, children }) {
  return (
    <li className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-putih text-tinta ring-1 ring-garis">
        <Ikon className="size-4.5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold">{judul}</p>
        <p className="mt-0.5 text-kecil text-tinta-2">{children}</p>
      </div>
    </li>
  );
}
