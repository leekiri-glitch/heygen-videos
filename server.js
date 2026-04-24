const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.HEYGEN_API_KEY || '';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
};

function readBody(req) {
  return new Promise((resolve) => {
    let s = '';
    req.on('data', c => s += c);
    req.on('end', () => { try { resolve(JSON.parse(s)); } catch { resolve({}); } });
  });
}

function heygen(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: 'api.heygen.com',
      path: endpoint,
      method,
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, json: { raw: d } }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // POST /api/generate
  if (req.method === 'POST' && pathname === '/api/generate') {
    const { script, avatarId, voiceId } = await readBody(req);
    if (!script) { res.writeHead(400); return res.end(JSON.stringify({ error: 'script vereist' })); }
    const r = await heygen('POST', '/v2/video/generate', {
      video_inputs: [{
        character: { type: 'talking_photo', talking_photo_id: avatarId },
        voice: { type: 'text', input_text: script, ...(voiceId ? { voice_id: voiceId } : {}) },
      }],
      dimension: { width: 1280, height: 720 },
    });
    res.writeHead(r.status, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(r.json));
  }

  // GET /api/status?id=xxx
  if (req.method === 'GET' && pathname === '/api/status') {
    const videoId = new URL(req.url, 'http://localhost').searchParams.get('id');
    if (!videoId) { res.writeHead(400); return res.end(JSON.stringify({ error: 'id vereist' })); }
    const r = await heygen('GET', `/v1/video_status.get?video_id=${videoId}`, {});
    res.writeHead(r.status, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(r.json));
  }

  // Static files
  let file = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, file);
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'text/plain' });
    res.end(data);
  });

}).listen(PORT, () => console.log(`HeyGen Studio → http://localhost:${PORT}`));
