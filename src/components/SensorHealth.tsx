import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  ZapOff,
  Radio,
  Satellite,
  Zap,
  Wind
} from 'lucide-react';
import type { SensorFeed } from '../types/storm';

interface SensorHealthProps {
  isOpen: boolean;
  onClose: () => void;
  sensors: SensorFeed[];
  isDropoutSimulated: boolean;
  onToggleDropout: () => void;
}

export const SensorHealth: React.FC<SensorHealthProps> = ({
  isOpen,
  onClose,
  sensors,
  isDropoutSimulated,
  onToggleDropout
}) => {
  if (!isOpen) return null;

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'RADAR':
        return <Radio className="w-4 h-4 text-cyan-400" />;
      case 'INSAT':
        return <Satellite className="w-4 h-4 text-blue-400" />;
      case 'LIGHTNING':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'NWP':
        return <Wind className="w-4 h-4 text-slate-400" />;
      default:
        return <Activity className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl glass-panel rounded-xl border border-white/[0.1] shadow-2xl overflow-hidden font-mono text-slate-200">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-cyan-500/30 bg-cyan-950/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">
                MULTI-SENSOR DATA PIPELINE & HEALTH
              </div>
              <div className="text-[10px] text-slate-400">
                Atmospheric Observation Feeds · SIH26072
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs">
            <div>
              <span className="text-[9px] text-slate-400 uppercase">PIPELINE LATENCY</span>
              <div className={`text-base font-bold mt-0.5 ${isDropoutSimulated ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isDropoutSimulated ? '04m 12s' : '02m 14s'}
              </div>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase">NOWCAST CYCLE</span>
              <div className="text-base font-bold text-white mt-0.5">10 Min</div>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase">FAULT TOLERANCE</span>
              <div className="text-base font-bold text-cyan-400 mt-0.5">Active (GNN)</div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider px-1">
              <span>Observation Feed</span>
              <span>Fusion Weight & Status</span>
            </div>

            {sensors.map((sensor) => {
              const isDegraded = sensor.status !== 'ONLINE';
              return (
                <div
                  key={sensor.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isDegraded
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-white/[0.02] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getSensorIcon(sensor.type)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {sensor.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {sensor.fullName}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {sensor.resolution} · Latency: {sensor.latencySeconds}s · {sensor.activeStations}/{sensor.totalStations} Stations
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1 italic">
                          {sensor.details}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isDegraded
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isDegraded ? (
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        )}
                        {sensor.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1.5">
                        Weight:{' '}
                        <span className="text-white font-bold">
                          {Math.round(sensor.currentWeight * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isDegraded ? 'bg-amber-500' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${sensor.currentWeight * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>FAULT TOLERANCE & SENSOR DROPOUT TEST</span>
              </div>
              <button
                onClick={onToggleDropout}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  isDropoutSimulated
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                {isDropoutSimulated ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RESTORE ALL FEEDS</span>
                  </>
                ) : (
                  <>
                    <ZapOff className="w-3.5 h-3.5" />
                    <span>TRIGGER LIGHTNING DROPOUT</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-slate-300 leading-relaxed">
              {isDropoutSimulated ? (
                <span className="text-amber-300 font-medium">
                  DROPOUT ACTIVE: Lightning LLN feed disconnected. VARUNA's Spatio-Temporal Graph Transformer has reweighted Radar dual-pol (+8%) and INSAT IR-10.8µm (+13%). Thunderstorm nowcasting continues uninterrupted at 91.4% CSI.
                </span>
              ) : (
                <span>
                  Simulate field sensor failure (e.g. ground lightning antenna severed or data link outage). Unlike traditional models that fail entirely, VARUNA dynamically redistributes multi-sensor attention weights with zero downtime.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-white/[0.08] bg-black/40 flex justify-between items-center text-[11px]">
          <span className="text-slate-400">
            Assimilating: 34 Radars · 1 Satellite · 82 LLN Stations · 1 NWP Model
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
