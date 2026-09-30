/*!
 * dsh-whale-girl-wallpaper — client half (prebuilt browser bundle).
 * Clears large opaque surfaces (including sibling background layers) at several
 * sample points, re-running on a timer and on every style/class mutation.
 */
window.__ModuleLoader__.load({
  id: "dsh-whale-girl-wallpaper",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    var ROUTE = "/dsh-whale-girl-wallpaper";
    var STYLE_ID = "dsh-whale-girl-wallpaper-style";
    var ROOT_ID = "dsh-whale-girl-wallpaper-root";
    var timer = null;
    var CSS = [
      "html,body{background:transparent !important;background-image:none !important}",
      ":root{--dsw-alias-bg-base:transparent !important}",
      "#root{background:transparent !important;position:relative;z-index:1}",
      "body::before,body::after,#root::before,#root::after{background:transparent !important;background-image:none !important}",
      "#dsh-whale-girl-wallpaper-root{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:#0b0d10}",
      "#dsh-whale-girl-wallpaper-root video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block}",
      "#dsh-whale-girl-wallpaper-root .dsh-wgw-scrim{position:absolute;inset:0;background:rgba(0,0,0,.34)}",
      "@media (prefers-reduced-motion:reduce){#dsh-whale-girl-wallpaper-root video{display:none}#dsh-whale-girl-wallpaper-root{background-image:url('" + ROUTE + "/assets/poster.jpg');background-size:cover;background-position:center}}"
    ].join("");
    var POINTS = [[0.5, 0.5], [0.28, 0.5], [0.72, 0.5], [0.5, 0.15], [0.5, 0.85], [0.75, 0.8]];
    function store(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
    function ensureStyle() {
      var el = document.getElementById(STYLE_ID);
      if (!el) { el = document.createElement("style"); el.id = STYLE_ID; el.textContent = CSS; }
      (document.head || document.documentElement).appendChild(el);
    }
    function isOpaque(el) {
      var cs = window.getComputedStyle(el);
      return cs.backgroundColor !== "rgba(0, 0, 0, 0)" || cs.backgroundImage !== "none";
    }
    function clearBg(el) {
      el.style.setProperty("background-color", "transparent", "important");
      el.style.setProperty("background-image", "none", "important");
    }
    function desc(el) {
      var cls = typeof el.className === "string" ? el.className : "";
      return el.tagName + "." + cls.split(" ").slice(0, 2).join(".") + " bg=" + window.getComputedStyle(el).backgroundColor;
    }
    function stripCover() {
      var found = {};
      var stripped = [];
      try {
        var vw = window.innerWidth, vh = window.innerHeight;
        var minArea = vw * vh * 0.2;
        for (var p = 0; p < POINTS.length; p++) {
          var x = Math.floor(vw * POINTS[p][0]), y = Math.floor(vh * POINTS[p][1]);
          var els;
          try { els = document.elementsFromPoint(x, y) || []; } catch (e) { els = []; }
          for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (el === document.documentElement || el === document.body) continue;
            var r = el.getBoundingClientRect();
            if (r.width * r.height < minArea) continue;
            if (!isOpaque(el)) continue;
            var d = desc(el);
            if (found[d]) continue;
            found[d] = 1;
            stripped.push(d);
            clearBg(el);
          }
        }
        var root = document.getElementById("root");
        if (root && isOpaque(root)) { stripped.push(desc(root)); clearBg(root); }
        document.documentElement.style.setProperty("--dsw-alias-bg-base", "transparent", "important");
        if (document.body) document.body.style.setProperty("background", "transparent", "important");
        ensureStyle();
      } catch (e) { store("dsh-wgw-error", String(e && e.message ? e.message : e)); }
      return stripped;
    }
    function sample(tag) {
      try {
        var vw = window.innerWidth, vh = window.innerHeight;
        var root = document.getElementById("root");
        var layer = document.getElementById(ROOT_ID);
        var vid = layer ? layer.querySelector("video") : null;
        var stack = [];
        try {
          var els = document.elementsFromPoint(Math.floor(vw / 2), Math.floor(vh / 2)) || [];
          for (var i = 0; i < els.length && i < 16; i++) {
            var cs = window.getComputedStyle(els[i]);
            stack.push((i + 1) + "|" + els[i].tagName + "." + (typeof els[i].className === "string" ? els[i].className : "") + " bg=" + cs.backgroundColor + " z=" + cs.zIndex);
          }
        } catch (e) {}
        store("dsh-wgw-diag", JSON.stringify({
          tag: tag, at: new Date().toISOString(),
          rootBg: root ? window.getComputedStyle(root).backgroundColor : "no-root",
          stack: stack,
          layerConnected: layer ? layer.isConnected : false,
          videoConnected: vid ? vid.isConnected : false,
          videoPaused: vid ? vid.paused : null,
          videoReadyState: vid ? vid.readyState : -1,
          videoError: vid && vid.error ? vid.error.code : 0,
          stripped: window.__dshWgwStripped || []
        }));
      } catch (e) {}
    }
    function ensureBackground() {
      if (document.getElementById(ROOT_ID)) return;
      if (!document.body) return;
      var root = document.createElement("div");
      root.id = ROOT_ID;
      root.setAttribute("aria-hidden", "true");
      var video = document.createElement("video");
      video.autoplay = true; video.muted = true; video.loop = true; video.playsInline = true;
      video.setAttribute("playsinline", ""); video.setAttribute("muted", ""); video.setAttribute("preload", "auto");
      video.setAttribute("disablepictureinpicture", ""); video.setAttribute("tabindex", "-1");
      video.poster = ROUTE + "/assets/poster.jpg";
      var source = document.createElement("source");
      source.src = ROUTE + "/assets/wallpaper.mp4"; source.type = "video/mp4";
      video.appendChild(source);
      var scrim = document.createElement("div");
      scrim.className = "dsh-wgw-scrim";
      root.appendChild(video); root.appendChild(scrim);
      document.body.insertBefore(root, document.body.firstChild);
      var reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) { var p = video.play(); if (p && typeof p.catch === "function") p.catch(function () {}); }
    }
    function tick() {
      var s = stripCover();
      if (s.length) window.__dshWgwStripped = s;
    }
    function watch() {
      if (window.__dshWgwObserver) return;
      var pending = false;
      var obs = new MutationObserver(function () {
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(function () { pending = false; tick(); });
      });
      obs.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["style", "class"] });
      window.__dshWgwObserver = obs;
    }
    function apply() {
      if (typeof document === "undefined") return;
      store("dsh-wgw-apply", new Date().toISOString());
      ensureStyle();
      tick();
      watch();
      if (document.body) ensureBackground();
      else document.addEventListener("DOMContentLoaded", ensureBackground, { once: true });
      if (timer === null) {
        timer = window.setInterval(tick, 500);
        window.setTimeout(function () { tick(); sample("t+3s"); }, 3000);
        window.setTimeout(function () { tick(); sample("t+10s"); }, 10000);
        window.addEventListener("load", tick);
        document.addEventListener("DOMContentLoaded", tick);
      }
    }
    module.exports = { inject: [], apply: apply };
    return module.exports;
  }
});
