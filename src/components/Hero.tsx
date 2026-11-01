import React from 'react';

interface HeroProps {
  operationalCount: number;
  totalCount: number;
  medianLatencyMs: number;
}

export const Hero: React.FC<HeroProps> = ({
  operationalCount,
  totalCount,
  medianLatencyMs,
}) => {
  return (
    <section className="relative pt-6 pb-4 sm:pt-10 sm:pb-8">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-48 bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="space-y-6 text-center max-w-3xl mx-auto px-4">
        
        {/* Atelier Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111726] border border-[#1E2840] text-xs font-mono text-zinc-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Harkco Software Atelier • Göteborg, Sverige</span>
        </div>

        {/* Serif Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Taktil mjukvara byggd för <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent italic">
            fokuserade människor.
          </span>
        </h1>

        {/* Lead text */}
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans max-w-2xl mx-auto">
          Tolv ändamålsenliga verktyg byggda med passion och hög hantverksgrad på kvällar och helger. Inga annonser, inga återkommande abonnemangsfällor—endast direkt värdeutbyte och full kontroll över ditt data.
        </p>

        {/* Live Telemetry Metric Strip */}
        <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left font-mono">
          <div className="p-3 rounded-xl bg-[#111726]/80 border border-[#1E2840]">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Flotta</div>
            <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
              <span>{operationalCount}/{totalCount}</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/20">Grön</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111726]/80 border border-[#1E2840]">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Median Latens</div>
            <div className="text-base font-bold text-cyan-400 mt-0.5">
              {medianLatencyMs} ms
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111726]/80 border border-[#1E2840]">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Integritet</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              0 Annonser
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111726]/80 border border-[#1E2840]">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Ägande</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">
              Ditt Data
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
