import React from 'react';
import { AppCategory } from '../types';
import { playTabClick } from '../utils/audio';

interface CategoryFilterProps {
  selectedCategory: AppCategory;
  onSelectCategory: (cat: AppCategory) => void;
  counts: Record<AppCategory, number>;
}

interface CategoryTab {
  id: AppCategory;
  label: string;
  shortcut: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  const tabs: CategoryTab[] = [
    { id: 'all', label: 'Alla', shortcut: 'A' },
    ...(counts.favorites > 0 ? [{ id: 'favorites' as AppCategory, label: '★ Favoriter', shortcut: '*' }] : []),
    { id: 'finance', label: 'Ekonomi & Skatt', shortcut: 'E' },
    { id: 'craft', label: 'Hantverk & Fritid', shortcut: 'C' },
    { id: 'crypto', label: 'XRPL & Web3', shortcut: 'K' },
    { id: 'tools', label: 'System & Spel', shortcut: 'W' },
  ];

  return (
    <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 pt-1 gap-2 font-mono text-xs scrollbar-none">
      {tabs.map((tab) => {
        const isSelected = selectedCategory === tab.id;
        const count = counts[tab.id] || 0;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              playTabClick();
              onSelectCategory(tab.id);
            }}
            title={`Filtrera: ${tab.label} (Snabbknapp: ${tab.shortcut})`}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-150 border select-none ${
              isSelected
                ? 'bg-[#EAE5DA] dark:bg-[#182035] border-[#B8A898] dark:border-cyan-500/50 text-[#111827] dark:text-white shadow-sm dark:shadow-card-glow'
                : 'bg-white dark:bg-[#111726]/60 border-[#E5E0D8] dark:border-[#1E2840] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-[#F0ECE4] dark:hover:bg-[#111726]'
            }`}
          >
            <span>{tab.label}</span>
            <kbd
              className={`hidden sm:inline-flex items-center justify-center min-w-[15px] h-3.5 px-1 text-[8px] font-mono rounded font-semibold transition-colors ${
                isSelected
                  ? 'bg-black/10 dark:bg-white/10 text-[#111827] dark:text-zinc-200 border border-black/10 dark:border-white/20'
                  : 'bg-[#F2EFE9] dark:bg-[#0A0E17] text-zinc-500 dark:text-zinc-400 border border-[#DDD7CD] dark:border-[#1E2840]'
              }`}
            >
              {tab.shortcut}
            </kbd>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected
                  ? 'bg-emerald-600/15 dark:bg-cyan-500/20 text-emerald-800 dark:text-cyan-300 font-semibold'
                  : 'bg-[#EFECE6] dark:bg-[#0A0E17] text-zinc-600 dark:text-zinc-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
