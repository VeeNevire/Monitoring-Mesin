import Lampu from './Lampu';
import { STATUS_MESIN } from './andon';

export default function BadgeStatus({ status }) {
  const s = STATUS_MESIN[status] ?? { tingkat: null, label: status };
  return (
    <span className="inline-flex items-center gap-2 text-kecil font-medium text-tinta">
      <Lampu tingkat={s.tingkat} />
      {s.label}
    </span>
  );
}
