import dayjs from 'dayjs';

// Shift pabrik: 1 = 07.00–15.00, 2 = 15.00–23.00, 3 = 23.00–07.00.
export const SHIFT = {
  1: { label: 'Shift 1', jam: '07.00–15.00' },
  2: { label: 'Shift 2', jam: '15.00–23.00' },
  3: { label: 'Shift 3', jam: '23.00–07.00' },
};

export function shiftSekarang(d = new Date()) {
  const j = d.getHours();
  if (j >= 7 && j < 15) return 1;
  if (j >= 15 && j < 23) return 2;
  return 3;
}

const fmtTanggal = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtTanggalPendek = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });

export const tanggalPanjang = (d) => fmtTanggal.format(dayjs(d).toDate());
export const tanggalPendek = (d) => fmtTanggalPendek.format(dayjs(d).toDate());
export const jamMenit = (d) => dayjs(d).format('HH.mm');

export function durasiMenit(mulai, selesai) {
  return Math.max(0, dayjs(selesai ?? new Date()).diff(dayjs(mulai), 'minute'));
}

export function formatDurasi(menit) {
  if (menit < 60) return `${menit} mnt`;
  const j = Math.floor(menit / 60);
  const m = menit % 60;
  return m ? `${j} j ${m} mnt` : `${j} jam`;
}

// Seberapa jauh shift berjalan: { shift, persen (0..1), sisaMenit }.
export function progresShift(d = new Date()) {
  const shift = shiftSekarang(d);
  const mulaiJam = { 1: 7, 2: 15, 3: 23 }[shift];
  const mulai = new Date(d);
  mulai.setHours(mulaiJam, 0, 0, 0);
  if (mulai > d) mulai.setDate(mulai.getDate() - 1); // shift 3 setelah tengah malam
  const berjalan = Math.max(0, (d - mulai) / 60000);
  return { shift, mulai, mulaiJam, persen: Math.min(1, berjalan / 480), sisaMenit: Math.max(0, Math.round(480 - berjalan)) };
}
