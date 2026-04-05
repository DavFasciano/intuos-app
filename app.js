/**
 * app.js — Server Node.js per intuos-site
 * Serve file statici dalla directory corrente sulla porta 3000.
 * Nginx fa da reverse proxy (porta 80/443) verso questa porta.
 */

const http = require("http");
const fs   = require("fs");
const path = require("path");

const PORT    = process.env.PORT || 3000;
const WEBROOT = __dirname;          // la root è la cartella del repo

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css" : "text/css",
  ".js"  : "application/javascript",
  ".json": "application/json",
  ".png" : "image/png",
  ".jpg" : "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif" : "image/gif",
  ".svg" : "image/svg+xml",
  ".ico" : "image/x-icon",
  ".txt" : "text/plain",
};

const server = http.createServer((req, res) => {
  // Rimuovi query string e decodifica URL
  let urlPath = decodeURIComponent(req.url.split("?")[0]);

  // Sicurezza: blocca path traversal
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  let filePath   = path.join(WEBROOT, safePath);

  // Se punta a una directory, serve index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // 404 personalizzato
      const notFound = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>404 – Pagina non trovata</title>
<style>
  body { font-family: monospace; background:#0d1117; color:#c9d1d9;
         display:flex; align-items:center; justify-content:center;
         height:100vh; margin:0; flex-direction:column; gap:1rem; }
  h1   { font-size:4rem; margin:0; color:#58a6ff; }
  p    { font-size:1.2rem; }
  a    { color:#58a6ff; text-decoration:none; }
  a:hover { text-decoration:underline; }
</style></head>
<body>
  <h1>404</h1>
  <p>Pagina non trovata: <code>${safePath}</code></p>
  <a href="/">← Torna alla home</a>
</body></html>`;
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(notFound);
      return;
    }

    const ext      = path.extname(filePath).toLowerCase();
    const mimeType = MIME[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type"  : mimeType,
      "Cache-Control" : "public, max-age=60",
      "X-Powered-By"  : "intuos-site/node",
    });
    res.end(data);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[intuos-site] Server attivo su http://127.0.0.1:${PORT}`);
  console.log(`[intuos-site] Webroot: ${WEBROOT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[intuos-site] SIGTERM ricevuto — chiusura in corso...");
  server.close(() => process.exit(0));
});
process.on("SIGINT", () => server.close(() => process.exit(0)));
