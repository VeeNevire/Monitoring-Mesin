// Tanda: menara andon tiga segmen.
export default function Logo({ className = 'h-7 w-4' }) {
  return (
    <svg viewBox="0 0 16 28" className={className} aria-hidden="true">
      <rect x="1" y="0" width="14" height="7" rx="1.5" className="fill-andon-merah" />
      <rect x="1" y="8" width="14" height="7" rx="1.5" className="fill-andon-kuning" />
      <rect x="1" y="16" width="14" height="7" rx="1.5" className="fill-andon-hijau" />
      <rect x="7" y="23" width="2" height="5" className="fill-current" />
    </svg>
  );
}
