import React from 'react';
import { Star, ArrowUpRight, Activity, Receipt, FileText, SplitSquareVertical, Timer, Radio, Beer, Dumbbell, Fish, Truck, Layers, Archive } from 'lucide-react';
import { HarkcoApp, MonitorTelemetry } from '../types';
import { playLaunchClick, playDismissClick } from '../utils/audio';

interface FavoritesRibbonProps {
  favoriteApps: HarkcoApp[];
  telemetryMap: Record<string, MonitorTelemetry>;
  onToggleFavorite: (appId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Receipt,
  FileText,
  SplitSquareVertical,
  Timer,
  Radio,
  Beer,
  Dumbbell,
  Fish,
  Truck,
  Activity,
  Layers,
  Archive,
};

export const FavoritesRibbon: React.FC<FavoritesRibbonProps> = ({
  favoriteApps,
  telemetryMap,
  onToggleFavorite,
}) => {
  if (favoriteApps.length === 0) {
    return null;
  }

  return (
    <section 
      aria-label="Snabbval och favoriter" 
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] shadow-xs relative overflow-hidden"
    >
      {/* Top subtle golden shimmer accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 opacity-80" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          </div>
          <h2 className="text-sm font-serif font-bold text-[#111827] dark:text-white tracking-tight">
            Snabbval & Favoriter
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F8F7F4] dark:bg-[#0A0E17] border border-[#E5E0D8] dark:border-[#1E2840] text-zinc-600 dark:text-zinc-400">
            {favoriteApps.length} {favoriteApps.length === 1 ? 'app' : 'appar'}
          </span>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 hidden sm:flex items-center gap-1.5">
          <span>Kortkommando</span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[#F8F7F4] dark:bg-[#0A0E17] border border-[#DDD7CD] dark:border-[#263550] text-[#111827] dark:text-zinc-200 font-semibold text-[10px] shadow-2xs">1</kbd>
            {favoriteApps.length > 1 && (
              <>
                <span>–</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#F8F7F4] dark:bg-[#0A0E17] border border-[#DDD7CD] dark:border-[#263550] text-[#111827] dark:text-zinc-200 font-semibold text-[10px] shadow-2xs">
                  {Math.min(favoriteApps.length, 3)}
                </kbd>
              </>
            )}
          </div>
          <span>startar direkt</span>
        </div>
      </div>

      {/* Favorites Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {favoriteApps.map((app, index) => {
          const IconComponent = ICON_MAP[app.iconName] || Activity;
          const telemetry = telemetryMap[app.id];
          const isUp = telemetry ? telemetry.status === 'up' : true;
          const latency = telemetry?.latency || 24;
          const slotNumber = index < 3 ? index + 1 : undefined;

          return (
            <div
              key={app.id}
              className="group/fav relative flex items-center justify-between p-3 rounded-xl bg-[#F8F7F4]/80 dark:bg-[#0A0E17]/80 hover:bg-[#F3F0EA] dark:hover:bg-[#141B2E] border border-[#E5E0D8] dark:border-[#1E2840] hover:border-amber-400/40 transition-all duration-150"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Slot Badge */}
                {slotNumber && (
                  <kbd 
                    className="w-5 h-5 flex items-center justify-center rounded bg-amber-500/20 dark:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-300 font-bold font-mono text-[10px] shrink-0 select-none shadow-2xs"
                    title={`Tryck ${slotNumber} på tangentbordet för att öppna direkt`}
                  >
                    {slotNumber}
                  </kbd>
                )}

                {/* App Icon */}
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: app.accentBg,
                    color: app.themeColor,
                    borderColor: `${app.themeColor}33`,
                  }}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* App Name & Tagline */}
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-[#111827] dark:text-white font-serif truncate">
                      {app.name}
                    </h3>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isUp ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                    {isUp ? `${latency} ms` : 'Offline'} • {app.categoryLabel}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Unstar / Remove Button */}
                <button
                  type="button"
                  onClick={() => {
                    playDismissClick();
                    onToggleFavorite(app.id);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                  title={`Ta bort ${app.name} från favoriter`}
                  aria-label={`Ta bort ${app.name} från favoriter`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                </button>

                {/* Direct Launch Link */}
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playLaunchClick()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:text-[#0A0E17] font-semibold text-xs transition shadow-2xs font-sans"
                  title={`Öppna ${app.name} (Kortkommando: ${slotNumber || ''})`}
                >
                  <span>Öppna</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
