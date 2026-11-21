// Gaya kolom form yang dipakai bersama.
export const kolom =
  'mt-1.5 w-full rounded-xl border border-garis bg-putih px-3.5 py-2.5 text-tinta placeholder:text-baja focus:border-sinyal focus:outline-none focus:ring-4 focus:ring-sinyal/15 aria-[invalid=true]:border-andon-merah';

export const kolomKecil =
  'rounded-full border border-garis bg-putih px-3.5 py-2 text-kecil text-tinta focus:border-sinyal focus:outline-none focus:ring-4 focus:ring-sinyal/15';

export const tombolUtama =
  'inline-flex items-center justify-center gap-2 rounded-full bg-sinyal px-5 py-2.5 font-semibold text-putih hover:bg-sinyal-tua disabled:opacity-60';

export const tombolGaris =
  'inline-flex items-center justify-center gap-2 rounded-full border border-garis bg-putih px-4 py-2 text-kecil font-semibold text-tinta hover:border-tinta disabled:opacity-50';

export function Bidang({ label, salah, id, className = '', children }) {
  return (
    <label htmlFor={id} className={`block text-kecil font-medium ${className}`}>
      {label}
      {children}
      {salah && (
        <span id={`${id}-salah`} className="mt-1.5 block text-andon-merah">
          {salah}
        </span>
      )}
    </label>
  );
}
