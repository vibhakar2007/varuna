import React from 'react';
import type { StormCell } from '../types/storm';
import { Zap, Shield, Timer, Award } from 'lucide-react';

interface MetricsBarProps {
  cells: StormCell[];
  isDropoutSimulated: boolean;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ cells, isDropoutSimulated }) => {
  const activeCellsCount = cells.length;
  const peakLightningRisk = Math.max(...cells.map((c) => c.lightningProb), 0);
  const highConfidenceCount = cells.filter((c) => c.confidence === 'HIGH').length;

  return (
    <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-6 px-4 py-1.5 glass-panel rounded-full border border-white/[0.08] shadow-lg text-slate-300 font-mono text-[11px]">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          ACTIVE CELLS
        </span>
        <span className="font-bold text-white text-xs">{activeCellsCount}</span>
      </div>

      <div className="w-[1px] h-3.5 bg-white/10" />

      <div className="flex items-center gap-2">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          PEAK LIGHTNING
        </span>
        <span className="font-bold text-amber-300 text-xs">{peakLightningRisk}%</span>
      </div>

      <div className="w-[1px] h-3.5 bg-white/10" />

      <div className="flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          HIGH CONFIDENCE
        </span>
        <span className="font-bold text-white text-xs">{highConfidenceCount}</span>
      </div>

      <div className="w-[1px] h-3.5 bg-white/10" />

      <div className="flex items-center gap-2">
        <Timer className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          LATENCY
        </span>
        <span
          className={`font-bold text-xs ${
            isDropoutSimulated ? 'text-amber-400' : 'text-emerald-400'
          }`}
        >
          {isDropoutSimulated ? '04m 12s' : '02m 14s'}
        </span>
      </div>

      <div className="w-[1px] h-3.5 bg-white/10" />

      <div className="flex items-center gap-2">
        <Award className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          GNN CSI
        </span>
        <span className="font-bold text-slate-200 text-xs">
          {isDropoutSimulated ? '91.4%' : '94.2%'}
        </span>
      </div>
    </div>
  );
};
