/*!
 * dsh-whale-girl-wallpaper — client half (prebuilt browser bundle).
 * Injects a fullscreen looping wallpaper video and keeps the DSH surfaces
 * transparent, because the app re-applies its own theme background after mount.
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
      ":root{--dsw-alias-bg-base:transparent !important;--dsw-alias-bg-layer-1:transparent !important;--dsh-desktop-frame-fill:transparent !important}",
      "#root{background:transparent !important;position:relative;z-index:1}",
      "#dsh-whale-girl-wallpaper-root{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:#0b0d10}",
      "#dsh-whale-girl-wallpaper-root video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block}",
      "#dsh-whale-girl-wallpaper-root .dsh-wgw-scrim{position:absolute;inset:0;background:rgba(0,0,0,.38)}",
      "@media (prefers-reduced-motion:reduce){#dsh-whale-girl-wallpaper-root video{display:none}#dsh-whale-girl-wallpaper-root{background-image:url('" + ROUTE + "/assets/poster.jpg');background-size:cover;background-position:center}}",
    ].join("");

    function ensureStyle() {
      var el = document.getElementById(STYLE_ID);
      if (!el) {
        el = document.createElement("style");
        el.id = STYLE_ID;
        el.textContent = CSS;
      }
      (document.head || document.documentElement).appendChild(el);
    }

    function clearBackground(el) {
      if (!el || !el.style) return;
      el.style.setProperty("background-color", "transparent", "important");
      el.style.setProperty("background-image", "none", "important");
    }

    function forceTransparent() {
      try {
        var de = document.documentElement;
        var body = document.body;
        if (de) {
          de.style.setProperty("background", "transparent", "important");
          de.style.setProperty("--dsw-alias-bg-base", "transparent", "important");
          de.style.setProperty("--dsw-alias-bg-layer-1", "transparent", "important");
          de.style.setProperty("--dsh-desktop-frame-fill", "transparent", "important");
        }
        if (body) body.style.setProperty("background", "transparent", "important");
        var root = document.getElementById("root");
        if (root) {
          clearBackground(root);
          var kids = root.children;
          for (var i = 0; i < kids.length; i++) clearBackground(kids[i]);
        }
        ensureStyle();
      } catch (e) {}
    }

    function ensureBackground() {
      if (document.getElementById(ROOT_ID)) return;
      if (!document.body) return;
      var root = document.createElement("div");
      root.id = ROOT_ID;
      root.setAttribute("aria-hidden", "true");
      var video = document.createElement("video");
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("muted", "");
      video.setAttribute("preload", "auto");
      video.setAttribute("disablepictureinpicture", "");
      video.setAttribute("tabindex", "-1");
      video.poster = ROUTE + "/assets/poster.jpg";
      var source = document.createElement("source");
      source.src = ROUTE + "/assets/wallpaper.mp4";
      source.type = "video/mp4";
      video.appendChild(source);
      var scrim = document.createElement("div");
      scrim.className = "dsh-wgw-scrim";
      root.appendChild(video);
      root.appendChild(scrim);
      document.body.insertBefore(root, document.body.firstChild);
      var reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) {
        var played = video.play();
        if (played && typeof played.catch === "function") played.catch(function () {});
      }
    }

    function apply() {
      if (typeof document === "undefined") return;
      ensureStyle();
      forceTransparent();
      if (document.body) ensureBackground();
      else document.addEventListener("DOMContentLoaded", ensureBackground, { once: true });
      if (timer === null) {
        timer = window.setInterval(forceTransparent, 700);
        window.addEventListener("load", forceTransparent);
        document.addEventListener("DOMContentLoaded", forceTransparent);
      }
    }

    module.exports = { inject: [], apply: apply };
    return module.exports;
  },
});
