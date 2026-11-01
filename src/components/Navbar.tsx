import React from 'react';
import { Volume2, VolumeX, BookOpen, Search, Radio } from 'lucide-react';
import { playTabClick, playChime } from '../utils/audio';

interface NavbarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenManifesto: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  fleetStatus: 'all_operational' | 'degraded';
  operationalCount: number;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMuted,
  onToggleMute,
  onOpenManifesto,
  searchQuery,
  onSearchChange,
  fleetStatus,
  operationalCount,
  totalCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0E17]/90 backdrop-blur-md border-b border-[#1E2840] px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#111726] border border-[#1E2840] flex items-center justify-center text-emerald-400 font-mono font-bold text-base shadow-sm">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-white">
                Harkco Hub
              </span>
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold">
                Software Lab
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
              Gothenburg • Natt- & Helgstudio • 100% Noll Annonser
            </p>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Sök bland alla 12 appar (t.ex. skatt, kvitto, gym, fika)..."
              className="w-full bg-[#111726] border border-[#1E2840] rounded-lg pl-9 pr-12 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-sans transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 bg-[#0A0E17] px-1.5 py-0.5 rounded border border-[#1E2840]">
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111726] hover:bg-[#182035] border border-[#1E2840] hover:border-emerald-500/40 text-zinc-300 transition"
            title="Öppna Vakt Fleet Sentinel"
          >
            <Radio className={`w-3.5 h-3.5 ${fleetStatus === 'all_operational' ? 'text-emerald-400' : 'text-rose-400'} animate-pulse`} />
            <span className="font-semibold text-[11px]">
              {operationalCount}/{totalCount}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold hidden lg:inline">OPERATIV</span>
          </a>

          {/* Philosophy / Manifesto Button */}
          <button
            type="button"
            onClick={() => {
              playChime();
              onOpenManifesto();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111726] hover:bg-[#182035] border border-[#1E2840] hover:border-[#2E3D60] text-zinc-200 transition font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Vår Filosofi</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border transition ${
              isMuted
                ? 'bg-[#111726] border-[#1E2840] text-zinc-500'
                : 'bg-[#111726] border-emerald-500/40 text-emerald-400'
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
