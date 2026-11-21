import { Link } from 'react-router-dom';
import Logo from './Logo';

const MENU = [
  ['#cuplikan', 'Cuplikan'],
  ['#untuk-siapa', 'Untuk siapa'],
  ['#kondisi-lini', 'Kondisi lini'],
  ['#catat-downtime', 'Catat downtime'],
];

export default function Footer() {
  return (
    <footer className="bg-panel text-putih">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center px-4 pb-10 pt-16 text-center sm:px-8">
        <Logo className="h-12 w-7 text-putih" />
        <p className="mt-4 text-lead font-extrabold font-stretch-expanded">Monitoring Produksi</p>
        <p className="mt-1 text-kecil text-putih/60">Status mesin, output, downtime, dan OEE dalam satu layar.</p>
        <Link to="/login" className="mt-8 rounded-full bg-putih px-6 py-3 font-semibold text-tinta hover:bg-sinyal-muda">
          Masuk ke dashboard
        </Link>
        <nav aria-label="Bagian halaman" className="mt-10">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-kecil text-putih/80">
            {MENU.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:text-putih">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-12 text-[0.75rem] text-putih/50">© {new Date().getFullYear()} Monitoring Produksi. Versi awal dengan data contoh.</p>
      </div>
    </footer>
  );
}
