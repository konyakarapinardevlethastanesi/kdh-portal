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
      '@media(max-width:520px){#kdhUsrBox .kd-add{grid-template-columns:1fr}}',
      'body.kdh-user .admin-only,body.kdh-user .col-yapan{display:none!important}',
      '.kdh-hist .hh{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:10px;margin-bottom:10px;font:600 12px Inter,system-ui,sans-serif}',
      '.kdh-hist input,.kdh-hist select{border:1px solid #cbd5e1;border-radius:10px;padding:7px 10px;font:600 12px Inter,system-ui,sans-serif;background:#f8fafc}',
      '.kdh-hist input[type=search]{flex:1;min-width:180px}',
      '.kdh-hist .hw{background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:auto;max-height:640px}',
      '.kdh-hist table{width:100%;border-collapse:collapse;font:500 12px Inter,system-ui,sans-serif;text-align:left}',
      '.kdh-hist th{position:sticky;top:0;background:#f1f5f9;color:#475569;text-transform:uppercase;font-size:10px;font-weight:800;padding:9px 10px;white-space:nowrap}',
      '.kdh-hist td{padding:8px 10px;border-top:1px solid #f1f5f9;vertical-align:top}',
      '.kdh-hist .tg{display:inline-block;padding:2px 8px;border-radius:999px;font-weight:800;font-size:10px;white-space:nowrap}',
      '.kdh-hist .t-e{background:#d1fae5;color:#047857}.kdh-hist .t-d{background:#dbeafe;color:#1d4ed8}.kdh-hist .t-s{background:#fee2e2;color:#b91c1c}.kdh-hist .t-o{background:#e2e8f0;color:#475569}'
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

  // ---- İşlem geçmişi (sadece yönetici) ----
  var HIST = [];
  function tagCls(i) { i = String(i).toLowerCase(); return /silin/.test(i) ? 't-s' : /ekle|kaydedil/.test(i) ? 't-e' : /düzenle|değiştir|güncelle/.test(i) ? 't-d' : 't-o'; }
  function histRender(box) {
    var q = (box.querySelector('.h-q').value || '').toLocaleLowerCase('tr'), u = box.querySelector('.h-u').value, op = box.querySelector('.h-i').value;
    var lim = +(box.dataset.lim || 300);
    var rows = HIST.filter(function (r) {
      if (u && r[1] !== u) return false;
      if (op && r[4] !== op) return false;
      if (q && r.join(' ').toLocaleLowerCase('tr').indexOf(q) < 0) return false;
      return true;
    });
    box.querySelector('.h-c').textContent = rows.length + ' kayıt';
    var shown = rows.slice(0, lim);
    box.querySelector('tbody').innerHTML = shown.length ? shown.map(function (r) {
      return '<tr><td style="white-space:nowrap">' + esc(r[0]) + '</td><td style="font-weight:800">' + esc(r[1]) + '<div style="font-size:10px;color:#94a3b8;font-weight:600">' + esc(r[2]) + '</div></td><td>' + esc(r[3]) + '</td><td><span class="tg ' + tagCls(r[4]) + '">' + esc(r[4]) + '</span></td><td style="font-family:ui-monospace,monospace;color:#64748b">' + esc(r[5]) + '</td><td>' + esc(r[6]) + '</td></tr>';
    }).join('') : '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px">Kayıt yok.</td></tr>';
    var more = box.querySelector('.h-m'); more.style.display = rows.length > lim ? '' : 'none';
  }
  async function histLoad(id) {
    var box = document.getElementById(id); if (!box) return;
    if (!box.dataset.built) {
      box.dataset.built = '1'; box.classList.add('kdh-hist');
      box.innerHTML = '<div class="hh"><input class="h-q" type="search" placeholder="Ara: kullanıcı, işlem, kayıt…"><select class="h-u"><option value="">Tüm kullanıcılar</option></select><select class="h-i"><option value="">Tüm işlemler</option></select><span class="h-c" style="color:#64748b"></span><button type="button" class="h-r" style="margin-left:auto;background:#334155;color:#fff;border:0;border-radius:10px;padding:7px 12px;font:700 12px Inter,system-ui,sans-serif;cursor:pointer">Yenile</button></div>' +
        '<div class="hw"><table><thead><tr><th>Zaman</th><th>İşlemi yapan</th><th>Sayfa</th><th>İşlem</th><th>Kayıt</th><th>Özet</th></tr></thead><tbody></tbody></table><div class="h-m" style="display:none;text-align:center;padding:10px"><button type="button" style="background:#f1f5f9;border:0;border-radius:10px;padding:8px 14px;font:700 12px Inter,system-ui,sans-serif;cursor:pointer">Daha fazla göster</button></div></div>';
      var re = function () { histRender(box); };
      box.querySelector('.h-q').oninput = function () { box.dataset.lim = 300; re(); };
      box.querySelector('.h-u').onchange = function () { box.dataset.lim = 300; re(); };
      box.querySelector('.h-i').onchange = function () { box.dataset.lim = 300; re(); };
      box.querySelector('.h-m button').onclick = function () { box.dataset.lim = (+box.dataset.lim || 300) + 500; re(); };
      box.querySelector('.h-r').onclick = function () { histLoad(id); };
    }
    box.querySelector('tbody').innerHTML = '<tr><td colspan="6" style="text-align:center;color:#64748b;padding:20px">Yükleniyor…</td></tr>';
    try {
      var out = await getJSON(cfg.api + '?' + (cfg.get || '') + 'action=gecmis&islem=gecmis&key=' + encodeURIComponent(key()));
      if (out.status !== 'success') throw new Error(out.message || 'Geçmiş alınamadı');
      HIST = out.gecmis || [];
      var uniq = function (i) { var m = {}; HIST.forEach(function (r) { if (r[i]) m[r[i]] = 1; }); return Object.keys(m).sort(function (a, b) { return a.localeCompare(b, 'tr'); }); };
      var fill = function (sel, first, list) { var cur = sel.value; sel.innerHTML = '<option value="">' + first + '</option>' + list.map(function (v) { return '<option>' + esc(v) + '</option>'; }).join(''); sel.value = list.indexOf(cur) >= 0 ? cur : ''; };
      fill(box.querySelector('.h-u'), 'Tüm kullanıcılar', uniq(1)); fill(box.querySelector('.h-i'), 'Tüm işlemler', uniq(4));
      box.dataset.lim = 300; histRender(box);
    } catch (e) { box.querySelector('tbody').innerHTML = '<tr><td colspan="6" style="color:#b91c1c;padding:16px">Geçmiş alınamadı: ' + esc(e.message) + '</td></tr>'; }
  }

  window.KDHAuth = {
    history: histLoad,
    init: async function (o) {
      cfg = o; css();
      document.body.classList.add('kdh-user');   // yönetici olduğu doğrulanana kadar yönetici-özel öğeler gizli
      try {
        var out = await getJSON(cfg.api + '?' + (cfg.get || '') + 'action=kimlik&islem=kimlik&key=' + encodeURIComponent(key()));
        if (out && out.status === 'success') {
          who = { ad: out.ad, rol: out.rol };
          document.body.classList.toggle('kdh-user', who.rol !== 'admin');
          try { sessionStorage.setItem('kdh_who', JSON.stringify(who)); } catch (e) {}
          badge();
        }
      } catch (e) { /* ağ hatası: etiket gösterilmez, uygulama etkilenmez */ }
    },
    who: function () { if (who) return who; try { return JSON.parse(sessionStorage.getItem('kdh_who') || 'null'); } catch (e) { return null; } },
    hide: function () { var a = document.getElementById('kdhWho'); if (a) a.remove(); }
  };
})();
