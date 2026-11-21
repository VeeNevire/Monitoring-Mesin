import { useState } from 'react';
import dayjs from 'dayjs';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import usePolling from '../../hooks/usePolling';
import { getDowntime, getOEE, getRingkasan } from '../../services/api';
import { angka } from '../../utils/oee';

const muatRingkasan = () => getRingkasan(dayjs().format('YYYY-MM-DD'), 1);
const WARNA_BATANG = '#1f5bd8';
const fmtTanggal = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

async function unduhRekap(produksi) {
  const [XLSX, downtime, oee] = await Promise.all([import('xlsx'), getDowntime(), getOEE()]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(produksi.map((p) => ({ Jam: p.jam, Aktual: p.aktual, Target: p.target, Selisih: p.aktual - p.target }))),
    'Produksi per jam',
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      downtime.map((d) => ({
        Mesin: d.nama_mesin,
        Mulai: dayjs(d.mulai).format('DD-MM-YYYY HH:mm'),
        Selesai: d.selesai ? dayjs(d.selesai).format('DD-MM-YYYY HH:mm') : 'Masih berhenti',
        'Durasi (menit)': d.selesai ? dayjs(d.selesai).diff(dayjs(d.mulai), 'minute') : '',
        Alasan: d.alasan,
        Kategori: d.kategori,
      })),
    ),
    'Downtime',
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      oee.per_mesin.map((o) => ({
        Mesin: o.nama,
        Availability: o.availability,
        Performance: o.performance,
        Quality: o.quality,
        OEE: o.oee,
      })),
    ),
    'OEE per mesin',
  );
  XLSX.writeFile(wb, `rekap-contoh-${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

export default function CuplikanDashboard() {
  const { data, loading, error, reload } = usePolling(muatRingkasan, 30000);
  const [tampilan, setTampilan] = useState('grafik');
  const [mengunduh, setMengunduh] = useState(false);

  const unduh = async () => {
    setMengunduh(true);
    try {
      await unduhRekap(data);
      toast.success('Rekap diunduh', { description: 'Berisi produksi per jam, downtime, dan OEE per mesin dari data contoh.' });
    } catch (e) {
      toast.error('Rekap gagal diunduh', { description: e.message });
    } finally {
      setMengunduh(false);
    }
  };

  return (
    <section id="cuplikan" aria-labelledby="judul-cuplikan" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 pt-24 sm:px-8 lg:pt-28">
      <h2 id="judul-cuplikan" className="text-h2 font-extrabold font-stretch-semi-expanded">
        Cuplikan dashboard
      </h2>
      <p className="mt-2 max-w-prose text-tinta-2">Output per jam dibandingkan dengan target, persis seperti di halaman Beranda.</p>

      <div className="mt-8 overflow-hidden rounded-[2rem] bg-panel p-2 sm:p-3">
        <div className="rounded-[1.6rem] bg-putih p-5 sm:p-8">
          {loading && !data ? (
            <div aria-busy="true" aria-label="Memuat grafik" className="h-80 animate-pulse rounded-2xl bg-abu" />
          ) : error && !data ? (
            <div className="py-10">
              <p className="font-semibold">Data produksi tidak dapat dimuat.</p>
              <p className="mt-1 text-kecil text-tinta-2">{error}</p>
              <button type="button" onClick={reload} className="mt-4 rounded-full border border-tinta px-4 py-2 font-semibold hover:bg-tinta hover:text-putih">
                Muat ulang
              </button>
            </div>
          ) : data.length === 0 ? (
            <p className="py-10 text-tinta-2">Belum ada output tercatat hari ini. Data muncul setelah operator mencatat jam pertama.</p>
          ) : (
            <Isi data={data} tampilan={tampilan} setTampilan={setTampilan} onUnduh={unduh} mengunduh={mengunduh} />
          )}
        </div>
      </div>
    </section>
  );
}

function Isi({ data, tampilan, setTampilan, onUnduh, mengunduh }) {
  const total = data.reduce((s, d) => s + d.aktual, 0);
  const target = data.reduce((s, d) => s + d.target, 0);
  const terendah = data.reduce((a, b) => (b.aktual < a.aktual ? b : a));
  const tercapai = data.filter((d) => d.aktual >= d.target).length;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <p className="text-kecil text-tinta-2">{fmtTanggal.format(new Date())}, Mesin Press A</p>
        <p className="angka mt-4 text-[2.6rem] font-extrabold leading-none font-stretch-semi-expanded">{angka(total)}</p>
        <p className="mt-1 text-tinta-2">pcs dari target {angka(target)} pcs</p>

        <dl className="mt-8 divide-y divide-garis border-y border-garis text-kecil">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-tinta-2">Selisih dari target</dt>
            <dd className="angka m-0 font-semibold">{angka(total - target)} pcs</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-tinta-2">Jam yang capai target</dt>
            <dd className="angka m-0 font-semibold">
              {tercapai} dari {data.length}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-tinta-2">Jam terendah</dt>
            <dd className="angka m-0 font-semibold">
              {terendah.jam.replace(':', '.')}, {terendah.aktual} pcs
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onUnduh}
          disabled={mengunduh}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-sinyal px-5 py-2.5 text-kecil font-semibold text-putih hover:bg-sinyal-tua disabled:opacity-60"
        >
          <Download className="size-4" aria-hidden="true" />
          {mengunduh ? 'Menyiapkan rekap…' : 'Unduh contoh rekap (.xlsx)'}
        </button>
      </div>

      <div className="min-w-0 lg:col-span-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">Output per jam</h3>
          <div role="tablist" aria-label="Tampilan data" className="flex rounded-full bg-abu p-1 text-kecil font-semibold">
            {['grafik', 'tabel'].map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tampilan === t}
                onClick={() => setTampilan(t)}
                className={`rounded-full px-3.5 py-1 capitalize ${tampilan === t ? 'bg-putih text-tinta shadow-sm' : 'text-tinta-2 hover:text-tinta'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tampilan === 'grafik' ? (
          <div className="mt-4 h-72 sm:h-80" role="img" aria-label={`Grafik batang output per jam. Total ${total} pcs dari target ${target} pcs.`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 8, bottom: 0, left: -18 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="#dce3eb" />
                <XAxis dataKey="jam" tickLine={false} axisLine={{ stroke: '#c9d4e2' }} tick={{ fill: '#4a5a70', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4a5a70', fontSize: 12 }} domain={[0, 120]} ticks={[0, 40, 80, 120]} />
                <Tooltip cursor={{ fill: '#f2f4f7' }} content={<TooltipJam />} />
                <ReferenceLine
                  y={100}
                  stroke="#142033"
                  strokeDasharray="5 4"
                  label={{ value: 'Target 100 pcs/jam', position: 'insideTopRight', fill: '#142033', fontSize: 12, dy: -18 }}
                />
                <Bar dataKey="aktual" name="Aktual" fill={WARNA_BATANG} radius={[4, 4, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <table className="mt-4 w-full text-left text-kecil">
            <thead>
              <tr className="border-b border-garis text-tinta-2">
                <th scope="col" className="py-2 font-medium">Jam</th>
                <th scope="col" className="py-2 text-right font-medium">Aktual</th>
                <th scope="col" className="py-2 text-right font-medium">Target</th>
                <th scope="col" className="py-2 text-right font-medium">Selisih</th>
              </tr>
            </thead>
            <tbody className="angka divide-y divide-garis">
              {data.map((d) => (
                <tr key={d.jam}>
                  <td className="py-2.5">{d.jam.replace(':', '.')}</td>
                  <td className="py-2.5 text-right font-semibold">{d.aktual}</td>
                  <td className="py-2.5 text-right">{d.target}</td>
                  <td className="py-2.5 text-right">{d.aktual - d.target > 0 ? `+${d.aktual - d.target}` : d.aktual - d.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TooltipJam({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const selisih = d.aktual - d.target;
  return (
    <div className="angka rounded-xl bg-tinta px-3.5 py-2.5 text-kecil text-putih shadow-lg">
      <p className="font-semibold">Pukul {d.jam.replace(':', '.')}</p>
      <p className="mt-1 flex items-center gap-2">
        <span className="size-2.5 rounded-[3px]" style={{ background: WARNA_BATANG }} aria-hidden="true" />
        Aktual {d.aktual} pcs
      </p>
      <p className="text-putih/75">
        Target {d.target} pcs, {selisih >= 0 ? `lebih ${selisih}` : `kurang ${-selisih}`}
      </p>
    </div>
  );
}
