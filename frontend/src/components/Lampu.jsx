import { LAMPU } from './andon';

// Lampu andon kecil berbentuk segmen menara sinyal.
export default function Lampu({ tingkat, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2.5 w-3.5 shrink-0 rounded-[2px] ${LAMPU[tingkat] ?? 'bg-baja'} ${className}`}
    />
  );
}
