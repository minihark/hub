import React from 'react';
import { Volume2, VolumeX, BookOpen, Search, Radio, Rss, Sun, Moon, Code2 } from 'lucide-react';
import { playTabClick, playChime } from '../utils/audio';

interface NavbarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  theme: 'dark' | 'paper';
  onToggleTheme: () => void;
  onOpenManifesto: () => void;
  onOpenChangelog: () => void;
  onOpenWidget: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  fleetStatus: 'all_operational' | 'degraded';
  operationalCount: number;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMuted,
  onToggleMute,
  theme,
  onToggleTheme,
  onOpenManifesto,
  onOpenChangelog,
  onOpenWidget,
  searchQuery,
  onSearchChange,
  fleetStatus,
  operationalCount,
  totalCount,
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

        {/* Center Search Input */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9CA3AF] dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Sök bland alla 12 appar (t.ex. skatt, kvitto, gym, fika)..."
              className="w-full bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] rounded-lg pl-9 pr-12 py-1.5 text-xs text-[#111827] dark:text-white placeholder-[#9CA3AF] dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-sans transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#6B7280] dark:text-zinc-500 bg-[#F3F0EA] dark:bg-[#0A0E17] px-1.5 py-0.5 rounded border border-[#E5E0D8] dark:border-[#1E2840]">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          
          {/* Live Fleet Sentinel Link */}
          <a
            href="https://vakt.apps.harkco.se"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTabClick()}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#111726] hover:bg-[#F3F0EA] dark:hover:bg-[#182035] border border-[#E5E0D8] dark:border-[#1E2840] hover:border-emerald-500/40 text-[#374151] dark:text-zinc-300 transition"
            title="Öppna Vakt Fleet Sentinel"
          >
            <Radio className={`w-3.5 h-3.5 ${fleetStatus === 'all_operational' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500'} animate-pulse`} />
            <span className="font-semibold text-[11px]">
              {operationalCount}/{totalCount}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hidden lg:inline">OPERATIV</span>
          </a>

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

          {/* Sound Toggle */}
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
    </header>
  );
};
