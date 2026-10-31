const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5173;
const BACKEND_PORT = 4000;
const DIST_DIR = path.join(__dirname, "apps", "web", "dist");

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  // 1. Proxy /api requests to backend on port 4000
  if (req.url.startsWith("/api")) {
    const proxyReq = http.request(
      {
        hostname: "localhost",
        port: BACKEND_PORT,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `localhost:${BACKEND_PORT}`,
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on("error", (err) => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Backend server unreachable on port 4000",
          details: err.message,
        })
      );
    });

    req.pipe(proxyReq);
    return;
  }

  // 2. Static File Serving from apps/web/dist
  let safePath = req.url.split("?")[0];
  if (safePath === "/") safePath = "/index.html";

  let filePath = path.join(DIST_DIR, safePath);

  // If file doesn't exist or is directory, SPA fallback to index.html (React Router)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Brightloop Web Frontend live at: http://localhost:${PORT}`);
  console.log(`🔗 API Proxy active: http://localhost:${PORT}/api -> http://localhost:${BACKEND_PORT}`);
  console.log(`=======================================================`);
});

