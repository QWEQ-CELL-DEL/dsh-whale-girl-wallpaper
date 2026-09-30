/*!
 * dsh-whale-girl-wallpaper — client half (prebuilt browser bundle).
 *
 * The DSH client-modules host serves this file as the package's `./client`
 * export and expects the `window.__ModuleLoader__.load({ id, factory })`
 * handshake. The factory returns the plugin exports (inject / apply).
 *
 * This file is hand-authored in the built form on purpose: it has no
 * external imports, so it needs no bundler step.
 */
window.__ModuleLoader__.load({
  id: "dsh-whale-girl-wallpaper",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;

    var ROUTE = "/dsh-whale-girl-wallpaper";
    var STYLE_ID = "dsh-whale-girl-wallpaper-style";
    var ROOT_ID = "dsh-whale-girl-wallpaper-root";

    var CSS = [
      "html,body{background:transparent !important}",
      ":root{--dsw-alias-bg-base:transparent !important}",
      "#dsh-whale-girl-wallpaper-root{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:#0b0d10}",
      "#dsh-whale-girl-wallpaper-root video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block}",
      "#dsh-whale-girl-wallpaper-root .dsh-wgw-scrim{position:absolute;inset:0;background:radial-gradient(120% 120% at 50% 0%,rgba(0,0,0,.08),rgba(0,0,0,.42))}",
      "#root{position:relative;z-index:1}",
      "@media (prefers-reduced-motion:reduce){#dsh-whale-girl-wallpaper-root video{display:none}" +
        "#dsh-whale-girl-wallpaper-root{background-image:url('" + ROUTE + "/assets/poster.jpg');background-size:cover;background-position:center}}",
    ].join("");

    function ensureStyle() {
      if (document.getElementById(STYLE_ID)) return;
      var style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = CSS;
      (document.head || document.documentElement).appendChild(style);
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

      var reduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) {
        var played = video.play();
        if (played && typeof played.catch === "function") played.catch(function () {});
      }
    }

    function apply() {
      if (typeof document === "undefined") return;
      ensureStyle();
      if (document.body) ensureBackground();
      else document.addEventListener("DOMContentLoaded", ensureBackground, { once: true });
    }

    module.exports = { inject: [], apply: apply };
    return module.exports;
  },
});
