// Warna andon dipakai HANYA untuk status mesin dan klasifikasi OEE.
export const LAMPU = {
  hijau: 'bg-andon-hijau',
  kuning: 'bg-andon-kuning',
  merah: 'bg-andon-merah',
};

export const STATUS_MESIN = {
  jalan: { tingkat: 'hijau', label: 'Jalan' },
  berhenti: { tingkat: 'merah', label: 'Berhenti' },
  maintenance: { tingkat: 'kuning', label: 'Maintenance' },
};
