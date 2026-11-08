// =====================================================================
// PORTAL AYAR DOSYASI  (tüm index dosyalarıyla aynı klasörde durmalı)
// ---------------------------------------------------------------------
// KULLANIM:
// 1) Aşağıdaki 20 yuvadan istediğinize "url" kısmına Apps Script
//    "Web uygulaması" /exec adresini tırnakların içine yapıştırın.
//    "ad" kısmı sadece sizin hatırlamanız içindir (isteğe bağlı).
//
// 2) Her index dosyasında, portal-ayar.js satırından ÖNCE hangi yuvayı
//    kullanacağını yazın. Örnek (3. yuva):
//
//      <script>window.AYAR_NO = 3;</script>
//      <script src="portal-ayar.js"></script>
//
//    AYAR_NO yazılmazsa 1. yuva kullanılır (eski index.html aynen çalışır).
//
// 3) index içinde yine eskisi gibi API_URL kullanılır; ek değişiklik gerekmez.
// =====================================================================

const PORTAL_AYARLARI = {
  1:  { ad: 'Ana Portal',            url: 'https://script.google.com/macros/s/AKfycbx8mWhLN_8KCqEjLKifDNa6oAXxkxnVNLTaw2FbwqeuCm8JqQRkG1YUEPC_eqojHlL28w/exec', not: '' },
  2:  { ad: 'ayriliş_baslayis',      url: 'https://script.google.com/macros/s/AKfycbwOMUqKJmAj_DjGJ9vXGzVEAyKX5G6dB299J8eHZNdVV9A8s9mBzj4jUgqHUQSO5q4dOg/exec', not: '' },
  3:  { ad: '',                      url: '', not: '' },
  4:  { ad: '',                      url: '', not: '' },
  5:  { ad: '',                      url: '', not: '' },
  6:  { ad: '',                      url: '', not: '' },
  7:  { ad: '',                      url: '', not: '' },
  8:  { ad: '',                      url: '', not: '' },
  9:  { ad: '',                      url: '', not: '' },
  10: { ad: '',                      url: '', not: '' },
  11: { ad: '',                      url: '', not: '' },
  12: { ad: '',                      url: '', not: '' },
  13: { ad: '',                      url: '', not: '' },
  14: { ad: '',                      url: '', not: '' },
  15: { ad: '',                      url: '', not: '' },
  16: { ad: '',                      url: '', not: '' },
  17: { ad: '',                      url: '', not: '' },
  18: { ad: '',                      url: '', not: '' },
  19: { ad: '',                      url: '', not: '' },
  20: { ad: '',                      url: '', not: '' }
};

// ---- Bu bölümü değiştirmeyin ----
const AYAR_NO_SECILI = Number(window.AYAR_NO) || 1;
const AKTIF_AYAR = PORTAL_AYARLARI[AYAR_NO_SECILI] || PORTAL_AYARLARI[1];
const API_URL = AKTIF_AYAR.url;

if (!API_URL) {
  console.warn('portal-ayar.js: ' + AYAR_NO_SECILI + '. yuvanın url alanı boş.');
}
