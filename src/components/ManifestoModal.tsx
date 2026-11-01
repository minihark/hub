import React from 'react';
import { X, Sparkles, Shield, HeartHandshake, Code, Terminal } from 'lucide-react';
import { playTabClick } from '../utils/audio';

interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManifestoModal: React.FC<ManifestoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div 
        className="w-full max-w-lg bg-[#0A0E17] border-l border-[#1E2840] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1E2840] flex items-center justify-between bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-serif tracking-tight">
                Harkco Manifest
              </h2>
              <p className="text-xs text-zinc-400 font-mono">Mjukvarufilosofi & Hantverkslöfte</p>
            </div>
          </div>
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

        {/* Manifesto Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-300 font-sans leading-relaxed">
          
          <div className="p-4 rounded-xl bg-[#111726] border border-[#1E2840] space-y-2">
            <div className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              1. Designad, inte maskingenererad
            </div>
            <p className="text-zinc-400">
              Varje app i Harkco-sviten har en egen visuell identitet, skräddarsydd typografi och taktila ytor. Vi sätter huvudfallet i 85% visuellt fokus och kastar ut button soup och onödiga inställningar.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111726] border border-[#1E2840] space-y-2">
            <div className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              2. 100% Noll Annonser & Inget Datamäklarliv
            </div>
            <p className="text-zinc-400">
              Vi säljer aldrig användardata, kör inga tredjeparts-trackers och visar noll blinkande banners. Din data lagras lokalt i din webbläsare eller i dina egna säkra databaser.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111726] border border-[#1E2840] space-y-2">
            <div className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              3. Direkt Värdeutbyte
            </div>
            <p className="text-zinc-400">
              Mjukvara ska vara ett enkelt och hederligt verktyg. Vissa appar är helt gratis; andra erbjuder en valfri engångsupplåsning (Pro) för teamfunktioner utan återkommande abonnemangsfällor.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111726] border border-[#1E2840] space-y-2">
            <div className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              4. Mjukvaruhantverk för sin egen skull
            </div>
            <p className="text-zinc-400">
              Harkco är ett oberoende mjukvarulabb drivet på kvällar och helger i Göteborg av Viktor Holmqvist och AI-partnern minihark. Vi bygger mjukvara vi själva älskar att använda varje dag.
            </p>
          </div>

          <div className="pt-2 text-center text-zinc-500 font-mono text-[11px]">
            Harkco Software Lab • Byggt med stolthet i Göteborg
          </div>

        </div>

      </div>
    </div>
  );
};
