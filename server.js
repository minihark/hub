import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import sharp from 'sharp';
import { generateRssXml, getChangelog } from './feed-generator.js';
import { generateHubOgSvg, generateAppOgSvg, getAppMeta } from './og-generator.js';
import { generateWidgetHtml } from './widget-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 80;
const VAKT_API_URL = process.env.VAKT_API_URL || 'https://vakt.apps.harkco.se/api/monitors';

// In-memory PNG cache: key -> { buffer, timestamp }
const pngCache = new Map();
const CACHE_TTL_MS = 60000; // 60 seconds

async function getOrRenderPng(cacheKey, svgString) {
  const now = Date.now();
  const cached = pngCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.buffer;
  }
  const buffer = await sharp(Buffer.from(svgString)).png().toBuffer();
  pngCache.set(cacheKey, { buffer, timestamp: now });
  return buffer;
}

let cachedFleet = {
  status: 'ok',
  fleet_status: 'all_operational',
  last_updated: new Date().toISOString(),
  monitors: [],
};

// Initial default list of the 12 apps
const DEFAULT_APPS = [
  { id: 'qvitt', name: 'Qvitt', url: 'https://qvitt.se', status: 'up', latency: 32 },
  { id: 'fakturacraft', name: 'FakturaCraft', url: 'https://fakturacraft.apps.harkco.se', status: 'up', latency: 18 },
  { id: 'skattekoll', name: 'SkatteKoll', url: 'https://skattekoll.apps.harkco.se', status: 'up', latency: 22 },
  { id: 'moteskoll', name: 'MötesKoll', url: 'https://moteskoll.apps.harkco.se', status: 'up', latency: 4 },
  { id: 'brygg', name: 'Bryggkompis', url: 'https://brygg.apps.harkco.se', status: 'up', latency: 24 },
  { id: 'styrka', name: 'Styrka', url: 'https://styrka.apps.harkco.se', status: 'up', latency: 21 },
  { id: 'akvarium', name: 'Akvarium', url: 'https://akvarium.apps.harkco.se', status: 'up', latency: 28 },
  { id: 'puls', name: 'Puls', url: 'https://puls.apps.harkco.se', status: 'up', latency: 29 },
  { id: 'knippa', name: 'Knippa', url: 'https://knippa.apps.harkco.se', status: 'up', latency: 5 },
  { id: 'knatte', name: 'Knattepatrullen', url: 'https://knatte.apps.harkco.se', status: 'up', latency: 35 },
  { id: 'timecapsule', name: 'Time Capsule', url: 'https://time-capsule.apps.harkco.se', status: 'up', latency: 34 },
  { id: 'vakt', name: 'Vakt', url: 'https://vakt.apps.harkco.se', status: 'up', latency: 8 },
];

cachedFleet.monitors = DEFAULT_APPS;

async function syncWithVakt() {
  try {
    const res = await fetch(VAKT_API_URL, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'Harkco-Hub-Portal/1.0' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedFleet = {
          status: 'ok',
          fleet_status: data.some((m) => m.currentStatus === 'down') ? 'degraded' : 'all_operational',
          last_updated: new Date().toISOString(),
          monitors: data.map((m) => ({
            id: m.id,
            name: m.name,
            url: m.url,
            status: m.currentStatus,
            latency: m.lastLatencyMs,
            uptime24h: m.uptime24h,
          })),
        };
      }
    }
  } catch {
    // Keep cached data
  }
}

// Background sync every 30 seconds
setInterval(syncWithVakt, 30000);
setTimeout(syncWithVakt, 1500);

// Static assets handler
const assets = sirv(path.resolve(__dirname, 'dist'), {
  single: true,
  dev: true,
  gzip: true,
  brotli: true,
});

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET or HEAD /health
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.method === 'HEAD') return res.end();
    res.end(JSON.stringify({
      status: 'ok',
      app: 'Harkco Hub',
      version: '1.0.0',
      apps_catalog: 12,
      fleet_status: cachedFleet.fleet_status,
      service: 'hub',
    }));
    return;
  }

  // GET or HEAD /api/fleet
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/api/fleet') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.method === 'HEAD') return res.end();
    res.end(JSON.stringify(cachedFleet));
    return;
  }

  // GET or HEAD /sw.js (PWA Service Worker)
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/sw.js') {
    const candidatePath = [
      path.resolve(__dirname, 'public/sw.js'),
      path.resolve(__dirname, 'dist/sw.js'),
    ].find((p) => fs.existsSync(p));

    if (candidatePath) {
      const swContent = fs.readFileSync(candidatePath, 'utf-8');
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Service-Worker-Allowed': '/',
      });
      if (req.method === 'HEAD') return res.end();
      res.end(swContent);
      return;
    }
  }

  // GET or HEAD /manifest.json & /manifest.webmanifest (PWA Manifest)
  if ((req.method === 'GET' || req.method === 'HEAD') && (pathname === '/manifest.json' || pathname === '/manifest.webmanifest')) {
    const candidatePath = [
      path.resolve(__dirname, 'public/manifest.json'),
      path.resolve(__dirname, 'dist/manifest.json'),
    ].find((p) => fs.existsSync(p));

    if (candidatePath) {
      const manifestContent = fs.readFileSync(candidatePath, 'utf-8');
      res.writeHead(200, {
        'Content-Type': 'application/manifest+json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      });
      if (req.method === 'HEAD') return res.end();
      res.end(manifestContent);
      return;
    }
  }

  // GET or HEAD /widget.js (Embeddable Mini-Launcher Script)
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/widget.js') {
    const candidatePath = [
      path.resolve(__dirname, 'public/widget.js'),
      path.resolve(__dirname, 'dist/widget.js'),
    ].find((p) => fs.existsSync(p));

    if (candidatePath) {
      const jsContent = fs.readFileSync(candidatePath, 'utf-8');
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      });
      if (req.method === 'HEAD') return res.end();
      res.end(jsContent);
      return;
    }
  }

  // GET or HEAD /widget or /embed (Standalone Iframe Embed View)
  if ((req.method === 'GET' || req.method === 'HEAD') && (pathname === '/widget' || pathname === '/embed')) {
    const theme = parsedUrl.searchParams.get('theme') || 'dark';
    const html = generateWidgetHtml(cachedFleet, { theme });
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
      'Access-Control-Allow-Origin': '*',
      'X-Frame-Options': 'ALLOWALL',
    });
    if (req.method === 'HEAD') return res.end();
    res.end(html);
    return;
  }

  // GET or HEAD /feed.xml & /rss.xml (RSS 2.0 / Atom Changelog Feed)
  if ((req.method === 'GET' || req.method === 'HEAD') && (pathname === '/feed.xml' || pathname === '/rss.xml')) {
    const rssXml = generateRssXml();
    res.writeHead(200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    });
    if (req.method === 'HEAD') return res.end();
    res.end(rssXml);
    return;
  }

  // GET or HEAD /api/changelog (JSON Changelog Feed)
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/api/changelog') {
    const changelog = getChangelog();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    });
    if (req.method === 'HEAD') return res.end();
    res.end(JSON.stringify({
      status: 'ok',
      count: changelog.length,
      updated_at: new Date().toISOString(),
      entries: changelog,
    }));
    return;
  }

  // GET or HEAD /og-image.png & /og/fleet.png (Fleet OpenGraph PNG)
  if ((req.method === 'GET' || req.method === 'HEAD') && (pathname === '/og-image.png' || pathname === '/og/fleet.png')) {
    const svg = generateHubOgSvg(cachedFleet);
    const pngBuffer = await getOrRenderPng(`fleet_${cachedFleet.fleet_status}`, svg);
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': pngBuffer.length,
      'Cache-Control': 'public, max-age=60',
    });
    if (req.method === 'HEAD') return res.end();
    res.end(pngBuffer);
    return;
  }

  // GET or HEAD /og-image.svg (Fleet OpenGraph SVG)
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/og-image.svg') {
    const svg = generateHubOgSvg(cachedFleet);
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    });
    if (req.method === 'HEAD') return res.end();
    res.end(svg);
    return;
  }

  // GET or HEAD /og/:id.png (Bespoke App OpenGraph PNG)
  const ogPngMatch = pathname.match(/^\/og\/([a-zA-Z0-9_-]+)\.png$/);
  if ((req.method === 'GET' || req.method === 'HEAD') && ogPngMatch) {
    const appId = ogPngMatch[1];
    const appData = cachedFleet.monitors.find((m) => m.id === appId) || null;
    const svg = generateAppOgSvg(appId, appData);
    const pngBuffer = await getOrRenderPng(`app_${appId}_${appData?.status || 'up'}`, svg);
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': pngBuffer.length,
      'Cache-Control': 'public, max-age=60',
    });
    if (req.method === 'HEAD') return res.end();
    res.end(pngBuffer);
    return;
  }

  // GET or HEAD /og/:id.svg (Bespoke App OpenGraph SVG)
  const ogSvgMatch = pathname.match(/^\/og\/([a-zA-Z0-9_-]+)\.svg$/);
  if ((req.method === 'GET' || req.method === 'HEAD') && ogSvgMatch) {
    const appId = ogSvgMatch[1];
    const appData = cachedFleet.monitors.find((m) => m.id === appId) || null;
    const svg = generateAppOgSvg(appId, appData);
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    });
    if (req.method === 'HEAD') return res.end();
    res.end(svg);
    return;
  }

  // GET or HEAD /api/og (Dynamic OpenGraph endpoint, format=png|svg)
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/api/og') {
    const appId = parsedUrl.searchParams.get('app');
    const format = parsedUrl.searchParams.get('format') || 'png';
    const appData = appId ? cachedFleet.monitors.find((m) => m.id === appId) : null;
    const svg = appId ? generateAppOgSvg(appId, appData) : generateHubOgSvg(cachedFleet);

    if (format === 'svg') {
      res.writeHead(200, {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      });
      if (req.method === 'HEAD') return res.end();
      res.end(svg);
      return;
    }

    const cacheKey = appId ? `app_${appId}_${appData?.status || 'up'}` : `fleet_${cachedFleet.fleet_status}`;
    const pngBuffer = await getOrRenderPng(cacheKey, svg);
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': pngBuffer.length,
      'Cache-Control': 'public, max-age=60',
    });
    if (req.method === 'HEAD') return res.end();
    res.end(pngBuffer);
    return;
  }

  // Dynamic Index Serving with App Meta Injection for crawler previews / direct links
  if ((req.method === 'GET' || req.method === 'HEAD') && (pathname === '/' || pathname === '/index.html')) {
    const appId = parsedUrl.searchParams.get('app');
    const indexPath = path.resolve(__dirname, 'dist/index.html');
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf-8');
      if (appId) {
        const meta = getAppMeta(appId);
        if (meta) {
          const title = `${meta.name} — Harkco Hub`;
          const desc = `${meta.description} Utvecklad med stolthet av Harkco.`;
          const ogUrl = `https://hub.apps.harkco.se/?app=${meta.id}#app-${meta.id}`;
          const ogImg = `https://hub.apps.harkco.se/og/${meta.id}.png`;

          html = html
            .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
            .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
            .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`)
            .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${ogUrl}" />`)
            .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${ogImg}" />`)
            .replace(/<meta property="og:image:type" content=".*?" \/>/, `<meta property="og:image:type" content="image/png" />`)
            .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`)
            .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${desc}" />`)
            .replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${ogImg}" />`);
        }
      }
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': appId ? 'no-cache' : 'public, max-age=60',
      });
      if (req.method === 'HEAD') return res.end();
      res.end(html);
      return;
    }
  }

  // Fallback to static client assets
  assets(req, res, () => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Harkco Hub] Running on http://0.0.0.0:${PORT}`);
});
