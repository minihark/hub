import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Check, 
  Share2, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Rss, 
  BookOpen, 
  Code2, 
  Download, 
  Radio, 
  Filter, 
  Command, 
  CornerDownLeft,
  Activity,
  Receipt,
  FileText,
  SplitSquareVertical,
  Timer,
  Beer,
  Dumbbell,
  Fish,
  Truck,
  Layers,
  Archive,
  Star,
  Sliders
} from 'lucide-react';
import { HarkcoApp, MonitorTelemetry, AppCategory } from '../types';
import { playTabClick, playLaunchClick, playDismissClick, playChime, SoundTheme, SOUND_THEMES, setSoundTheme, previewSoundTheme } from '../utils/audio';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: HarkcoApp[];
  telemetryMap: Record<string, MonitorTelemetry>;
  theme: 'dark' | 'paper';
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  soundTheme?: SoundTheme;
  onSelectSoundTheme?: (theme: SoundTheme) => void;
  onOpenSoundSettings?: () => void;
  onSelectCategory: (category: AppCategory) => void;
  onOpenManifesto: () => void;
  onOpenChangelog: () => void;
  onOpenWidget: () => void;
  onOpenTelemetry?: () => void;
  onInstallApp?: () => void;
  canInstall?: boolean;
  favoriteIds?: string[];
  onToggleFavorite?: (appId: string) => void;
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

interface PaletteAction {
  id: string;
  title: string;
  subtitle?: string;
  group: 'apps' | 'commands' | 'categories';
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  shortcutHint?: string;
  telemetry?: MonitorTelemetry;
  appUrl?: string;
  appId?: string;
  isFavorite?: boolean;
  onRun: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  apps,
  telemetryMap,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  soundTheme = 'relay',
  onSelectSoundTheme,
  onOpenSoundSettings,
  onSelectCategory,
  onOpenManifesto,
  onOpenChangelog,
  onOpenWidget,
  onOpenTelemetry,
  onInstallApp,
  canInstall,
  favoriteIds = [],
  onToggleFavorite,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setCopiedAppId(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Construct all searchable actions
  const allActions = useMemo<PaletteAction[]>(() => {
    const list: PaletteAction[] = [];

    // 1. All 12 Daily Apps (Favorited apps sorted first)
    const sortedApps = [...apps].sort((a, b) => {
      const aFav = favoriteIds.includes(a.id);
      const bFav = favoriteIds.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

    sortedApps.forEach((app, index) => {
      const IconCmp = ICON_MAP[app.iconName] || Activity;
      const telem = telemetryMap[app.id];
      const isFav = favoriteIds.includes(app.id);

      list.push({
        id: `app-${app.id}`,
        title: app.name,
        subtitle: `${app.categoryLabel} • ${app.tagline}`,
        group: 'apps',
        icon: <IconCmp className="w-4 h-4 text-emerald-500 shrink-0" />,
        badge: isFav ? `★ ${app.badge}` : app.badge,
        badgeColor: isFav ? '#F59E0B' : app.themeColor,
        shortcutHint: index < 9 ? `${index + 1}` : undefined,
        telemetry: telem,
        appUrl: app.url,
        appId: app.id,
        isFavorite: isFav,
        onRun: () => {
          playLaunchClick();
          window.open(app.url, '_blank', 'noopener,noreferrer');
          onClose();
        },
      });
    });

    // 2. Studio Commands
    list.push({
      id: 'cmd-theme',
      title: theme === 'dark' ? 'Växla till Nordiskt Arkivpapper (Ljust läge)' : 'Växla till Mörkt Ateljéläge',
      subtitle: `Nuvarande tema: ${theme === 'dark' ? 'Mörkt' : 'Arkivpapper'}`,
      group: 'commands',
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-cyan-500 shrink-0" />,
      shortcutHint: 'T',
      onRun: () => {
        onToggleTheme();
        onClose();
      },
    });

    list.push({
      id: 'cmd-mute',
      title: isMuted ? 'Slå på taktila syntljud' : 'Stäng av syntljud (Mute)',
      subtitle: `Web Audio feedback: ${isMuted ? 'Inaktiverad' : 'Aktiv'}`,
      group: 'commands',
      icon: isMuted ? <VolumeX className="w-4 h-4 text-zinc-400 shrink-0" /> : <Volume2 className="w-4 h-4 text-emerald-500 shrink-0" />,
      shortcutHint: 'M',
      onRun: () => {
        onToggleMute();
        onClose();
      },
    });

    if (onOpenSoundSettings) {
      list.push({
        id: 'cmd-sound-settings',
        title: 'Ljud- och haptikinställningar',
        subtitle: 'Justera mastervolym, hårdvaruprofil, spatial stereo & haptik',
        group: 'commands',
        icon: <Sliders className="w-4 h-4 text-emerald-500 shrink-0" />,
        onRun: () => {
          playTabClick();
          onOpenSoundSettings();
          onClose();
        },
      });
    }

    // Sound Synthesizer Profiles
    SOUND_THEMES.forEach((themeItem) => {
      const isActive = soundTheme === themeItem.id;
      list.push({
        id: `cmd-sound-theme-${themeItem.id}`,
        title: `Ljudprofil: ${themeItem.name}`,
        subtitle: themeItem.description,
        group: 'commands',
        icon: <Sliders className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-zinc-400'} shrink-0`} />,
        badge: isActive ? 'Aktiv' : themeItem.badge,
        badgeColor: isActive ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold' : undefined,
        shortcutHint: isActive ? 'Vald' : undefined,
        onRun: () => {
          setSoundTheme(themeItem.id);
          if (onSelectSoundTheme) onSelectSoundTheme(themeItem.id);
          previewSoundTheme(themeItem.id);
          onClose();
        },
      });
    });

    list.push({
      id: 'cmd-changelog',
      title: 'Öppna Ateljé-Loggbok & RSS-flöde',
      subtitle: 'Se de 12 senaste lanseringarna och versionsnoteringarna',
      group: 'commands',
      icon: <Rss className="w-4 h-4 text-amber-500 shrink-0" />,
      onRun: () => {
        playChime();
        onOpenChangelog();
        onClose();
      },
    });

    list.push({
      id: 'cmd-manifesto',
      title: 'Läs Harkco-Manifestet',
      subtitle: 'Vår mjukvarufilosofi: Designad, inte maskingenererad & 100% noll annonser',
      group: 'commands',
      icon: <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
      onRun: () => {
        playChime();
        onOpenManifesto();
        onClose();
      },
    });

    list.push({
      id: 'cmd-widget',
      title: 'Bädda in Harkco Widget & Iframe',
      subtitle: 'Hämta vanilla JS Shadow-DOM script eller iframe-kod',
      group: 'commands',
      icon: <Code2 className="w-4 h-4 text-emerald-500 shrink-0" />,
      onRun: () => {
        playChime();
        onOpenWidget();
        onClose();
      },
    });

    if (onOpenTelemetry) {
      list.push({
        id: 'cmd-telemetry-drawer',
        title: 'Öppna 24h Vakt Fleet Telemetri',
        subtitle: 'Inspektera 24h upptidstidslinje, latensgrafer och incidentlogg',
        group: 'commands',
        icon: <Activity className="w-4 h-4 text-emerald-500 shrink-0" />,
        shortcutHint: 'V',
        onRun: () => {
          playChime();
          onOpenTelemetry();
          onClose();
        },
      });
    }

    list.push({
      id: 'cmd-vakt',
      title: 'Öppna Extern Vakt Fleet Sentinel',
      subtitle: 'Öppna den fullständiga Vakt-instrumentpanelen i ny flik',
      group: 'commands',
      icon: <Radio className="w-4 h-4 text-emerald-500 shrink-0" />,
      onRun: () => {
        playLaunchClick();
        window.open('https://vakt.apps.harkco.se', '_blank', 'noopener,noreferrer');
        onClose();
      },
    });

    if (canInstall && onInstallApp) {
      list.push({
        id: 'cmd-install',
        title: 'Installera Harkco Hub (PWA)',
        subtitle: 'Spara hubben på hemskärmen eller skrivbordet för offline-tillgång',
        group: 'commands',
        icon: <Download className="w-4 h-4 text-emerald-500 shrink-0" />,
        onRun: () => {
          onInstallApp();
          onClose();
        },
      });
    }

    // 3. Category Filters
    const categories: { id: AppCategory; label: string; count: number }[] = [
      { id: 'all', label: 'Visa alla appar', count: apps.length },
      { id: 'finance', label: 'Filtrera: Ekonomi & Skatt', count: apps.filter(a => a.category === 'finance').length },
      { id: 'craft', label: 'Filtrera: Hantverk & Brygg', count: apps.filter(a => a.category === 'craft').length },
      { id: 'crypto', label: 'Filtrera: Krypto & Validering', count: apps.filter(a => a.category === 'crypto').length },
      { id: 'tools', label: 'Filtrera: Verktyg & Monitor', count: apps.filter(a => a.category === 'tools').length },
    ];

    categories.forEach(cat => {
      list.push({
        id: `cat-${cat.id}`,
        title: cat.label,
        subtitle: `${cat.count} verktyg i denna kategori`,
        group: 'categories',
        icon: <Filter className="w-4 h-4 text-cyan-500 shrink-0" />,
        onRun: () => {
          playTabClick();
          onSelectCategory(cat.id);
          onClose();
        },
      });
    });

    return list;
  }, [
    apps,
    telemetryMap,
    theme,
    isMuted,
    canInstall,
    onClose,
    onToggleTheme,
    onToggleMute,
    onOpenChangelog,
    onOpenManifesto,
    onOpenWidget,
    onInstallApp,
    onSelectCategory,
    favoriteIds,
  ]);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    if (!query.trim()) return allActions;
    const q = query.toLowerCase().trim();

    return allActions.filter(action => {
      const matchTitle = action.title.toLowerCase().includes(q);
      const matchSubtitle = action.subtitle?.toLowerCase().includes(q);
      const matchBadge = action.badge?.toLowerCase().includes(q);
      const matchId = action.id.toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchBadge || matchId;
    });
  }, [allActions, query]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep highlighted item in view
  useEffect(() => {
    if (listRef.current) {
      const highlightedEl = listRef.current.querySelector(`[data-action-index="${activeIndex}"]`);
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredActions.length > 0) {
        playTabClick();
        setActiveIndex((prev) => (prev + 1) % filteredActions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredActions.length > 0) {
        playTabClick();
        setActiveIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredActions[activeIndex];
      if (current) {
        current.onRun();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      playDismissClick();
      onClose();
    }
  };

  const handleShareApp = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    playChime();
    const deepLink = `${window.location.origin}/?app=${appId}#app-${appId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(deepLink).catch(() => {});
      setCopiedAppId(appId);
      setTimeout(() => {
        setCopiedAppId(null);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-start justify-center pt-14 sm:pt-20 p-4 transition-opacity animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playDismissClick();
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Kommandomeny"
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0E1424] border border-[#E5E0D8] dark:border-[#1E2840] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[82vh] animate-in zoom-in-95 duration-150 transition-colors"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E5E0D8] dark:border-[#1E2840] flex items-center gap-3 bg-[#F8F7F4]/60 dark:bg-[#0A0E17]/60">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök app, kategori, kommando eller telemetri... (t.ex. skatt, kvitto, tema)"
            className="flex-1 bg-transparent text-sm sm:text-base text-[#111827] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-[#161D2F] border border-[#DDD7CD] dark:border-[#263550] text-zinc-600 dark:text-zinc-300 font-semibold shadow-2xs">
            Esc
          </kbd>
        </div>

        {/* Action List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-[#E5E0D8]/40 dark:divide-[#1E2840]/40 font-sans"
        >
          {filteredActions.length > 0 ? (
            filteredActions.map((action, idx) => {
              const isSelected = idx === activeIndex;
              const isApp = action.group === 'apps';

              return (
                <div
                  key={action.id}
                  data-action-index={idx}
                  onClick={action.onRun}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`group px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-[#111827] dark:text-white'
                      : 'hover:bg-[#F8F7F4] dark:hover:bg-[#141B2E] text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-white dark:bg-[#111726] border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-white dark:bg-[#111726] border-[#E5E0D8] dark:border-[#1E2840] text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {action.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-semibold truncate ${
                          isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-[#111827] dark:text-zinc-200'
                        }`}>
                          {action.title}
                        </span>
                        {action.badge && (
                          <span 
                            className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                            style={{ 
                              backgroundColor: `${action.badgeColor || '#10B981'}18`, 
                              color: action.badgeColor || '#10B981' 
                            }}
                          >
                            {action.badge}
                          </span>
                        )}
                      </div>
                      {action.subtitle && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                          {action.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Action Tools & Telemetry */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Live Latency Telemetry */}
                    {action.telemetry && (
                      <span className="hidden md:flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{action.telemetry.latency} ms</span>
                      </span>
                    )}

                    {/* Star Favorite Button for App */}
                    {isApp && action.appId && onToggleFavorite && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(action.appId!);
                        }}
                        className={`p-1.5 rounded-md border text-[10px] transition ${
                          action.isFavorite
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                            : 'bg-white dark:bg-[#111726] border-[#E5E0D8] dark:border-[#1E2840] text-zinc-400 hover:text-amber-500'
                        }`}
                        title={action.isFavorite ? 'Ta bort från snabbval' : 'Fäst som snabbval (kortkommando 1-3)'}
                        aria-label={action.isFavorite ? 'Ta bort från favoriter' : 'Fäst som favorit'}
                      >
                        <Star className={`w-3.5 h-3.5 ${action.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    )}

                    {/* Share Link Button for App */}
                    {isApp && action.appId && (
                      <button
                        type="button"
                        onClick={(e) => handleShareApp(e, action.appId!)}
                        className={`p-1.5 rounded-md border text-[10px] transition ${
                          copiedAppId === action.appId
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-[#111726] border-[#E5E0D8] dark:border-[#1E2840] text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                        title="Kopiera direktlänk (?app=id)"
                      >
                        {copiedAppId === action.appId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Shortcut Hint */}
                    {action.shortcutHint && (
                      <kbd className="hidden sm:inline-flex items-center justify-center min-w-[18px] h-5 px-1.5 text-[10px] font-mono rounded bg-white dark:bg-[#161D2F] border border-[#DDD7CD] dark:border-[#263550] text-zinc-600 dark:text-zinc-300 font-semibold shadow-2xs">
                        {action.shortcutHint}
                      </kbd>
                    )}

                    {/* Enter Action Indicator */}
                    <span className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                      isSelected ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'opacity-0 group-hover:opacity-100 text-zinc-400'
                    }`}>
                      <CornerDownLeft className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] flex items-center justify-center text-zinc-400 mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                Inga kommandon eller appar matchade "{query}".
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Återställ sökning
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-4 py-2.5 bg-[#F8F7F4] dark:bg-[#0A0E17] border-t border-[#E5E0D8] dark:border-[#1E2840] flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#161D2F] border border-[#DDD7CD] dark:border-[#263550] text-[10px]">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#161D2F] border border-[#DDD7CD] dark:border-[#263550] text-[10px]">↓</kbd>
              <span className="ml-1">Navigera</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#161D2F] border border-[#DDD7CD] dark:border-[#263550] text-[10px]">↵</kbd>
              <span className="ml-1">Kör</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#161D2F] border border-[#DDD7CD] dark:border-[#263550] text-[10px]">Esc</kbd>
              <span className="ml-1">Stäng</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            <Command className="w-3 h-3 text-emerald-500" />
            <span>Harkco Omnibox</span>
          </div>
        </div>
      </div>
    </div>
  );
};
