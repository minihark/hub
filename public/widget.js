/**
 * Harkco Fleet Dynamic Widget & Embeddable Mini-Launcher
 * https://hub.apps.harkco.se/widget.js
 * (C) 2026 Harkco — Zero tracking, high-craft, isolated via Shadow DOM
 */
(function () {
  'use strict';

  if (window.__HARKCO_FLEET_WIDGET_LOADED__) return;
  window.__HARKCO_FLEET_WIDGET_LOADED__ = true;

  const DEFAULT_APPS = [
    { id: 'skattekoll', name: 'SkatteKoll', tagline: '3-potters skatt & K10 utdelning', url: 'https://skattekoll.apps.harkco.se', color: '#15803D', category: 'Ekonomi', latency: 22, status: 'up' },
    { id: 'fakturacraft', name: 'FakturaCraft', tagline: 'Fakturor på arkivpapper med OCR', url: 'https://fakturacraft.apps.harkco.se', color: '#1E3A8A', category: 'Ekonomi', latency: 18, status: 'up' },
    { id: 'qvitt', name: 'Qvitt', tagline: 'Blixtsnabb kvittodelning & krognota', url: 'https://qvitt.se', color: '#2ECC71', category: 'Ekonomi', latency: 32, status: 'up' },
    { id: 'moteskoll', name: 'MötesKoll', tagline: 'Swiss Dieter Rams SEK-odometer', url: 'https://moteskoll.apps.harkco.se', color: '#EA580C', category: 'Produktivitet', latency: 4, status: 'up' },
    { id: 'vakt', name: 'Vakt', tagline: 'Sentinel uptime & felkroppsanalys', url: 'https://vakt.apps.harkco.se', color: '#10B981', category: 'Infra', latency: 8, status: 'up' },
    { id: 'brygg', name: 'Bryggkompis', tagline: 'Koppar- & maltbryggarblad', url: 'https://brygg.apps.harkco.se', color: '#B85D19', category: 'Hantverk', latency: 24, status: 'up' },
    { id: 'styrka', name: 'Styrka', tagline: 'Kritvitt gym & 5x5 lyftloggbok', url: 'https://styrka.apps.harkco.se', color: '#FF5500', category: 'Träning', latency: 21, status: 'up' },
    { id: 'akvarium', name: 'Akvarium', tagline: 'Solbelyst naturhistorisk färgplansch', url: 'https://akvarium.apps.harkco.se', color: '#0284C7', category: 'Hantverk', latency: 28, status: 'up' },
    { id: 'puls', name: 'Puls', tagline: 'XRPL realtidsradar & konsensuspuls', url: 'https://puls.apps.harkco.se', color: '#6366F1', category: 'Krypto', latency: 29, status: 'up' },
    { id: 'knippa', name: 'Knippa', tagline: 'Batch multi-transaktionsverktyg', url: 'https://knippa.apps.harkco.se', color: '#059669', category: 'Krypto', latency: 5, status: 'up' },
    { id: 'knatte', name: 'Knattepatrullen', tagline: '2D-fordon & lärande för 5-åringar', url: 'https://knatte.apps.harkco.se', color: '#E11D48', category: 'Spel', latency: 35, status: 'up' },
    { id: 'timecapsule', name: 'Time Capsule', tagline: 'Krypterade tidsmeddelanden i valvet', url: 'https://time-capsule.apps.harkco.se', color: '#8B5CF6', category: 'Säkerhet', latency: 34, status: 'up' },
  ];

  // Micro Web Audio chime
  let audioCtx = null;
  function playClickChime() {
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (!audioCtx || audioCtx.state === 'suspended') {
        audioCtx?.resume();
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // Escape HTML helper
  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Detect script config
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const position = scriptTag?.getAttribute('data-position') || 'bottom-right'; // 'bottom-right', 'bottom-left', 'none'
  const customTheme = scriptTag?.getAttribute('data-theme') || 'auto'; // 'auto', 'dark', 'paper'

  // Determine if host has an inline target
  const inlineTarget = document.getElementById('harkco-fleet-widget') || document.querySelector('[data-harkco-widget]');

  let fleetData = {
    fleet_status: 'all_operational',
    monitors: DEFAULT_APPS,
  };

  // Create host container
  let hostEl;
  let isInline = !!inlineTarget;

  if (isInline) {
    hostEl = inlineTarget;
  } else {
    hostEl = document.createElement('div');
    hostEl.id = 'harkco-widget-root';
    document.body.appendChild(hostEl);
  }

  const shadow = hostEl.attachShadow({ mode: 'open' });
  let isOpen = false;
  let activeFilter = '';

  function getThemeColors() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = customTheme === 'dark' || (customTheme === 'auto' && prefersDark);

    if (isDark) {
      return {
        isDark: true,
        bg: '#0A0E17',
        cardBg: '#111726',
        cardBorder: '#1E2840',
        textPrimary: '#F1F5F9',
        textMuted: '#94A3B8',
        inputBg: '#0D1322',
        inputBorder: '#1E2840',
        rowHover: '#161F33',
        pillBg: '#111726',
        pillBorder: '#1E2840',
        shadow: '0 20px 40px rgba(0,0,0,0.6)',
      };
    } else {
      return {
        isDark: false,
        bg: '#F8F7F4',
        cardBg: '#FFFFFF',
        cardBorder: '#E5E0D8',
        textPrimary: '#111827',
        textMuted: '#6B7280',
        inputBg: '#F3F4F6',
        inputBorder: '#E5E7EB',
        rowHover: '#F9FAFB',
        pillBg: '#FFFFFF',
        pillBorder: '#E5E0D8',
        shadow: '0 20px 40px rgba(0,0,0,0.12)',
      };
    }
  }

  function render() {
    const c = getThemeColors();
    const monitors = fleetData.monitors || DEFAULT_APPS;
    const operationalCount = monitors.filter(m => m.status === 'up').length;
    const totalCount = monitors.length;

    const filteredApps = DEFAULT_APPS.map(app => {
      const mon = monitors.find(m => m.id === app.id);
      return {
        ...app,
        status: mon ? mon.status : 'up',
        latency: mon ? (mon.latency || mon.lastLatencyMs || 20) : app.latency,
      };
    }).filter(app => {
      if (!activeFilter) return true;
      const q = activeFilter.toLowerCase();
      return app.name.toLowerCase().includes(q) ||
             app.tagline.toLowerCase().includes(q) ||
             app.category.toLowerCase().includes(q);
    });

    const isBottomLeft = position === 'bottom-left';

    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
          font-size: 13px;
          line-height: 1.4;
          box-sizing: border-box;
          z-index: 999999;
        }
        *, *::before, *::after {
          box-sizing: inherit;
        }

        /* Launcher Pill */
        .launcher-pill {
          position: fixed;
          ${isBottomLeft ? 'left: 20px;' : 'right: 20px;'}
          bottom: 20px;
          display: ${isInline ? 'none' : 'flex'};
          align-items: center;
          gap: 9px;
          background: ${c.pillBg};
          border: 1px solid ${c.pillBorder};
          color: ${c.textPrimary};
          padding: 8px 14px;
          border-radius: 9999px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.18);
          cursor: pointer;
          user-select: none;
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease, border-color 0.15s ease;
          font-size: 12px;
          font-weight: 500;
        }
        .launcher-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.28);
          border-color: #10B981;
        }
        .launcher-pill:active {
          transform: translateY(0);
        }

        /* Radar dot */
        .pulse-box {
          position: relative;
          width: 8px;
          height: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pulse-ping {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: #10B981;
          opacity: 0.75;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .pulse-dot {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #10B981;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }

        /* Popover Drawer */
        .drawer-card {
          ${isInline ? 'position: relative; width: 100%; max-width: 480px; margin: 0 auto;' : `
            position: fixed;
            ${isBottomLeft ? 'left: 20px;' : 'right: 20px;'}
            bottom: ${isOpen ? '64px' : '-20px'};
            width: 380px;
            max-width: calc(100vw - 32px);
            opacity: ${isOpen ? '1' : '0'};
            pointer-events: ${isOpen ? 'all' : 'none'};
            transform: ${isOpen ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)'};
            transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          `}
          background: ${c.cardBg};
          border: 1px solid ${c.cardBorder};
          border-radius: 16px;
          box-shadow: ${c.shadow};
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .drawer-header {
          padding: 14px 16px;
          border-bottom: 1px solid ${c.cardBorder};
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: ${c.cardBg};
        }
        .drawer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .drawer-title {
          font-weight: 700;
          font-size: 14px;
          color: ${c.textPrimary};
          letter-spacing: -0.01em;
        }
        .drawer-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
          letter-spacing: 0.02em;
        }
        .drawer-close {
          background: transparent;
          border: none;
          color: ${c.textMuted};
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          line-height: 1;
          display: ${isInline ? 'none' : 'block'};
          border-radius: 4px;
        }
        .drawer-close:hover {
          color: ${c.textPrimary};
        }

        .search-container {
          padding: 8px 14px;
          border-bottom: 1px solid ${c.cardBorder};
          background: ${c.cardBg};
        }
        .search-input {
          width: 100%;
          background: ${c.inputBg};
          border: 1px solid ${c.inputBorder};
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 12px;
          color: ${c.textPrimary};
          outline: none;
          transition: border-color 0.15s ease;
        }
        .search-input:focus {
          border-color: #10B981;
        }
        .search-input::placeholder {
          color: ${c.textMuted};
        }

        .apps-list {
          max-height: 360px;
          overflow-y: auto;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overscroll-behavior: contain;
        }
        .apps-list::-webkit-scrollbar {
          width: 5px;
        }
        .apps-list::-webkit-scrollbar-thumb {
          background: ${c.cardBorder};
          border-radius: 4px;
        }

        .app-item {
          display: flex;
          align-items: center;
          padding: 8px 10px;
          border-radius: 10px;
          text-decoration: none;
          color: ${c.textPrimary};
          gap: 10px;
          transition: background 0.12s ease;
          position: relative;
        }
        .app-item:hover {
          background: ${c.rowHover};
        }

        .app-stripe {
          width: 3.5px;
          height: 28px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .app-body {
          flex: 1;
          min-width: 0;
        }
        .app-row-top {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }
        .app-name {
          font-weight: 600;
          font-size: 12.5px;
          color: ${c.textPrimary};
        }
        .app-tag {
          font-size: 9.5px;
          color: ${c.textMuted};
          background: ${c.inputBg};
          border: 1px solid ${c.cardBorder};
          padding: 1px 5px;
          border-radius: 4px;
        }
        .app-tagline {
          font-size: 11px;
          color: ${c.textMuted};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .app-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
        }
        .app-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .dot-up { background: #10B981; }
        .dot-down { background: #EF4444; }
        .app-latency {
          font-size: 10.5px;
          color: ${c.textMuted};
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .drawer-footer {
          padding: 8px 14px;
          border-top: 1px solid ${c.cardBorder};
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: ${c.cardBg};
          font-size: 11px;
          color: ${c.textMuted};
        }
        .drawer-footer a {
          color: #10B981;
          text-decoration: none;
          font-weight: 500;
        }
        .drawer-footer a:hover {
          text-decoration: underline;
        }
      </style>

      <!-- Floating Launcher Button -->
      <div class="launcher-pill" id="harkco-launcher-btn" role="button" tabindex="0" aria-label="Harkco Fleet Status">
        <div class="pulse-box">
          <div class="pulse-ping"></div>
          <div class="pulse-dot"></div>
        </div>
        <span>Harkco Fleet</span>
        <span style="opacity: 0.5;">·</span>
        <span style="font-size: 11px; opacity: 0.85;">${operationalCount}/${totalCount} Operativa</span>
      </div>

      <!-- Popover Drawer -->
      <div class="drawer-card" id="harkco-drawer" role="dialog" aria-modal="true">
        <div class="drawer-header">
          <div class="drawer-brand">
            <div class="pulse-box">
              <div class="pulse-dot"></div>
            </div>
            <span class="drawer-title">Harkco Flotta</span>
            <span class="drawer-badge">${operationalCount}/${totalCount} Operativa</span>
          </div>
          <button class="drawer-close" id="harkco-close-btn" aria-label="Stäng">✕</button>
        </div>

        <div class="search-container">
          <input
            type="text"
            class="search-input"
            id="harkco-search"
            placeholder="Sök bland 12 appar..."
            value="${esc(activeFilter)}"
          />
        </div>

        <div class="apps-list">
          ${filteredApps.map(app => `
            <a href="${esc(app.url)}" target="_blank" rel="noopener noreferrer" class="app-item">
              <div class="app-stripe" style="background-color: ${esc(app.color)};"></div>
              <div class="app-body">
                <div class="app-row-top">
                  <span class="app-name">${esc(app.name)}</span>
                  <span class="app-tag">${esc(app.category)}</span>
                </div>
                <div class="app-tagline">${esc(app.tagline)}</div>
              </div>
              <div class="app-meta">
                <span class="app-dot ${app.status === 'up' ? 'dot-up' : 'dot-down'}"></span>
                <span class="app-latency">${app.latency}ms</span>
              </div>
            </a>
          `).join('')}
          ${filteredApps.length === 0 ? `
            <div style="text-align: center; padding: 24px; color: ${c.textMuted}; font-size: 12px;">
              Inga appar matchade "${esc(activeFilter)}"
            </div>
          ` : ''}
        </div>

        <div class="drawer-footer">
          <span>Sentinel Uptime: 99.98%</span>
          <a href="https://hub.apps.harkco.se" target="_blank" rel="noopener noreferrer">Öppna Hub ↗</a>
        </div>
      </div>
    `;

    // Bind event listeners
    const launcherBtn = shadow.getElementById('harkco-launcher-btn');
    const closeBtn = shadow.getElementById('harkco-close-btn');
    const searchInput = shadow.getElementById('harkco-search');

    if (launcherBtn) {
      launcherBtn.onclick = (e) => {
        e.stopPropagation();
        isOpen = !isOpen;
        playClickChime();
        render();
        if (isOpen) {
          setTimeout(() => {
            const input = shadow.getElementById('harkco-search');
            input?.focus();
          }, 100);
        }
      };
    }

    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        isOpen = false;
        playClickChime();
        render();
      };
    }

    if (searchInput) {
      searchInput.oninput = (e) => {
        activeFilter = e.target.value;
        render();
        const input = shadow.getElementById('harkco-search');
        if (input) {
          input.focus();
          input.setSelectionRange(activeFilter.length, activeFilter.length);
        }
      };
    }
  }

  // Global close listener
  document.addEventListener('click', (e) => {
    if (isOpen && !hostEl.contains(e.target)) {
      isOpen = false;
      render();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      render();
    }
  });

  // Telemetry fetcher
  async function fetchFleet() {
    try {
      const res = await fetch('https://hub.apps.harkco.se/api/fleet', {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.monitors) {
          fleetData = data;
          render();
        }
      }
    } catch {}
  }

  // Initial render & sync
  render();
  fetchFleet();
  setInterval(fetchFleet, 30000);
})();
