import { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import Lampu from './Lampu';
import StatusData from './StatusData';
import Panel from './Panel';
import { durasiMenit, formatDurasi, jamMenit, tanggalPendek } from '../utils/waktu';

const KATEGORI = { rusak: 'Rusak', setup: 'Setup', material: 'Material', istirahat: 'Istirahat', lainnya: 'Lainnya' };

// README §7.2: mesin, mulai, selesai, durasi, alasan; baris "sedang berhenti" disorot.
// onTutup(baris) opsional: menampilkan tombol untuk mengisi `selesai`.
export default function TabelDowntime({ index = 0, data, onTutup, judul = 'Downtime', keterangan, aksi, batas, loading, error, onCobaLagi }) {
  const [menutup, setMenutup] = useState(null);
  const baris = batas ? data?.slice(0, batas) : data;

  const tutup = async (d) => {
    setMenutup(d.id);
    try {
      await onTutup(d);
    } finally {
      setMenutup(null);
    }
  };

  return (
    <Panel index={index}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight">{judul}</h2>
          {keterangan && <p className="mt-0.5 text-[12px] text-tinta-2">{keterangan}</p>}
        </div>
        {aksi}
      </div>
      <StatusData loading={loading} error={error} onCobaLagi={onCobaLagi} kosong={!data?.length} pesanKosong="Belum ada downtime tercatat." tinggi="h-40">
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-kecil">
            <thead>
              <tr className="border-b border-garis text-tinta-2">
                <th scope="col" className="py-2.5 pl-5 pr-3 font-medium">Mesin</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Mulai</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Selesai</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Durasi</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Alasan</th>
                {onTutup && <th scope="col" className="py-2.5 pl-3 pr-5 text-right font-medium"><span className="sr-only">Aksi</span></th>}
              </tr>
            </thead>
            <tbody className="angka divide-y divide-garis">
              {baris?.map((d) => {
                const aktif = d.selesai === null;
                return (
                  <tr key={d.id} className={aktif ? 'bg-andon-merah/[0.06]' : undefined}>
                    <td className="py-3 pl-5 pr-3">
                      <span className="flex items-center gap-2 font-semibold">
                        {aktif && <Lampu tingkat="merah" />}
                        {d.nama_mesin}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {tanggalPendek(d.mulai)}, {jamMenit(d.mulai)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {aktif ? <span className="font-semibold text-andon-merah">Masih berhenti</span> : jamMenit(d.selesai)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{formatDurasi(durasiMenit(d.mulai, d.selesai))}</td>
                    <td className="px-3 py-3">
                      {d.alasan}
                      <span className="ml-2 rounded-full bg-abu px-2 py-0.5 text-[0.7rem] text-tinta-2">{KATEGORI[d.kategori] ?? d.kategori}</span>
                    </td>
                    {onTutup && (
                      <td className="py-3 pl-3 pr-5 text-right">
                        {aktif && (
                          <button
                            type="button"
                            onClick={() => tutup(d)}
                            disabled={menutup === d.id}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-tinta px-3 py-1.5 font-semibold text-putih hover:bg-panel disabled:opacity-60"
                          >
                            <CircleCheck className="size-3.5" aria-hidden="true" />
                            {menutup === d.id ? 'Menutup…' : 'Tutup downtime'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </StatusData>
    </Panel>
  );
}
