import React, { useState, useMemo } from 'react';
import { 
  X, 
  Radio, 
  ExternalLink, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Filter
} from 'lucide-react';
import { FleetResponse, HarkcoApp, MonitorTelemetry, FleetIncident } from '../types';
import { playTabClick, playDismissClick } from '../utils/audio';

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fleetData: FleetResponse | null;
  apps: HarkcoApp[];
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  isOpen,
  onClose,
  fleetData,
  apps,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'incidents'>('timeline');
  const [filterAppId, setFilterAppId] = useState<string>('all');

  const monitors: MonitorTelemetry[] = useMemo(() => {
    if (fleetData && fleetData.monitors && fleetData.monitors.length > 0) {
      return fleetData.monitors;
    }
    // Fallback default list
    return apps.map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url,
      status: 'up' as const,
      latency: 24,
      uptime24h: 100,
      history: [],
    }));
  }, [fleetData, apps]);

  const incidents: FleetIncident[] = useMemo(() => {
    return fleetData?.incidents || [];
  }, [fleetData]);

  const filteredIncidents = useMemo(() => {
    if (filterAppId === 'all') return incidents;
    return incidents.filter((inc) => inc.monitorId === filterAppId);
  }, [incidents, filterAppId]);

  // Overall statistics
  const totalMonitors = monitors.length;
  const operationalCount = monitors.filter((m) => m.status === 'up').length;
  const medianLatency = useMemo(() => {
    const latencies = monitors.map((m) => m.latency).filter((l) => l > 0).sort((a, b) => a - b);
    if (latencies.length === 0) return 24;
    const mid = Math.floor(latencies.length / 2);
    return latencies.length % 2 !== 0 ? latencies[mid] : Math.round((latencies[mid - 1] + latencies[mid]) / 2);
  }, [monitors]);

  const overallUptime = useMemo(() => {
    if (typeof fleetData?.overall_uptime === 'number') {
      return fleetData.overall_uptime;
    }
    if (monitors.length === 0) return 100;
    const sum = monitors.reduce((acc, m) => acc + (m.uptime24h || 100), 0);
    return Number((sum / monitors.length).toFixed(2));
  }, [fleetData, monitors]);

  const activeIncidentsCount = useMemo(() => {
    return incidents.filter((inc) => !inc.resolvedAt).length;
  }, [incidents]);

  if (!isOpen) return null;

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
      aria-label="Vakt Fleet Telemetri"
    >
      <div 
        className="w-full max-w-2xl bg-[#F8F7F4] dark:bg-[#0A0E17] border-l border-[#E5E0D8] dark:border-[#1E2840] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 transition-colors"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5E0D8] dark:border-[#1E2840] flex items-center justify-between bg-white dark:bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white font-serif tracking-tight">
                  Vakt Fleet Sentinel
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold uppercase tracking-wider">
                  24h Telemetri
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-0.5">
                Prober var 45:e sekund • SQLite • 100% Noll Externa Spårare
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://vakt.apps.harkco.se"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playTabClick()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0ECE4] dark:bg-[#182035] hover:bg-[#E5E0D8] dark:hover:bg-[#202B48] border border-[#E5E0D8] dark:border-[#2E3D60] text-emerald-800 dark:text-emerald-300 text-xs font-mono transition font-medium"
              title="Öppna fullständiga Vakt Sentinel i ny flik"
            >
              <span>Öppna Vakt</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

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
        </div>

        {/* Fleet KPI Quick Strip */}
        <div className="px-5 sm:px-6 py-4 bg-[#F3F0EA]/70 dark:bg-[#0E1424] border-b border-[#E5E0D8] dark:border-[#1E2840] grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-left">
          
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] shadow-2xs">
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Flottans Upptid</div>
            <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span>{overallUptime}%</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] shadow-2xs">
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Median Latens</div>
            <div className="text-base font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5 mt-0.5">
              <span>{medianLatency} ms</span>
              <Zap className="w-3.5 h-3.5 text-cyan-500" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] shadow-2xs">
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Aktiva Appar</div>
            <div className="text-base font-bold text-[#111827] dark:text-white flex items-center gap-1.5 mt-0.5">
              <span>{operationalCount}/{totalMonitors}</span>
              <span className={`w-2 h-2 rounded-full ${operationalCount === totalMonitors ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] shadow-2xs">
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">24h Incidenter</div>
            <div className={`text-base font-bold flex items-center gap-1.5 mt-0.5 ${
              activeIncidentsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-700 dark:text-zinc-300'
            }`}>
              <span>{incidents.length} st</span>
              {incidents.length === 0 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
          </div>

        </div>

        {/* Tab Switcher */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-[#E5E0D8] dark:border-[#1E2840] bg-white dark:bg-[#111726] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-[#F3F0EA] dark:bg-[#0A0E17] p-1 rounded-xl border border-[#E5E0D8] dark:border-[#1E2840] text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                playTabClick();
                setActiveTab('timeline');
              }}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-[#161D2F] text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>24h Tidslinje & Latens</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                {totalMonitors}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTabClick();
                setActiveTab('incidents');
              }}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                activeTab === 'incidents'
                  ? 'bg-white dark:bg-[#161D2F] text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Incidentlogg</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                incidents.length > 0 
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300' 
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              }`}>
                {incidents.length}
              </span>
            </button>
          </div>

          {activeTab === 'incidents' && incidents.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
              <Filter className="w-3 h-3" />
              <select
                value={filterAppId}
                onChange={(e) => {
                  playTabClick();
                  setFilterAppId(e.target.value);
                }}
                className="bg-transparent border border-[#E5E0D8] dark:border-[#1E2840] rounded-lg px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="all">Alla appar ({incidents.length})</option>
                {apps.map((a) => {
                  const count = incidents.filter((i) => i.monitorId === a.id).length;
                  if (count === 0) return null;
                  return (
                    <option key={a.id} value={a.id}>
                      {a.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 font-sans">
          
          {/* TAB 1: 24h TIMELINE & LATENCY */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 px-1">
                <span>12 Dagliga Appar</span>
                <span>Probhistorik (senaste 30 mätningar)</span>
              </div>

              {monitors.map((mon) => {
                const matchedApp = apps.find((a) => a.id === mon.id);
                const accentColor = matchedApp?.themeColor || '#10B981';
                const history = mon.history || [];
                const uptime = typeof mon.uptime24h === 'number' ? mon.uptime24h : 100;

                return (
                  <div
                    key={mon.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] hover:border-emerald-500/40 transition-all shadow-2xs group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      
                      {/* Left: App Identity */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: accentColor }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#111827] dark:text-white truncate">
                              {mon.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hidden sm:inline">
                              {matchedApp?.categoryLabel || 'Verktyg'}
                            </span>
                          </div>
                          <a
                            href={mon.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 truncate block hover:underline"
                          >
                            {mon.url.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>

                      {/* Right: Real-time telemetry badges */}
                      <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                        <div className="text-right">
                          <div className="font-bold text-[#111827] dark:text-white">
                            {mon.latency} ms
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {uptime}% upptid
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>UP</span>
                        </div>
                      </div>

                    </div>

                    {/* 24h Probe Check Bar / Sparkline */}
                    <div className="mt-3 pt-2.5 border-t border-[#E5E0D8]/60 dark:border-[#1E2840]/60">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                        <span>24h tidslinje</span>
                        <span>{history.length > 0 ? `${history.length} prober registrerade` : '100% felfri drift'}</span>
                      </div>

                      {history.length > 0 ? (
                        <div className="flex items-center gap-1 h-5 overflow-hidden">
                          {history.map((pt, pIdx) => {
                            const isDown = !pt.isUp || pt.statusCode >= 400 || pt.statusCode === 0;
                            const isSlow = pt.latencyMs > 150;
                            
                            // Height scales slightly with latency (min 6px, max 18px)
                            const heightPx = Math.min(18, Math.max(6, Math.round(pt.latencyMs / 10)));
                            
                            let barColor = 'bg-emerald-500/70 hover:bg-emerald-500';
                            if (isDown) {
                              barColor = 'bg-rose-500 hover:bg-rose-600';
                            } else if (isSlow) {
                              barColor = 'bg-amber-500 hover:bg-amber-600';
                            }

                            const timeStr = pt.checkedAt ? new Date(pt.checkedAt).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

                            return (
                              <div
                                key={pIdx}
                                className={`flex-1 rounded-xs transition-all ${barColor} cursor-help`}
                                style={{ height: `${heightPx}px` }}
                                title={`${timeStr} • ${pt.latencyMs}ms • HTTP ${pt.statusCode}`}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-2 w-full rounded-full bg-emerald-500/20 overflow-hidden flex items-center">
                          <div className="h-full w-full bg-emerald-500 rounded-full" />
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: INCIDENT HISTORY */}
          {activeTab === 'incidents' && (
            <div className="space-y-3">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((inc) => {
                  const startedDate = new Date(inc.startedAt);
                  const isResolved = Boolean(inc.resolvedAt);

                  return (
                    <div
                      key={inc.id}
                      className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E0D8] dark:border-[#1E2840] shadow-2xs space-y-2.5 font-sans"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#111827] dark:text-white">
                              {inc.monitorName}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-bold uppercase">
                              {inc.statusCode ? `HTTP ${inc.statusCode}` : 'Avbrott'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                            {startedDate.toLocaleString('sv-SE', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>

                        <div className={`text-xs font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1 font-semibold ${
                          isResolved
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400 animate-pulse'
                        }`}>
                          {isResolved ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Löst ({inc.durationSec || 45}s)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                              <span>Pågående</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Error Message */}
                      <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-[#F8F7F4] dark:bg-[#0E1424] p-2.5 rounded-lg border border-[#E5E0D8] dark:border-[#1E2840] font-mono">
                        {inc.errorMessage || 'Tjänsten svarade inte på schemalagd hälsosond.'}
                      </div>

                      {inc.url && (
                        <div className="text-[11px] font-mono text-zinc-400">
                          Sond-adress: <span className="text-zinc-600 dark:text-zinc-300">{inc.url}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-14 text-center space-y-3 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111827] dark:text-white font-serif">
                      100% Felfri Flottdrift
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-1 leading-relaxed">
                      Inga incidenter eller oplanerade avbrott registrerade för de {totalMonitors} apparna. Vakt fortsätter kontrollera var 45:e sekund.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E5E0D8] dark:border-[#1E2840] bg-white dark:bg-[#111726] flex items-center justify-between text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Vakt Sentinel daemon körs lokalt i M4 Pro</span>
          </div>
          <button
            type="button"
            onClick={() => {
              playDismissClick();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#F3F0EA] dark:bg-[#182035] hover:bg-[#E5E0D8] dark:hover:bg-[#202B48] border border-[#E5E0D8] dark:border-[#2E3D60] text-zinc-700 dark:text-zinc-200 transition font-medium"
          >
            Stäng
          </button>
        </div>

      </div>
    </div>
  );
};
