import React from 'react';
import { Search, Star, Activity, Sun, Moon } from 'lucide-react';
import { AppCategory } from '../types';
import { playTabClick, playChime } from '../utils/audio';

interface ThumbDockProps {
  hidden?: boolean;
  theme: 'dark' | 'paper';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  selectedCategory: AppCategory;
  onSelectCategory: (cat: AppCategory) => void;
  favoritesCount: number;
  onOpenTelemetry: () => void;
  fleetStatus: 'all_operational' | 'degraded' | 'offline';
  operationalCount: number;
  totalCount: number;
}

export const ThumbDock: React.FC<ThumbDockProps> = ({
  hidden = false,
  theme,
  onToggleTheme,
  onOpenSearch,
  selectedCategory,
  onSelectCategory,
  favoritesCount,
  onOpenTelemetry,
  fleetStatus,
  operationalCount,
  totalCount,
}) => {
  const isFavoritesActive = selectedCategory === 'favorites';
  const isAllOperational = fleetStatus === 'all_operational';

  const handleSearchClick = () => {
    playTabClick();
    onOpenSearch();
  };

  const handleFavoritesClick = () => {
    playTabClick();
    if (isFavoritesActive) {
      onSelectCategory('all');
    } else {
      onSelectCategory('favorites');
    }
  };

  const handleTelemetryClick = () => {
    playTabClick();
    onOpenTelemetry();
  };

  const handleThemeClick = () => {
    playChime();
    onToggleTheme();
  };

  return (
    <nav
      role="toolbar"
      aria-label="Snabbkommandon och studiodocka"
      className={`fixed z-30 bottom-[calc(env(safe-area-inset-bottom)+14px)] inset-x-0 mx-auto w-max sm:hidden select-none transition-all duration-200 ease-out motion-reduce:transition-none ${
        hidden
          ? 'translate-y-[150%] opacity-0 pointer-events-none scale-95'
          : 'translate-y-0 opacity-100 pointer-events-auto scale-100'
      }`}
    >
      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FFFCF7]/95 dark:bg-[#111726]/90 backdrop-blur-md border border-[#D5CEBF] dark:border-[#1E2840] shadow-[0_12px_28px_-10px_rgba(60,50,30,0.28)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_-8px_rgba(0,0,0,0.7)]">
        
        {/* Sök / Command Palette */}
        <button
          type="button"
          onClick={handleSearchClick}
          aria-label="Sök och snabbmeny (Kommandomeny ⌘K)"
          title="Sök appar och kommandon"
          className="relative w-12 h-12 flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.92] active:bg-black/10 dark:active:bg-white/15 transition-transform duration-75 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-cyan-400"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Favoriter Filter Toggle */}
        <button
          type="button"
          onClick={handleFavoritesClick}
          aria-pressed={isFavoritesActive}
          aria-label={isFavoritesActive ? 'Visa alla appar' : `Visa sparade favoriter (${favoritesCount} st)`}
          title={isFavoritesActive ? 'Visa alla appar' : 'Filtrera på dina stjärnmärkta favoriter'}
          className={`relative w-12 h-12 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.92] active:bg-black/10 dark:active:bg-white/15 transition-transform duration-75 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-cyan-400 ${
            isFavoritesActive
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Star
            className={`w-5 h-5 transition-transform ${
              isFavoritesActive ? 'fill-amber-500 dark:fill-amber-400 scale-110' : ''
            }`}
          />
          {favoritesCount > 0 && !isFavoritesActive && (
            <span className="absolute top-2.5 right-2.5 min-w-[14px] h-3.5 px-0.5 text-[8px] font-mono font-bold rounded-full bg-emerald-500 text-black flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Vakt Fleet Telemetry Pulse */}
        <button
          type="button"
          onClick={handleTelemetryClick}
          aria-label={`Vakt Sentinel telemetri: ${operationalCount} av ${totalCount} appar operativa`}
          title={`Vakt Sentinel: ${operationalCount}/${totalCount} appar operativa`}
          className="relative w-12 h-12 flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.92] active:bg-black/10 dark:active:bg-white/15 transition-transform duration-75 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-cyan-400"
        >
          <Activity className="w-5 h-5" />
          <span
            className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full border-2 border-[#FFFCF7] dark:border-[#111726] ${
              isAllOperational
                ? 'bg-emerald-500'
                : 'bg-amber-500 animate-pulse'
            }`}
          />
        </button>

        {/* Tema Switcher (180deg tactile rotation) */}
        <button
          type="button"
          onClick={handleThemeClick}
          aria-label={`Byt till ${theme === 'dark' ? 'Nordic Bond Paper-läge' : 'Mörkt ateljéläge'}`}
          title={`Växla tema (nu: ${theme === 'dark' ? 'Mörkt' : 'Nordic Paper'})`}
          className="relative w-12 h-12 flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.92] active:bg-black/10 dark:active:bg-white/15 transition-transform duration-75 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-cyan-400"
        >
          <div className="transition-transform duration-300 ease-out rotate-0 dark:rotate-180">
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-zinc-800" />
            )}
          </div>
        </button>

      </div>
    </nav>
  );
};
