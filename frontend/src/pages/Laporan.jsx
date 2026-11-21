import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import usePolling from '../hooks/usePolling';
import { getLaporan } from '../services/api';
import KepalaHalaman from '../components/KepalaHalaman';
import KartuOEE from '../components/KartuOEE';
import GrafikProduksiVsTarget from '../components/GrafikProduksiVsTarget';
import Kartu from '../components/Kartu';
import StatusData from '../components/StatusData';
import Lampu from '../components/Lampu';
import { kolomKecil, tombolUtama } from '../components/Form';
import { angka, klasifikasiOEE, persen } from '../utils/oee';
import { formatDurasi, tanggalPendek } from '../utils/waktu';

const F = 'YYYY-MM-DD';
const PRESET = [
  ['7 hari', () => [dayjs().subtract(6, 'day'), dayjs()]],
  ['30 hari', () => [dayjs().subtract(29, 'day'), dayjs()]],
  ['Bulan ini', () => [dayjs().startOf('month'), dayjs()]],
];

async function unduhExcel(lap) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const r = lap.ringkasan;
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([
      { Dari: lap.dari, Sampai: lap.sampai, 'Total hasil': r.hasil, Target: r.target, Reject: r.reject, 'Downtime (menit)': r.downtime_menit, Availability: r.availability, Performance: r.performance, Quality: r.quality, OEE: r.oee },
    ]),
    'Ringkasan',
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(lap.per_hari.map((h) => ({ Tanggal: h.tanggal, Hasil: h.hasil, Target: h.target, Reject: h.reject, 'Downtime (menit)': h.downtime_menit, OEE: h.oee }))),
    'Per hari',
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(lap.per_mesin.map((m) => ({ Kode: m.kode, Mesin: m.nama, Hasil: m.hasil, Reject: m.reject, 'Downtime (menit)': m.downtime_menit, OEE: m.oee }))),
    'Per mesin',
  );
  XLSX.writeFile(wb, `laporan-produksi-${lap.dari}_${lap.sampai}.xlsx`);
}

// README §7.1: filter periode + rekap + tombol export.
export default function Laporan() {
  const [periode, setPeriode] = useState({ dari: dayjs().subtract(6, 'day').format(F), sampai: dayjs().format(F) });
  const [tab, setTab] = useState('hari');
  const [mengunduh, setMengunduh] = useState(false);

  const terbalik = periode.dari > periode.sampai;
  const muat = useCallback(
    () => (terbalik ? Promise.reject(new Error('Tanggal "dari" harus sebelum tanggal "sampai".')) : getLaporan(periode.dari, periode.sampai)),
    [periode, terbalik],
  );
  const lap = usePolling(muat, null);
  const d = lap.data;

  const grafik = useMemo(() => d?.per_hari.map((h) => ({ jam: tanggalPendek(h.tanggal), aktual: h.hasil, target: h.target })), [d]);

  const unduh = async () => {
    setMengunduh(true);
    try {
      await unduhExcel(d);
      toast.success('Laporan diunduh', { description: `${tanggalPendek(d.dari)} sampai ${tanggalPendek(d.sampai)}.` });
    } catch (e) {
      toast.error('Laporan gagal diunduh', { description: e.message });
    } finally {
      setMengunduh(false);
    }
  };

  return (
    <>
      <KepalaHalaman
        judul="Laporan"
        deskripsi="Rekap produksi, downtime, dan OEE untuk periode yang dipilih."
        aksi={
          <button type="button" onClick={unduh} disabled={!d || mengunduh || lap.error} className={tombolUtama}>
            <FileSpreadsheet className="size-4" aria-hidden="true" />
            {mengunduh ? 'Menyiapkan…' : 'Unduh Excel'}
          </button>
        }
      />

      <div role="search" aria-label="Periode laporan" className="mb-5 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-kecil text-tinta-2">
          Dari
          <input type="date" value={periode.dari} max={periode.sampai} onChange={(e) => setPeriode((p) => ({ ...p, dari: e.target.value }))} className={`${kolomKecil} angka`} />
        </label>
        <label className="flex items-center gap-2 text-kecil text-tinta-2">
          sampai
          <input type="date" value={periode.sampai} min={periode.dari} onChange={(e) => setPeriode((p) => ({ ...p, sampai: e.target.value }))} className={`${kolomKecil} angka`} />
        </label>
        <span className="mx-1 hidden h-5 w-px bg-garis sm:block" aria-hidden="true" />
        {PRESET.map(([label, rentang]) => {
          const [a, b] = rentang();
          const aktif = periode.dari === a.format(F) && periode.sampai === b.format(F);
          return (
            <button
              key={label}
              type="button"
              aria-pressed={aktif}
              onClick={() => setPeriode({ dari: a.format(F), sampai: b.format(F) })}
              className={`rounded-full px-3.5 py-2 text-kecil font-semibold ring-1 ${aktif ? 'bg-tinta text-putih ring-tinta' : 'bg-putih text-tinta ring-garis hover:ring-tinta'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Kartu index={0} judul="Rekap periode">
            <StatusData loading={lap.loading} error={lap.error} onCobaLagi={lap.reload} kosong={!d?.per_hari.length} tinggi="h-56">
              {d && (
                <dl className="angka divide-y divide-garis">
                  <Baris label="Total hasil" nilai={`${angka(d.ringkasan.hasil)} pcs`} sub={`dari target ${angka(d.ringkasan.target)} pcs`} />
                  <Baris label="Pencapaian target" nilai={persen(d.ringkasan.hasil / d.ringkasan.target)} />
                  <Baris label="Reject" nilai={`${angka(d.ringkasan.reject)} pcs`} sub={persen(d.ringkasan.reject / d.ringkasan.hasil)} />
                  <Baris label="Total downtime" nilai={formatDurasi(d.ringkasan.downtime_menit)} />
                  <Baris label="Jumlah hari" nilai={`${d.per_hari.length} hari`} />
                </dl>
              )}
            </StatusData>
          </Kartu>
        </div>
        <div className="lg:col-span-8">
          <GrafikProduksiVsTarget
            index={1}
            data={grafik}
            judul="Produksi per hari"
            keterangan="Semua mesin, dibandingkan dengan target harian."
            labelX="Tanggal"
            loading={lap.loading}
            error={lap.error}
            onCobaLagi={lap.reload}
          />
        </div>
        <div className="lg:col-span-4">
          <KartuOEE
            index={2}
            {...(d ? { availability: d.ringkasan.availability, performance: d.ringkasan.performance, quality: d.ringkasan.quality, oee: d.ringkasan.oee } : {})}
            judul="OEE rata-rata"
            keterangan="Rata-rata harian dalam periode."
            loading={lap.loading}
            error={lap.error}
            onCobaLagi={lap.reload}
          />
        </div>
        <div className="lg:col-span-8">
          <Kartu
            index={3}
            judul="Rincian"
            aksi={
              <div role="tablist" aria-label="Rincian laporan" className="flex rounded-full bg-abu p-1 text-kecil font-semibold">
                {[
                  ['hari', 'Per hari'],
                  ['mesin', 'Per mesin'],
                ].map(([v, l]) => (
                  <button key={v} type="button" role="tab" aria-selected={tab === v} onClick={() => setTab(v)} className={`rounded-full px-3.5 py-1 ${tab === v ? 'bg-putih text-tinta shadow-sm' : 'text-tinta-2 hover:text-tinta'}`}>
                    {l}
                  </button>
                ))}
              </div>
            }
          >
            <StatusData loading={lap.loading} error={lap.error} onCobaLagi={lap.reload} kosong={!d?.per_hari.length} tinggi="h-56">
              {d && (tab === 'hari' ? <TabelHari data={d.per_hari} /> : <TabelMesin data={d.per_mesin} />)}
            </StatusData>
          </Kartu>
        </div>
      </div>
    </>
  );
}

function Baris({ label, nilai, sub }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-kecil text-tinta-2">{label}</dt>
      <dd className="m-0 text-right">
        <span className="font-bold">{nilai}</span>
        {sub && <span className="block text-[0.75rem] text-tinta-2">{sub}</span>}
      </dd>
    </div>
  );
}

function SelOEE({ nilai }) {
  return (
    <span className="inline-flex items-center justify-end gap-2">
      <Lampu tingkat={klasifikasiOEE(nilai).tingkat} className="h-2 w-2.5" />
      {persen(nilai)}
    </span>
  );
}

const th = 'px-3 py-2.5 text-right font-medium';
const td = 'px-3 py-2.5 text-right';

function TabelHari({ data }) {
  return (
    <div className="-mx-5 max-h-[26rem] overflow-auto">
      <table className="angka w-full min-w-[34rem] border-collapse text-left text-kecil">
        <thead className="sticky top-0 bg-putih">
          <tr className="border-b border-garis text-tinta-2">
            <th scope="col" className="py-2.5 pl-5 pr-3 font-medium">Tanggal</th>
            <th scope="col" className={th}>Hasil</th>
            <th scope="col" className={th}>Target</th>
            <th scope="col" className={th}>Reject</th>
            <th scope="col" className={th}>Downtime</th>
            <th scope="col" className={`${th} pr-5`}>OEE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {data.map((h) => (
            <tr key={h.tanggal}>
              <td className="whitespace-nowrap py-2.5 pl-5 pr-3">{tanggalPendek(h.tanggal)}</td>
              <td className={`${td} font-semibold`}>{angka(h.hasil)}</td>
              <td className={td}>{angka(h.target)}</td>
              <td className={td}>{angka(h.reject)}</td>
              <td className={`${td} whitespace-nowrap`}>{formatDurasi(h.downtime_menit)}</td>
              <td className={`${td} pr-5`}>
                <SelOEE nilai={h.oee} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabelMesin({ data }) {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="angka w-full min-w-[34rem] border-collapse text-left text-kecil">
        <thead>
          <tr className="border-b border-garis text-tinta-2">
            <th scope="col" className="py-2.5 pl-5 pr-3 font-medium">Mesin</th>
            <th scope="col" className={th}>Hasil</th>
            <th scope="col" className={th}>Reject</th>
            <th scope="col" className={th}>Downtime</th>
            <th scope="col" className={`${th} pr-5`}>OEE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {data.map((m) => (
            <tr key={m.mesin_id}>
              <td className="py-2.5 pl-5 pr-3">
                <span className="font-semibold">{m.nama}</span>
                <span className="block text-[0.75rem] text-tinta-2">{m.kode}</span>
              </td>
              <td className={`${td} font-semibold`}>{angka(m.hasil)}</td>
              <td className={td}>{angka(m.reject)}</td>
              <td className={`${td} whitespace-nowrap`}>{formatDurasi(m.downtime_menit)}</td>
              <td className={`${td} pr-5`}>
                <SelOEE nilai={m.oee} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
