import React, { useState } from 'react';
import { X, Code2, Copy, Check, ExternalLink, Sliders, Layout, Monitor } from 'lucide-react';
import { playTabClick, playChime } from '../utils/audio';

interface WidgetEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetEmbedModal: React.FC<WidgetEmbedModalProps> = ({ isOpen, onClose }) => {
  const [embedType, setEmbedType] = useState<'script' | 'iframe' | 'badge'>('script');
  const [theme, setTheme] = useState<'dark' | 'paper' | 'auto'>('dark');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'inline'>('bottom-right');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate code snippet based on selections
  let codeSnippet = '';
  if (embedType === 'script') {
    const posAttr = position !== 'bottom-right' ? ` data-position="${position}"` : '';
    const themeAttr = theme !== 'auto' ? ` data-theme="${theme}"` : '';
    if (position === 'inline') {
      codeSnippet = `<!-- 1. Placera var som helst där du vill rendera widgeten -->
<div id="harkco-fleet-widget"></div>

<!-- 2. Ladda Harkco Widget-skriptet -->
<script src="https://hub.apps.harkco.se/widget.js"${themeAttr} async></script>`;
    } else {
      codeSnippet = `<!-- Harkco Fleet Floating Mini-Launcher -->
<script src="https://hub.apps.harkco.se/widget.js"${posAttr}${themeAttr} async></script>`;
    }
  } else if (embedType === 'iframe') {
    const iframeTheme = theme === 'paper' ? 'paper' : 'dark';
    codeSnippet = `<iframe
  src="https://hub.apps.harkco.se/widget?theme=${iframeTheme}"
  width="100%"
  height="480"
  style="border: 0; border-radius: 16px; max-width: 420px; overflow: hidden;"
  title="Harkco Fleet Status"
  loading="lazy"
></iframe>`;
  } else {
    codeSnippet = `[![Harkco Fleet Status](https://hub.apps.harkco.se/og-image.svg)](https://hub.apps.harkco.se)`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    playChime();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div 
        className="w-full max-w-xl bg-[#F8F7F4] dark:bg-[#0A0E17] border-l border-[#E5E0D8] dark:border-[#1E2840] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E5E0D8] dark:border-[#1E2840] flex items-center justify-between bg-white dark:bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827] dark:text-white font-serif tracking-tight">
                Fleet Widget & Embeds
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">Bädda in live-flottan på din sajt eller i Notion</p>
            </div>
          </div>
          <button
            onClick={() => {
              playTabClick();
              onClose();
            }}
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors"
            title="Stäng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
          
          {/* Format Tabs */}
          <div className="flex rounded-lg bg-zinc-200/60 dark:bg-[#0D1322] p-1 border border-[#E5E0D8] dark:border-[#1E2840]">
            <button
              onClick={() => { playTabClick(); setEmbedType('script'); }}
              className={`flex-1 py-1.5 px-3 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                embedType === 'script'
                  ? 'bg-white dark:bg-[#1E2840] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              1-Line Skript
            </button>
            <button
              onClick={() => { playTabClick(); setEmbedType('iframe'); }}
              className={`flex-1 py-1.5 px-3 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                embedType === 'iframe'
                  ? 'bg-white dark:bg-[#1E2840] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              Iframe / Notion
            </button>
            <button
              onClick={() => { playTabClick(); setEmbedType('badge'); }}
              className={`flex-1 py-1.5 px-3 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                embedType === 'badge'
                  ? 'bg-white dark:bg-[#1E2840] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Markdown Badge
            </button>
          </div>

          {/* Configuration Options */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] space-y-4">
            <h3 className="font-semibold text-xs text-[#111827] dark:text-white uppercase tracking-wider font-mono">
              Konfiguration & Utseende
            </h3>

            {/* Theme Selector */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Färgtema</span>
              <div className="flex gap-2">
                {(['dark', 'paper', 'auto'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { playTabClick(); setTheme(t); }}
                    className={`px-2.5 py-1 rounded text-xs capitalize border transition-all ${
                      theme === t
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'border-[#E5E0D8] dark:border-[#1E2840] text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {t === 'paper' ? 'Bond Paper' : t === 'dark' ? 'Dark Radar' : 'Auto (OS)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Selector (only for script) */}
            {embedType === 'script' && (
              <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D8]/60 dark:border-[#1E2840]/60">
                <span className="text-zinc-600 dark:text-zinc-400">Position</span>
                <div className="flex gap-2">
                  {(['bottom-right', 'bottom-left', 'inline'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => { playTabClick(); setPosition(p); }}
                      className={`px-2.5 py-1 rounded text-xs border transition-all ${
                        position === p
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'border-[#E5E0D8] dark:border-[#1E2840] text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                      }`}
                    >
                      {p === 'bottom-right' ? 'Nere till höger' : p === 'bottom-left' ? 'Nere till vänster' : 'Inline (Mount)'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Snippet Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">Färdig kodsnutt:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Kopierad!' : 'Kopiera kod'}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto border border-zinc-800 leading-normal selection:bg-emerald-800">
              <code>{codeSnippet}</code>
            </pre>
          </div>

          {/* Live Preview Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">Förhandsgranskning:</span>
              <a
                href={`/widget?theme=${theme === 'paper' ? 'paper' : 'dark'}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Öppna i ny flik <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="rounded-xl border border-[#E5E0D8] dark:border-[#1E2840] overflow-hidden bg-white dark:bg-[#111726] p-2">
              <iframe
                src={`/widget?theme=${theme === 'paper' ? 'paper' : 'dark'}`}
                title="Widget Preview"
                className="w-full h-80 rounded-lg border-0"
              />
            </div>
          </div>

          {/* Highlights */}
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-[#0D1322] border border-[#E5E0D8] dark:border-[#1E2840] space-y-2 text-zinc-600 dark:text-zinc-400 text-xs">
            <div className="font-semibold text-[#111827] dark:text-white flex items-center gap-1.5">
              <span>✨</span> Hantverkslöfte för externa inbäddningar
            </div>
            <p>
              • <strong>100% Shadow DOM:</strong> Skriptet förorenar inte ditt CSS-namespace och påverkas inte av externa CSS-regler på din sajt.<br />
              • <strong>0 beroenden:</strong> Ren vanilla ES-modul, väger under 8 KB gzippat.<br />
              • <strong>Live Vakt-puls:</strong> Synkroniseras var 30:e sekund med realtidslatenser och driftstatus för alla 12 appar.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
