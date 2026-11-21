import { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import usePolling from '../hooks/usePolling';
import { getMesin, getProduksi, getRingkasan, postProduksi } from '../services/api';
import KepalaHalaman from '../components/KepalaHalaman';
import GrafikProduksiVsTarget from '../components/GrafikProduksiVsTarget';
import Kartu from '../components/Kartu';
import StatusData from '../components/StatusData';
import { Bidang, kolom, kolomKecil, tombolUtama } from '../components/Form';
import { angka, persen } from '../utils/oee';
import { SHIFT, jamMenit, shiftSekarang, tanggalPendek } from '../utils/waktu';

const hariIni = () => dayjs().format('YYYY-MM-DD');

// README §7.1: GrafikProduksiVsTarget + tabel log produksi + form input.
export default function Produksi() {
  const [filter, setFilter] = useState({ tanggal: hariIni(), shift: '', mesin_id: '' });
  const ubahFilter = (k) => (e) => setFilter((f) => ({ ...f, [k]: e.target.value }));

  const muatLog = useCallback(() => getProduksi(filter), [filter]);
  const muatRingkasan = useCallback(() => getRingkasan(filter.tanggal, filter.mesin_id), [filter.tanggal, filter.mesin_id]);
  const log = usePolling(muatLog, null);
  const ringkasan = usePolling(muatRingkasan, null);
  const mesin = usePolling(getMesin, null);

  const setelahSimpan = () => {
    log.reload();
    ringkasan.reload();
  };

  const namaMesin = mesin.data?.find((m) => String(m.id) === filter.mesin_id)?.nama;

  return (
    <>
      <KepalaHalaman judul="Produksi" deskripsi="Catat output dan reject per jam, lalu bandingkan dengan target." />

      <div role="search" aria-label="Filter log produksi" className="mb-5 flex flex-wrap items-center gap-2">
        <input type="date" aria-label="Tanggal" value={filter.tanggal} onChange={ubahFilter('tanggal')} className={`${kolomKecil} angka`} />
        <select aria-label="Shift" value={filter.shift} onChange={ubahFilter('shift')} className={kolomKecil}>
          <option value="">Semua shift</option>
          {Object.entries(SHIFT).map(([v, s]) => (
            <option key={v} value={v}>
              {s.label}
            </option>
          ))}
        </select>
        <select aria-label="Mesin" value={filter.mesin_id} onChange={ubahFilter('mesin_id')} className={kolomKecil}>
          <option value="">Semua mesin</option>
          {mesin.data?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nama}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <GrafikProduksiVsTarget
            index={0}
            data={ringkasan.data}
            keterangan={`${namaMesin ?? 'Semua mesin'}, ${tanggalPendek(filter.tanggal)}.`}
            loading={ringkasan.loading}
            error={ringkasan.error}
            onCobaLagi={ringkasan.reload}
          />
        </div>
        <div className="lg:col-span-4">
          <FormProduksi daftarMesin={mesin.data} onTersimpan={setelahSimpan} />
        </div>
        <div className="lg:col-span-12">
          <TabelLog log={log} />
        </div>
      </div>
    </>
  );
}

function FormProduksi({ daftarMesin, onTersimpan }) {
  const awal = () => ({ mesin_id: '', tanggal: hariIni(), jam: dayjs().format('HH:00'), shift: String(shiftSekarang()), jumlah_hasil: '', jumlah_reject: '0' });
  const [form, setForm] = useState(awal);
  const [salah, setSalah] = useState({});
  const [menyimpan, setMenyimpan] = useState(false);
  const ubah = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const kirim = async (e) => {
    e.preventDefault();
    const hasil = Number(form.jumlah_hasil);
    const reject = Number(form.jumlah_reject);
    const s = {};
    if (!form.mesin_id) s.mesin_id = 'Pilih mesin.';
    if (form.jumlah_hasil === '' || !Number.isInteger(hasil) || hasil < 0) s.jumlah_hasil = 'Isi jumlah hasil, bilangan bulat 0 atau lebih.';
    if (!Number.isInteger(reject) || reject < 0) s.jumlah_reject = 'Isi jumlah reject, bilangan bulat 0 atau lebih.';
    else if (!s.jumlah_hasil && reject > hasil) s.jumlah_reject = 'Reject tidak boleh lebih dari jumlah hasil.';
    setSalah(s);
    if (Object.keys(s).length) return;

    setMenyimpan(true);
    try {
      const baru = await postProduksi({
        mesin_id: Number(form.mesin_id),
        waktu: `${form.tanggal}T${form.jam}:00`,
        shift: Number(form.shift),
        jumlah_hasil: hasil,
        jumlah_reject: reject,
      });
      toast.success('Produksi tercatat', { description: `${baru.nama_mesin}: ${hasil} pcs, reject ${reject} pcs.` });
      setForm((f) => ({ ...awal(), mesin_id: f.mesin_id }));
      onTersimpan();
    } catch (err) {
      toast.error('Produksi gagal dicatat', { description: err.message });
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <Kartu index={1} judul="Catat hasil produksi" keterangan="Output dan reject untuk satu jam kerja.">
      <form onSubmit={kirim} noValidate className="grid grid-cols-2 gap-4">
        <Bidang label="Mesin" id="p-mesin" salah={salah.mesin_id} className="col-span-2">
          <select id="p-mesin" value={form.mesin_id} onChange={ubah('mesin_id')} aria-invalid={!!salah.mesin_id} className={kolom}>
            <option value="">{daftarMesin ? 'Pilih mesin' : 'Memuat…'}</option>
            {daftarMesin?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.kode}, {m.nama}
              </option>
            ))}
          </select>
        </Bidang>
        <Bidang label="Tanggal" id="p-tgl">
          <input id="p-tgl" type="date" value={form.tanggal} onChange={ubah('tanggal')} className={`${kolom} angka`} />
        </Bidang>
        <Bidang label="Jam" id="p-jam">
          <input id="p-jam" type="time" step="3600" value={form.jam} onChange={ubah('jam')} className={`${kolom} angka`} />
        </Bidang>
        <Bidang label="Shift" id="p-shift" className="col-span-2">
          <select id="p-shift" value={form.shift} onChange={ubah('shift')} className={kolom}>
            {Object.entries(SHIFT).map(([v, s]) => (
              <option key={v} value={v}>
                {s.label}, {s.jam}
              </option>
            ))}
          </select>
        </Bidang>
        <Bidang label="Jumlah hasil (pcs)" id="p-hasil" salah={salah.jumlah_hasil}>
          <input id="p-hasil" type="number" inputMode="numeric" min="0" value={form.jumlah_hasil} onChange={ubah('jumlah_hasil')} aria-invalid={!!salah.jumlah_hasil} className={`${kolom} angka`} />
        </Bidang>
        <Bidang label="Reject (pcs)" id="p-reject" salah={salah.jumlah_reject}>
          <input id="p-reject" type="number" inputMode="numeric" min="0" value={form.jumlah_reject} onChange={ubah('jumlah_reject')} aria-invalid={!!salah.jumlah_reject} className={`${kolom} angka`} />
        </Bidang>
        <button type="submit" disabled={menyimpan} className={`${tombolUtama} col-span-2 mt-1`}>
          <Plus className="size-4" aria-hidden="true" />
          {menyimpan ? 'Mencatat…' : 'Catat produksi'}
        </button>
      </form>
    </Kartu>
  );
}

function TabelLog({ log }) {
  const data = log.data;
  const total = data?.reduce((a, p) => ({ hasil: a.hasil + p.jumlah_hasil, reject: a.reject + p.jumlah_reject }), { hasil: 0, reject: 0 });

  return (
    <Kartu index={2} judul="Log produksi" keterangan={data ? `${data.length} catatan` : undefined}>
      <StatusData loading={log.loading} error={log.error} onCobaLagi={log.reload} kosong={!data?.length} pesanKosong="Belum ada produksi tercatat untuk filter ini." tinggi="h-40">
        <div className="-mx-5 overflow-x-auto">
          <table className="angka w-full min-w-[36rem] border-collapse text-left text-kecil">
            <thead>
              <tr className="border-b border-garis text-tinta-2">
                <th scope="col" className="py-2.5 pl-5 pr-3 font-medium">Waktu</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Mesin</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Shift</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Hasil</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Reject</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Bagus</th>
                <th scope="col" className="py-2.5 pl-3 pr-5 text-right font-medium">Reject %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {data?.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap py-3 pl-5 pr-3">
                    {tanggalPendek(p.waktu)}, {jamMenit(p.waktu)}
                  </td>
                  <td className="px-3 py-3 font-semibold">{p.nama_mesin}</td>
                  <td className="px-3 py-3">{p.shift}</td>
                  <td className="px-3 py-3 text-right">{angka(p.jumlah_hasil)}</td>
                  <td className="px-3 py-3 text-right">{angka(p.jumlah_reject)}</td>
                  <td className="px-3 py-3 text-right">{angka(p.jumlah_hasil - p.jumlah_reject)}</td>
                  <td className="py-3 pl-3 pr-5 text-right">{p.jumlah_hasil ? persen(p.jumlah_reject / p.jumlah_hasil) : '–'}</td>
                </tr>
              ))}
            </tbody>
            {total && (
              <tfoot>
                <tr className="border-t border-tinta font-semibold">
                  <td colSpan={3} className="py-3 pl-5 pr-3">Total</td>
                  <td className="px-3 py-3 text-right">{angka(total.hasil)}</td>
                  <td className="px-3 py-3 text-right">{angka(total.reject)}</td>
                  <td className="px-3 py-3 text-right">{angka(total.hasil - total.reject)}</td>
                  <td className="py-3 pl-3 pr-5 text-right">{total.hasil ? persen(total.reject / total.hasil) : '–'}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </StatusData>
    </Kartu>
  );
}
