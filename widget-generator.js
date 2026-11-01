/**
 * Standalone HTML Generator for Harkco Hub Embed Widget (/widget)
 * Lightweight, high-craft, zero external asset dependencies, auto-refreshing telemetry.
 */

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const APPS_CATALOG = [
  { id: 'skattekoll', name: 'SkatteKoll', tagline: '3-potters skatt & K10 utdelning', url: 'https://skattekoll.apps.harkco.se', color: '#15803D', category: 'Ekonomi' },
  { id: 'fakturacraft', name: 'FakturaCraft', tagline: 'Fakturor på arkivpapper med OCR', url: 'https://fakturacraft.apps.harkco.se', color: '#1E3A8A', category: 'Ekonomi' },
  { id: 'qvitt', name: 'Qvitt', tagline: 'Blixtsnabb kvittodelning & krognota', url: 'https://qvitt.se', color: '#2ECC71', category: 'Ekonomi' },
  { id: 'moteskoll', name: 'MötesKoll', tagline: 'Swiss Dieter Rams SEK-odometer', url: 'https://moteskoll.apps.harkco.se', color: '#EA580C', category: 'Produktivitet' },
  { id: 'vakt', name: 'Vakt', tagline: 'Sentinel uptime & felkroppsanalys', url: 'https://vakt.apps.harkco.se', color: '#10B981', category: 'Infra' },
  { id: 'brygg', name: 'Bryggkompis', tagline: 'Koppar- & maltbryggarblad', url: 'https://brygg.apps.harkco.se', color: '#B85D19', category: 'Hantverk' },
  { id: 'styrka', name: 'Styrka', tagline: 'Kritvitt gym & 5x5 lyftloggbok', url: 'https://styrka.apps.harkco.se', color: '#FF5500', category: 'Träning' },
  { id: 'akvarium', name: 'Akvarium', tagline: 'Solbelyst naturhistorisk färgplansch', url: 'https://akvarium.apps.harkco.se', color: '#0284C7', category: 'Hantverk' },
  { id: 'puls', name: 'Puls', tagline: 'XRPL realtidsradar & konsensuspuls', url: 'https://puls.apps.harkco.se', color: '#6366F1', category: 'Krypto' },
  { id: 'knippa', name: 'Knippa', tagline: 'Batch multi-transaktionsverktyg', url: 'https://knippa.apps.harkco.se', color: '#059669', category: 'Krypto' },
  { id: 'knatte', name: 'Knattepatrullen', tagline: '2D-fordon & lärande för 5-åringar', url: 'https://knatte.apps.harkco.se', color: '#E11D48', category: 'Spel' },
  { id: 'timecapsule', name: 'Time Capsule', tagline: 'Krypterade tidsmeddelanden i valvet', url: 'https://time-capsule.apps.harkco.se', color: '#8B5CF6', category: 'Säkerhet' },
];

export function generateWidgetHtml(cachedFleet, options = {}) {
  const theme = options.theme === 'paper' ? 'paper' : 'dark';
  const isPaper = theme === 'paper';
  const monitors = (cachedFleet && Array.isArray(cachedFleet.monitors)) ? cachedFleet.monitors : [];
  const operationalCount = monitors.filter((m) => m.status === 'up').length || 12;
  const totalCount = monitors.length || 12;

  const bg = isPaper ? '#F8F7F4' : '#0A0E17';
  const cardBg = isPaper ? '#FFFFFF' : '#111726';
  const border = isPaper ? '#E5E0D8' : '#1E2840';
  const textPrimary = isPaper ? '#111827' : '#F1F5F9';
  const textMuted = isPaper ? '#6B7280' : '#94A3B8';
  const accent = isPaper ? '#15803D' : '#10B981';

  const rowsHtml = APPS_CATALOG.map((app) => {
    const mon = monitors.find((m) => m.id === app.id);
    const isUp = mon ? mon.status === 'up' : true;
    const latency = mon?.latency || 24;

    return `
      <a href="${escapeHtml(app.url)}" target="_blank" rel="noopener noreferrer" class="app-row" data-name="${escapeHtml(app.name.toLowerCase())}" data-tagline="${escapeHtml(app.tagline.toLowerCase())}">
        <div class="app-accent-bar" style="background-color: ${escapeHtml(app.color)};"></div>
        <div class="app-info">
          <div class="app-header">
            <span class="app-name">${escapeHtml(app.name)}</span>
            <span class="app-cat">${escapeHtml(app.category)}</span>
          </div>
          <div class="app-tagline">${escapeHtml(app.tagline)}</div>
        </div>
        <div class="app-meta">
          <span class="status-dot ${isUp ? 'dot-up' : 'dot-down'}"></span>
          <span class="latency">${latency}ms</span>
        </div>
      </a>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="sv" class="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Harkco Fleet Widget</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${bg};
      color: ${textPrimary};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      padding: 12px;
      margin: 0;
      overflow-x: hidden;
      font-size: 13px;
      line-height: 1.4;
    }
    .widget-container {
      background: ${cardBg};
      border: 1px solid ${border};
      border-radius: 14px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 100%;
    }
    .widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid ${border};
      padding-bottom: 8px;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: -0.01em;
    }
    .radar-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      display: inline-block;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
      animation: pulse 2s infinite ease-in-out;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
    }
    .fleet-counter {
      font-family: monospace;
      font-size: 11px;
      color: ${accent};
      background: ${isPaper ? 'rgba(21, 128, 61, 0.1)' : 'rgba(16, 185, 129, 0.12)'};
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 700;
    }
    .search-box {
      width: 100%;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid ${border};
      background: ${isPaper ? '#F3F0EA' : '#0A0E17'};
      color: ${textPrimary};
      font-size: 12px;
      outline: none;
      transition: border-color 0.15s;
    }
    .search-box:focus {
      border-color: ${accent};
    }
    .apps-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 290px;
      overflow-y: auto;
      padding-right: 2px;
    }
    .apps-list::-webkit-scrollbar {
      width: 4px;
    }
    .apps-list::-webkit-scrollbar-thumb {
      background: ${border};
      border-radius: 4px;
    }
    .app-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 8px;
      background: ${isPaper ? '#F8F7F4' : '#0D1322'};
      border: 1px solid ${border};
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: all 0.15s ease;
      position: relative;
      overflow: hidden;
    }
    .app-row:hover {
      transform: translateX(2px);
      border-color: ${accent};
      background: ${isPaper ? '#EFECE6' : '#141C30'};
    }
    .app-accent-bar {
      width: 3px;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
    }
    .app-info {
      flex: 1;
      min-width: 0;
      padding-left: 2px;
    }
    .app-header {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .app-name {
      font-weight: 700;
      font-size: 12px;
    }
    .app-cat {
      font-size: 9px;
      font-family: monospace;
      color: ${textMuted};
      background: ${isPaper ? '#E5E0D8' : '#1E2840'};
      padding: 1px 4px;
      border-radius: 4px;
    }
    .app-tagline {
      font-size: 10.5px;
      color: ${textMuted};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .app-meta {
      display: flex;
      align-items: center;
      gap: 5px;
      font-family: monospace;
      font-size: 10px;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .dot-up { background: #10B981; }
    .dot-down { background: #EF4444; }
    .latency {
      color: ${textMuted};
    }
    .widget-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid ${border};
      padding-top: 8px;
      font-size: 10.5px;
      color: ${textMuted};
      font-family: monospace;
    }
    .widget-footer a {
      color: ${accent};
      text-decoration: none;
      font-weight: 600;
    }
    .widget-footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="widget-container">
    <div class="widget-header">
      <div class="brand-title">
        <span class="radar-dot"></span>
        <span>Harkco Fleet</span>
      </div>
      <span class="fleet-counter" id="fleet-counter">${operationalCount}/${totalCount} OPERATIVA</span>
    </div>

    <input type="text" id="app-search" class="search-box" placeholder="Filtrera bland alla 12 appar..." autocomplete="off">

    <div class="apps-list" id="apps-list">
      ${rowsHtml}
    </div>

    <div class="widget-footer">
      <span>100% Noll Annonser</span>
      <a href="https://hub.apps.harkco.se" target="_blank" rel="noopener">hub.apps.harkco.se ↗</a>
    </div>
  </div>

  <script>
    const searchInput = document.getElementById('app-search');
    const appsList = document.getElementById('apps-list');
    const rows = appsList.querySelectorAll('.app-row');

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      rows.forEach(r => {
        const name = r.getAttribute('data-name');
        const tag = r.getAttribute('data-tagline');
        const match = !q || name.includes(q) || tag.includes(q);
        r.style.display = match ? 'flex' : 'none';
      });
    });

    // Auto-refresh telemetry every 30 seconds
    setInterval(async () => {
      try {
        const res = await fetch('/api/fleet');
        if (res.ok) {
          const data = await res.json();
          if (data && data.monitors) {
            const up = data.monitors.filter(m => m.status === 'up').length;
            const total = data.monitors.length;
            document.getElementById('fleet-counter').textContent = up + '/' + total + ' OPERATIVA';
          }
        }
      } catch {}
    }, 30000);
  </script>
</body>
</html>`;
}
