import React from 'react';
import { AppCategory } from '../types';
import { playTabClick } from '../utils/audio';

interface CategoryFilterProps {
  selectedCategory: AppCategory;
  onSelectCategory: (cat: AppCategory) => void;
  counts: Record<AppCategory, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  const tabs: { id: AppCategory; label: string }[] = [
    { id: 'all', label: 'Alla' },
    { id: 'finance', label: 'Ekonomi & Skatt' },
    { id: 'craft', label: 'Hantverk & Fritid' },
    { id: 'crypto', label: 'XRPL & Web3' },
    { id: 'tools', label: 'System & Spel' },
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-150 border ${
              isSelected
                ? 'bg-[#182035] border-cyan-500/50 text-white shadow-card-glow'
                : 'bg-[#111726]/60 border-[#1E2840] text-zinc-400 hover:text-zinc-200 hover:bg-[#111726]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'bg-[#0A0E17] text-zinc-500'
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
