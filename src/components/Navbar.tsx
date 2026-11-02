import React from 'react';
import { Volume2, VolumeX, BookOpen, Search, Radio, Rss, Sun, Moon, Code2, WifiOff, Download, Sliders } from 'lucide-react';
import { playTabClick, playChime, SoundTheme, SOUND_THEMES } from '../utils/audio';

interface NavbarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  soundTheme?: SoundTheme;
  onCycleSoundTheme?: () => void;
  theme: 'dark' | 'paper';
  onToggleTheme: () => void;
  onOpenManifesto: () => void;
  onOpenChangelog: () => void;
  onOpenWidget: () => void;
  onOpenCommandPalette: () => void;
  onOpenTelemetry?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  fleetStatus: 'all_operational' | 'degraded';
  operationalCount: number;
  totalCount: number;
  isOffline?: boolean;
  canInstall?: boolean;
  onInstallApp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMuted,
  onToggleMute,
  soundTheme = 'relay',
  onCycleSoundTheme,
  theme,
  onToggleTheme,
  onOpenManifesto,
  onOpenChangelog,
  onOpenWidget,
  onOpenCommandPalette,
  onOpenTelemetry,
  searchQuery,
  onSearchChange: _onSearchChange,
  fleetStatus,
  operationalCount,
  totalCount,
  isOffline,
  canInstall,
  onInstallApp,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F4]/90 dark:bg-[#0A0E17]/90 backdrop-blur-md border-b border-[#E5E0D8] dark:border-[#1E2840] px-4 sm:px-6 py-3.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono font-bold text-base shadow-xs">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-[#111827] dark:text-white">
                Harkco Hub
              </span>
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 font-bold">
                Software Lab
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-zinc-400 font-mono hidden sm:block">
              Gothenburg • Natt- & Helgstudio • 100% Noll Annonser
            </p>
          </div>
        </div>

        {/* Center Search Input / Omnibox Trigger */}
        <div 
          onClick={() => {
            playTabClick();
            onOpenCommandPalette();
          }}
          className="flex-1 max-w-md relative hidden md:block cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              playTabClick();
              onOpenCommandPalette();
            }
          }}
          title="Öppna Studio Kommandomeny (⌘K eller /)"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-[#9CA3AF] dark:text-zinc-400 group-hover:text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <div className="w-full bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] group-hover:border-emerald-500/50 rounded-lg pl-9 pr-16 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-sans transition-all flex items-center justify-between shadow-2xs">
              <span className="truncate">
                {searchQuery ? `Aktiv sökning: "${searchQuery}"` : 'Sök app, kategori, kommando...'}
              </span>
            </div>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none select-none">
              <span className="text-[10px] font-mono text-[#6B7280] dark:text-zinc-400 bg-[#F3F0EA] dark:bg-[#0A0E17] px-1.5 py-0.5 rounded border border-[#E5E0D8] dark:border-[#1E2840] group-hover:border-emerald-500/40">
                /
              </span>
              <span className="text-[10px] font-mono text-[#6B7280] dark:text-zinc-400 bg-[#F3F0EA] dark:bg-[#0A0E17] px-1.5 py-0.5 rounded border border-[#E5E0D8] dark:border-[#1E2840] group-hover:border-emerald-500/40 font-bold text-emerald-600 dark:text-emerald-400">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          
          {/* Offline Status Badge */}
          {isOffline && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-medium select-none"
              title="Hubben och appar körs från offline-cache"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Offline</span>
            </div>
          )}

          {/* Live Fleet Sentinel Link / Telemetry Drawer Trigger */}
          {!isOffline && (
            <button
              type="button"
              onClick={() => {
                playChime();
                if (onOpenTelemetry) {
                  onOpenTelemetry();
                } else {
                  window.open('https://vakt.apps.harkco.se', '_blank', 'noopener,noreferrer');
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#111726] hover:bg-[#F3F0EA] dark:hover:bg-[#182035] border border-[#E5E0D8] dark:border-[#1E2840] hover:border-emerald-500/40 text-[#374151] dark:text-zinc-300 transition cursor-pointer"
              title="Öppna 24h Vakt Fleet Telemetri & Tidslinje (Kortkommando: V)"
            >
              <Radio className={`w-3.5 h-3.5 ${fleetStatus === 'all_operational' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500'} animate-pulse`} />
              <span className="font-semibold text-[11px]">
                {operationalCount}/{totalCount}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hidden lg:inline">OPERATIV</span>
            </button>
          )}

          {/* PWA Install Button */}
          {canInstall && onInstallApp && (
            <button
              type="button"
              onClick={() => {
                playChime();
                onInstallApp();
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 transition font-medium"
              title="Installera Harkco Hub på hemskärmen eller skrivbordet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Installera</span>
            </button>
          )}

          {/* Changelog / Loggbok Button */}
          <button
            type="button"
            onClick={() => {
              playChime();
              onOpenChangelog();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111726] hover:bg-[#F3F0EA] dark:hover:bg-[#182035] border border-[#E5E0D8] dark:border-[#1E2840] hover:border-amber-500/40 text-amber-700 dark:text-amber-300 transition font-medium"
            title="Öppna Ateljé-Loggbok & RSS-flöde"
          >
            <Rss className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline">Loggbok</span>
          </button>

          {/* Philosophy / Manifesto Button */}
          <button
            type="button"
            onClick={() => {
              playChime();
              onOpenManifesto();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111726] hover:bg-[#F3F0EA] dark:hover:bg-[#182035] border border-[#E5E0D8] dark:border-[#1E2840] hover:border-[#CBD5E1] dark:hover:border-[#2E3D60] text-[#374151] dark:text-zinc-200 transition font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Vår Filosofi</span>
          </button>

          {/* Widget / Embed Button */}
          <button
            type="button"
            onClick={() => {
              playChime();
              onOpenWidget();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111726] hover:bg-[#F3F0EA] dark:hover:bg-[#182035] border border-[#E5E0D8] dark:border-[#1E2840] hover:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 transition font-medium"
            title="Bädda in Harkco Widget på extern sajt"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Widget</span>
          </button>

          {/* Theme Toggle (Paper / Dark) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg border bg-white dark:bg-[#111726] border-[#E5E0D8] dark:border-[#1E2840] text-[#374151] dark:text-zinc-300 hover:text-[#111827] dark:hover:text-white transition"
            title={theme === 'dark' ? 'Växla till Nordiskt Arkivpapper (Ljust läge)' : 'Växla till Mörkt läge'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-600" />
            )}
          </button>

          {/* Sound Toggle & Theme Selector */}
          <div className="flex items-center gap-1">
            {!isMuted && onCycleSoundTheme && (
              <button
                type="button"
                onClick={onCycleSoundTheme}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg border bg-white dark:bg-[#111726] border-[#E5E0D8] dark:border-[#1E2840] hover:border-emerald-500/40 text-[#374151] dark:text-zinc-300 transition group"
                title={`Aktiv ljudprofil: ${SOUND_THEMES.find(t => t.id === soundTheme)?.name || 'Analogt Relä'}. Klicka för nästa profil (eller tryck 'S').`}
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-45 transition-transform" />
                <span className="text-[11px] font-mono font-medium">
                  {SOUND_THEMES.find(t => t.id === soundTheme)?.name || 'Relä'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleMute}
              className={`p-1.5 rounded-lg border transition ${
                isMuted
                  ? 'bg-white dark:bg-[#111726] border-[#E5E0D8] dark:border-[#1E2840] text-[#9CA3AF] dark:text-zinc-500'
                  : 'bg-white dark:bg-[#111726] border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              }`}
              title={isMuted ? 'Slå på ljud' : 'Stäng av ljud'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
