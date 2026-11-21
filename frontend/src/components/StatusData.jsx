import { Inbox, RefreshCw } from 'lucide-react';

// Tiga state wajib komponen data (README §7.3): loading, error, kosong.
export default function StatusData({ loading, error, onCobaLagi, kosong, pesanKosong = 'Belum ada data.', tinggi = 'h-48', children }) {
  if (loading) {
    return (
      <div aria-busy="true" aria-label="Memuat data" className={`${tinggi} animate-pulse rounded-2xl bg-abu`} />
    );
  }
  if (error) {
    return (
      <div role="alert" className={`${tinggi} flex flex-col items-start justify-center rounded-2xl bg-andon-merah/[0.06] p-5`}>
        <p className="font-semibold">Data tidak dapat dimuat.</p>
        <p className="mt-1 text-kecil text-tinta-2">{error}</p>
        {onCobaLagi && (
          <button type="button" onClick={onCobaLagi} className="mt-4 inline-flex items-center gap-2 rounded-full border border-tinta px-4 py-1.5 text-kecil font-semibold hover:bg-tinta hover:text-putih">
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Coba lagi
          </button>
        )}
      </div>
    );
  }
  if (kosong) {
    return (
      <div className={`${tinggi} flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-garis p-5 text-center text-tinta-2`}>
        <Inbox className="size-5" aria-hidden="true" />
        <p className="text-kecil">{pesanKosong}</p>
      </div>
    );
  }
  return children;
}
