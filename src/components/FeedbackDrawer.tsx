import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquarePlus, 
  Bug, 
  Lightbulb, 
  Heart,
  Loader2
} from 'lucide-react';
import { HarkcoApp } from '../types';
import { playTabClick, playLaunchClick, playDismissClick, playChime } from '../utils/audio';

interface FeedbackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apps: HarkcoApp[];
  theme: 'dark' | 'paper';
  initialAppId?: string;
}

type FeedbackType = 'idea' | 'bug' | 'praise';

export const FeedbackDrawer: React.FC<FeedbackDrawerProps> = ({
  isOpen,
  onClose,
  apps,
  theme,
  initialAppId = 'hub',
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('idea');
  const [selectedAppId, setSelectedAppId] = useState<string>(initialAppId);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentApp = apps.find((a) => a.id === selectedAppId);
  const appDisplayName = selectedAppId === 'hub' ? 'Harkco Hub (Portal)' : (currentApp?.name || 'Harkco App');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    playLaunchClick();

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedbackType,
          appId: selectedAppId,
          appName: appDisplayName,
          message: message.trim(),
          contact: contact.trim(),
          clientInfo: {
            theme,
            screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          },
        }),
      });

      if (res.ok) {
        playChime();
        setSubmitSuccess(true);
        setMessage('');
        setContact('');
      } else {
        const errJson = await res.json().catch(() => ({}));
        setErrorMessage(errJson.error || 'Kunde inte skicka meddelandet. Försök igen.');
      }
    } catch {
      setErrorMessage('Nätverksfel vid kontakt med servern. Kontrollera din anslutning.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitSuccess(false);
    setErrorMessage(null);
  };

  const placeholders: Record<FeedbackType, string> = {
    idea: 'Vad skulle göra appen ännu bättre? Beskriv gärna ditt arbetsflöde eller funktionen du saknar...',
    bug: 'Vad gick snett? Berätta gärna vad du klickade på, vilken webbläsare du använder och vad som hände...',
    praise: 'Vad gillar du bäst med appen eller ateljéns design? Vi läser varenda ord med stolthet...',
  };

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
      aria-label="Lämna feedback till ateljén"
    >
      <div 
        className="w-full max-w-lg bg-[#F8F7F4] dark:bg-[#0A0E17] border-l border-[#E5E0D8] dark:border-[#1E2840] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 transition-colors"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5E0D8] dark:border-[#1E2840] flex items-center justify-between bg-white dark:bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white font-serif tracking-tight">
                  Ateljé-Feedback
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold uppercase tracking-wider">
                  Direktlinje
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-0.5">
                Direkt till Viktor i Telegram • Noll spårare • 100% anonymt
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

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 font-sans">
          
          {submitSuccess ? (
            <div className="py-12 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-lg font-bold text-[#111827] dark:text-white font-serif">
                  Tack för dina tankar!
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                  Ditt meddelande har landat direkt i Viktors Telegram. Tack för att du hjälper oss hålla mjukvaruhantverket levande.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-mono rounded-lg bg-[#F3F0EA] dark:bg-[#161D2F] hover:bg-[#E5E0D8] dark:hover:bg-[#202B48] border border-[#E5E0D8] dark:border-[#263550] text-zinc-700 dark:text-zinc-300 transition"
                >
                  Skicka ett till meddelande
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playDismissClick();
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-mono font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:text-[#0A0E17] transition shadow-xs"
                >
                  Färdig
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* 1. Category / Type Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Vad gäller ditt meddelande?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'idea', label: 'Idé / Förslag', icon: Lightbulb },
                    { id: 'bug', label: 'Buggrapport', icon: Bug },
                    { id: 'praise', label: 'Tankar & Beröm', icon: Heart },
                  ].map((tab) => {
                    const isSelected = feedbackType === tab.id;
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          playTabClick();
                          setFeedbackType(tab.id as FeedbackType);
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-mono ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                            : 'bg-white dark:bg-[#111726] border-[#E5E0D8] dark:border-[#1E2840] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-[#F8F7F4] dark:hover:bg-[#161D2F]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Target App Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Vilken app gäller det?
                </label>
                <div className="relative">
                  <select
                    value={selectedAppId}
                    onChange={(e) => {
                      playTabClick();
                      setSelectedAppId(e.target.value);
                    }}
                    className="w-full bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#111827] dark:text-white font-sans focus:outline-none focus:border-emerald-500/50 transition appearance-none cursor-pointer"
                  >
                    <option value="hub">Harkco Hub (Huvudportalen & Flottan)</option>
                    <optgroup label="Dagliga Appar">
                      {apps.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.name} ({app.categoryLabel})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 font-mono text-[10px]">
                    ▼
                  </div>
                </div>
              </div>

              {/* 3. Message Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Ditt meddelande <span className="text-emerald-600 dark:text-emerald-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {message.length} / 2000
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                  placeholder={placeholders[feedbackType]}
                  className="w-full bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] focus:border-emerald-500/50 rounded-xl p-3.5 text-xs sm:text-sm text-[#111827] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition font-sans resize-none"
                  required
                />
              </div>

              {/* 4. Optional Contact Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Kontaktuppgifter <span className="text-zinc-400 font-normal lowercase">(valfritt)</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Om du önskar svar
                  </span>
                </div>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="E-post eller @telegram-användarnamn"
                  className="w-full bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#111827] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition font-sans"
                />
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!message.trim() || isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white dark:text-[#0A0E17] font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm font-sans"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Skickar till ateljén...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Skicka direkt till Viktor</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust & Craft Footnote */}
              <div className="p-3.5 rounded-xl bg-[#F0ECE4]/60 dark:bg-[#0E1424] border border-[#E5E0D8]/80 dark:border-[#1E2840]/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Harkco Hantverkslöfte</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
                  Inga bottar, inga outsourcade supportköer. Ditt meddelande läses direkt av grundaren i Göteborg.
                </p>
              </div>

            </form>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E5E0D8] dark:border-[#1E2840] bg-white dark:bg-[#111726] flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Göteborg • Natt- & Helgstudio</span>
          <button
            type="button"
            onClick={() => {
              playDismissClick();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#F3F0EA] dark:bg-[#182035] hover:bg-[#E5E0D8] dark:hover:bg-[#202B48] border border-[#E5E0D8] dark:border-[#2E3D60] text-zinc-700 dark:text-zinc-200 transition font-medium"
          >
            Stäng
          </button>
        </div>

      </div>
    </div>
  );
};
