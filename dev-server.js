/**
 * 超輕量本機靜態伺服器（避免 file:// 阻擋 ES Module）
 *
 * 用法：
 *   cd BOUND
 *   node dev-server.js
 *
 * 之後打開：
 *   http://127.0.0.1:5180/
 */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname);
const DEFAULT_PORT = 5180;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
};

function safeJoin(base, requestPath) {
  const cleaned = requestPath.split("?")[0].split("#")[0];
  const decoded = decodeURIComponent(cleaned);
  const rel = decoded.replace(/^[\\/]+/, ""); // 去掉開頭 / 或 \
  const abs = path.resolve(base, rel);
  if (!abs.startsWith(base)) return null; // 防止 ../ 逃逸
  return abs;
}

function send(res, code, body, headers = {}) {
  res.writeHead(code, { "Cache-Control": "no-store", ...headers });
  res.end(body);
}

function serveFile(res, filePath) {
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      send(res, 404, "Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    fs.createReadStream(filePath).pipe(res);
  });
}

function createServer() {
  return http.createServer((req, res) => {
    try {
      const url = req.url || "/";

      if (url === "/" || url.startsWith("/?")) {
        serveFile(res, path.join(ROOT, "index.html"));
        return;
      }

      const abs = safeJoin(ROOT, url);
      if (!abs) {
        send(res, 400, "Bad Request");
        return;
      }

      // 若是目錄，嘗試 index.html
      fs.stat(abs, (err, st) => {
        if (!err && st.isDirectory()) {
          serveFile(res, path.join(abs, "index.html"));
          return;
        }
        serveFile(res, abs);
      });
    } catch (e) {
      send(res, 500, `Server Error: ${e?.message || String(e)}`);
    }
  });
}

function listenWithFallback(startPort, maxTries = 20) {
  let port = Number(process.env.PORT) || startPort;
  let tries = 0;

  const server = createServer();

  const tryListen = () => {
    server.once("error", (err) => {
      if (err && err.code === "EADDRINUSE" && tries < maxTries) {
        tries += 1;
        port += 1;
        tryListen();
        return;
      }
      console.error(err);
      process.exit(1);
    });

    server.listen(port, "127.0.0.1", () => {
      console.log(`BOUND dev server running`);
      console.log(`- root: ${ROOT}`);
      console.log(`- url : http://127.0.0.1:${port}/`);
      console.log(`（若要換埠：PORT=xxxx node dev-server.js）`);
    });
  };

  tryListen();
}

listenWithFallback(DEFAULT_PORT);

