# Monitoring Produksi

Sistem monitoring produksi pabrik berbasis web. Memantau **mesin**, **hasil produksi**, dan **downtime**, lalu membandingkannya dengan **target** dan menghitung **OEE** (Overall Equipment Effectiveness).

> Dokumen ini adalah panduan utama agar pengerjaan tidak tersesat. Pengerjaan dimulai dari **frontend dengan data mock**, backend menyusul.

---

## Daftar Isi

1. [Tujuan & Fitur](#1-tujuan--fitur)
2. [Tech Stack](#2-tech-stack)
3. [Struktur Project](#3-struktur-project)
4. [Desain Database](#4-desain-database)
5. [Rumus OEE](#5-rumus-oee)
6. [API Endpoint](#6-api-endpoint)
7. [Frontend](#7-frontend)
8. [Data Mock](#8-data-mock)
9. [Backend](#9-backend)
10. [Cara Menjalankan](#10-cara-menjalankan)
11. [Roadmap Pengerjaan](#11-roadmap-pengerjaan)
12. [Checklist](#12-checklist)
13. [Catatan & Celah Struktur](#13-catatan--celah-struktur)

---

## 1. Tujuan & Fitur

**Tujuan:** memberi operator dan manajer gambaran real-time kondisi lini produksi: apakah target tercapai, mesin mana yang berhenti, dan seberapa efektif mesin berjalan.

| Fitur | Deskripsi |
|---|---|
| Dashboard | Ringkasan OEE, status mesin, grafik produksi vs target |
| Monitoring mesin | Status jalan / berhenti / maintenance per mesin |
| Pencatatan produksi | Output dan reject per shift atau per jam |
| Pencatatan downtime | Waktu mulai, selesai, dan alasan mesin berhenti |
| Target produksi | Target harian atau per shift per lini |
| Perhitungan OEE | Availability × Performance × Quality |
| Laporan | Rekap per periode (produksi, downtime, OEE) |
| Notifikasi | Pemberitahuan saat target tercapai |

---

## 2. Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend | React (Vite), React Router, Recharts, Tailwind CSS |
| Backend | Node.js + Express |
| Database | MySQL (atau PostgreSQL) |
| Komunikasi | REST API (JSON), polling berkala |

---

## 3. Struktur Project

```
monitoring-produksi/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # koneksi DB
│   │   ├── models/
│   │   │   ├── Mesin.js             # data mesin/lini produksi
│   │   │   ├── ProduksiLog.js       # hasil produksi per shift/jam
│   │   │   ├── DowntimeLog.js       # catatan mesin berhenti & alasannya
│   │   │   └── TargetProduksi.js    # target harian/shift per lini
│   │   ├── controllers/
│   │   │   ├── produksiController.js
│   │   │   ├── mesinController.js
│   │   │   ├── downtimeController.js
│   │   │   └── laporanController.js
│   │   ├── routes/
│   │   │   ├── produksiRoutes.js
│   │   │   ├── mesinRoutes.js
│   │   │   └── downtimeRoutes.js
│   │   ├── services/
│   │   │   ├── oeeCalculator.js     # hitung OEE (availability, performance, quality)
│   │   │   └── notifTargetTercapai.js
│   │   └── app.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GrafikProduksiVsTarget.jsx
│   │   │   ├── StatusMesin.jsx
│   │   │   ├── TabelDowntime.jsx
│   │   │   ├── KartuOEE.jsx
│   │   │   ├── LayoutDashboard.jsx      # sidebar + menu bawah (tablet/HP)
│   │   │   ├── StatusData.jsx           # state loading / error / kosong
│   │   │   ├── Kartu.jsx, KepalaHalaman.jsx, Form.jsx, BadgeStatus.jsx, Lampu.jsx
│   │   │   └── landing/                 # komponen khusus halaman Landing
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Beranda.jsx
│   │   │   ├── Produksi.jsx
│   │   │   ├── Mesin.jsx
│   │   │   └── Laporan.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
│
├── database/
│   └── schema.sql                   # tabel: mesin, produksi_log, downtime_log, target_produksi
│
└── docs/
    └── README.md
```

### Penjelasan peran tiap folder

| Folder | Peran |
|---|---|
| `backend/src/config` | Konfigurasi koneksi database |
| `backend/src/models` | Representasi tabel di kode |
| `backend/src/controllers` | Logika menangani request |
| `backend/src/routes` | Pemetaan URL ke controller |
| `backend/src/services` | Logika bisnis (OEE, notifikasi) |
| `frontend/src/components` | Komponen UI yang bisa dipakai ulang |
| `frontend/src/pages` | Halaman utama, merangkai komponen |
| `frontend/src/services` | Satu-satunya pintu komunikasi dengan data/API |
| `database` | Skema tabel |
| `docs` | Dokumentasi |

---

## 4. Desain Database

### 4.1 Relasi antar tabel

```
mesin (1) ──< produksi_log (N)
mesin (1) ──< downtime_log (N)
mesin (1) ──< target_produksi (N)
```

Satu mesin punya banyak log produksi, banyak log downtime, dan banyak target (per tanggal/shift).

### 4.2 Draft `schema.sql`

```sql
CREATE TABLE mesin (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  kode        VARCHAR(20)  NOT NULL UNIQUE,
  nama        VARCHAR(100) NOT NULL,
  lini        VARCHAR(50)  NOT NULL,
  status      ENUM('jalan','berhenti','maintenance') NOT NULL DEFAULT 'berhenti',
  kapasitas_per_jam INT NOT NULL,          -- output ideal per jam (untuk Performance)
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produksi_log (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  mesin_id      INT NOT NULL,
  waktu         DATETIME NOT NULL,
  shift         TINYINT NOT NULL,          -- 1, 2, 3
  jumlah_hasil  INT NOT NULL DEFAULT 0,    -- total output
  jumlah_reject INT NOT NULL DEFAULT 0,
  FOREIGN KEY (mesin_id) REFERENCES mesin(id)
);

CREATE TABLE downtime_log (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  mesin_id  INT NOT NULL,
  mulai     DATETIME NOT NULL,
  selesai   DATETIME NULL,                 -- NULL = masih berhenti
  alasan    VARCHAR(255) NOT NULL,
  kategori  ENUM('rusak','setup','material','istirahat','lainnya') DEFAULT 'lainnya',
  FOREIGN KEY (mesin_id) REFERENCES mesin(id)
);

CREATE TABLE target_produksi (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  mesin_id  INT NOT NULL,
  tanggal   DATE NOT NULL,
  shift     TINYINT NOT NULL,
  target    INT NOT NULL,
  UNIQUE KEY uq_target (mesin_id, tanggal, shift),
  FOREIGN KEY (mesin_id) REFERENCES mesin(id)
);
```

### 4.3 Catatan field

- `kapasitas_per_jam` pada `mesin` wajib ada, karena dipakai untuk menghitung **Performance** (output ideal).
- `selesai = NULL` di `downtime_log` berarti mesin **sedang berhenti saat ini**.
- `jumlah_hasil` adalah total output; produk bagus = `jumlah_hasil - jumlah_reject`.

---

## 5. Rumus OEE

```
Availability = waktu jalan / waktu terjadwal
Performance  = output aktual / output ideal
Quality      = produk bagus / total produk
OEE          = Availability × Performance × Quality
```

### Penjabaran dari data

| Komponen | Cara hitung dari tabel |
|---|---|
| Waktu terjadwal | Durasi shift (mis. 8 jam) dikurangi istirahat terencana |
| Waktu jalan | Waktu terjadwal dikurangi total durasi `downtime_log` |
| Output ideal | Waktu jalan × `mesin.kapasitas_per_jam` |
| Output aktual | `SUM(jumlah_hasil)` |
| Produk bagus | `SUM(jumlah_hasil) - SUM(jumlah_reject)` |

### Contoh hitungan

- Shift 8 jam = 480 menit, downtime 60 menit → waktu jalan 420 menit
- Availability = 420 / 480 = **87,5%**
- Kapasitas 100/jam → output ideal = 7 jam × 100 = 700; aktual 630 → Performance = **90%**
- Reject 31 dari 630 → Quality = 599 / 630 = **95,1%**
- OEE = 0,875 × 0,90 × 0,951 ≈ **74,9%**

### Klasifikasi tampilan OEE (saran)

| Nilai OEE | Warna | Arti |
|---|---|---|
| ≥ 85% | Hijau | Sangat baik (world class) |
| 60 – 84% | Kuning | Cukup, perlu perbaikan |
| < 60% | Merah | Rendah |

> Backend (`oeeCalculator.js`) yang menghitung. Frontend hanya menampilkan tiga komponen dan hasil akhirnya.

---

## 6. API Endpoint

Base URL: `/api`

| Method | Endpoint | Fungsi | Dipakai oleh |
|---|---|---|---|
| GET | `/mesin` | Daftar semua mesin + status | Beranda, Mesin |
| GET | `/mesin/:id` | Detail satu mesin + OEE-nya | Mesin |
| POST | `/mesin` | Tambah mesin | Mesin |
| PUT | `/mesin/:id` | Ubah data/status mesin | Mesin |
| GET | `/produksi` | Log produksi (filter tanggal, shift, mesin) | Produksi |
| POST | `/produksi` | Catat hasil produksi | Produksi |
| GET | `/produksi/ringkasan` | Total aktual vs target (untuk grafik) | Beranda, Produksi |
| GET | `/downtime` | Log downtime (filter) | Beranda, Mesin |
| POST | `/downtime` | Catat mesin berhenti | Mesin |
| PUT | `/downtime/:id` | Tutup downtime (isi `selesai`) | Mesin |
| GET | `/oee` | OEE per mesin / keseluruhan | Beranda |
| GET | `/laporan?dari=&sampai=` | Rekap periode | Laporan |

### Contoh response

`GET /api/oee`

```json
{
  "keseluruhan": { "availability": 0.875, "performance": 0.90, "quality": 0.951, "oee": 0.749 },
  "per_mesin": [
    { "mesin_id": 1, "nama": "Mesin Press A", "availability": 0.9, "performance": 0.92, "quality": 0.97, "oee": 0.803 }
  ]
}
```

`GET /api/produksi/ringkasan?tanggal=2026-11-21`

```json
[
  { "jam": "08:00", "aktual": 95,  "target": 100 },
  { "jam": "09:00", "aktual": 102, "target": 100 }
]
```

---

## 7. Frontend

### 7.1 Pemetaan halaman ke komponen

| Halaman (`pages/`) | Route | Isi |
|---|---|---|
| `Landing.jsx` | `/` | Halaman awal: hero inspeksi mesin press interaktif (simulasi OEE), peran pengguna, papan kondisi lini |
| `Login.jsx` | `/login` | Form masuk (peran operator/manajer). Versi awal tanpa autentikasi, kolom boleh kosong, langsung ke `/dashboard` |
| `Beranda.jsx` | `/dashboard` | `Dashboard` (`KartuOEE` + `StatusMesin` + `GrafikProduksiVsTarget` + `TabelDowntime` ringkas) |
| `Produksi.jsx` | `/produksi` | `GrafikProduksiVsTarget` + tabel log produksi + form input |
| `Mesin.jsx` | `/mesin` | `StatusMesin` + detail per mesin + `TabelDowntime` |
| `Laporan.jsx` | `/laporan` | Filter periode + rekap + tombol export |

### 7.2 Spesifikasi komponen

| Komponen | Props | Menampilkan |
|---|---|---|
| `KartuOEE` | `availability`, `performance`, `quality`, `oee` | Angka OEE besar + 3 komponen, warna sesuai klasifikasi |
| `StatusMesin` | `daftarMesin[]` | Kartu/baris per mesin dengan badge jalan/berhenti/maintenance |
| `GrafikProduksiVsTarget` | `data[]` (`jam`, `aktual`, `target`) | Bar/line chart aktual vs target (Recharts) |
| `TabelDowntime` | `data[]`, `onTutup?` | Tabel: mesin, mulai, selesai, durasi, alasan; baris "sedang berhenti" disorot |
| `Dashboard` | (mengambil data sendiri) | Merangkai komponen di atas + auto-refresh |

### 7.3 State yang wajib ada di tiap komponen data

- **Loading** (skeleton atau spinner)
- **Error** (pesan + tombol coba lagi)
- **Empty** ("Belum ada data")
- **Auto-refresh** polling, mis. tiap 10–30 detik (khusus Beranda dan Mesin)

### 7.4 `services/api.js` (satu pintu data)

Tahap awal mengembalikan mock. Nanti cukup ganti isi fungsi dengan `fetch`/`axios`, **komponen tidak perlu diubah**.

```js
// frontend/src/services/api.js
import { mesin, produksiRingkasan, downtime, oee } from '../mock/data';

const USE_MOCK = true;                       // ganti ke false saat backend siap
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

async function get(path, mockData) {
  if (USE_MOCK) { await delay(); return mockData; }
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Gagal memuat ${path}`);
  return res.json();
}

export const getMesin       = ()       => get('/mesin', mesin);
export const getOEE         = ()       => get('/oee', oee);
export const getRingkasan   = (tgl)    => get(`/produksi/ringkasan?tanggal=${tgl}`, produksiRingkasan);
export const getDowntime    = ()       => get('/downtime', downtime);
```

### 7.5 `App.jsx` (routing)

```jsx
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Beranda from './pages/Beranda';
import Produksi from './pages/Produksi';
import Mesin from './pages/Mesin';
import Laporan from './pages/Laporan';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="flex gap-4 p-4 border-b">
        <NavLink to="/dashboard">Beranda</NavLink>
        <NavLink to="/produksi">Produksi</NavLink>
        <NavLink to="/mesin">Mesin</NavLink>
        <NavLink to="/laporan">Laporan</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Beranda />} />
        <Route path="/produksi" element={<Produksi />} />
        <Route path="/mesin" element={<Mesin />} />
        <Route path="/laporan" element={<Laporan />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 7.6 Tambahan folder frontend (disarankan)

Struktur asli tidak punya folder untuk mock dan hook. Tambahkan:

```
frontend/src/
├── mock/
│   └── data.js          # data palsu sesuai bentuk schema.sql
└── hooks/
    └── usePolling.js    # hook fetch + auto-refresh + loading/error
```

```js
// frontend/src/hooks/usePolling.js
import { useEffect, useState, useCallback } from 'react';

export default function usePolling(fetcher, intervalMs = 15000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await fetcher());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);

  return { data, loading, error, reload: load };
}
```

---

## 8. Data Mock

Bentuk mock **harus sama** dengan kolom di `schema.sql` supaya transisi ke backend mulus.

```js
// frontend/src/mock/data.js
export const mesin = [
  { id: 1, kode: 'PRS-01', nama: 'Mesin Press A',  lini: 'Lini 1', status: 'jalan',       kapasitas_per_jam: 100 },
  { id: 2, kode: 'PRS-02', nama: 'Mesin Press B',  lini: 'Lini 1', status: 'berhenti',    kapasitas_per_jam: 100 },
  { id: 3, kode: 'WLD-01', nama: 'Mesin Las 1',    lini: 'Lini 2', status: 'jalan',       kapasitas_per_jam: 60  },
  { id: 4, kode: 'PNT-01', nama: 'Mesin Cat 1',    lini: 'Lini 3', status: 'maintenance', kapasitas_per_jam: 80  },
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
  { id: 1, mesin_id: 2, nama_mesin: 'Mesin Press B', mulai: '2026-11-21T10:15:00', selesai: null,                  alasan: 'Motor overheat',    kategori: 'rusak'    },
  { id: 2, mesin_id: 1, nama_mesin: 'Mesin Press A', mulai: '2026-11-21T08:30:00', selesai: '2026-11-21T08:50:00', alasan: 'Ganti dies',        kategori: 'setup'    },
  { id: 3, mesin_id: 3, nama_mesin: 'Mesin Las 1',   mulai: '2026-11-21T09:40:00', selesai: '2026-11-21T10:05:00', alasan: 'Menunggu material', kategori: 'material' },
];
```

---

## 9. Backend

### 9.1 Alur request

```
Request → routes → controller → model (DB) / service (OEE) → response JSON
```

### 9.2 Tanggung jawab file

| File | Tugas |
|---|---|
| `config/database.js` | Membuat koneksi pool ke DB |
| `models/*.js` | Query/ORM per tabel |
| `controllers/*.js` | Validasi input, panggil model/service, kirim response |
| `routes/*.js` | Daftar endpoint per modul |
| `services/oeeCalculator.js` | Hitung availability, performance, quality, OEE |
| `services/notifTargetTercapai.js` | Cek apakah akumulasi output ≥ target, lalu kirim notifikasi |
| `app.js` | Setup Express, CORS, JSON parser, mount routes |

### 9.3 Kerangka `oeeCalculator.js`

```js
// backend/src/services/oeeCalculator.js
function hitungOEE({ waktuTerjadwalMenit, downtimeMenit, kapasitasPerJam, outputAktual, reject }) {
  const waktuJalan = waktuTerjadwalMenit - downtimeMenit;
  const availability = waktuTerjadwalMenit > 0 ? waktuJalan / waktuTerjadwalMenit : 0;

  const outputIdeal = (waktuJalan / 60) * kapasitasPerJam;
  const performance = outputIdeal > 0 ? outputAktual / outputIdeal : 0;

  const bagus = outputAktual - reject;
  const quality = outputAktual > 0 ? bagus / outputAktual : 0;

  return { availability, performance, quality, oee: availability * performance * quality };
}

module.exports = { hitungOEE };
```

### 9.4 Kerangka `app.js`

```js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/mesin', require('./routes/mesinRoutes'));
app.use('/api/produksi', require('./routes/produksiRoutes'));
app.use('/api/downtime', require('./routes/downtimeRoutes'));
// app.use('/api/laporan', require('./routes/laporanRoutes'));  // lihat bagian 13

app.listen(process.env.PORT || 5000);
module.exports = app;
```

---

## 10. Cara Menjalankan

### Prasyarat

- Node.js 18+
- MySQL 8+ (atau PostgreSQL)

### Frontend (tahap awal, tanpa backend)

```bash
cd frontend
npm create vite@latest . -- --template react
npm install react-router-dom recharts
npm install -D tailwindcss @tailwindcss/vite
npm run dev
```

Pastikan `USE_MOCK = true` di `src/services/api.js`.

### Backend (tahap berikutnya)

```bash
cd backend
npm init -y
npm install express cors mysql2 dotenv
npm install -D nodemon
```

Buat `.env`:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=monitoring_produksi
```

Import skema:

```bash
mysql -u root -p monitoring_produksi < database/schema.sql
```

Jalankan:

```bash
npx nodemon src/app.js
```

Lalu di frontend: set `USE_MOCK = false` dan `VITE_API_URL=http://localhost:5000/api`.

---

## 11. Roadmap Pengerjaan

Urutan ini membuat frontend bisa selesai penuh sebelum backend ada.

### Fase 1: Fondasi frontend
1. Setup Vite + React + Tailwind + React Router
2. Buat `mock/data.js` sesuai `schema.sql`
3. Buat `services/api.js` (mode mock)
4. Buat `hooks/usePolling.js`

### Fase 2: Komponen (kecil ke besar)
1. `KartuOEE`
2. `StatusMesin`
3. `GrafikProduksiVsTarget`
4. `TabelDowntime`
5. `Dashboard`

### Fase 3: Halaman
1. `Beranda` (pakai `Dashboard`)
2. `Mesin`
3. `Produksi` (+ form input)
4. `Laporan` (+ export)

### Fase 4: Polesan frontend
- Loading, error, dan empty state di semua komponen
- Responsif (tablet dipakai di lantai pabrik)
- Mode layar besar / TV untuk monitor dinding (opsional)

### Fase 5: Database dan backend
1. Finalisasi `schema.sql` + data seed
2. `config/database.js` dan models
3. Routes dan controllers
4. `oeeCalculator.js`
5. `notifTargetTercapai.js`

### Fase 6: Integrasi
1. Ganti `USE_MOCK = false`
2. Cocokkan bentuk response dengan mock
3. Uji end-to-end

---

## 12. Checklist

### Frontend
- [x] Setup project (Vite, Tailwind, Router, Recharts)
- [x] `mock/data.js`
- [x] `services/api.js`
- [x] `hooks/usePolling.js`
- [x] `KartuOEE.jsx`
- [x] `StatusMesin.jsx`
- [x] `GrafikProduksiVsTarget.jsx`
- [x] `TabelDowntime.jsx`
- [x] `Dashboard.jsx`
- [x] `Beranda.jsx`
- [x] `Mesin.jsx`
- [x] `Produksi.jsx`
- [x] `Laporan.jsx`
- [x] `App.jsx` (routing + navigasi)
- [x] Loading / error / empty state
- [x] Responsif

### Database
- [ ] `schema.sql` final
- [ ] Data seed untuk uji

### Backend
- [ ] `config/database.js`
- [ ] 4 model
- [ ] 4 controller
- [ ] 4 file route (termasuk `laporanRoutes.js`)
- [ ] `oeeCalculator.js`
- [ ] `notifTargetTercapai.js`
- [ ] `app.js`

### Integrasi
- [ ] Mock diganti API sungguhan
- [ ] Uji semua halaman dengan data nyata

---

## 13. Catatan & Celah Struktur

Hal yang tidak ada di struktur awal tetapi sebaiknya ditambahkan:

| Celah | Solusi |
|---|---|
| Ada `laporanController.js` tapi tidak ada `laporanRoutes.js` | Tambah `routes/laporanRoutes.js` dan mount di `app.js` |
| Tidak ada endpoint/controller khusus OEE | Tambah `GET /api/oee` yang memanggil `oeeCalculator.js` (bisa lewat `laporanController` atau `oeeController` baru) |
| Tidak ada folder mock di frontend | Tambah `frontend/src/mock/` |
| Tidak ada hook untuk polling | Tambah `frontend/src/hooks/` |
| Tidak ada file `.env.example` | Tambah di `backend/` dan `frontend/` |
| `docs/README.md` dan README root bisa dobel | Jadikan file ini README utama, `docs/` untuk dokumentasi detail (API, ERD) |
| Belum ada autentikasi | Opsional: login operator vs manajer, tambah tabel `users` nanti |

---

*Terakhir diperbarui: 21 November 2026*
