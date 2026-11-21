// Simulasi shift untuk landing: 1 tick = 1 menit shift.
import { hitungOEE } from '../../utils/oee';

export const DURASI_TICK_MS = 400;

// Karakter tiap mesin saat jalan (performa & rasio reject), diturunkan dari mock OEE.
const KARAKTER = {
  1: { performa: 0.9, rasioReject: 0.048 },
  2: { performa: 0.88, rasioReject: 0.058 },
};

export const KOMPONEN = [
  { id: 'motor', no: 1, nama: 'Motor penggerak', satuan: '°C', batas: 95 },
  { id: 'hidrolik', no: 2, nama: 'Silinder hidrolik', satuan: 'bar', batas: 160 },
  { id: 'dies', no: 3, nama: 'Dies', satuan: 'pukulan', batas: 25000 },
  { id: 'counter', no: 4, nama: 'Counter output', satuan: 'pcs', batas: null },
];

export function bentukAwal(mesin, sensor) {
  return {
    id: mesin.id,
    kode: mesin.kode,
    nama: mesin.nama,
    lini: mesin.lini,
    kapasitas: mesin.kapasitas_per_jam,
    jalan: sensor.berhenti_sejak_menit === null,
    menit: sensor.menit_shift,
    downtime: sensor.downtime_menit,
    hasil: sensor.jumlah_hasil,
    reject: sensor.jumlah_reject,
    suhu: sensor.suhu_motor,
    tekanan: sensor.tekanan_hidrolik,
    pukulan: sensor.pukulan_dies,
    berhentiSejak: sensor.berhenti_sejak_menit,
    alasan: sensor.alasan_berhenti,
  };
}

const mendekati = (nilai, target, laju) => nilai + (target - nilai) * laju;

function majukan(m, acak) {
  const k = KARAKTER[m.id] ?? { performa: 0.9, rasioReject: 0.05 };
  const goyang = (acak - 0.5) * 2; // -1..1
  const berikut = { ...m, menit: m.menit + 1 };

  if (m.jalan) {
    const tambah = (m.kapasitas / 60) * k.performa;
    berikut.hasil = m.hasil + tambah;
    berikut.reject = m.reject + tambah * k.rasioReject;
    berikut.pukulan = m.pukulan + tambah;
    berikut.suhu = mendekati(m.suhu, 82, 0.06) + goyang * 0.3;
    berikut.tekanan = mendekati(m.tekanan, 140, 0.25) + goyang * 1.5;
  } else {
    berikut.downtime = m.downtime + 1;
    berikut.suhu = mendekati(m.suhu, 45, 0.015);
    berikut.tekanan = mendekati(m.tekanan, 22, 0.25);
  }
  return berikut;
}

export function reducer(state, aksi) {
  switch (aksi.type) {
    case 'muat':
      return { awal: aksi.daftar, mesin: aksi.daftar };
    case 'tick':
      if (!state) return state;
      return {
        ...state,
        mesin: state.mesin.map((m, i) => majukan(m, aksi.acak[i] ?? 0.5)),
      };
    case 'alih': {
      return {
        ...state,
        mesin: state.mesin.map((m) => {
          if (m.id !== aksi.id) return m;
          return m.jalan
            ? { ...m, jalan: false, berhentiSejak: m.menit, alasan: 'Dihentikan dari simulasi' }
            : { ...m, jalan: true, berhentiSejak: null, alasan: null };
        }),
      };
    }
    case 'ulang':
      return { ...state, mesin: state.awal };
    default:
      return state;
  }
}

export function oeeMesin(m) {
  return hitungOEE({
    waktuTerjadwalMenit: m.menit,
    downtimeMenit: m.downtime,
    kapasitasPerJam: m.kapasitas,
    outputAktual: m.hasil,
    reject: m.reject,
  });
}

export function nilaiKomponen(m, id) {
  switch (id) {
    case 'motor':
      return m.suhu;
    case 'hidrolik':
      return m.tekanan;
    case 'dies':
      return m.pukulan;
    case 'counter':
      return m.hasil;
    default:
      return 0;
  }
}

export function tingkatKomponen(m, komponen) {
  if (!komponen.batas) return null;
  const nilai = nilaiKomponen(m, komponen.id);
  if (nilai > komponen.batas) return 'merah';
  if (nilai > komponen.batas * 0.9) return 'kuning';
  return 'hijau';
}
