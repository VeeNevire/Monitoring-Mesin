import Panel, { KepalaPanel } from './Panel';

// Panel dengan judul opsional.
export default function Kartu({ judul, keterangan, aksi, className = '', index = 0, children }) {
  return (
    <Panel index={index} className={className}>
      {(judul || aksi) && <KepalaPanel judul={judul} keterangan={keterangan} aksi={aksi} />}
      {children}
    </Panel>
  );
}
