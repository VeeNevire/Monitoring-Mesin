// Versi frontend dari backend/src/services/oeeCalculator.js (README §9.3).
// Di produksi backend yang menghitung; di sini dipakai untuk simulasi landing.
export function hitungOEE({ waktuTerjadwalMenit, downtimeMenit, kapasitasPerJam, outputAktual, reject }) {
  const waktuJalan = Math.max(0, waktuTerjadwalMenit - downtimeMenit);
  const availability = waktuTerjadwalMenit > 0 ? waktuJalan / waktuTerjadwalMenit : 0;

  const outputIdeal = (waktuJalan / 60) * kapasitasPerJam;
  const performance = outputIdeal > 0 ? Math.min(1, outputAktual / outputIdeal) : 0;

  const bagus = outputAktual - reject;
  const quality = outputAktual > 0 ? bagus / outputAktual : 0;

  return { availability, performance, quality, oee: availability * performance * quality };
}

// Klasifikasi tampilan OEE (README §5).
export function klasifikasiOEE(nilai) {
  if (nilai >= 0.85) return { tingkat: 'hijau', label: 'Sangat baik' };
  if (nilai >= 0.6) return { tingkat: 'kuning', label: 'Cukup, perlu perbaikan' };
  return { tingkat: 'merah', label: 'Rendah' };
}

const fmtPersen = new Intl.NumberFormat('id-ID', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const persen = (n) => fmtPersen.format(n);

const fmtAngka = new Intl.NumberFormat('id-ID');
export const angka = (n) => fmtAngka.format(Math.round(n));
