import { angka } from '../../utils/oee';

export function formatNilai(m, id) {
  switch (id) {
    case 'motor':
      return `${Math.round(m.suhu)} °C`;
    case 'hidrolik':
      return `${Math.round(m.tekanan)} bar`;
    case 'dies':
      return angka(m.pukulan);
    case 'counter':
      return `${angka(m.hasil)} pcs`;
    default:
      return '';
  }
}

export function catatanKomponen(m, id, tingkat) {
  switch (id) {
    case 'motor':
      if (tingkat === 'merah') return 'Melebihi batas aman 95 °C. Periksa pendingin dan beban motor.';
      if (tingkat === 'kuning') return 'Mendekati batas aman 95 °C.';
      return 'Dalam batas aman 95 °C.';
    case 'hidrolik':
      if (!m.jalan) return 'Tekanan siaga karena mesin berhenti.';
      return 'Tekanan kerja normal. Batas 160 bar.';
    case 'dies': {
      const sisa = angka(Math.max(0, 25000 - m.pukulan));
      if (tingkat !== 'hijau') return `Dies perlu segera diganti. Sisa ${sisa} pukulan.`;
      return `Dies diganti setiap 25.000 pukulan. Sisa ${sisa} pukulan.`;
    }
    case 'counter': {
      const target = angka((m.menit / 60) * m.kapasitas);
      return `Reject ${angka(m.reject)} pcs. Target sampai menit ke-${m.menit}: ${target} pcs.`;
    }
    default:
      return '';
  }
}
