import React, { useState, useEffect, useMemo } from 'react';
import { HARKCO_APPS } from './data/apps';
import { AppCategory, MonitorTelemetry, FleetResponse } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryFilter } from './components/CategoryFilter';
import { AppCard } from './components/AppCard';
import { ManifestoModal } from './components/ManifestoModal';
import { ChangelogDrawer } from './components/ChangelogDrawer';
import { Footer } from './components/Footer';
import { setAudioMuted, playTabClick } from './utils/audio';
import { Search } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('harkco_hub_muted') === 'true';
  });
  const [theme, setTheme] = useState<'dark' | 'paper'>(() => {
    return (localStorage.getItem('harkco_hub_theme') as 'dark' | 'paper') || 'dark';
  });
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [fleetData, setFleetData] = useState<FleetResponse | null>(null);

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

  // Keyboard shortcut cmd+k / ctrl+k / "/"
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2', 'dark:ring-offset-[#0A0E17]');
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2', 'dark:ring-offset-[#0A0E17]');
            }, 3000);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] dark:bg-[#0A0E17] text-[#111827] dark:text-[#F1F5F9] font-sans selection:bg-[#10B981] selection:text-black transition-colors duration-200">
      
      {/* 2px Emerald Accent Top Bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

      {/* Navigation */}
      <Navbar
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenManifesto={() => setIsManifestoOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        fleetStatus={fleetData?.fleet_status || 'all_operational'}
        operationalCount={operationalCount}
        totalCount={HARKCO_APPS.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* Studio Hero */}
        <Hero
          operationalCount={operationalCount}
          totalCount={HARKCO_APPS.length}
          medianLatencyMs={medianLatencyMs}
        />

        {/* Mobile Search Bar */}
        <div className="block md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök bland alla 12 appar..."
              className="w-full bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] rounded-lg pl-9 pr-4 py-2.5 text-xs text-[#111827] dark:text-white placeholder-[#9CA3AF] dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-sans transition-colors"
            />
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
            {filteredApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                telemetry={telemetryMap[app.id]}
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

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default App;
