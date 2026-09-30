import React from 'react';
import { 
  X, 
  Layers, 
  ArrowRight, 
  Cpu, 
  Radio, 
  Satellite, 
  Zap, 
  Wind, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import type { SensorFeed } from '../types/storm';

interface FusionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sensors: SensorFeed[];
  isDropoutSimulated: boolean;
  onToggleDropout: () => void;
}

export const FusionPanel: React.FC<FusionPanelProps> = ({
  isOpen,
  onClose,
  sensors,
  isDropoutSimulated,
  onToggleDropout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in font-mono text-slate-200">
      <div className="w-full max-w-4xl glass-panel rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-cyan-500/30 bg-cyan-950/40 flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>VARUNA MULTI-SOURCE FUSION ARCHITECTURE</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-normal">
                  ST-GNN v2.4
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Spatio-Temporal Graph Attention Fusion for Thunderstorm & Lightning Nowcasting (SIH26072)
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

        {/* Content: Architecture Diagram */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Step 1: 4 Input Feeds */}
            <div className="lg:col-span-4 space-y-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>OBSERVATIONAL SENSOR FEEDS</span>
              </div>

              {sensors.map((s) => {
                const isDegraded = s.status !== 'ONLINE';
                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isDegraded
                        ? 'bg-amber-950/30 border-amber-500/40'
                        : 'bg-white/[0.03] border-white/[0.07] hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {s.type === 'RADAR' && <Radio className="w-4 h-4 text-cyan-400" />}
                        {s.type === 'INSAT' && <Satellite className="w-4 h-4 text-blue-400" />}
                        {s.type === 'LIGHTNING' && <Zap className="w-4 h-4 text-amber-400" />}
                        {s.type === 'NWP' && <Wind className="w-4 h-4 text-slate-400" />}
                        <span className="text-xs font-bold text-white">{s.name}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isDegraded
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>Attention Weight:</span>
                      <span className="text-white font-bold">
                        {Math.round(s.currentWeight * 100)}%
                      </span>
                    </div>

                    <div className="mt-1 h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDegraded ? 'bg-amber-500' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${s.currentWeight * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Transition Arrow for Desktop */}
            <div className="hidden lg:flex lg:col-span-1 justify-center">
              <div className="flex flex-col items-center gap-1 text-cyan-400">
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            {/* Step 2: VARUNA Fusion Engine */}
            <div className="lg:col-span-4 p-5 rounded-xl bg-gradient-to-b from-cyan-950/40 to-black/60 border border-cyan-500/30 relative overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.08)]">
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-cyan-500 text-black text-[9px] font-bold uppercase rounded-bl">
                Core Engine
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  VARUNA FUSION ENGINE
                </span>
              </div>

              <div className="space-y-2 text-[10px] text-slate-300">
                <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                  <div className="font-semibold text-cyan-300">1. Spatial-Temporal Graph Attention</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    Aligns multi-scale 500m radar grids with 4km INSAT IR-10.8µm cold convective brightness tops.
                  </div>
                </div>

                <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                  <div className="font-semibold text-amber-300">2. Convective Microphysics Encoder</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    Correlates IITM lightning stroke rates with dual-pol graupel volume in the -10°C to -20°C charging zone.
                  </div>
                </div>

                <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                  <div className="font-semibold text-purple-300">3. Dynamic Dropout Resilience</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    Sensor dropout module recalculates normalized softmax attention coefficients on-the-fly.
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[9px] text-slate-400">
                <span>INFERENCE: 38ms</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  REAL-TIME
                </span>
              </div>
            </div>

            {/* Transition Arrow for Desktop */}
            <div className="hidden lg:flex lg:col-span-1 justify-center">
              <div className="flex flex-col items-center gap-1 text-cyan-400">
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            {/* Step 3: Nowcast Output */}
            <div className="lg:col-span-2 space-y-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>UNIFIED NOWCAST</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">LEAD TIME</div>
                  <div className="text-sm font-bold text-white">0 — 180 Min</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">SPATIAL GRID</div>
                  <div className="text-sm font-bold text-cyan-300">1.0 km² India</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">LIGHTNING ACCURACY</div>
                  <div className="text-sm font-bold text-amber-300">91.4% CSI</div>
                </div>
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    CAP-Alerts Dispatched
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Dropout Sandbox in Modal */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Interactive Dropout Demonstration
                </div>
                <div className="text-[10px] text-slate-400">
                  {isDropoutSimulated
                    ? 'Lightning feed is currently OFFLINE. Notice how Radar (+8%) and INSAT (+13%) compensated.'
                    : 'Click button to simulate field outage of Lightning LLN network and watch weights adapt.'}
                </div>
              </div>
            </div>

            <button
              onClick={onToggleDropout}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                isDropoutSimulated
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-amber-600 text-white hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              }`}
            >
              {isDropoutSimulated ? 'RESTORE FULL PIPELINE' : 'TEST SENSOR DROPOUT'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-black/40 flex justify-between items-center text-[11px] text-slate-400">
          <span>Smart India Hackathon 2026 · Problem Statement SIH26072</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Close Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
