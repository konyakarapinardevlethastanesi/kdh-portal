/* KDH ortak tema: ana portalda seçilen tema (localStorage 'kdh_theme') giriş ekranlarına uygulanır.
   Varsayılan: koyu. Uygulamaların iç sayfaları etkilenmez, yalnızca giriş ekranları. */
(function () {
  var KEY = 'kdh_theme';
  function get() { try { return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; } catch (e) { return 'dark'; } }
  function apply() { document.documentElement.setAttribute('data-kdh-theme', get()); }
  apply();
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(); });

  var css = [
  /* ---------- KOYU: giriş kartı koyulaşır ---------- */
  'html[data-kdh-theme="dark"] #mainAuthPortal .bg-white\\/95{background:rgba(15,23,42,.92)!important;border-color:#334155!important}',
  'html[data-kdh-theme="dark"] #mainAuthPortal .text-slate-800,html[data-kdh-theme="dark"] #mainAuthPortal .text-slate-900{color:#f1f5f9!important}',
  'html[data-kdh-theme="dark"] #mainAuthPortal .text-slate-600,html[data-kdh-theme="dark"] #mainAuthPortal .text-slate-500{color:#cbd5e1!important}',
  'html[data-kdh-theme="dark"] #mainAuthPortal .border-slate-100{border-color:#334155!important}',
  'html[data-kdh-theme="dark"] #mainAuthPortal input,html[data-kdh-theme="dark"] #mainAuthPortal select{background:#1e293b!important;color:#f8fafc!important;border-color:#475569!important}',
  'html[data-kdh-theme="dark"] #mainAuthPortal button[type="submit"]{background:#2563eb!important;color:#fff!important}',
  /* ---------- AÇIK: zemin ve başlıklar açılır ---------- */
  'html[data-kdh-theme="light"] #mainAuthPortal{background:linear-gradient(160deg,#f8fafc,#e2e8f0)!important}',
  'html[data-kdh-theme="light"] #mainAuthPortal canvas{opacity:.18}',
  'html[data-kdh-theme="light"] #mainAuthPortal h1.text-white{color:#0f172a!important}',
  'html[data-kdh-theme="light"] #mainAuthPortal .text-slate-200{color:#334155!important}',
  'html[data-kdh-theme="light"] #mainAuthPortal .text-slate-400{color:#64748b!important}',
  'html[data-kdh-theme="light"] #mainAuthPortal .bg-white\\/95{background:#fff!important}',
  /* ---------- Güvenlik girişi (guvenlik.html) ---------- */
  'html[data-kdh-theme="dark"] body:has(#v-login:not(.hidden)){background:#020617!important}',
  'html[data-kdh-theme="dark"] #v-login{background:#0f172a!important;border-color:#334155!important}',
  'html[data-kdh-theme="dark"] #v-login .text-slate-900,html[data-kdh-theme="dark"] #v-login .text-slate-800,html[data-kdh-theme="dark"] #v-login .text-slate-700{color:#f1f5f9!important}',
  'html[data-kdh-theme="dark"] #v-login .text-slate-500{color:#cbd5e1!important}',
  'html[data-kdh-theme="dark"] #v-login input,html[data-kdh-theme="dark"] #v-login select{background:#1e293b!important;color:#f8fafc!important;border-color:#475569!important}',
  'html[data-kdh-theme="dark"] #v-login #loginKodInfo{background:rgba(6,78,59,.45)!important;border-color:#059669!important;color:#a7f3d0!important}',
  'html[data-kdh-theme="dark"] #v-login .bg-red-50{background:rgba(127,29,29,.35)!important}',
  /* ---------- Ana portala dön bağlantısı ---------- */
  '#kdhBackLink{position:fixed;top:14px;left:14px;z-index:60;display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:14px;font:800 14px Inter,system-ui,sans-serif;text-decoration:none;cursor:pointer;background:rgba(15,23,42,.8);color:#e2e8f0;border:1.5px solid #475569;backdrop-filter:blur(6px);box-shadow:0 2px 8px rgba(0,0,0,.25);transition:background .18s,color .18s,border-color .18s,transform .12s,box-shadow .18s;-webkit-tap-highlight-color:transparent}',
  '#kdhBackLink:hover{background:#dc2626;border-color:#dc2626;color:#fff;transform:translateY(-1px);box-shadow:0 8px 20px rgba(220,38,38,.4)}',
  '#kdhBackLink:active{transform:translateY(1px) scale(.95);box-shadow:0 1px 3px rgba(0,0,0,.4);filter:brightness(.9)}',
  'html[data-kdh-theme="light"] #kdhBackLink{background:#fff;color:#334155;border-color:#cbd5e1}',
  'html[data-kdh-theme="light"] #kdhBackLink:hover{background:#dc2626;border-color:#dc2626;color:#fff}'
  ].join('\n');
  var st = document.createElement('style'); st.id = 'kdhThemeCss'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  document.addEventListener('DOMContentLoaded', function () {
    var ov = document.getElementById('mainAuthPortal');
    if (ov && !document.getElementById('kdhBackLink')) {
      var a = document.createElement('a'); a.id = 'kdhBackLink'; a.href = '../';
      a.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Ana Portal';
      ov.appendChild(a);
    }
  });
})();
