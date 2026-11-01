import React from 'react';
import { Radio, ExternalLink, Rss, Code2 } from 'lucide-react';
import { playTabClick } from '../utils/audio';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface FooterProps {
  onOpenWidget?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenWidget }) => {
  return (
    <footer className="border-t border-[#E5E0D8] dark:border-[#1E2840] bg-[#F0ECE4] dark:bg-[#0A0E17] py-10 px-4 sm:px-6 text-xs text-zinc-600 dark:text-zinc-500 font-mono mt-16 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Mission & Fleet Status Shield */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
            H
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[#111827] dark:text-zinc-300 font-bold">Harkco Software Lab</span>
              <a
                href="https://vakt.apps.harkco.se"
                target="_blank"
                rel="noopener noreferrer"
                title="Harkco Fleet Status Sentinel"
                className="inline-block transition-opacity hover:opacity-90 self-center sm:self-auto"
              >
                <img
                  src="https://vakt.apps.harkco.se/badge/fleet.svg"
                  alt="Harkco Fleet Status"
                  className="h-5"
                />
              </a>
            </div>
            <div className="text-[11px] text-zinc-500">
              Göteborg, Sverige • Natt- och helgstudio för taktila mjukvaruinstrument
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-zinc-600 dark:text-zinc-400">
          <a
            href="https://vakt.apps.harkco.se"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTabClick()}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Vakt Sentinel</span>
          </a>

          {onOpenWidget && (
            <button
              type="button"
              onClick={() => {
                playTabClick();
                onOpenWidget();
              }}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1 text-left"
              title="Bädda in Harkco Fleet Widget"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Widget & Embeds</span>
            </button>
          )}

          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTabClick()}
            className="hover:text-amber-800 dark:hover:text-amber-400 transition flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium"
            title="Prenumerera på studio-loggboken via RSS"
          >
            <Rss className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>RSS-flöde</span>
          </a>

          <a
            href="https://github.com/theharkco"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTabClick()}
            className="hover:text-[#111827] dark:hover:text-white transition flex items-center gap-1"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          <a
            href="https://qvitt.se"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTabClick()}
            className="hover:text-[#111827] dark:hover:text-white transition flex items-center gap-1"
          >
            <span>Qvitt.se</span>
            <ExternalLink className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
          </a>
        </div>

      </div>
    </footer>
  );
};
