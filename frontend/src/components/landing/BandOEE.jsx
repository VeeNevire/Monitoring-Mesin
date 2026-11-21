const KOMPONEN_OEE = ['Availability', 'Performance', 'Quality'];

export default function BandOEE() {
  return (
    <section aria-label="Tentang OEE" className="mx-auto max-w-[1320px] px-4 sm:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-abu px-6 py-14 text-center sm:rounded-full sm:px-16 sm:py-16">
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[18rem] font-black leading-none text-garis/70">
          ×
        </span>
        <p className="relative mx-auto max-w-[38ch] text-lead font-medium italic text-tinta sm:text-h3">
          Mesin yang jalan belum tentu produktif. OEE menunjukkan berapa bagian dari waktu shift yang benar-benar
          menghasilkan produk bagus.
        </p>
        <p className="relative mt-7 flex flex-wrap items-center justify-center gap-2 text-kecil font-semibold">
          {KOMPONEN_OEE.map((k, i) => (
            <span key={k} className="flex items-center gap-2">
              <span className="rounded-full bg-putih px-3.5 py-1.5 ring-1 ring-garis">{k}</span>
              <span aria-hidden="true" className="text-tinta-2">
                {i < KOMPONEN_OEE.length - 1 ? '×' : '='}
              </span>
            </span>
          ))}
          <span className="rounded-full bg-tinta px-3.5 py-1.5 text-putih">OEE</span>
        </p>
      </div>
    </section>
  );
}
