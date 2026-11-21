import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatusData from './StatusData';
import Panel from './Panel';
import { angka } from '../utils/oee';

const WARNA = { aktual: '#1f5bd8', target: '#142033', grid: '#dce3eb', sumbu: '#4a5a70' };

// README §7.2: bar aktual vs garis target (Recharts). data[] = { jam, aktual, target }.
export default function GrafikProduksiVsTarget({ index = 0, data, judul = 'Produksi vs target', keterangan, labelX = 'Jam', loading, error, onCobaLagi }) {
  const total = data?.reduce((s, d) => s + d.aktual, 0) ?? 0;
  const target = data?.reduce((s, d) => s + d.target, 0) ?? 0;

  return (
    <Panel index={index}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight">{judul}</h2>
          {keterangan && <p className="mt-0.5 text-[12px] text-tinta-2">{keterangan}</p>}
        </div>
        {data?.length > 0 && (
          <p className="angka text-right text-kecil">
            <span className="text-lead font-extrabold">{angka(total)}</span>
            <span className="text-tinta-2"> dari {angka(target)} pcs</span>
          </p>
        )}
      </div>

      <StatusData loading={loading} error={error} onCobaLagi={onCobaLagi} kosong={!data?.length} pesanKosong="Belum ada output tercatat untuk periode ini." tinggi="h-72">
        <ul className="mb-2 flex gap-5 text-kecil text-tinta-2" aria-label="Keterangan grafik">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-[3px]" style={{ background: WARNA.aktual }} aria-hidden="true" />
            Aktual
          </li>
          <li className="flex items-center gap-2">
            <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: WARNA.target }} aria-hidden="true" />
            Target
          </li>
        </ul>
        <div className="h-72" role="img" aria-label={`${judul}: total ${total} pcs dari target ${target} pcs.`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} barCategoryGap="24%">
              <CartesianGrid vertical={false} stroke={WARNA.grid} />
              <XAxis dataKey="jam" tickLine={false} axisLine={{ stroke: '#c9d4e2' }} tick={{ fill: WARNA.sumbu, fontSize: 12 }} minTickGap={8} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: WARNA.sumbu, fontSize: 12 }} width={48} />
              <Tooltip cursor={{ fill: '#f2f4f7' }} content={<Tip labelX={labelX} />} />
              <Bar dataKey="aktual" name="Aktual" fill={WARNA.aktual} radius={[4, 4, 0, 0]} maxBarSize={44} />
              <Line dataKey="target" name="Target" type="step" stroke={WARNA.target} strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <table className="sr-only">
          <caption>{judul}</caption>
          <thead>
            <tr>
              <th scope="col">{labelX}</th>
              <th scope="col">Aktual</th>
              <th scope="col">Target</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((d) => (
              <tr key={d.jam}>
                <td>{d.jam}</td>
                <td>{d.aktual}</td>
                <td>{d.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatusData>
    </Panel>
  );
}

function Tip({ active, payload, labelX }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const selisih = d.aktual - d.target;
  return (
    <div className="angka rounded-xl bg-tinta px-3.5 py-2.5 text-kecil text-putih shadow-lg">
      <p className="font-semibold">
        {labelX} {d.jam}
      </p>
      <p className="mt-1">Aktual {angka(d.aktual)} pcs</p>
      <p>Target {angka(d.target)} pcs</p>
      <p className="text-putih/75">{selisih >= 0 ? `Lebih ${angka(selisih)}` : `Kurang ${angka(-selisih)}`} pcs</p>
    </div>
  );
}
