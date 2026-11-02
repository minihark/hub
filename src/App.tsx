import React, { useState, useEffect, useMemo } from 'react';
import { HARKCO_APPS } from './data/apps';
import { AppCategory, MonitorTelemetry, FleetResponse } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryFilter } from './components/CategoryFilter';
import { AppCard } from './components/AppCard';
import { ManifestoModal } from './components/ManifestoModal';
import { ChangelogDrawer } from './components/ChangelogDrawer';
import { WidgetEmbedModal } from './components/WidgetEmbedModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { Footer } from './components/Footer';
import { setAudioMuted, playTabClick, playLaunchClick, playDismissClick, playChime } from './utils/audio';
import { Search, WifiOff } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('harkco_hub_muted') === 'true';
  });
  const [theme, setTheme] = useState<'dark' | 'paper'>(() => {
    return (localStorage.getItem('harkco_hub_theme') as 'dark' | 'paper') || 'dark';
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [fleetData, setFleetData] = useState<FleetResponse | null>(null);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Monitor network status & PWA install availability
  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }
    function handlePrompt(e: Event) {
      e.preventDefault();
      setInstallPrompt(e);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handlePrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    playChime();
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Sync theme with document class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('paper');
    } else {
      root.classList.remove('dark');
      root.classList.add('paper');
    }
    localStorage.setItem('harkco_hub_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    playTabClick();
    setTheme((prev) => (prev === 'dark' ? 'paper' : 'dark'));
  };

  // Sync with live fleet
  useEffect(() => {
    async function loadFleet() {
      try {
        const res = await fetch('/api/fleet');
        if (res.ok) {
          const data = await res.json();
          setFleetData(data);
        }
      } catch (e) {
        console.error('Failed to load fleet status:', e);
      }
    }
    loadFleet();
    const interval = setInterval(loadFleet, 25000);
    return () => clearInterval(interval);
  }, []);

  // Deep-link auto-scroll and highlight (?app=:id or #app-:id)
  useEffect(() => {
    function handleDeepLink() {
      const hash = window.location.hash.replace(/^#app-/, '').replace(/^#/, '');
      const queryApp = new URLSearchParams(window.location.search).get('app');
      const targetId = queryApp || hash;
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(`app-${targetId}`);
          if (el) {
            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
            
            const matchedApp = HARKCO_APPS.find((a) => a.id === targetId);
            const accent = matchedApp?.themeColor || '#10B981';
            
            el.style.boxShadow = `0 0 0 3px ${accent}, 0 10px 25px -5px ${accent}40`;
            el.style.transition = 'box-shadow 0.4s ease';

            setTimeout(() => {
              el.style.boxShadow = '';
            }, 3000);

            // Clean hash to avoid double-triggers on back navigation
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname + (queryApp ? `?app=${queryApp}` : ''));
            }
          }
        }, 300);
      }
    }

    handleDeepLink();
    window.addEventListener('hashchange', handleDeepLink);
    return () => window.removeEventListener('hashchange', handleDeepLink);
  }, []);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
    localStorage.setItem('harkco_hub_muted', String(next));
  };

  // Map of monitor telemetry by app id
  const telemetryMap = useMemo(() => {
    const map: Record<string, MonitorTelemetry> = {};
    if (fleetData && fleetData.monitors) {
      fleetData.monitors.forEach((m) => {
        map[m.id] = m;
      });
    }
    return map;
  }, [fleetData]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<AppCategory, number> = {
      all: HARKCO_APPS.length,
      finance: 0,
      craft: 0,
      crypto: 0,
      tools: 0,
    };
    HARKCO_APPS.forEach((app) => {
      counts[app.category]++;
    });
    return counts;
  }, []);

  // Filter apps
  const filteredApps = useMemo(() => {
    return HARKCO_APPS.filter((app) => {
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        app.name.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.categoryLabel.toLowerCase().includes(q) ||
        app.features.some((f) => f.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  // Telemetry summary
  const operationalCount = useMemo(() => {
    if (!fleetData || !fleetData.monitors) return HARKCO_APPS.length;
    return fleetData.monitors.filter((m) => m.status === 'up').length || HARKCO_APPS.length;
  }, [fleetData]);

  const medianLatencyMs = useMemo(() => {
    if (!fleetData || !fleetData.monitors || fleetData.monitors.length === 0) return 24;
    const latencies = fleetData.monitors.map((m) => m.latency).filter((l) => l > 0).sort((a, b) => a - b);
    if (latencies.length === 0) return 24;
    const mid = Math.floor(latencies.length / 2);
    return latencies.length % 2 !== 0 ? latencies[mid] : Math.round((latencies[mid - 1] + latencies[mid]) / 2);
  }, [fleetData]);

  // Global hotkeys (Power user navigation)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable);

      // Dismiss modals or clear search on Escape
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          e.preventDefault();
          setIsCommandPaletteOpen(false);
          playDismissClick();
          return;
        }
        if (isManifestoOpen || isChangelogOpen || isWidgetOpen) {
          e.preventDefault();
          setIsManifestoOpen(false);
          setIsChangelogOpen(false);
          setIsWidgetOpen(false);
          playDismissClick();
          return;
        }
        if (searchQuery) {
          e.preventDefault();
          setSearchQuery('');
          playDismissClick();
          if (activeEl instanceof HTMLElement) activeEl.blur();
          return;
        }
        if (isInput && activeEl instanceof HTMLElement) {
          activeEl.blur();
          return;
        }
      }

      // Studio Command Palette (Cmd+K / Ctrl+K or /)
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        playChime();
        return;
      }

      if (e.key === '/' && !isInput && !isCommandPaletteOpen && !isManifestoOpen && !isChangelogOpen && !isWidgetOpen) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        playTabClick();
        return;
      }

      // The following shortcuts only activate when not typing in an input and no drawer/modal is open
      if (isInput || isCommandPaletteOpen || isManifestoOpen || isChangelogOpen || isWidgetOpen) {
        return;
      }

      // 1-9 to launch apps from current filtered list
      if (/^[1-9]$/.test(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        const targetApp = filteredApps[index];
        if (targetApp) {
          e.preventDefault();
          playLaunchClick();
          window.open(targetApp.url, '_blank', 'noopener,noreferrer');
        }
        return;
      }

      // 't' or 'T' to toggle theme
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleToggleTheme();
        return;
      }

      // 'm' or 'M' to toggle mute
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    filteredApps,
    isCommandPaletteOpen,
    isManifestoOpen,
    isChangelogOpen,
    isWidgetOpen,
    searchQuery,
    isMuted,
    theme,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] dark:bg-[#0A0E17] text-[#111827] dark:text-[#F1F5F9] font-sans selection:bg-[#10B981] selection:text-black transition-colors duration-200">
      
      {/* 2px Emerald Accent Top Bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

      {/* Offline Status Alert Banner */}
      {isOffline && (
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-mono text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2 select-none">
          <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Offline-läge aktiverat — Hela ateljén och appar körs från lokal PWA-cache.</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenManifesto={() => setIsManifestoOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onOpenWidget={() => setIsWidgetOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        fleetStatus={fleetData?.fleet_status || 'all_operational'}
        operationalCount={operationalCount}
        totalCount={HARKCO_APPS.length}
        isOffline={isOffline}
        canInstall={!!installPrompt}
        onInstallApp={handleInstallApp}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* Studio Hero */}
        <Hero
          operationalCount={operationalCount}
          totalCount={HARKCO_APPS.length}
          medianLatencyMs={medianLatencyMs}
        />

        {/* Mobile Search Bar / Command Palette Trigger */}
        <div 
          onClick={() => {
            playTabClick();
            setIsCommandPaletteOpen(true);
          }}
          className="block md:hidden cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="w-full bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] rounded-lg pl-9 pr-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-sans flex items-center justify-between">
              <span className="truncate">{searchQuery ? `Sökning: "${searchQuery}"` : 'Sök app, kategori, kommando...'}</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-[#F3F0EA] dark:bg-[#0A0E17] px-1.5 py-0.5 rounded border border-[#E5E0D8] dark:border-[#1E2840] font-bold">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          counts={categoryCounts}
        />

        {/* Grid of Apps */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app, index) => (
              <AppCard
                key={app.id}
                app={app}
                telemetry={telemetryMap[app.id]}
                shortcutNumber={index < 9 ? index + 1 : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] flex items-center justify-center text-zinc-400 dark:text-zinc-500 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827] dark:text-white font-serif">Inga appar matchade</h3>
              <p className="text-xs text-[#4B5563] dark:text-zinc-400 font-mono mt-1">
                Inga resultat för "{searchQuery}". Prova ett annat sökord eller nollställ filtret.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                playTabClick();
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-lg bg-[#F3F0EA] dark:bg-[#182035] hover:bg-[#E5E0D8] dark:hover:bg-[#202B48] border border-[#E5E0D8] dark:border-[#2E3D60] text-xs font-mono text-[#111827] dark:text-zinc-200 transition"
            >
              Återställ sökning
            </button>
          </div>
        )}

      </main>

      {/* Studio Command Palette (Omnibox Modal) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        apps={HARKCO_APPS}
        telemetryMap={telemetryMap}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery('');
        }}
        onOpenManifesto={() => setIsManifestoOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onOpenWidget={() => setIsWidgetOpen(true)}
        canInstall={!!installPrompt}
        onInstallApp={handleInstallApp}
      />

      {/* Manifesto Drawer Modal */}
      <ManifestoModal
        isOpen={isManifestoOpen}
        onClose={() => setIsManifestoOpen(false)}
      />

      {/* Atelier Changelog Drawer */}
      <ChangelogDrawer
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      {/* Widget & Embed Modal */}
      <WidgetEmbedModal
        isOpen={isWidgetOpen}
        onClose={() => setIsWidgetOpen(false)}
      />

      {/* Desktop Quick Shortcuts Bar */}
      <aside
        aria-label="Kortkommandon"
        className="hidden md:flex items-center justify-between border-t border-[#E5E0D8]/80 dark:border-[#1E2840]/80 px-6 py-2.5 max-w-7xl w-full mx-auto text-[11px] font-mono text-[#6B7280] dark:text-zinc-400 select-none"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
            Kortkommandon
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#111726] border border-[#DDD7CD] dark:border-[#263550] text-[#111827] dark:text-zinc-200 font-semibold text-[10px] shadow-2xs">1</kbd>
            <span>–</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#111726] border border-[#DDD7CD] dark:border-[#263550] text-[#111827] dark:text-zinc-200 font-semibold text-[10px] shadow-2xs">9</kbd>
            <span className="ml-0.5">Starta app</span>
          </span>
          <span className="text-[#D1D5DB] dark:text-zinc-700">•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#111726] border border-[#DDD7CD] dark:border-[#263550] text-[#111827] dark:text-zinc-200 font-semibold text-[10px] shadow-2xs">⌘K</kbd>
            <span className="text-[10px] text-zinc-400">/</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#111726] border border-[#DDD7CD] dark:border-[#263550] text-[#111827] dark:text-zinc-200 font-semibold text-[10px] shadow-2xs">/</kbd>
            <span className="ml-0.5 font-medium text-emerald-600 dark:text-emerald-400">Kommandomeny</span>
          </span>
          <span className="text-[#D1D5DB] dark:text-zinc-700">•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#111726] border border-[#DDD7CD] dark:border-[#263550] text-[#111827] dark:text-zinc-200 font-semibold text-[10px] shadow-2xs">T</kbd>
            <span className="ml-0.5">Växla tema</span>
          </span>
          <span className="text-[#D1D5DB] dark:text-zinc-700">•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#111726] border border-[#DDD7CD] dark:border-[#263550] text-[#111827] dark:text-zinc-200 font-semibold text-[10px] shadow-2xs">M</kbd>
            <span className="ml-0.5">Ljud</span>
          </span>
          <span className="text-[#D1D5DB] dark:text-zinc-700">•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#111726] border border-[#DDD7CD] dark:border-[#263550] text-[#111827] dark:text-zinc-200 font-semibold text-[10px] shadow-2xs">Esc</kbd>
            <span className="ml-0.5">Stäng / Rensa</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Harkco Studio Fleet • 12 aktiva verktyg</span>
        </div>
      </aside>

      {/* Footer */}
      <Footer onOpenWidget={() => setIsWidgetOpen(true)} />

    </div>
  );
};

export default App;
