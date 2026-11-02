/* KDH uygulama içi takvim: telefonun kendi takvimi yerine sayfanın kendi takvimi açılır.
   input[type=date] alanlarını otomatik yükseltir (sonradan eklenenleri de). Değer ISO (yyyy-aa-gg) kalır,
   ekranda gg.aa.yyyy görünür. min / max desteklenir. Takvimin içinde "Bugün" (ve isteğe bağlı "Temizle") vardır.
   Temizle düğmesi için alana data-clear="1" ekleyin. */
(function () {
  var AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var GUN = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  var p2 = function (n) { return String(n).padStart(2, "0"); };
  var iso = function (y, m, d) { return y + "-" + p2(m + 1) + "-" + p2(d); };
  var parse = function (s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null; };
  var fmt = function (s) { var o = parse(s); return o ? p2(o.d) + "." + p2(o.m + 1) + "." + o.y : ""; };
  var todayIso = function () { var d = new Date(); return iso(d.getFullYear(), d.getMonth(), d.getDate()); };
  var valDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");

  var css = [
    ".kcal-back{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px}",
    ".kcal{background:#fff;color:#0f172a;border-radius:18px;width:100%;max-width:340px;padding:14px;box-shadow:0 20px 50px rgba(0,0,0,.35);font-family:Inter,system-ui,sans-serif;user-select:none}",
    ".kcal-head{display:flex;align-items:center;gap:6px;margin-bottom:10px}",
    ".kcal-head select{flex:1;min-width:0;padding:7px 6px;border:1px solid #cbd5e1;border-radius:10px;font:700 13px Inter,system-ui,sans-serif;background:#fff;color:#0f172a}",
    ".kcal-nav{width:36px;height:36px;border:0;border-radius:10px;background:#f1f5f9;color:#334155;font-size:15px;cursor:pointer;flex:none}",
    ".kcal-nav:hover{background:#e2e8f0}.kcal-nav:disabled{opacity:.3;cursor:default}",
    ".kcal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}",
    ".kcal-wd{text-align:center;font:800 10px Inter,system-ui,sans-serif;color:#64748b;padding:4px 0}",
    ".kcal-d{height:38px;border:0;border-radius:10px;background:transparent;color:#0f172a;font:700 13px Inter,system-ui,sans-serif;cursor:pointer}",
    ".kcal-d:hover{background:#e0e7ff}.kcal-d.off{color:#cbd5e1;cursor:default;background:transparent}",
    ".kcal-d.today{box-shadow:inset 0 0 0 2px #2563eb}.kcal-d.sel{background:#2563eb;color:#fff}",
    ".kcal-foot{display:flex;gap:8px;margin-top:10px}",
    ".kcal-foot button{flex:1;padding:10px;border:0;border-radius:12px;font:800 12px Inter,system-ui,sans-serif;cursor:pointer}",
    ".kcal-today{background:#2563eb;color:#fff}.kcal-today:disabled{opacity:.35;cursor:default}",
    ".kcal-clear{background:#f1f5f9;color:#334155}.kcal-close{background:#0f172a;color:#fff}"
  ].join("\n");
  var st = document.createElement("style"); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  var back = null;
  function close() { if (back) { back.remove(); back = null; document.removeEventListener("keydown", onKey, true); } }
  function onKey(e) { if (e.key === "Escape") { e.stopPropagation(); close(); } }

  function setValue(el, v) {
    el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function open(el) {
    close();
    var cur = parse(el.value), now = parse(todayIso());
    var min = parse(el.min), max = parse(el.max);
    var view = cur || (max && (max.y * 400 + max.m * 32 + max.d) < (now.y * 400 + now.m * 32 + now.d) ? max : now);
    var y = view.y, m = view.m;
    var minK = min ? iso(min.y, min.m, min.d) : "", maxK = max ? iso(max.y, max.m, max.d) : "";
    var tIso = todayIso();
    var inRange = function (k) { return (!minK || k >= minK) && (!maxK || k <= maxK); };

    back = document.createElement("div"); back.className = "kcal-back";
    var box = document.createElement("div"); box.className = "kcal"; back.appendChild(box);
    back.addEventListener("mousedown", function (e) { if (e.target === back) close(); });
    back.addEventListener("touchstart", function (e) { if (e.target === back) close(); }, { passive: true });
    document.addEventListener("keydown", onKey, true);

    function render() {
      var y0 = min ? min.y : Math.min(now.y - 10, y), y1 = max ? max.y : Math.max(now.y + 1, y);
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      var ys = ""; for (var k = y1; k >= y0; k--) ys += '<option value="' + k + '"' + (k === y ? " selected" : "") + ">" + k + "</option>";
      var ms = AYLAR.map(function (a, i) { return '<option value="' + i + '"' + (i === m ? " selected" : "") + ">" + a + "</option>"; }).join("");
      var first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      var cells = GUN.map(function (g) { return '<div class="kcal-wd">' + g + "</div>"; }).join("");
      for (var i = 0; i < lead; i++) cells += "<div></div>";
      for (var d = 1; d <= days; d++) {
        var k2 = iso(y, m, d), ok = inRange(k2);
        cells += '<button type="button" class="kcal-d' + (ok ? "" : " off") + (k2 === tIso ? " today" : "") + (k2 === el.value ? " sel" : "") + '" data-d="' + k2 + '"' + (ok ? "" : " disabled") + ">" + d + "</button>";
      }
      var prevOk = !minK || iso(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, new Date(m === 0 ? y - 1 : y, (m === 0 ? 11 : m - 1) + 1, 0).getDate()) >= minK;
      var nextOk = !maxK || iso(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1, 1) <= maxK;
      box.innerHTML = '<div class="kcal-head"><button type="button" class="kcal-nav" data-nav="-1"' + (prevOk ? "" : " disabled") + '>&#10094;</button>'
        + '<select data-m>' + ms + '</select><select data-y>' + ys + '</select>'
        + '<button type="button" class="kcal-nav" data-nav="1"' + (nextOk ? "" : " disabled") + '>&#10095;</button></div>'
        + '<div class="kcal-grid">' + cells + '</div>'
        + '<div class="kcal-foot"><button type="button" class="kcal-today" data-today' + (inRange(tIso) ? "" : " disabled") + '>Bugün</button>'
        + (el.dataset.clear === "1" ? '<button type="button" class="kcal-clear" data-clear>Temizle</button>' : "")
        + '<button type="button" class="kcal-close" data-close>Kapat</button></div>';
    }
    box.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t || t.disabled) return;
      if (t.dataset.d) { setValue(el, t.dataset.d); close(); }
      else if (t.hasAttribute("data-today")) { setValue(el, tIso); close(); }
      else if (t.hasAttribute("data-clear")) { setValue(el, ""); close(); }
      else if (t.hasAttribute("data-close")) close();
      else if (t.dataset.nav) { m += +t.dataset.nav; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } render(); }
    });
    box.addEventListener("change", function (e) {
      if (e.target.hasAttribute("data-m")) m = +e.target.value;
      if (e.target.hasAttribute("data-y")) y = +e.target.value;
      render();
    });
    render();
    document.body.appendChild(back);
  }

  function attach(el) {
    if (el.dataset.kcal) return; el.dataset.kcal = "1";
    var disp = document.createElement("input");
    disp.type = "text"; disp.className = el.className; disp.size = 11; disp.autocomplete = "off";
    disp.placeholder = "gg.aa.yyyy"; disp.setAttribute("inputmode", "none"); disp.style.cursor = "pointer";
    disp.dataset.kcalFor = el.id || "";
    disp.required = el.required; el.required = false;   // doğrulama görünen alanda yapılır
    el.style.display = "none"; el.tabIndex = -1;
    el.parentNode.insertBefore(disp, el.nextSibling);
    Object.defineProperty(el, "value", {
      configurable: true,
      get: function () { return valDesc.get.call(el); },
      set: function (v) { valDesc.set.call(el, v); disp.value = fmt(valDesc.get.call(el)); }
    });
    disp.value = fmt(el.value);
    disp.addEventListener("click", function () { open(el); });
    disp.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); open(el); }
      else if (e.key !== "Tab" && e.key !== "Escape") e.preventDefault();
    });
    ["beforeinput", "paste", "drop"].forEach(function (ev) { disp.addEventListener(ev, function (e) { e.preventDefault(); }); });
    if (el.form) el.form.addEventListener("reset", function () { setTimeout(function () { disp.value = fmt(valDesc.get.call(el)); }, 0); });
  }
  function scan(root) { (root || document).querySelectorAll('input[type="date"]').forEach(attach); }

  function start() {
    scan(document);
    new MutationObserver(function (list) {
      list.forEach(function (r) { r.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.matches && n.matches('input[type="date"]')) attach(n); scan(n); } }); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.KdhCal = { scan: scan, open: open, fmt: fmt };
})();
