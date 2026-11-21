import { Flame, Hammer, PaintBucket, Cog } from 'lucide-react';
import BadgeStatus from './BadgeStatus';
import Lampu from './Lampu';
import StatusData from './StatusData';
import Panel from './Panel';
import { klasifikasiOEE, persen } from '../utils/oee';

const IKON = { PRS: Hammer, WLD: Flame, PNT: PaintBucket };
const CINCIN = { jalan: 'ring-garis', berhenti: 'ring-andon-merah/40 bg-andon-merah/[0.05]', maintenance: 'ring-andon-kuning/50 bg-andon-kuning/[0.06]' };

// README §7.2: kartu per mesin dengan badge jalan/berhenti/maintenance.
export default function StatusMesin({ index = 0, daftarMesin, oeePerMesin = [], terpilih, onPilih, loading, error, onCobaLagi }) {
  const jumlah = daftarMesin?.reduce((a, m) => ({ ...a, [m.status]: (a[m.status] ?? 0) + 1 }), {}) ?? {};

  return (
    <Panel index={index}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight">Status mesin</h2>
        {daftarMesin?.length > 0 && (
          <p className="angka flex flex-wrap gap-x-4 gap-y-1 text-kecil text-tinta-2">
            <span>{jumlah.jalan ?? 0} jalan</span>
            <span>{jumlah.berhenti ?? 0} berhenti</span>
            <span>{jumlah.maintenance ?? 0} maintenance</span>
          </p>
        )}
      </div>
      <StatusData loading={loading} error={error} onCobaLagi={onCobaLagi} kosong={!daftarMesin?.length} pesanKosong="Belum ada mesin terdaftar." tinggi="h-56">
        <ul className="grid gap-3 sm:grid-cols-2">
          {daftarMesin?.map((m) => {
            const Ikon = IKON[m.kode.slice(0, 3)] ?? Cog;
            const o = oeePerMesin.find((x) => x.mesin_id === m.id);
            const dipilih = terpilih === m.id;
            const isi = (
              <>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tinta text-putih">
                  <Ikon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold">{m.nama}</span>
                    <span className="angka shrink-0 text-kecil text-tinta-2">{m.kode}</span>
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                    <BadgeStatus status={m.status} />
                    <span className="angka flex items-center gap-1.5 text-kecil text-tinta-2">
                      {o ? (
                        <>
                          <Lampu tingkat={klasifikasiOEE(o.oee).tingkat} className="h-2 w-2.5" />
                          OEE {persen(o.oee)}
                        </>
                      ) : (
                        m.lini
                      )}
                    </span>
                  </span>
                </span>
              </>
            );
            const kelas = `flex w-full items-start gap-3 rounded-2xl p-3.5 text-left ring-1 ${CINCIN[m.status] ?? 'ring-garis'}`;
            return (
              <li key={m.id}>
                {onPilih ? (
                  <button type="button" aria-pressed={dipilih} onClick={() => onPilih(m.id)} className={`${kelas} transition-shadow hover:ring-tinta ${dipilih ? 'ring-2 !ring-sinyal' : ''}`}>
                    {isi}
                  </button>
                ) : (
                  <div className={kelas}>{isi}</div>
                )}
              </li>
            );
          })}
        </ul>
      </StatusData>
    </Panel>
  );
}
