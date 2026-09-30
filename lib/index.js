/**
 * dsh-whale-girl-wallpaper — host half (node).
 *
 * Serves the packaged wallpaper assets over the DSH web server so the
 * browser half can point a fullscreen <video> at them.
 *
 * Contract: { name, inject: ["webServer"], apply(ctx, config) }.
 * Route: <config.route>/assets/<file> (default /dsh-whale-girl-wallpaper).
 */
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const name = "whale-girl-wallpaper";
export const inject = ["webServer"];

const DEFAULT_ROUTE = "/dsh-whale-girl-wallpaper";
const ASSETS_DIR = resolve(fileURLToPath(new URL("../assets/", import.meta.url)));

const MIME = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function fail(res, status, message) {
  if (res.headersSent) { res.destroy?.(); return; }
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(message);
}

export function apply(ctx, config) {
  const route =
    config && typeof config.route === "string" && config.route.startsWith("/")
      ? config.route.replace(/\/+$/, "")
      : DEFAULT_ROUTE;
  const prefix = route + "/assets/";

  const handler = (req, res) => {
    try {
      const method = req.method || "GET";
      if (method !== "GET" && method !== "HEAD") {
        res.writeHead(405, { allow: "GET, HEAD" });
        res.end("method not allowed");
        return;
      }

      const rawPath = String(req.url || "").split("?")[0];
      if (!rawPath.startsWith(prefix)) { fail(res, 404, "not found"); return; }

      let relative;
      try {
        relative = decodeURIComponent(rawPath.slice(prefix.length));
      } catch {
        fail(res, 400, "bad request");
        return;
      }
      if (!relative || relative.includes("\0")) { fail(res, 404, "not found"); return; }

      const target = resolve(join(ASSETS_DIR, normalize(relative)));
      if (target !== ASSETS_DIR && !target.startsWith(ASSETS_DIR + sep)) {
        fail(res, 403, "forbidden");
        return;
      }

      let stat;
      try {
        stat = statSync(target);
      } catch {
        fail(res, 404, "not found");
        return;
      }
      if (!stat.isFile()) { fail(res, 404, "not found"); return; }

      const headers = {
        "content-type": MIME[extname(target).toLowerCase()] || "application/octet-stream",
        "accept-ranges": "bytes",
        "cache-control": "public, max-age=86400",
      };

      const range = req.headers && req.headers.range;
      if (typeof range === "string" && /^bytes=\d*-\d*$/.test(range.trim()) && stat.size > 0) {
        const parts = range.trim().replace(/^bytes=/, "").split("-");
        const start = parts[0] === "" ? 0 : Number(parts[0]);
        let end = parts[1] === "" ? stat.size - 1 : Number(parts[1]);
        if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= stat.size) {
          res.writeHead(416, { "content-range": "bytes */" + stat.size });
          res.end();
          return;
        }
        end = Math.min(end, stat.size - 1);
        res.writeHead(206, Object.assign({}, headers, {
          "content-range": "bytes " + start + "-" + end + "/" + stat.size,
          "content-length": String(end - start + 1),
        }));
        if (method === "HEAD") { res.end(); return; }
        createReadStream(target, { start, end }).pipe(res);
        return;
      }

      res.writeHead(200, Object.assign({}, headers, { "content-length": String(stat.size) }));
      if (method === "HEAD") { res.end(); return; }
      createReadStream(target).pipe(res);
    } catch (error) {
      fail(res, 500, "internal error");
      if (ctx && ctx.logger && typeof ctx.logger.warn === "function") {
        ctx.logger.warn("whale-girl-wallpaper: " + String((error && error.message) || error));
      }
    }
  };

  ctx.effect(
    () => ctx.webServer.register({ kind: "prefix", path: route, handler }),
    "whale-girl-wallpaper: serve wallpaper assets",
  );
}
