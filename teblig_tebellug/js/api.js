// ==============================================================
// api.js — SUNUCU İLETİŞİMİ (giriş, veri alma, kaydetme)
// ==============================================================
// Tarayıcıda hiçbir veri kalıcı saklanmaz. Tüm veri Google Sheets'te durur;
// bu dosya giriş yapar, verileri getirir ve değişiklikleri sunucuya yollar.
// Yetki kontrolü SUNUCUDA yapılır (sitedeki gizli düğmelere güvenilmez).

const OTURUM_ANAHTARI = 'kdh_teblig_oturum';   // sadece bu sekmede (sekme kapanınca silinir)
let TOKEN = '';

// ---------- 1. Sunucuya istek ----------
async function sunucuCagir(islem, veri = {}) {
    if (!AYARLAR.SUNUCU_ADRESI || AYARLAR.SUNUCU_ADRESI.indexOf('BURAYA') === 0) {
        throw new Error('Sunucu adresi ayarlanmamış (js/ayarlar.js).');
    }
    let yanit;
    try {
        // Başlık eklenmez: "basit istek" olduğu için tarayıcı ön kontrol (CORS) yapmaz
        yanit = await fetch(AYARLAR.SUNUCU_ADRESI, {
            method: 'POST', body: JSON.stringify({ islem, token: TOKEN, ...veri }),
            credentials: 'omit', cache: 'no-store'
        });
    } catch (e) { throw new Error('Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.'); }
    let y;
    try { y = await yanit.json(); } catch (e) { throw new Error('Sunucu yanıtı okunamadı.'); }
    if (!y.ok) {
        const hata = new Error(y.hata || 'İşlem yapılamadı.');
        hata.kod = y.kod;
        if (y.kod === 'oturum') oturumDustu();
        throw hata;
    }
    return y;
}

function oturumDustu() {
    TOKEN = '';
    try { sessionStorage.removeItem(OTURUM_ANAHTARI); } catch (e) {}
    showToast('Oturum süresi doldu, yeniden giriş yapın', true);
    setTimeout(() => location.reload(), 1500);
}

// ---------- 2. Değişiklikleri bulma ve kaydetme ----------
// Her kayıt kimliğiyle ayrı gönderilir; iki kişi aynı anda çalışsa da birbirinin kaydını ezmez.
const KOLEKSIYON_ANAHTARLARI = { fields: 'code', templates: 'id', docs: 'id', listGroups: 'id', tebligEdenler: 'id', logs: 'id' };
const SADECE_YONETICI = ['fields', 'templates', 'listGroups', 'tebligEdenler'];
let SNAP = {};                                  // sunucudaki son bilinen hâl
const SYNC = { zamanlayici: null, calisiyor: false, tekrar: false };

function snapAl() {
    const s = {};
    for (const [k, a] of Object.entries(KOLEKSIYON_ANAHTARLARI)) {
        s[k] = {};
        (STATE[k] || []).forEach(x => { s[k][String(x[a])] = JSON.stringify(x); });
    }
    return s;
}
function degisiklikleriBul() {
    const simdiki = snapAl(), fark = {};
    let var_ = false;
    for (const k of Object.keys(KOLEKSIYON_ANAHTARLARI)) {
        if (!isAdmin() && SADECE_YONETICI.includes(k)) continue;
        const a = KOLEKSIYON_ANAHTARLARI[k], eski = SNAP[k] || {}, yeni = simdiki[k];
        const upsert = (STATE[k] || []).filter(x => eski[String(x[a])] !== yeni[String(x[a])]);
        const sil = Object.keys(eski).filter(id => !(id in yeni));
        if (upsert.length || sil.length) { fark[k] = { upsert, sil }; var_ = true; }
    }
    return var_ ? { fark, simdiki } : null;
}

// Eski koddaki saveState() çağrıları buraya gelir; kısa bekleyip sunucuya gönderir.
function saveState() {
    clearTimeout(SYNC.zamanlayici);
    SYNC.zamanlayici = setTimeout(senkronla, 250);
}
async function senkronla() {
    if (!TOKEN) return;
    if (SYNC.calisiyor) { SYNC.tekrar = true; return; }
    const d = degisiklikleriBul();
    if (!d) return;
    SYNC.calisiyor = true;
    try {
        await sunucuCagir('kaydet', { degisiklikler: d.fark });
        SNAP = d.simdiki;
    } catch (e) {
        showToast('Kaydedilemedi: ' + e.message, true);
    } finally {
        SYNC.calisiyor = false;
        if (SYNC.tekrar) { SYNC.tekrar = false; saveState(); }
    }
}
window.addEventListener('beforeunload', e => {
    if (TOKEN && (SYNC.calisiyor || degisiklikleriBul())) { e.preventDefault(); e.returnValue = ''; }
});

// ---------- 3. Verileri alma ----------
function sunucuVerisiniUygula(sv) {
    ['fields', 'templates', 'docs', 'listGroups', 'tebligEdenler', 'logs'].forEach(k => { STATE[k] = Array.isArray(sv[k]) ? sv[k] : []; });
    STATE.users = Array.isArray(sv.kullanicilar) ? sv.kullanicilar : [];
    normalizeState();
    SNAP = snapAl();
    SON_YENILEME = Date.now();
}

// Sistem ilk kez açılıyorsa varsayılan şablon/alanları (ve varsa bu tarayıcıdaki eski verileri) sunucuya bir kez yükler.
async function ilkVeriyiYukle() {
    let eski = {};
    try { const ham = localStorage.getItem(STORE_KEY) || localStorage.getItem('kdh_teblig_tebellug_v4'); if (ham) eski = JSON.parse(ham) || {}; } catch (e) {}
    const dolu = a => Array.isArray(a) && a.length;
    STATE.fields = dolu(eski.fields) ? eski.fields : clone(DEFAULT_FIELDS);
    STATE.templates = dolu(eski.templates) ? eski.templates : clone(DEFAULT_TEMPLATES);
    STATE.listGroups = dolu(eski.listGroups) ? eski.listGroups
        : [{ id: 'g_kurum', ad: 'Kurum', ek: true, items: DEFAULT_KURUMLAR.map((ad, i) => ({ id: 'k' + (i + 1), ad })) }];
    STATE.tebligEdenler = Array.isArray(eski.tebligEdenler) ? eski.tebligEdenler : [];
    STATE.docs = Array.isArray(eski.docs) ? eski.docs : [];
    normalizeState();
    await sunucuCagir('tohumla', { veri: { fields: STATE.fields, templates: STATE.templates, listGroups: STATE.listGroups, tebligEdenler: STATE.tebligEdenler, docs: STATE.docs } });
    try { localStorage.removeItem(STORE_KEY); localStorage.removeItem('kdh_teblig_tebellug_v4'); } catch (e) {}   // eski yerel veriyi temizle
}
async function verileriUygula(sv) {
    if (!sv.tohumlandi && isAdmin()) { await ilkVeriyiYukle(); sv = await sunucuCagir('durum'); }
    sunucuVerisiniUygula(sv);
}

let SON_YENILEME = 0;
const modalAcik = () => ['tplModal', 'docModal', 'pvModal', 'editModal', 'cfModal'].some(id => $(id) && !$(id).classList.contains('hidden'));
// Diğer kullanıcıların değişikliklerini getirir (kaydedilmemiş iş ya da açık pencere varsa dokunmaz).
async function yenile(sessiz) {
    if (!TOKEN || SYNC.calisiyor || modalAcik() || degisiklikleriBul()) return;
    if (Date.now() - SON_YENILEME < 5000) return;
    SON_YENILEME = Date.now();
    try {
        const sv = await sunucuCagir('durum');
        if (SYNC.calisiyor || modalAcik() || degisiklikleriBul()) return;
        sunucuVerisiniUygula(sv);
        const ben = STATE.users.find(u => u.id === CUR_UID); if (ben) { USER = ben.ad; uwInit(); }
        initYearSelect(); renderCurrent();
    } catch (e) { if (!sessiz) showToast(e.message, true); }
}
setInterval(() => { if (document.visibilityState === 'visible') yenile(true); }, 120000);

// ---------- 4. Giriş / çıkış ----------
async function handleLogin(e) {
    e.preventDefault();
    const err = $('loginError'), btn = e.submitter || $('loginForm').querySelector('button[type=submit]');
    err.classList.add('hidden');
    const eskiYazi = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Kontrol ediliyor...';
    try {
        const y = await sunucuCagir('giris', { sifre: $('passwordInput').value });
        TOKEN = y.token;
        try { sessionStorage.setItem(OTURUM_ANAHTARI, TOKEN); } catch (x) {}
        $('passwordInput').value = '';
        loginAs(y.kullanici);
        await verileriUygula(await sunucuCagir('durum'));
        showApp();
    } catch (x) {
        TOKEN = '';
        err.textContent = x.message || 'Hatalı şifre!';
        err.classList.remove('hidden');
    } finally {
        btn.disabled = false; btn.innerHTML = eskiYazi;
    }
}

async function oturumuGeriYukle() {
    const t = sessionStorage.getItem(OTURUM_ANAHTARI);
    if (!t) return;
    TOKEN = t;
    try {
        const sv = await sunucuCagir('durum');
        loginAs(sv.kullanici);
        await verileriUygula(sv);
        showApp();
    } catch (e) {
        TOKEN = ''; try { sessionStorage.removeItem(OTURUM_ANAHTARI); } catch (x) {}
    }
}

async function cikisYap() {
    try { if (TOKEN) { await senkronla(); await sunucuCagir('cikis'); } } catch (e) {}
    TOKEN = '';
    try { sessionStorage.removeItem(OTURUM_ANAHTARI); } catch (e) {}
    location.reload();
}
function logoutClick() { cikisYap(); }

// ---------- 5. Hareketsizlikte otomatik çıkış ----------
let SON_HAREKET = Date.now();
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev => document.addEventListener(ev, () => { SON_HAREKET = Date.now(); }, { passive: true }));
setInterval(() => {
    if (TOKEN && Date.now() - SON_HAREKET > AYARLAR.BOSTA_CIKIS_DK * 60000) cikisYap();
}, 30000);
