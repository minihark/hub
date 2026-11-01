import React, { useState } from 'react';
import { HarkcoApp, MonitorTelemetry } from '../types';
import { 
  ArrowUpRight, 
  Check, 
  Activity, 
  Receipt, 
  FileText, 
  SplitSquareVertical, 
  Timer, 
  Radio, 
  Beer, 
  Dumbbell, 
  Fish, 
  Truck, 
  Layers, 
  Archive,
  Share2
} from 'lucide-react';
import { playLaunchClick, playChime } from '../utils/audio';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface AppCardProps {
  app: HarkcoApp;
  telemetry?: MonitorTelemetry;
  shortcutNumber?: number;
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

export const AppCard: React.FC<AppCardProps> = ({ app, telemetry, shortcutNumber }) => {
  const [copied, setCopied] = useState(false);
  const IconComponent = ICON_MAP[app.iconName] || Activity;
  const isUp = telemetry ? telemetry.status === 'up' : true;
  const latency = telemetry?.latency || 24;

  const handleShare = async () => {
    playChime();
    const deepLinkUrl = `${window.location.origin}/?app=${app.id}#app-${app.id}`;
    if (typeof navigator !== 'undefined' && navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: `${app.name} — Harkco Daily Apps`,
          text: `${app.tagline}: ${app.description}`,
          url: deepLinkUrl,
        });
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(deepLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div 
      id={`app-${app.id}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] hover:border-[#CBD5E1] dark:hover:border-[#2E3D60] p-6 transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-xl dark:shadow-none"
      style={{
        borderTopColor: app.themeColor,
        borderTopWidth: '2px',
      }}
    >
      {/* Top Meta & Icon */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{
                backgroundColor: app.accentBg,
                color: app.themeColor,
                border: `1px solid ${app.themeColor}33`,
              }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#111827] dark:text-white font-serif tracking-tight">
                  {app.name}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {app.categoryLabel}
              </span>
            </div>
          </div>

          {/* Latency & Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8F7F4] dark:bg-[#0A0E17] border border-[#E5E0D8] dark:border-[#1E2840] text-[10px] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className={isUp ? 'text-zinc-700 dark:text-zinc-300' : 'text-rose-600 dark:text-rose-400 font-bold'}>
              {isUp ? `${latency} ms` : 'Offline'}
            </span>
          </div>
        </div>

        {/* Tagline */}
        <h4 className="text-xs font-semibold text-[#1F2937] dark:text-zinc-200 mb-2 font-sans">
          {app.tagline}
        </h4>

        {/* Description */}
        <p className="text-xs text-[#4B5563] dark:text-zinc-400 leading-relaxed font-sans mb-5">
          {app.description}
        </p>

        {/* Features list */}
        <div className="grid grid-cols-2 gap-1.5 mb-6 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
          {app.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-1.5 truncate">
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer & Launch Button */}
      <div className="pt-4 border-t border-[#E5E0D8] dark:border-[#1E2840] flex items-center justify-between gap-3">
        <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
          <span className="text-amber-700 dark:text-amber-400 font-medium">{app.monetization}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* 1-Click Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className={`p-2 rounded-lg border transition text-xs font-mono flex items-center gap-1 ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'bg-[#F8F7F4] dark:bg-[#0A0E17] hover:bg-[#EFECE6] dark:hover:bg-[#182035] border-[#E5E0D8] dark:border-[#1E2840] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
            title="Dela eller kopiera direktlänk till appen"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline text-[10px]">Kopierad!</span>
              </>
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>

          {app.githubUrl && (
            <a
              href={app.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playLaunchClick()}
              className="p-2 rounded-lg bg-[#F8F7F4] dark:bg-[#0A0E17] hover:bg-[#EFECE6] dark:hover:bg-[#182035] border border-[#E5E0D8] dark:border-[#1E2840] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
              title="Visa källkod på GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          )}

          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playLaunchClick()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:text-[#0A0E17] font-semibold text-xs transition shadow-sm font-sans"
            title={shortcutNumber ? `Öppna ${app.name} (Kortkommando: ${shortcutNumber})` : `Öppna ${app.name}`}
          >
            <span>Öppna</span>
            {shortcutNumber && (
              <kbd className="hidden sm:inline-flex items-center justify-center min-w-[15px] h-4 px-1 text-[9px] font-mono rounded bg-emerald-700/60 dark:bg-emerald-400/30 text-white dark:text-emerald-950 font-bold select-none border border-emerald-500/40 dark:border-emerald-600/30 shadow-2xs">
                {shortcutNumber}
              </kbd>
            )}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </div>
  );
};
