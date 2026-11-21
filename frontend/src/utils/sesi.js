// Peran pengguna dari halaman login. Disimpan di localStorage hanya sebagai kenyamanan;
// aman bila storage tidak tersedia.
const KUNCI = 'mp-peran';

export function simpanPeran(peran) {
  try {
    localStorage.setItem(KUNCI, peran);
  } catch {
    /* storage tidak tersedia */
  }
}

export function ambilPeran() {
  try {
    return localStorage.getItem(KUNCI) ?? 'operator';
  } catch {
    return 'operator';
  }
}

export function hapusPeran() {
  try {
    localStorage.removeItem(KUNCI);
  } catch {
    /* storage tidak tersedia */
  }
}
