import { useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import usePolling from '../hooks/usePolling';
import { getDowntime, getMesin, getOEE, getRingkasan } from '../services/api';
import PapanShift from './PapanShift';
import KartuOEE from './KartuOEE';
import StatusMesin from './StatusMesin';
import GrafikProduksiVsTarget from './GrafikProduksiVsTarget';
import TabelDowntime from './TabelDowntime';
import { angka } from '../utils/oee';

const INTERVAL = 15000;
const muatRingkasan = () => getRingkasan(dayjs().format('YYYY-MM-DD'));
const muatDowntime = () => getDowntime();

// README §7.2: mengambil data sendiri, merangkai komponen, auto-refresh.
export default function Dashboard() {
  const { segarkanShell } = useOutletContext() ?? {};
  const oee = usePolling(getOEE, INTERVAL);
  const mesin = usePolling(getMesin, INTERVAL);
  const ringkasan = usePolling(muatRingkasan, INTERVAL);
  const downtime = usePolling(muatDowntime, INTERVAL);
  const semua = [oee, mesin, ringkasan, downtime];
  const memuat = semua.some((s) => s.loading);

  const muatSemua = () => {
    semua.forEach((s) => s.reload());
    segarkanShell?.();
  };

  const total = ringkasan.data?.reduce((s, d) => s + d.aktual, 0) ?? 0;
  const target = ringkasan.data?.reduce((s, d) => s + d.target, 0) ?? 0;
  const tercapai = target > 0 && total >= target;
  const daftar = mesin.data ?? [];

  // Notifikasi saat target tercapai (README §1), sekali per kunjungan halaman.
  const sudahDiberitahu = useRef(false);
  useEffect(() => {
    if (tercapai && !sudahDiberitahu.current) {
      sudahDiberitahu.current = true;
      toast.success('Target hari ini tercapai', { description: `${angka(total)} dari ${angka(target)} pcs.` });
    }
  }, [tercapai, total, target]);

  return (
    <>
      <PapanShift
        total={total}
        target={target}
        oee={oee.data?.keseluruhan.oee}
        jalan={daftar.filter((m) => m.status === 'jalan').length}
        jumlahMesin={daftar.length}
        downtime={downtime.data ?? []}
        memuat={memuat}
        diperbarui={oee.diperbarui}
        onMuatUlang={muatSemua}
      />

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <GrafikProduksiVsTarget index={1} data={ringkasan.data} keterangan="Output per jam semua mesin. Target per jam = kapasitas mesin." loading={ringkasan.loading} error={ringkasan.error} onCobaLagi={ringkasan.reload} />
        </div>
        <div className="xl:col-span-4">
          <KartuOEE index={2} {...(oee.data?.keseluruhan ?? {})} judul="Rincian OEE" keterangan="Semua mesin, shift berjalan." loading={oee.loading} error={oee.error} onCobaLagi={oee.reload} />
        </div>
        <div className="xl:col-span-5">
          <StatusMesin index={3} daftarMesin={mesin.data} oeePerMesin={oee.data?.per_mesin} loading={mesin.loading} error={mesin.error} onCobaLagi={mesin.reload} />
        </div>
        <div className="xl:col-span-7">
          <TabelDowntime
            index={4}
            judul="Downtime terbaru"
            keterangan="Lima catatan terakhir. Baris merah berarti mesin masih berhenti."
            data={downtime.data}
            batas={5}
            loading={downtime.loading}
            error={downtime.error}
            onCobaLagi={downtime.reload}
            aksi={
              <Link to="/mesin" className="shrink-0 text-[12px] font-semibold text-sinyal hover:underline">
                Kelola di halaman Mesin
              </Link>
            }
          />
        </div>
      </div>
    </>
  );
}
