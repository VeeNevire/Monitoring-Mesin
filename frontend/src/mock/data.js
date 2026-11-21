// Data palsu. Bentuknya mengikuti kolom di database/schema.sql (README §4 & §8).
import dayjs from 'dayjs';

// Tanggal dibuat relatif ke hari ini supaya filter "hari ini" selalu berisi data.
const HARI = dayjs().format('YYYY-MM-DD');
const jam = (j) => `${HARI}T${j}:00`;

export const mesin = [
  { id: 1, kode: 'PRS-01', nama: 'Mesin Press A', lini: 'Lini 1', status: 'jalan',       kapasitas_per_jam: 100 },
  { id: 2, kode: 'PRS-02', nama: 'Mesin Press B', lini: 'Lini 1', status: 'berhenti',    kapasitas_per_jam: 100 },
  { id: 3, kode: 'WLD-01', nama: 'Mesin Las 1',   lini: 'Lini 2', status: 'jalan',       kapasitas_per_jam: 60  },
  { id: 4, kode: 'PNT-01', nama: 'Mesin Cat 1',   lini: 'Lini 3', status: 'maintenance', kapasitas_per_jam: 80  },
];

export const oee = {
  keseluruhan: { availability: 0.875, performance: 0.90, quality: 0.951, oee: 0.749 },
  per_mesin: [
    { mesin_id: 1, nama: 'Mesin Press A', availability: 0.92, performance: 0.93, quality: 0.97, oee: 0.83 },
    { mesin_id: 2, nama: 'Mesin Press B', availability: 0.70, performance: 0.88, quality: 0.94, oee: 0.58 },
  ],
};

export const produksiRingkasan = [
  { jam: '08:00', aktual: 95,  target: 100 },
  { jam: '09:00', aktual: 102, target: 100 },
  { jam: '10:00', aktual: 88,  target: 100 },
  { jam: '11:00', aktual: 97,  target: 100 },
  { jam: '12:00', aktual: 60,  target: 100 },
  { jam: '13:00', aktual: 105, target: 100 },
];

export const downtime = [
  { id: 1, mesin_id: 2, nama_mesin: 'Mesin Press B', mulai: jam('10:15'), selesai: null,        alasan: 'Motor overheat',    kategori: 'rusak'    },
  { id: 2, mesin_id: 1, nama_mesin: 'Mesin Press A', mulai: jam('08:30'), selesai: jam('08:50'), alasan: 'Ganti dies',        kategori: 'setup'    },
  { id: 3, mesin_id: 3, nama_mesin: 'Mesin Las 1',   mulai: jam('09:40'), selesai: jam('10:05'), alasan: 'Menunggu material', kategori: 'material' },
];

// Tabel produksi_log: output & reject per jam, shift 1.
const LOG_PER_JAM = {
  1: [[95, 3], [102, 4], [88, 5], [97, 4], [60, 2], [105, 5]],
  2: [[91, 5], [84, 6], [42, 3], [0, 0], [0, 0], [0, 0]],
  3: [[55, 1], [58, 2], [31, 1], [57, 2], [54, 1], [59, 2]],
};
export const produksiLog = Object.entries(LOG_PER_JAM).flatMap(([mesinId, baris]) =>
  baris.map(([hasil, reject], i) => {
    const m = mesin.find((x) => x.id === Number(mesinId));
    return {
      id: Number(mesinId) * 100 + i,
      mesin_id: m.id,
      nama_mesin: m.nama,
      waktu: jam(`${String(8 + i).padStart(2, '0')}:00`),
      shift: 1,
      jumlah_hasil: hasil,
      jumlah_reject: reject,
    };
  }),
);

// Snapshot sensor & akumulasi shift untuk mesin press (dipakai simulasi di landing).
// Angka diturunkan dari contoh OEE README §5, di menit ke-300 shift 1.
export const sensor = {
  1: {
    mesin_id: 1,
    menit_shift: 300,
    downtime_menit: 38,
    jumlah_hasil: 393,
    jumlah_reject: 19,
    suhu_motor: 82,
    tekanan_hidrolik: 140,
    pukulan_dies: 18240,
    berhenti_sejak_menit: null,
    alasan_berhenti: null,
  },
  2: {
    mesin_id: 2,
    menit_shift: 300,
    downtime_menit: 90,
    jumlah_hasil: 308,
    jumlah_reject: 18,
    suhu_motor: 103,
    tekanan_hidrolik: 22,
    pukulan_dies: 22110,
    berhenti_sejak_menit: 275,
    alasan_berhenti: 'Motor overheat',
  },
};
