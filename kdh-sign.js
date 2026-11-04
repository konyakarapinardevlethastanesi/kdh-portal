// KDH ortak İmza Alanı modülü (Çalışan Anketi + Hasta Memnuniyeti raporları)
//  - "İmzacı Seçiniz" penceresi: imza sayısı (1-5), her imzacı için şablondan seç / elle yaz / şablona kaydet
//  - Şablonlar ve son seçim sunucuda tutulur: hangi bilgisayar/telefondan girilirse aynı görünür
//  - Rapor çıktısındaki imza yerleşimi:
//      1-3 imzacı : tek satır, eşit aralıklı, 1. kişi en sağda
//      4-5 imzacı : üst satırda 2..n (2. en sağda), 1. kişi bir alt satırda ortada
(function () {
  var cfg = null, T = [], META = null, S = { count: 3, list: [] }, META_DEF = { kod: '', yayin: '', revNo: '', revTar: '' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function key() { try { return cfg.key() || ''; } catch (e) { return ''; } }
  function lsGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function isAdmin() { try { var w = window.KDHAuth && KDHAuth.who(); return !!w && w.rol === 'admin'; } catch (e) { return false; } }

  function css() {
    if (document.getElementById('kdhSignCss')) return;
    var st = document.createElement('style'); st.id = 'kdhSignCss';
    st.textContent = [
      '.kdh-sig{margin-top:5mm}',
      '.kdh-sig .r{display:flex;flex-direction:row-reverse;justify-content:space-around}',
      '.kdh-sig .r2{justify-content:center;margin-top:6mm}',
      '.kdh-sig .r > div{flex:1 1 0;min-width:0;text-align:center;padding:0 2mm;min-height:12mm}',
      '.kdh-sig .r2 > div{flex:0 1 33.3%}',
      '.kdh-sig b{display:block;font-size:9.5pt;line-height:1.2}',
      '.kdh-sig span{display:block;font-size:9pt;line-height:1.2;margin-top:1mm}',
      '.ks-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}',
      '.ks-t{font:700 11px Inter,system-ui,sans-serif;color:#334155}.ks-t small{font-weight:600;color:#94a3b8}',
      '.ks-btn{background:#0f172a;color:#fff;border:0;border-radius:12px;padding:8px 14px;font:700 12px Inter,system-ui,sans-serif;cursor:pointer;display:inline-flex;gap:6px;align-items:center}',
      '.ks-btn:hover{background:#1e293b}',
      '.ks-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
      '.ks-chip{display:flex;gap:6px;align-items:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:5px 10px;font:600 11px Inter,system-ui,sans-serif;color:#334155}',
      '.ks-no{width:20px;height:20px;border-radius:999px;background:#0f172a;color:#fff;font:800 10px Inter,system-ui,sans-serif;display:inline-flex;align-items:center;justify-content:center;flex:none}',
      '.ks-prevl{margin:10px 0 4px;font:700 10px Inter,system-ui,sans-serif;color:#94a3b8;text-transform:uppercase}',
      '.ks-prev{border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc;padding:10px 6px}',
      '.ks-prev .kdh-sig{margin-top:0}.ks-prev .kdh-sig b{font-size:10px}.ks-prev .kdh-sig span{font-size:9px}.ks-prev .kdh-sig .r > div{min-height:0}.ks-prev .kdh-sig .r2{margin-top:8px}',
      '#ksBack{position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:9996;display:none;align-items:center;justify-content:center;padding:14px}',
      '#ksBack.on{display:flex}',
      '#ksBox{background:#fff;color:#0f172a;border-radius:18px;width:100%;max-width:680px;max-height:92vh;overflow:auto;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,.4);font:500 13px/1.4 Inter,system-ui,sans-serif}',
      '#ksBox h3{margin:0;font-size:16px;font-weight:800}',
      '#ksBox .ks-sub{margin:2px 0 12px;color:#64748b;font-size:12px}',
      '#ksBox .ks-cnt{display:flex;gap:8px;align-items:center;margin-bottom:10px;font-weight:700;font-size:12px}',
      '#ksBox select,#ksBox input{border:1px solid #cbd5e1;border-radius:10px;padding:8px 10px;font:600 12px Inter,system-ui,sans-serif;background:#fff;color:#0f172a;min-width:0;width:100%}',
      '#ksBox .ks-row{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center;border:1px solid #e2e8f0;background:#f8fafc;border-radius:12px;padding:10px;margin-bottom:8px}',
      '#ksBox .ks-row .ks-no{grid-row:span 3}',
      '#ksBox .ks-save{justify-self:start;background:#e0e7ff;color:#3730a3;border:0;border-radius:8px;padding:5px 10px;font:700 11px Inter,system-ui,sans-serif;cursor:pointer}',
      '#ksBox .ks-tpl{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 12px}',
      '#ksBox .ks-tp{display:flex;gap:6px;align-items:center;background:#eef2ff;border-radius:999px;padding:4px 6px 4px 12px;font:600 11px Inter,system-ui,sans-serif;color:#3730a3}',
      '#ksBox .ks-tp button{border:0;background:#c7d2fe;color:#3730a3;border-radius:999px;width:20px;height:20px;cursor:pointer;font-weight:800;line-height:1}',
      '#ksBox .ks-act{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}',
      '#ksBox .ks-ok{background:#059669;color:#fff;border:0;border-radius:12px;padding:9px 18px;font:700 12px Inter,system-ui,sans-serif;cursor:pointer}',
      '#ksBox .ks-no2{background:#f1f5f9;color:#334155;border:0;border-radius:12px;padding:9px 18px;font:700 12px Inter,system-ui,sans-serif;cursor:pointer}',
      '#ksBox .ks-msg{font-size:12px;font-weight:700;margin-top:6px;min-height:16px}'
    ].join('\n');
    document.head.appendChild(st);
  }

  // Rapor çıktısı için imza HTML'i (boş olanlar atlanır)
  function sigHtml(sig) {
    var list = (sig || []).filter(function (x) { return (x.name || '').trim() || (x.title || '').trim(); });
    if (!list.length) return '';
    var cell = function (x) { return '<div><b>' + esc(x.name) + '</b><span>' + esc(x.title) + '</span></div>'; };
    if (list.length <= 3) return '<div class="kdh-sig"><div class="r">' + list.map(cell).join('') + '</div></div>';
    return '<div class="kdh-sig"><div class="r">' + list.slice(1).map(cell).join('') + '</div><div class="r r2">' + cell(list[0]) + '</div></div>';
  }
  // Form üzerindeki yerleşim önizlemesi (numaralı)
  function previewHtml(n) {
    var cell = function (i) { return '<div><b><span class="ks-no" style="display:inline-flex;margin:0 auto">' + i + '</span></b><span style="color:#94a3b8">Adı soyadı</span></div>'; };
    var idx = []; for (var i = 1; i <= n; i++) idx.push(i);
    if (n <= 3) return '<div class="kdh-sig"><div class="r">' + idx.map(cell).join('') + '</div></div>';
    return '<div class="kdh-sig"><div class="r">' + idx.slice(1).map(cell).join('') + '</div><div class="r r2">' + cell(1) + '</div></div>';
  }

  async function getJSON(url) { var r = await fetch(url); return await r.json(); }
  async function postJSON(body) {
    var o = {}, k;
    for (k in (cfg.post || {})) o[k] = cfg.post[k];
    for (k in body) o[k] = body[k];
    o.key = key();
    var r = await fetch(cfg.api, { method: 'POST', body: JSON.stringify(o) });
    return await r.json();
  }
  function q(extra) { return cfg.api + '?' + (cfg.get || '') + extra + '&key=' + encodeURIComponent(key()); }

  function normList(list, n) {
    var out = []; for (var i = 0; i < n; i++) { var p = (list && list[i]) || {}; out.push({ name: String(p.name || ''), title: String(p.title || '') }); }
    return out;
  }
  function signers() { return normList(S.list, S.count).map(function (x) { return { name: x.name.trim(), title: x.title.trim() }; }); }

  // ---- Form özeti ----
  function renderSummary() {
    var el = document.getElementById(cfg.mount); if (!el) return;
    var list = signers();
    el.innerHTML = '<div class="ks-bar"><div class="ks-t"><i class="fa-solid fa-signature" style="margin-right:4px;color:#64748b"></i> İmza Alanı <small>(' + S.count + ' imzacı · 1. kişi en sağda' + (S.count > 3 ? ', alt satırda ortada' : '') + ')</small></div>' +
      '<button type="button" class="ks-btn" id="ksOpen"><i class="fa-solid fa-user-pen"></i> İmzacı Seçiniz</button></div>' +
      '<div class="ks-chips">' + list.map(function (x, i) {
        return '<div class="ks-chip"><span class="ks-no">' + (i + 1) + '</span><span>' + (x.name || x.title ? '<b>' + esc(x.name || '—') + '</b>' + (x.title ? ' · ' + esc(x.title) : '') : '<i style="color:#94a3b8">boş</i>') + '</span></div>';
      }).join('') + '</div>' +
      '<div class="ks-prevl">Raporda imza yerleşimi</div><div class="ks-prev">' + previewHtml(S.count) + '</div>';
    document.getElementById('ksOpen').onclick = openPicker;
  }

  // ---- Seçim penceresi ----
  var W = null; // geçici (pencere açıkken)
  function ensureModal() {
    if (document.getElementById('ksBack')) return;
    var d = document.createElement('div'); d.id = 'ksBack'; d.innerHTML = '<div id="ksBox"></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d) closePicker(); });
  }
  function closePicker() { var b = document.getElementById('ksBack'); if (b) b.classList.remove('on'); }
  function msg(t, ok) { var m = document.getElementById('ksMsg'); if (m) { m.textContent = t || ''; m.style.color = ok ? '#059669' : '#b91c1c'; } }

  function readRows() {
    var out = [];
    for (var i = 0; i < W.count; i++) {
      var n = document.getElementById('ksN' + i), t = document.getElementById('ksT' + i);
      out.push({ name: n ? n.value.trim() : '', title: t ? t.value.trim() : '' });
    }
    return out;
  }
  function drawModal() {
    var box = document.getElementById('ksBox');
    var tplOpts = '<option value="">— Şablondan seç —</option>' + T.map(function (t, i) { return '<option value="' + i + '">' + esc(t.ad) + (t.unvan ? ' — ' + esc(t.unvan) : '') + '</option>'; }).join('');
    var rows = '';
    for (var i = 0; i < W.count; i++) {
      var p = W.list[i] || {};
      rows += '<div class="ks-row"><span class="ks-no">' + (i + 1) + '</span>' +
        '<select data-i="' + i + '" class="ks-sel">' + tplOpts + '</select>' +
        '<input id="ksN' + i + '" type="text" placeholder="Ad Soyad" value="' + esc(p.name || '') + '" maxlength="80" autocomplete="off">' +
        '<div style="display:flex;gap:8px;align-items:center"><input id="ksT' + i + '" type="text" placeholder="Ünvan" value="' + esc(p.title || '') + '" maxlength="120" autocomplete="off"><button type="button" class="ks-save" data-i="' + i + '">Şablona kaydet</button></div></div>';
    }
    box.innerHTML = '<h3>İmzacı Seçiniz</h3><p class="ks-sub">Şablondan seçin ya da elle yazın. Şablonlar tüm cihazlarda ve tüm kullanıcılarda aynı görünür.</p>' +
      '<div class="ks-cnt">İmza sayısı: <select id="ksCount" style="width:auto">' + [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + (n === W.count ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select>' +
      '<span style="color:#94a3b8;font-weight:600">4-5 imzada 1. kişi alt satırda ortada yer alır</span></div>' +
      rows +
      '<div class="ks-prevl">Kayıtlı şablonlar' + (isAdmin() ? ' (silmek için ×)' : '') + '</div><div class="ks-tpl">' +
      (T.length ? T.map(function (t, i) { return '<span class="ks-tp">' + esc(t.ad) + (t.unvan ? ' · ' + esc(t.unvan) : '') + (isAdmin() ? '<button type="button" data-del="' + i + '" title="Sil">×</button>' : '') + '</span>'; }).join('') : '<span style="color:#94a3b8;font-size:12px">Henüz şablon yok. Bir imzacıyı yazıp “Şablona kaydet” deyin.</span>') + '</div>' +
      '<div class="ks-msg" id="ksMsg"></div><div class="ks-act"><button type="button" class="ks-no2" id="ksCancel">Vazgeç</button><button type="button" class="ks-ok" id="ksApply">Uygula</button></div>';

    document.getElementById('ksCount').onchange = function () { W.list = readRows().concat(Array(5).fill({ name: '', title: '' })); W.count = +this.value; W.list = W.list.slice(0, 5); drawModal(); };
    box.querySelectorAll('.ks-sel').forEach(function (s) {
      s.onchange = function () { if (s.value === '') return; var t = T[+s.value], i = s.dataset.i; document.getElementById('ksN' + i).value = t.ad; document.getElementById('ksT' + i).value = t.unvan; s.value = ''; };
    });
    box.querySelectorAll('.ks-save').forEach(function (b) { b.onclick = function () { saveTpl(+b.dataset.i); }; });
    box.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { delTpl(+b.dataset.del); }; });
    document.getElementById('ksCancel').onclick = closePicker;
    document.getElementById('ksApply').onclick = apply;
  }
  async function reloadTpl() {
    try { var o = await getJSON(q('islem=imzalar')); if (o.status === 'success') T = o.sablonlar || []; } catch (e) {}
  }
  async function saveTpl(i) {
    var r = readRows()[i];
    if (!r.name) { msg('Önce Ad Soyad yazın.'); return; }
    msg('Kaydediliyor…', true);
    try {
      var o = await postJSON({ action: 'imzaKaydet', ad: r.name, unvan: r.title });
      if (o.status !== 'success') { msg(o.message || 'Kaydedilemedi'); return; }
      var keep = readRows(); await reloadTpl(); W.list = keep; drawModal(); msg('Şablon kaydedildi.', true);
    } catch (e) { msg('Sunucuya ulaşılamadı (Apps Script güncel mi?).'); }
  }
  async function delTpl(i) {
    var t = T[i]; if (!t || !confirm(t.ad + ' şablonu silinsin mi?')) return;
    try {
      var o = await postJSON({ action: 'imzaSil', ad: t.ad });
      if (o.status !== 'success') { msg(o.message || 'Silinemedi'); return; }
      var keep = readRows(); await reloadTpl(); W.list = keep; drawModal(); msg('Şablon silindi.', true);
    } catch (e) { msg('Sunucuya ulaşılamadı.'); }
  }
  async function apply() {
    S.count = W.count; S.list = readRows();
    lsSet('kdh_sign_' + cfg.tur, S);
    renderSummary(); closePicker();
    try { await postJSON({ action: 'ayarKaydet', anahtar: 'imza_' + cfg.tur, deger: S }); } catch (e) { /* yerel kayıt yeterli */ }
    if (cfg.onChange) cfg.onChange(signers());
  }
  async function openPicker() {
    ensureModal();
    await reloadTpl();
    W = { count: S.count, list: normList(S.list, 5) };
    drawModal();
    document.getElementById('ksBack').classList.add('on');
  }

  window.KDHSign = {
    sigHtml: sigHtml,
    init: async function (c) {
      cfg = c; css();
      var loc = lsGet('kdh_sign_' + cfg.tur, null);
      if (loc && loc.count) S = { count: Math.min(5, Math.max(1, +loc.count)), list: normList(loc.list, 5) };
      renderSummary();
      try {
        var res = await Promise.all([getJSON(q('islem=imzalar')), getJSON(q('islem=ayar'))]);
        if (res[0].status === 'success') T = res[0].sablonlar || [];
        var a = res[1].status === 'success' ? (res[1].ayar || {}) : {};
        var sv = a['imza_' + cfg.tur];
        if (sv && sv.count) { S = { count: Math.min(5, Math.max(1, +sv.count)), list: normList(sv.list, 5) }; lsSet('kdh_sign_' + cfg.tur, S); }
        META = a['meta_' + cfg.tur] || null;
      } catch (e) { /* sunucu eski sürümse yerel kayıt kullanılır */ }
      renderSummary();
      return S;
    },
    signers: signers,
    // Doküman kodları: sunucuda (tüm cihazlarda aynı) ve yerelde saklanır; kullanıcı değiştirene kadar aynı kalır
    meta: function (def) { var m = META || (cfg ? lsGet('kdh_meta_' + cfg.tur, null) : null); return Object.assign({}, def || META_DEF, m || {}); },
    saveMeta: async function (m) {
      if (!cfg) return;
      META = m; lsSet('kdh_meta_' + cfg.tur, m);
      try { await postJSON({ action: 'ayarKaydet', anahtar: 'meta_' + cfg.tur, deger: m }); } catch (e) {}
    }
  };
})();
