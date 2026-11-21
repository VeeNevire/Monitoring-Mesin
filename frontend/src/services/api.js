// Satu-satunya pintu data. Ganti USE_MOCK ke false saat backend siap; komponen tidak perlu diubah.
import dayjs from 'dayjs';
import { mesin, downtime, oee, sensor, produksiLog } from '../mock/data';

const USE_MOCK = true;
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// "Database" mock di memori supaya POST/PUT terlihat efeknya sampai halaman dimuat ulang.
const db = {
  mesin: structuredClone(mesin),
  downtime: structuredClone(downtime),
  produksiLog: structuredClone(produksiLog),
};
const nextId = (arr) => Math.max(0, ...arr.map((x) => x.id)) + 1;

async function get(path, mockData) {
  if (USE_MOCK) {
    await delay();
    return structuredClone(typeof mockData === 'function' ? mockData() : mockData);
  }
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Gagal memuat ${path} (status ${res.status})`);
  return res.json();
}

async function kirim(method, path, body, mockFn) {
  if (USE_MOCK) {
    await delay(300);
    return structuredClone(mockFn());
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gagal menyimpan ke ${path} (status ${res.status})`);
  return res.json();
}

const query = (obj) => new URLSearchParams(Object.entries(obj).filter(([, v]) => v !== '' && v != null)).toString();

// --- Mesin ---
export const getMesin = () => get('/mesin', () => db.mesin);
export const getSensor = (id) => get(`/mesin/${id}/sensor`, sensor[id]);
export const putMesin = (id, data) =>
  kirim('PUT', `/mesin/${id}`, data, () => {
    const m = db.mesin.find((x) => x.id === id);
    Object.assign(m, data);
    return m;
  });

// --- OEE ---
export const getOEE = () => get('/oee', oee);

// --- Produksi ---
// Aktual vs target per jam, dihitung dari produksi_log. Target per jam = kapasitas mesin.
export const getRingkasan = (tgl, mesinId) =>
  get(`/produksi/ringkasan?${query({ tanggal: tgl, mesin_id: mesinId })}`, () => {
    const perJam = new Map();
    db.produksiLog
      .filter((p) => p.waktu.startsWith(tgl) && (!mesinId || p.mesin_id === Number(mesinId)))
      .forEach((p) => {
        const jam = `${p.waktu.slice(11, 13)}:00`;
        const kap = db.mesin.find((m) => m.id === p.mesin_id)?.kapasitas_per_jam ?? 0;
        const b = perJam.get(jam) ?? { jam, aktual: 0, target: 0 };
        b.aktual += p.jumlah_hasil;
        b.target += kap;
        perJam.set(jam, b);
      });
    return [...perJam.values()].sort((a, b) => a.jam.localeCompare(b.jam));
  });
export const getProduksi = (filter = {}) =>
  get(`/produksi?${query(filter)}`, () =>
    db.produksiLog
      .filter((p) => !filter.tanggal || p.waktu.startsWith(filter.tanggal))
      .filter((p) => !filter.shift || p.shift === Number(filter.shift))
      .filter((p) => !filter.mesin_id || p.mesin_id === Number(filter.mesin_id))
      .sort((a, b) => b.waktu.localeCompare(a.waktu)),
  );
export const postProduksi = (data) =>
  kirim('POST', '/produksi', data, () => {
    const m = db.mesin.find((x) => x.id === Number(data.mesin_id));
    const baru = { ...data, id: nextId(db.produksiLog), mesin_id: m.id, nama_mesin: m.nama };
    db.produksiLog.push(baru);
    return baru;
  });

// --- Downtime ---
export const getDowntime = (filter = {}) =>
  get(`/downtime?${query(filter)}`, () =>
    db.downtime
      .filter((d) => !filter.mesin_id || d.mesin_id === Number(filter.mesin_id))
      .sort((a, b) => b.mulai.localeCompare(a.mulai)),
  );
// Mencatat downtime sekaligus menandai mesin "berhenti".
export const postDowntime = (data) =>
  kirim('POST', '/downtime', data, () => {
    const m = db.mesin.find((x) => x.id === Number(data.mesin_id));
    const baru = { selesai: null, ...data, id: nextId(db.downtime), mesin_id: m.id, nama_mesin: m.nama };
    db.downtime.push(baru);
    m.status = 'berhenti';
    return baru;
  });
// Menutup downtime (mengisi `selesai`) dan mengembalikan mesin ke "jalan".
export const putDowntime = (id, data) =>
  kirim('PUT', `/downtime/${id}`, data, () => {
    const d = db.downtime.find((x) => x.id === id);
    Object.assign(d, data);
    const m = db.mesin.find((x) => x.id === d.mesin_id);
    if (m && !db.downtime.some((x) => x.mesin_id === m.id && x.selesai === null)) m.status = 'jalan';
    return d;
  });

// --- Laporan ---
// Angka acak yang stabil untuk tanggal yang sama.
function acak(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buatLaporan(dari, sampai) {
  const awal = dayjs(dari);
  const akhir = dayjs(sampai);
  const hari = [];
  for (let d = awal; !d.isAfter(akhir) && hari.length < 92; d = d.add(1, 'day')) hari.push(d);

  const per_hari = hari.map((d) => {
    const s = Number(d.format('YYYYMMDD'));
    const target = 2400;
    const hasil = Math.round(1750 + acak(s) * 600);
    const reject = Math.round(hasil * (0.025 + acak(s + 1) * 0.04));
    const downtime_menit = Math.round(40 + acak(s + 2) * 140);
    const availability = (1440 - downtime_menit * 3) / 1440;
    const performance = Math.min(1, hasil / (target * availability));
    const quality = (hasil - reject) / hasil;
    return { tanggal: d.format('YYYY-MM-DD'), hasil, reject, target, downtime_menit, oee: availability * performance * quality, availability, performance, quality };
  });

  const jumlah = (k) => per_hari.reduce((a, b) => a + b[k], 0);
  const rata = (k) => (per_hari.length ? jumlah(k) / per_hari.length : 0);

  const per_mesin = db.mesin.map((m, i) => {
    const s = Number(awal.format('YYYYMMDD')) + i * 17;
    const bagian = m.kapasitas_per_jam / db.mesin.reduce((a, b) => a + b.kapasitas_per_jam, 0);
    const hasil = Math.round(jumlah('hasil') * bagian);
    return {
      mesin_id: m.id,
      kode: m.kode,
      nama: m.nama,
      hasil,
      reject: Math.round(hasil * (0.02 + acak(s) * 0.05)),
      downtime_menit: Math.round(jumlah('downtime_menit') * (0.1 + acak(s + 3) * 0.4)),
      oee: 0.5 + acak(s + 5) * 0.4,
    };
  });

  return {
    dari,
    sampai,
    ringkasan: {
      hasil: jumlah('hasil'),
      reject: jumlah('reject'),
      target: jumlah('target'),
      downtime_menit: jumlah('downtime_menit'),
      availability: rata('availability'),
      performance: rata('performance'),
      quality: rata('quality'),
      oee: rata('oee'),
    },
    per_hari,
    per_mesin,
  };
}

export const getLaporan = (dari, sampai) => get(`/laporan?${query({ dari, sampai })}`, () => buatLaporan(dari, sampai));
