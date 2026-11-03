import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Sliders, 
  Smartphone, 
  Radio, 
  Play, 
  Compass, 
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  SoundTheme, 
  SOUND_THEMES, 
  setSoundTheme, 
  previewSoundTheme,
  setAudioVolume,
  getAudioVolume,
  setSpatialAudioEnabled,
  getSpatialAudioEnabled,
  setHapticsEnabled,
  getHapticsEnabled,
  isHapticsSupported,
  playLaunchClick,
  playTabClick,
  playChime,
  playDismissClick
} from '../utils/audio';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  soundTheme: SoundTheme;
  onSelectSoundTheme: (theme: SoundTheme) => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  soundTheme,
  onSelectSoundTheme,
}) => {
  const [volume, setVolumeState] = useState<number>(() => getAudioVolume());
  const [spatial, setSpatialState] = useState<boolean>(() => getSpatialAudioEnabled());
  const [haptics, setHapticsState] = useState<boolean>(() => getHapticsEnabled());
  const hasHapticSupport = isHapticsSupported();

  const handleVolumeChange = (newVol: number) => {
    setVolumeState(newVol);
    setAudioVolume(newVol);
    playTabClick();
  };

  const handleToggleSpatial = () => {
    const next = !spatial;
    setSpatialState(next);
    setSpatialAudioEnabled(next);
    playTabClick();
  };

  const handleToggleHaptics = () => {
    const next = !haptics;
    setHapticsState(next);
    setHapticsEnabled(next);
    playTabClick();
  };

  const handleSelectTheme = (themeId: SoundTheme) => {
    onSelectSoundTheme(themeId);
    setSoundTheme(themeId);
    previewSoundTheme(themeId);
  };

  if (!isOpen) return null;

  const volumePercent = Math.round(volume * 100);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playDismissClick();
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Ljud och haptikinställningar"
    >
      <div 
        className="w-full max-w-lg bg-[#F8F7F4] dark:bg-[#0A0E17] border-l border-[#E5E0D8] dark:border-[#1E2840] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 transition-colors"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5E0D8] dark:border-[#1E2840] flex items-center justify-between bg-white dark:bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white font-serif tracking-tight">
                  Ateljé Ljud & Haptik
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold uppercase tracking-wider">
                  Web Audio
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-0.5">
                Realtidssyntes • Noll externa ljudfiler • Taktil feedback
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playDismissClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Stäng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 font-sans">

          {/* Section 1: Master Volume & Mute */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                ) : volume > 0.5 ? (
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Volume1 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="font-semibold text-sm text-[#111827] dark:text-white">
                  Masternivå (Volym)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  {isMuted ? 'Avstängt' : `${volumePercent}%`}
                </span>
                <button
                  type="button"
                  onClick={onToggleMute}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition ${
                    isMuted
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {isMuted ? 'Slå på' : 'Mute'}
                </button>
              </div>
            </div>

            {/* Range Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                disabled={isMuted}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 dark:accent-emerald-400 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none"
              />
              
              {/* Presets */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: '25% Subtil', val: 0.25 },
                  { label: '50% Balans', val: 0.5 },
                  { label: '75% Taktil', val: 0.75 },
                  { label: '100% Full', val: 1.0 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    disabled={isMuted}
                    onClick={() => handleVolumeChange(preset.val)}
                    className={`px-2 py-1 text-[11px] font-mono rounded-md border transition ${
                      Math.abs(volume - preset.val) < 0.05 && !isMuted
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'bg-[#F3F0EA] dark:bg-[#161D2F] border-[#E5E0D8] dark:border-[#263550] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Audio Button */}
            <div className="pt-2 border-t border-[#E5E0D8]/60 dark:border-[#1E2840]/60 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                Provlyssna klick & klocka:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => playLaunchClick()}
                  className="px-2.5 py-1 text-xs font-mono rounded-lg bg-[#F3F0EA] dark:bg-[#161D2F] hover:bg-[#E5E0D8] dark:hover:bg-[#202B48] border border-[#E5E0D8] dark:border-[#263550] text-zinc-700 dark:text-zinc-300 transition"
                >
                  Klick
                </button>
                <button
                  type="button"
                  onClick={() => playChime()}
                  className="px-2.5 py-1 text-xs font-mono rounded-lg bg-[#F3F0EA] dark:bg-[#161D2F] hover:bg-[#E5E0D8] dark:hover:bg-[#202B48] border border-[#E5E0D8] dark:border-[#263550] text-zinc-700 dark:text-zinc-300 transition"
                >
                  Klang
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Hardware Synthesizer Profiles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#111827] dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Synthesizer Hårdvaruprofil
              </span>
              <span className="text-xs font-mono text-zinc-500">
                Kortkommando: <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#111726] border border-[#DDD7CD] dark:border-[#263550] font-bold">S</kbd>
              </span>
            </div>

            <div className="space-y-2.5">
              {SOUND_THEMES.map((themeItem) => {
                const isActive = soundTheme === themeItem.id;

                return (
                  <div
                    key={themeItem.id}
                    onClick={() => handleSelectTheme(themeItem.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/50 shadow-xs'
                        : 'bg-white dark:bg-[#111726] border-[#E5E0D8] dark:border-[#1E2840] hover:border-emerald-500/30 hover:bg-[#F8F7F4] dark:hover:bg-[#141B2E]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isActive ? 'text-emerald-800 dark:text-emerald-300' : 'text-[#111827] dark:text-white'}`}>
                          {themeItem.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase">
                          {themeItem.badge}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                            Aktiv
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans mt-0.5 leading-snug">
                        {themeItem.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        previewSoundTheme(themeItem.id);
                      }}
                      className="p-2 rounded-lg bg-white dark:bg-[#161D2F] border border-[#E5E0D8] dark:border-[#263550] hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 transition shrink-0"
                      title="Provlyssna ton"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Spatial Stereo Panning */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-sm text-[#111827] dark:text-white">
                  Spatial Stereo-Panorering
                </span>
              </div>
              
              <button
                type="button"
                role="switch"
                aria-checked={spatial}
                onClick={handleToggleSpatial}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  spatial ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white transition-transform block absolute top-1 ${
                    spatial ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              Panorerar mikroljuden organiskt i stereo (-45% vänster till +45% höger) baserat på appens fysiska rutnätskolumn på skärmen.
            </p>

            {spatial && (
              <div className="pt-2 border-t border-[#E5E0D8]/60 dark:border-[#1E2840]/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500">Testa stereobild:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => playLaunchClick(-0.45)}
                    className="px-2 py-0.5 text-[11px] font-mono rounded bg-[#F3F0EA] dark:bg-[#161D2F] border border-[#E5E0D8] dark:border-[#263550] text-zinc-700 dark:text-zinc-300"
                  >
                    Vänster
                  </button>
                  <button
                    type="button"
                    onClick={() => playLaunchClick(0)}
                    className="px-2 py-0.5 text-[11px] font-mono rounded bg-[#F3F0EA] dark:bg-[#161D2F] border border-[#E5E0D8] dark:border-[#263550] text-zinc-700 dark:text-zinc-300"
                  >
                    Mitten
                  </button>
                  <button
                    type="button"
                    onClick={() => playLaunchClick(0.45)}
                    className="px-2 py-0.5 text-[11px] font-mono rounded bg-[#F3F0EA] dark:bg-[#161D2F] border border-[#E5E0D8] dark:border-[#263550] text-zinc-700 dark:text-zinc-300"
                  >
                    Höger
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Mobile Haptic Feedback */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-sm text-[#111827] dark:text-white">
                  Mobil Taktil Haptik
                </span>
              </div>
              
              <button
                type="button"
                role="switch"
                aria-checked={haptics}
                onClick={handleToggleHaptics}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  haptics ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white transition-transform block absolute top-1 ${
                    haptics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              Ger en fysisk vibrationspuls via enhetens Taptic Engine vid knapptryck, favoritmarkeringar och app-öppningar.
            </p>

            <div className="pt-2 border-t border-[#E5E0D8]/60 dark:border-[#1E2840]/60 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">
                {hasHapticSupport ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Stöds av denna enhet
                  </span>
                ) : (
                  <span className="text-zinc-400">Vibration ej aktiv i skrivbordsläge</span>
                )}
              </span>
              {hasHapticSupport && (
                <button
                  type="button"
                  onClick={() => playChime()}
                  className="px-2 py-0.5 text-[11px] rounded bg-[#F3F0EA] dark:bg-[#161D2F] border border-[#E5E0D8] dark:border-[#263550] text-zinc-700 dark:text-zinc-300"
                >
                  Testa puls
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E5E0D8] dark:border-[#1E2840] bg-white dark:bg-[#111726] flex items-center justify-between text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sparat i lokal webbläsarlagring</span>
          </div>
          <button
            type="button"
            onClick={() => {
              playDismissClick();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#F3F0EA] dark:bg-[#182035] hover:bg-[#E5E0D8] dark:hover:bg-[#202B48] border border-[#E5E0D8] dark:border-[#2E3D60] text-zinc-700 dark:text-zinc-200 transition font-medium"
          >
            Färdig
          </button>
        </div>

      </div>
    </div>
  );
};
