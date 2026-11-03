// KDH ortak kullanıcı modülü
//  - Giriş yapanın adını (Yönetici / kullanıcı) ekranın sol altında gösterir.
//  - Yönetici girişinde "Kullanıcılar" düğmesi çıkar: kullanıcı ekle / şifre değiştir / sil.
// Kullanım (uygulama girişten sonra):
//   KDHAuth.init({ api: API_URL, key: function(){ return sessionStorage.getItem('kdh_admin_key') || ''; },
//                  get: '',   // hasta için 'anket=hasta&'
//                  post: {},  // hasta için {anket:'hasta'}
//                  title: 'Zimmet' });
(function () {
  var cfg = null, who = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function key() { try { return cfg.key() || ''; } catch (e) { return ''; } }

  function css() {
    if (document.getElementById('kdhAuthCss')) return;
    var st = document.createElement('style'); st.id = 'kdhAuthCss';
    st.textContent = [
      '#kdhWho{position:fixed;left:12px;bottom:12px;z-index:9990;display:flex;gap:6px;align-items:center;font:600 12px/1.2 Inter,system-ui,sans-serif}',
      '#kdhWho .kw-pill{background:#0f172a;color:#f8fafc;padding:7px 12px;border-radius:999px;box-shadow:0 4px 14px rgba(15,23,42,.35);max-width:60vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#kdhWho .kw-pill small{opacity:.65;font-weight:600;margin-left:4px}',
      '#kdhWho button{background:#2563eb;color:#fff;border:0;padding:7px 12px;border-radius:999px;cursor:pointer;font:700 12px/1.2 Inter,system-ui,sans-serif;box-shadow:0 4px 14px rgba(37,99,235,.35)}',
      '#kdhWho button:hover{background:#1d4ed8}',
      '#kdhUsrBack{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:9995;display:none;align-items:center;justify-content:center;padding:16px}',
      '#kdhUsrBack.on{display:flex}',
      '#kdhUsrBox{background:#fff;color:#0f172a;border-radius:16px;width:100%;max-width:560px;max-height:88vh;overflow:auto;padding:18px;box-shadow:0 20px 50px rgba(0,0,0,.35);font:500 13px/1.4 Inter,system-ui,sans-serif}',
      '#kdhUsrBox h3{margin:0 0 4px;font-size:16px;font-weight:800}',
      '#kdhUsrBox p.kd-sub{margin:0 0 12px;color:#64748b;font-size:12px}',
      '#kdhUsrBox .kd-row{display:flex;gap:8px;align-items:center;padding:8px 10px;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:6px;background:#f8fafc}',
      '#kdhUsrBox .kd-row .n{flex:1;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis}',
      '#kdhUsrBox .kd-row .p{font-family:ui-monospace,Menlo,monospace;color:#475569;background:#fff;border:1px solid #e2e8f0;padding:2px 8px;border-radius:6px}',
      '#kdhUsrBox .kd-row button{border:0;border-radius:8px;padding:5px 9px;cursor:pointer;font:700 11px Inter,system-ui,sans-serif}',
      '#kdhUsrBox .b-pw{background:#e0e7ff;color:#3730a3}#kdhUsrBox .b-del{background:#fee2e2;color:#b91c1c}',
      '#kdhUsrBox .kd-add{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-top:12px}',
      '#kdhUsrBox input{border:1px solid #cbd5e1;border-radius:10px;padding:8px 10px;font:500 13px Inter,system-ui,sans-serif;min-width:0;background:#fff;color:#0f172a}',
      '#kdhUsrBox .kd-ok{background:#059669;color:#fff;border:0;border-radius:10px;padding:8px 14px;font:700 12px Inter,system-ui,sans-serif;cursor:pointer}',
      '#kdhUsrBox .kd-close{float:right;background:#f1f5f9;border:0;border-radius:8px;padding:5px 10px;cursor:pointer;font:700 12px Inter,system-ui,sans-serif}',
      '#kdhUsrBox .kd-msg{margin-top:8px;font-size:12px;font-weight:700}',
      '@media(max-width:520px){#kdhUsrBox .kd-add{grid-template-columns:1fr}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  async function getJSON(url) { var r = await fetch(url); return await r.json(); }
  async function postJSON(body) {
    var o = {}; for (var k in (cfg.post || {})) o[k] = cfg.post[k];
    for (var k2 in body) o[k2] = body[k2];
    o.key = key();
    var r = await fetch(cfg.api, { method: 'POST', body: JSON.stringify(o) });
    return await r.json();
  }

  function badge() {
    var el = document.getElementById('kdhWho');
    if (!el) { el = document.createElement('div'); el.id = 'kdhWho'; document.body.appendChild(el); }
    el.innerHTML = '<span class="kw-pill">👤 ' + esc(who.ad) + '<small>' + (who.rol === 'admin' ? 'Yönetici' : 'Kullanıcı') + '</small></span>' +
      (who.rol === 'admin' ? '<button type="button" id="kdhUsrBtn">Kullanıcılar</button>' : '');
    var b = document.getElementById('kdhUsrBtn'); if (b) b.onclick = openModal;
  }

  function ensureModal() {
    if (document.getElementById('kdhUsrBack')) return;
    var d = document.createElement('div'); d.id = 'kdhUsrBack';
    d.innerHTML = '<div id="kdhUsrBox"><button type="button" class="kd-close" id="kdhUsrClose">Kapat</button>' +
      '<h3>Kullanıcılar' + (cfg.title ? ' — ' + esc(cfg.title) : '') + '</h3>' +
      '<p class="kd-sub">Her kullanıcı kendi şifresiyle girer; yaptığı işlemler adıyla kaydedilir. Şifreler birbirinden ve yönetici şifresinden farklı olmalı.</p>' +
      '<div id="kdhUsrList"></div>' +
      '<div class="kd-add"><input id="kdhUsrAd" placeholder="Ad Soyad" maxlength="60" autocomplete="off"><input id="kdhUsrSf" placeholder="Şifre (en az 4 karakter)" maxlength="40" autocomplete="off"><button type="button" class="kd-ok" id="kdhUsrAdd">Ekle</button></div>' +
      '<div class="kd-msg" id="kdhUsrMsg"></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d) d.classList.remove('on'); });
    document.getElementById('kdhUsrClose').onclick = function () { d.classList.remove('on'); };
    document.getElementById('kdhUsrAdd').onclick = addUser;
  }

  function msg(t, ok) { var m = document.getElementById('kdhUsrMsg'); if (m) { m.textContent = t || ''; m.style.color = ok ? '#059669' : '#b91c1c'; } }

  async function load() {
    var box = document.getElementById('kdhUsrList');
    box.innerHTML = '<div style="color:#64748b">Yükleniyor…</div>';
    try {
      var out = await getJSON(cfg.api + '?' + (cfg.get || '') + 'action=kullanicilar&islem=kullanicilar&key=' + encodeURIComponent(key()));
      if (out.status !== 'success') throw new Error(out.message || 'Liste alınamadı');
      var l = out.kullanicilar || [];
      if (!l.length) { box.innerHTML = '<div style="color:#64748b;padding:6px 0">Henüz kullanıcı yok. Aşağıdan ekleyin.</div>'; return; }
      box.innerHTML = l.map(function (u, i) {
        return '<div class="kd-row"><span class="n">' + esc(u.ad) + '</span><span class="p">' + esc(u.sifre) + '</span>' +
          '<button type="button" class="b-pw" data-i="' + i + '">Şifre</button><button type="button" class="b-del" data-i="' + i + '">Sil</button></div>';
      }).join('');
      box.querySelectorAll('.b-pw').forEach(function (b) { b.onclick = function () { changePw(l[+b.dataset.i].ad); }; });
      box.querySelectorAll('.b-del').forEach(function (b) { b.onclick = function () { delUser(l[+b.dataset.i].ad); }; });
    } catch (e) { box.innerHTML = '<div style="color:#b91c1c">Liste alınamadı: ' + esc(e.message) + '</div>'; }
  }

  async function addUser() {
    var ad = document.getElementById('kdhUsrAd').value.trim(), sf = document.getElementById('kdhUsrSf').value.trim();
    if (!ad || !sf) { msg('Ad Soyad ve şifre giriniz.'); return; }
    msg('Kaydediliyor…', true);
    try {
      var out = await postJSON({ action: 'kullaniciEkle', ad: ad, sifre: sf });
      if (out.status !== 'success') { msg(out.message || 'Eklenemedi'); return; }
      document.getElementById('kdhUsrAd').value = ''; document.getElementById('kdhUsrSf').value = '';
      msg('Kullanıcı eklendi.', true); load();
    } catch (e) { msg('Sunucuya ulaşılamadı.'); }
  }
  async function changePw(ad) {
    var sf = prompt(ad + ' için yeni şifre (en az 4 karakter):'); if (sf == null) return; sf = sf.trim();
    if (!sf) return;
    try {
      var out = await postJSON({ action: 'kullaniciSifre', ad: ad, sifre: sf });
      if (out.status !== 'success') { msg(out.message || 'Değiştirilemedi'); return; }
      msg('Şifre değiştirildi.', true); load();
    } catch (e) { msg('Sunucuya ulaşılamadı.'); }
  }
  async function delUser(ad) {
    if (!confirm(ad + ' kullanıcısı silinsin mi?\n(Eski kayıtlardaki adı değişmez.)')) return;
    try {
      var out = await postJSON({ action: 'kullaniciSil', ad: ad });
      if (out.status !== 'success') { msg(out.message || 'Silinemedi'); return; }
      msg('Kullanıcı silindi.', true); load();
    } catch (e) { msg('Sunucuya ulaşılamadı.'); }
  }
  function openModal() { ensureModal(); msg(''); document.getElementById('kdhUsrBack').classList.add('on'); load(); }

  window.KDHAuth = {
    init: async function (o) {
      cfg = o; css();
      try {
        var out = await getJSON(cfg.api + '?' + (cfg.get || '') + 'action=kimlik&islem=kimlik&key=' + encodeURIComponent(key()));
        if (out && out.status === 'success') {
          who = { ad: out.ad, rol: out.rol };
          try { sessionStorage.setItem('kdh_who', JSON.stringify(who)); } catch (e) {}
          badge();
        }
      } catch (e) { /* ağ hatası: etiket gösterilmez, uygulama etkilenmez */ }
    },
    who: function () { if (who) return who; try { return JSON.parse(sessionStorage.getItem('kdh_who') || 'null'); } catch (e) { return null; } },
    hide: function () { var a = document.getElementById('kdhWho'); if (a) a.remove(); }
  };
})();
