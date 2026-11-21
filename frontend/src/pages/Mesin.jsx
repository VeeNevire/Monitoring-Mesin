import { useCallback, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import dayjs from 'dayjs';
import { OctagonAlert, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import usePolling from '../hooks/usePolling';
import { getDowntime, getMesin, getOEE, postDowntime, putDowntime, putMesin } from '../services/api';
import KepalaHalaman from '../components/KepalaHalaman';
import StatusMesin from '../components/StatusMesin';
import KartuOEE from '../components/KartuOEE';
import TabelDowntime from '../components/TabelDowntime';
import Kartu from '../components/Kartu';
import BadgeStatus from '../components/BadgeStatus';
import StatusData from '../components/StatusData';
import { Bidang, kolom, tombolGaris, tombolUtama } from '../components/Form';

const INTERVAL = 15000;
const KATEGORI = [
  ['rusak', 'Rusak'],
  ['setup', 'Setup atau ganti dies'],
  ['material', 'Menunggu material'],
  ['istirahat', 'Istirahat'],
  ['lainnya', 'Lainnya'],
];
const sekarang = () => dayjs().format('YYYY-MM-DDTHH:mm:ss');

// README §7.1: StatusMesin + detail per mesin + TabelDowntime.
export default function Mesin() {
  const lokasi = useLocation();
  const { segarkanShell } = useOutletContext() ?? {};
  const mesin = usePolling(getMesin, INTERVAL);
  const oee = usePolling(getOEE, INTERVAL);
  // Pilihan manual berlaku untuk kunjungan ini; tautan dari pencarian/pemberitahuan membawa state.mesinId.
  const [pilihanManual, setPilihanManual] = useState({ kunci: null, id: null });
  const setPilihan = (id) => setPilihanManual({ kunci: lokasi.key, id });
  const [lingkup, setLingkup] = useState('mesin');

  const pilihan = pilihanManual.kunci === lokasi.key ? pilihanManual.id : null;
  const idTerpilih = pilihan ?? lokasi.state?.mesinId ?? mesin.data?.[0]?.id ?? null;
  const terpilih = mesin.data?.find((m) => m.id === idTerpilih) ?? null;

  const muatDowntime = useCallback(
    () => (lingkup === 'mesin' && idTerpilih ? getDowntime({ mesin_id: idTerpilih }) : getDowntime()),
    [lingkup, idTerpilih],
  );
  const downtime = usePolling(muatDowntime, INTERVAL);

  const segarkan = () => {
    mesin.reload();
    downtime.reload();
    segarkanShell?.();
  };

  const tutupDowntime = async (d) => {
    try {
      await putDowntime(d.id, { selesai: sekarang() });
      toast.success('Downtime ditutup', { description: `${d.nama_mesin} tercatat jalan lagi.` });
      segarkan();
    } catch (e) {
      toast.error('Downtime gagal ditutup', { description: e.message });
    }
  };

  const oeeMesin = oee.data?.per_mesin.find((o) => o.mesin_id === idTerpilih);

  return (
    <>
      <KepalaHalaman judul="Mesin" deskripsi="Pilih mesin untuk melihat detail, mengubah status, atau mencatat downtime." />

      <StatusMesin
        index={0}
        daftarMesin={mesin.data}
        oeePerMesin={oee.data?.per_mesin}
        terpilih={idTerpilih}
        onPilih={setPilihan}
        loading={mesin.loading}
        error={mesin.error}
        onCobaLagi={mesin.reload}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Kartu index={1} judul="Detail mesin">
            <StatusData loading={mesin.loading} error={mesin.error} onCobaLagi={mesin.reload} kosong={!terpilih} pesanKosong="Pilih mesin di atas." tinggi="h-64">
              {terpilih && <DetailMesin key={terpilih.id} mesin={terpilih} onBerubah={segarkan} />}
            </StatusData>
          </Kartu>
        </div>
        <div className="lg:col-span-5">
          <KartuOEE
            index={2}
            {...(oeeMesin ?? {})}
            judul={`OEE ${terpilih?.nama ?? 'mesin'}`}
            keterangan="Shift berjalan."
            loading={oee.loading}
            error={oee.error}
            onCobaLagi={oee.reload}
          />
        </div>
        <div className="lg:col-span-12">
          <TabelDowntime
            index={3}
            judul="Riwayat downtime"
            keterangan={lingkup === 'mesin' && terpilih ? terpilih.nama : 'Semua mesin'}
            data={downtime.data}
            onTutup={tutupDowntime}
            loading={downtime.loading}
            error={downtime.error}
            onCobaLagi={downtime.reload}
            aksi={
              <div role="radiogroup" aria-label="Tampilkan downtime" className="flex rounded-full bg-abu p-1 text-kecil font-semibold">
                {[
                  ['mesin', 'Mesin ini'],
                  ['semua', 'Semua mesin'],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={lingkup === v}
                    onClick={() => setLingkup(v)}
                    className={`rounded-full px-3.5 py-1 ${lingkup === v ? 'bg-putih text-tinta shadow-sm' : 'text-tinta-2 hover:text-tinta'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            }
          />
        </div>
      </div>
    </>
  );
}

function DetailMesin({ mesin, onBerubah }) {
  const [form, setForm] = useState({ kategori: 'rusak', mulai: dayjs().format('HH:mm'), alasan: '' });
  const [salah, setSalah] = useState(null);
  const [sibuk, setSibuk] = useState(false);

  const ubahStatus = async (status) => {
    setSibuk(true);
    try {
      await putMesin(mesin.id, { status });
      toast.success(status === 'maintenance' ? 'Maintenance dimulai' : 'Maintenance selesai', { description: mesin.nama });
      onBerubah();
    } catch (e) {
      toast.error('Status gagal diubah', { description: e.message });
    } finally {
      setSibuk(false);
    }
  };

  const catat = async (e) => {
    e.preventDefault();
    if (form.alasan.trim().length < 3) {
      setSalah('Tulis alasan singkat, misalnya "Motor overheat".');
      return;
    }
    setSalah(null);
    setSibuk(true);
    try {
      await postDowntime({ mesin_id: mesin.id, mulai: `${dayjs().format('YYYY-MM-DD')}T${form.mulai}:00`, alasan: form.alasan.trim(), kategori: form.kategori });
      toast.success('Downtime tercatat', { description: `${mesin.nama} ditandai berhenti.` });
      setForm((f) => ({ ...f, alasan: '' }));
      onBerubah();
    } catch (err) {
      toast.error('Downtime gagal dicatat', { description: err.message });
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-h3 font-extrabold font-stretch-semi-expanded">{mesin.nama}</p>
          <div className="mt-2">
            <BadgeStatus status={mesin.status} />
          </div>
        </div>
        {mesin.status === 'jalan' && (
          <button type="button" disabled={sibuk} onClick={() => ubahStatus('maintenance')} className={tombolGaris}>
            <Wrench className="size-3.5" aria-hidden="true" />
            Mulai maintenance
          </button>
        )}
        {mesin.status === 'maintenance' && (
          <button type="button" disabled={sibuk} onClick={() => ubahStatus('jalan')} className={tombolGaris}>
            <Wrench className="size-3.5" aria-hidden="true" />
            Selesai maintenance
          </button>
        )}
      </div>

      <dl className="angka mt-5 grid grid-cols-3 gap-3 border-y border-garis py-4 text-kecil">
        <div>
          <dt className="text-tinta-2">Kode</dt>
          <dd className="m-0 font-semibold">{mesin.kode}</dd>
        </div>
        <div>
          <dt className="text-tinta-2">Lini</dt>
          <dd className="m-0 font-semibold">{mesin.lini}</dd>
        </div>
        <div>
          <dt className="text-tinta-2">Kapasitas</dt>
          <dd className="m-0 font-semibold">{mesin.kapasitas_per_jam} pcs/jam</dd>
        </div>
      </dl>

      {mesin.status === 'berhenti' ? (
        <p className="mt-5 flex items-start gap-3 rounded-2xl bg-andon-merah/[0.06] p-4 text-kecil">
          <OctagonAlert className="mt-0.5 size-4 shrink-0 text-andon-merah" aria-hidden="true" />
          Mesin sedang berhenti. Setelah diperbaiki, tekan Tutup downtime di tabel riwayat supaya mesin tercatat jalan lagi.
        </p>
      ) : (
        <form onSubmit={catat} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
          <p className="font-semibold sm:col-span-2">Catat mesin berhenti</p>
          <Bidang label="Kategori" id="d-kategori">
            <select id="d-kategori" value={form.kategori} onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))} className={kolom}>
              {KATEGORI.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Bidang>
          <Bidang label="Mulai berhenti" id="d-mulai">
            <input id="d-mulai" type="time" value={form.mulai} onChange={(e) => setForm((f) => ({ ...f, mulai: e.target.value }))} className={`${kolom} angka`} />
          </Bidang>
          <Bidang label="Alasan" id="d-alasan" salah={salah} className="sm:col-span-2">
            <input
              id="d-alasan"
              type="text"
              value={form.alasan}
              onChange={(e) => setForm((f) => ({ ...f, alasan: e.target.value }))}
              placeholder="Misalnya: sensor tekanan hidrolik error"
              aria-invalid={!!salah}
              aria-describedby={salah ? 'd-alasan-salah' : undefined}
              className={kolom}
            />
          </Bidang>
          <div className="sm:col-span-2">
            <button type="submit" disabled={sibuk} className={tombolUtama}>
              {sibuk ? 'Mencatat…' : 'Catat downtime'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
