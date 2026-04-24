const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || '';

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain',
};

function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function heygenRequest(endpoint, data, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'api.heygen.com',
      path: endpoint,
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // --- API routes ---

  if (req.method === 'POST' && pathname === '/api/heygen-generate') {
    const body = await readBody(req);
    const { scriptText, avatarId } = body;
    const apiKey = HEYGEN_API_KEY;
    if (!scriptText) { res.writeHead(400); res.end(JSON.stringify({ error: 'scriptText required' })); return; }
    try {
      const result = await heygenRequest('/v3/videos', {
        type: 'avatar',
        avatar_id: avatarId || 'avt_17e95a63388a11eea55d6a7fa3e8cfa4',
        script: scriptText,
        voice_id: '1bd001e7e50f421d891986aad5e3e5d2',
      }, apiKey);
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.data?.data || result.data));
    } catch (e) {
      res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/heygen-video-status') {
    const body = await readBody(req);
    const { videoId } = body;
    const apiKey = HEYGEN_API_KEY;
    if (!videoId) { res.writeHead(400); res.end(JSON.stringify({ error: 'videoId required' })); return; }
    try {
      const result = await heygenRequest(`/v1/video_status.get?video_id=${videoId}`, {}, apiKey);
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.data?.data || result.data));
    } catch (e) {
      res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/heygen-proxy') {
    const body = await readBody(req);
    const { endpoint, data, apiKey: clientKey } = body;
    const apiKey = HEYGEN_API_KEY || clientKey;
    if (!endpoint) { res.writeHead(400); res.end(JSON.stringify({ error: 'endpoint required' })); return; }
    try {
      const result = await heygenRequest(endpoint, data || {}, apiKey);
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.data));
    } catch (e) {
      res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // --- Static files ---

  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else {
    filePath = path.join(__dirname, pathname);
  }

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Scene Studio draait op poort ${PORT}`);
});
