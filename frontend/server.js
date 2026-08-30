const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const DIST_DIR = path.join(__dirname, 'dist');
// 💡 K8s Private Backend Service Address
const BACKEND_TARGET = 'http://backend:8080';

const server = http.createServer((req, res) => {

  // 🚀 ROUTING BRIDGE: Intercept browser api strings and stream them down to Go
  if (req.url.startsWith('/api')) {
    
    // Explicitly build a safe network connection URL string for the backend pod service
    const targetUrl = `http://backend:8080${req.url}`;

    // Forward the request to your private backend service
    const proxyReq = http.request(
      targetUrl.toString(),
      {
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        // Forward the backend status code and headers back to the browser
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    // Handle any network connectivity failures gracefully
    proxyReq.on('error', (err) => {
      console.error('Proxy Error:', err);
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway: Unable to connect to the backend api service.');
    });

    // Pipe incoming client payload data (like JSON task creation bodies) to backend
    req.pipe(proxyReq, { end: true });
    return;
  }
  // 📁 2. STATIC FILES ROUTING (Your existing logic)
  let filePath = path.join(DIST_DIR, req.url);
  if (req.url === '/' || !path.extname(req.url)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  if (extname === '.js') contentType = 'application/javascript';
  else if (extname === '.css') contentType = 'text/css';
  else if (extname === '.json') contentType = 'application/json';
  else if (extname === '.svg') contentType = 'image/svg+xml';
  else if (extname === '.png') contentType = 'image/png';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway network proxy running at http://0.0.0.0:${PORT}`);
});