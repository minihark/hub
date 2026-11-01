/**
 * High-Fidelity OpenGraph & Twitter Card SVG Generator for Harkco Hub
 * Renders 1200x630 pixel cards with custom typography, dark studio canvas,
 * app brand palettes, and real-time fleet telemetry.
 */

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const APPS_META = {
  skattekoll: {
    name: 'SkatteKoll',
    tagline: 'Nordiskt finansiellt instrument för egna företagare',
    description: 'Dela upp intäkten i tre säkra potter: Privatkonto, Skattekonto-reserv och Momsreserv. 2026 skattetrappa & 3:12 K10.',
    category: 'Ekonomi & Skatt',
    color: '#15803D',
    accentBg: 'rgba(21, 128, 61, 0.25)',
    features: ['Skattekonto-reserv 12:e', 'Momsavsättning 25/12/6%', '3:12 K10 Utdelning', '100% Noll tracking'],
  },
  fakturacraft: {
    name: 'FakturaCraft',
    tagline: 'Svensk fakturagenerator på officiellt arkivpapper',
    description: 'Skapa professionella fakturor på sekunder med OCR-beräkning, ROT/RUT-avdrag, automatisk omvänd moms och direkt PDF-export.',
    category: 'Ekonomi & Skatt',
    color: '#1E3A8A',
    accentBg: 'rgba(30, 58, 138, 0.25)',
    features: ['Officiell OCR-modul 10', 'ROT & RUT-avdrag', 'PDF i A4-standard', 'Lokal webbläsarlagring'],
  },
  qvitt: {
    name: 'Qvitt',
    tagline: 'Blixtsnabb kvittodelning och krognota-kalkylator',
    description: 'Skanna restaurangnotan eller dela notan per person i realtid. Peer-to-peer livesessioner utan krav på appnedladdning.',
    category: 'Ekonomi & Skatt',
    color: '#2ECC71',
    accentBg: 'rgba(46, 204, 113, 0.25)',
    features: ['Kamera/kvitto OCR', 'Realtids-session med QR', 'Drickskalkylator', 'Swish-integration'],
  },
  moteskoll: {
    name: 'MötesKoll',
    tagline: 'Swiss Minimalist möteskostnadsmätare & Braun-odometer',
    description: 'Se mötets verkliga kostnad rulla i realtid med live SEK-odometer. Dieter Rams-estetik med inline beslutslogg och .ics-agendainläsning.',
    category: 'System & Spel',
    color: '#EA580C',
    accentBg: 'rgba(234, 88, 12, 0.25)',
    features: ['Live SEK Odometer', 'Deltagartariffer & löner', 'Tidsbox-nedräkning', 'Besluts- & åtgärdslogg'],
  },
  vakt: {
    name: 'Vakt',
    tagline: 'Harkco flottans sentinell & automatisk självläkning',
    description: 'Övervakar alla 12 appar i realtid med millisekund-latens, JSON-felinspektion, automatiska omstart-hooks och Telegram-larm.',
    category: 'System & Spel',
    color: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.25)',
    features: ['45s probing-radar', 'JSON stacktrace-inspektion', 'Automatiska Action Hooks', 'Telegram bot-larm'],
  },
  brygg: {
    name: 'Bryggkompis',
    tagline: 'Bryggverktyg & receptarkiv för hembryggare',
    description: 'Designa och beräkna ölrecept med maltnota, humleschema, strike water-termodynamik, CO2-priming och utskriftsvänligt receptblad.',
    category: 'Hantverk & Fritid',
    color: '#B85D19',
    accentBg: 'rgba(184, 93, 25, 0.25)',
    features: ['Ölkompaniet malt & humle', 'Strike water-kalkylator', 'Kolsyre- & priming-math', 'Utskriftsvänligt Receptblad'],
  },
  styrka: {
    name: 'Styrka',
    tagline: 'Taktil 5×5 träningsdagbok för tunga baslyft',
    description: 'Fokusera 100% på dagens 3 lyft: Knäböj, Bänkpress, Marklyft, Militärpress och Skivstångsrodd. Taktil räknare och skivstångsberäkning.',
    category: 'Hantverk & Fritid',
    color: '#F97316',
    accentBg: 'rgba(249, 115, 22, 0.25)',
    features: ['5×5 Linjär progression', 'Automatiska vilotimers', 'Skivstångs-kalkylator', 'Lokal offline-lagring'],
  },
  akvarium: {
    name: 'Akvarium',
    tagline: 'Illustrerad sötvattensbiotop & naturhistoriskt bibliotek',
    description: 'Interaktiv sötvattensbiotop på varmt pergament. Mata fiskarna, balansera vattenkemi och utforska arter.',
    category: 'Hantverk & Fritid',
    color: '#0D9488',
    accentBg: 'rgba(13, 148, 136, 0.25)',
    features: ['Live glassakvarium', 'Fisk- & växtencyklopedi', 'Vattenvolym-kalkylator', 'Fisk-Jakten minispel'],
  },
  knatte: {
    name: 'Knattepatrullen',
    tagline: 'Taktilt 2D-fordonsäventyr & lärande för 5-åringar',
    description: '60fps fysikspel med brandbil, traktor och rymdrover. Noll frustration, rolig tuta, djurräddning och pedagogiska räkne- och färgäventyr.',
    category: 'System & Spel',
    color: '#E11D48',
    accentBg: 'rgba(225, 29, 72, 0.25)',
    features: ['4 taktila träfordon', 'Jättekul tuta & toner', 'Svensk & engelsk röst', 'Officiellt Knatte-Körkort'],
  },
  puls: {
    name: 'Puls',
    tagline: 'Realtids-radar för XRPL konsensus & valtransaktioner',
    description: 'Direkt konsensus-puls från XRP Ledger med sekvensräknare, sub-4s kadens, AMM-volymer, RLUSD-adoption och valtransaktions-radar.',
    category: 'XRPL & Web3',
    color: '#06B6D4',
    accentBg: 'rgba(6, 182, 212, 0.25)',
    features: ['Live Sequence Heartbeat', 'Sub-4s konsensus-radar', 'RLUSD cirkulation', 'Whale Alert flöde'],
  },
  knippa: {
    name: 'Knippa',
    tagline: 'Atomär batch-dispatcher för XLS-56 transaktioner',
    description: 'Bunta ihop upp till 8 operationer i ett atomärt XLS-56 kuvert på XRPL med zero inner fees och all-or-nothing konsensusgaranti.',
    category: 'XRPL & Web3',
    color: '#D97706',
    accentBg: 'rgba(217, 119, 6, 0.25)',
    features: ['XLS-56 Batch kuvert', 'All-or-Nothing garanti', 'CSV-massutskick', 'XUMM & Crossmark stöd'],
  },
  timecapsule: {
    name: 'Time Capsule',
    tagline: 'Krypterade framtida minnesvalv & brev',
    description: 'Försegla meddelanden, foton och minnen för framtiden. Klientkryptering med tidslås och påminnelser.',
    category: 'System & Spel',
    color: '#8B5CF6',
    accentBg: 'rgba(139, 92, 246, 0.25)',
    features: ['Tidslåsta kapslar', 'Lokal kryptering', 'Minnen & brev', '100% Noll datainsamling'],
  },
};

/**
 * Generate default Hub 1200x630 vector preview
 */
export function generateHubOgSvg(fleetStatus = 'all_operational', count = 12) {
  const isUp = fleetStatus === 'all_operational';
  const statusColor = isUp ? '#10B981' : '#F59E0B';
  const statusText = isUp ? `${count}/${count} APPAR DRIFTSÄKRA` : 'PARTIELL DRIFT';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A0E17"/>
      <stop offset="50%" stop-color="#0E1422"/>
      <stop offset="100%" stop-color="#060910"/>
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="50%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E2840" stroke-width="0.75" stroke-opacity="0.35"/>
    </pattern>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Radial Glow Spots -->
  <circle cx="1050" cy="120" r="280" fill="#10B981" fill-opacity="0.08" filter="url(#glow)"/>
  <circle cx="150" cy="520" r="320" fill="#06B6D4" fill-opacity="0.07" filter="url(#glow)"/>

  <!-- Top Accent Bar -->
  <rect x="0" y="0" width="1200" height="6" fill="url(#brandGrad)"/>

  <!-- Outer Card Frame -->
  <rect x="40" y="40" width="1120" height="550" rx="20" fill="none" stroke="#1E2840" stroke-width="1.5"/>

  <!-- Header Badge -->
  <g transform="translate(80, 85)">
    <rect width="210" height="34" rx="8" fill="#111726" stroke="#1E2840" stroke-width="1"/>
    <circle cx="20" cy="17" r="4.5" fill="${statusColor}"/>
    <text x="34" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#E2E8F0" letter-spacing="0.08em">${statusText}</text>
  </g>

  <!-- Studio Mark -->
  <g transform="translate(970, 85)">
    <rect width="150" height="34" rx="8" fill="#111726" stroke="#1E2840" stroke-width="1"/>
    <text x="75" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" letter-spacing="0.05em">HARKCO STUDIO</text>
  </g>

  <!-- Title & Headline -->
  <text x="80" y="195" font-family="Georgia, serif" font-size="54" font-weight="700" fill="#FFFFFF" letter-spacing="-0.02em">
    Harkco Hub
  </text>
  <text x="80" y="245" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600" fill="#38BDF8" letter-spacing="-0.01em">
    Ateljé för 12 taktila mjukvaruinstrument
  </text>
  <text x="80" y="285" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">
    100% noll annonser • Direkt värdeutbyte • Byggt med hantverk i Göteborg
  </text>

  <!-- Grid of 12 Daily Apps (Mini Pills) -->
  <g transform="translate(80, 335)">
    <!-- Row 1 -->
    <g transform="translate(0, 0)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#15803D"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">SkatteKoll</text>
      <text x="140" y="29" font-family="monospace" font-size="11" fill="#64748B">3-Potter</text>
    </g>

    <g transform="translate(265, 0)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#1E3A8A"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">FakturaCraft</text>
      <text x="145" y="29" font-family="monospace" font-size="11" fill="#64748B">Arkiv A4</text>
    </g>

    <g transform="translate(530, 0)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#2ECC71"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Qvitt</text>
      <text x="135" y="29" font-family="monospace" font-size="11" fill="#64748B">Krognotor</text>
    </g>

    <g transform="translate(795, 0)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#EA580C"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">MötesKoll</text>
      <text x="145" y="29" font-family="monospace" font-size="11" fill="#64748B">SEK-Ticker</text>
    </g>

    <!-- Row 2 -->
    <g transform="translate(0, 60)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#B85D19"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Bryggkompis</text>
      <text x="145" y="29" font-family="monospace" font-size="11" fill="#64748B">Ölbryggning</text>
    </g>

    <g transform="translate(265, 60)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#F97316"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Styrka</text>
      <text x="130" y="29" font-family="monospace" font-size="11" fill="#64748B">5×5 Baslyft</text>
    </g>

    <g transform="translate(530, 60)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#0D9488"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Akvarium</text>
      <text x="135" y="29" font-family="monospace" font-size="11" fill="#64748B">Biotoper</text>
    </g>

    <g transform="translate(795, 60)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#E11D48"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Knattepatrullen</text>
      <text x="160" y="29" font-family="monospace" font-size="11" fill="#64748B">5-Åringar</text>
    </g>

    <!-- Row 3 -->
    <g transform="translate(0, 120)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#06B6D4"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Puls</text>
      <text x="120" y="29" font-family="monospace" font-size="11" fill="#64748B">XRPL Radar</text>
    </g>

    <g transform="translate(265, 120)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#D97706"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Knippa</text>
      <text x="130" y="29" font-family="monospace" font-size="11" fill="#64748B">XLS-56 Batch</text>
    </g>

    <g transform="translate(530, 120)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#8B5CF6"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Time Capsule</text>
      <text x="145" y="29" font-family="monospace" font-size="11" fill="#64748B">Minnesvalv</text>
    </g>

    <g transform="translate(795, 120)">
      <rect width="245" height="48" rx="10" fill="#111726" stroke="#1E2840" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="48" rx="2" fill="#10B981"/>
      <text x="20" y="29" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Vakt Sentinel</text>
      <text x="145" y="29" font-family="monospace" font-size="11" fill="#64748B">Uptime Radar</text>
    </g>
  </g>

  <!-- Bottom Provenance -->
  <text x="80" y="555" font-family="monospace" font-size="13" font-weight="500" fill="#64748B">
    hub.apps.harkco.se • Göteborg, Sverige • RSS 2.0 Feed: /feed.xml
  </text>
</svg>`;
}

/**
 * Generate bespoke app OpenGraph 1200x630 vector preview
 */
export function generateAppOgSvg(appId, telemetry) {
  const app = APPS_META[appId] || {
    name: appId,
    tagline: 'Harkco Daily App',
    description: 'Taktilt mjukvaruinstrument skapat av Harkco Software Lab.',
    category: 'Mjukvara',
    color: '#10B981',
    features: ['100% Noll tracking', 'Lokal webbläsarlagring', 'Direkt värdeutbyte'],
  };

  const isUp = telemetry ? telemetry.status === 'up' : true;
  const statusColor = isUp ? '#10B981' : '#F43F5E';
  const statusText = isUp ? 'OPERATIONAL' : 'DEGRADED';
  const latency = telemetry?.latency ? `${telemetry.latency} ms` : '24 ms';

  const featuresXml = (app.features || []).map((feat, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col * 420;
    const y = row * 45;
    return `
      <g transform="translate(${x}, ${y})">
        <circle cx="12" cy="12" r="9" fill="${app.color}" fill-opacity="0.2"/>
        <path d="M 8 12 L 11 15 L 16 9" fill="none" stroke="${app.color}" stroke-width="2.5" stroke-linecap="round"/>
        <text x="32" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="600" fill="#E2E8F0">${escapeXml(feat)}</text>
      </g>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A0E17"/>
      <stop offset="50%" stop-color="#0E1422"/>
      <stop offset="100%" stop-color="#060910"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E2840" stroke-width="0.75" stroke-opacity="0.35"/>
    </pattern>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Accent glow from app color -->
  <circle cx="1050" cy="180" r="320" fill="${app.color}" fill-opacity="0.14" filter="url(#glow)"/>

  <!-- Top Accent Bar in App Color -->
  <rect x="0" y="0" width="1200" height="6" fill="${app.color}"/>

  <!-- Outer Card Frame -->
  <rect x="40" y="40" width="1120" height="550" rx="20" fill="#111726" fill-opacity="0.75" stroke="#1E2840" stroke-width="1.5"/>

  <!-- Category & Live Telemetry Badge -->
  <g transform="translate(80, 85)">
    <!-- Category Pill -->
    <rect width="150" height="34" rx="8" fill="#1E2840" stroke="#2E3D60" stroke-width="1"/>
    <text x="75" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#94A3B8" letter-spacing="0.05em">${escapeXml(app.category.toUpperCase())}</text>

    <!-- Telemetry Pill -->
    <g transform="translate(165, 0)">
      <rect width="180" height="34" rx="8" fill="#0A0E17" stroke="#1E2840" stroke-width="1"/>
      <circle cx="20" cy="17" r="4.5" fill="${statusColor}"/>
      <text x="34" y="22" font-family="monospace" font-size="12" font-weight="600" fill="#E2E8F0">${statusText} • ${latency}</text>
    </g>
  </g>

  <!-- Studio Provenance Badge -->
  <g transform="translate(950, 85)">
    <rect width="170" height="34" rx="8" fill="#0A0E17" stroke="#1E2840" stroke-width="1"/>
    <text x="85" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#64748B" letter-spacing="0.05em">HARKCO DAILY APPS</text>
  </g>

  <!-- App Title & Accent Line -->
  <g transform="translate(80, 160)">
    <rect x="0" y="0" width="8" height="60" rx="4" fill="${app.color}"/>
    <text x="24" y="50" font-family="Georgia, serif" font-size="56" font-weight="700" fill="#FFFFFF" letter-spacing="-0.02em">
      ${escapeXml(app.name)}
    </text>
  </g>

  <!-- Tagline -->
  <text x="80" y="260" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="600" fill="#E2E8F0" letter-spacing="-0.01em">
    ${escapeXml(app.tagline)}
  </text>

  <!-- Description -->
  <text x="80" y="300" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">
    ${escapeXml(app.description)}
  </text>

  <!-- Feature List -->
  <g transform="translate(80, 360)">
    ${featuresXml}
  </g>

  <!-- Bottom CTA Bar -->
  <g transform="translate(80, 520)">
    <text x="0" y="25" font-family="monospace" font-size="14" font-weight="500" fill="#64748B">
      hub.apps.harkco.se/#app-${appId} • 100% Noll Annonser • Klientintegritet
    </text>
  </g>
</svg>`;
}

export function getAppMeta(appId) {
  if (!APPS_META[appId]) return null;
  return { id: appId, ...APPS_META[appId] };
}
