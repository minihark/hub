import React, { useState, useMemo } from 'react';
import { X, Rss, ExternalLink, Check, Sparkles, Rocket, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';
import { CHANGELOG_ENTRIES } from '../data/changelog';
import { playTabClick, playChime } from '../utils/audio';

interface ChangelogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterCategory = 'all' | 'launch' | 'redesign' | 'feature';

export const ChangelogDrawer: React.FC<ChangelogDrawerProps> = ({ isOpen, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [copiedRss, setCopiedRss] = useState(false);

  const filteredEntries = useMemo(() => {
    if (selectedFilter === 'all') return CHANGELOG_ENTRIES;
    return CHANGELOG_ENTRIES.filter((e) => e.category === selectedFilter);
  }, [selectedFilter]);

  const counts = useMemo(() => {
    return {
      all: CHANGELOG_ENTRIES.length,
      launch: CHANGELOG_ENTRIES.filter((e) => e.category === 'launch').length,
      redesign: CHANGELOG_ENTRIES.filter((e) => e.category === 'redesign').length,
      feature: CHANGELOG_ENTRIES.filter((e) => e.category === 'feature').length,
    };
  }, []);

  const handleCopyRss = () => {
    playChime();
    const rssUrl = `${window.location.origin}/feed.xml`;
    navigator.clipboard.writeText(rssUrl).then(() => {
      setCopiedRss(true);
      setTimeout(() => setCopiedRss(false), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        className="w-full max-w-xl bg-[#0A0E17] border-l border-[#1E2840] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#1E2840] flex items-center justify-between bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-serif tracking-tight">
                  Ateljé-Loggbok
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-500/30 font-bold uppercase">
                  RSS 2.0
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">Releaser, redesigns & milstolpar i ateljén</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRss}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182035] hover:bg-[#202B48] border border-[#2E3D60] text-amber-300 text-xs font-mono transition"
              title="Kopiera RSS-flödets URL"
            >
              {copiedRss ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Kopierad!</span>
                </>
              ) : (
                <>
                  <Rss className="w-3.5 h-3.5" />
                  <span>Kopiera RSS</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                playTabClick();
                onClose();
              }}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
              title="Stäng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-3 border-b border-[#1E2840] bg-[#0E1320] flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => {
              playTabClick();
              setSelectedFilter('all');
            }}
            className={`px-2.5 py-1 rounded-md transition ${
              selectedFilter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#182035]'
            }`}
          >
            Alla ({counts.all})
          </button>

          <button
            onClick={() => {
              playTabClick();
              setSelectedFilter('launch');
            }}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              selectedFilter === 'launch'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#182035]'
            }`}
          >
            <Rocket className="w-3 h-3" /> Lanseringar ({counts.launch})
          </button>

          <button
            onClick={() => {
              playTabClick();
              setSelectedFilter('redesign');
            }}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              selectedFilter === 'redesign'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#182035]'
            }`}
          >
            <RefreshCw className="w-3 h-3" /> Redesigns ({counts.redesign})
          </button>

          <button
            onClick={() => {
              playTabClick();
              setSelectedFilter('feature');
            }}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              selectedFilter === 'feature'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#182035]'
            }`}
          >
            <Zap className="w-3 h-3" /> Nya funktioner ({counts.feature})
          </button>
        </div>

        {/* Timeline Entries List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredEntries.map((entry) => {
            const isLaunch = entry.category === 'launch';
            const isRedesign = entry.category === 'redesign';

            const badgeColor = isLaunch
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
              : isRedesign
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
              : 'bg-purple-950/60 text-purple-300 border-purple-500/30';

            const badgeText = isLaunch ? 'Lansering' : isRedesign ? 'Redesign' : 'Ny funktion';

            return (
              <article
                key={entry.id}
                id={`changelog-${entry.id}`}
                className="p-5 rounded-xl bg-[#111726] border border-[#1E2840] hover:border-[#2E3D60] transition-colors space-y-3 relative group"
              >
                {/* Meta row */}
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">{entry.date}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-300 font-semibold">{entry.appName}</span>
                    <span className="text-zinc-500">{entry.version}</span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${badgeColor}`}>
                    {badgeText}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white font-serif tracking-tight">
                  {entry.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {entry.summary}
                </p>

                {/* Highlights List */}
                {entry.highlights && entry.highlights.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {entry.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Action button */}
                <div className="pt-2 flex items-center justify-between border-t border-[#1E2840]/60">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Av {entry.author}
                  </span>

                  <a
                    href={entry.appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playTabClick()}
                    className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
                  >
                    <span>Öppna {entry.appName}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Drawer Footer with RSS Subscribe Info */}
        <div className="p-4 border-t border-[#1E2840] bg-[#111726] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-400">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Prenumerera i din RSS-läsare (NetNewsWire, Feedly m.fl.)</span>
          </div>

          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTabClick()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182035] hover:bg-[#202B48] border border-[#2E3D60] text-amber-300 hover:text-amber-200 transition"
          >
            <Rss className="w-3.5 h-3.5" />
            <span>Öppna feed.xml</span>
          </a>
        </div>
      </div>
    </div>
  );
};
