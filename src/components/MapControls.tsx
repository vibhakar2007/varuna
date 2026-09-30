import React from 'react';
import { 
  Radar, 
  Satellite, 
  Zap, 
  Wind, 
  Target, 
  Eye, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import type { MapLayerType, ViewEngineMode } from '../types/storm';

interface MapControlsProps {
  layers: Record<MapLayerType, boolean>;
  onToggleLayer: (layer: MapLayerType) => void;
  viewMode: ViewEngineMode;
  onSetViewMode: (mode: ViewEngineMode) => void;
  radarSweepAngle?: number;
}

export const MapControls: React.FC<MapControlsProps> = ({
  layers,
  onToggleLayer,
  viewMode,
  onSetViewMode
}) => {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  const layerItems: Array<{
    id: MapLayerType;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'radar',
      label: 'RADAR REFLECTIVITY',
      sublabel: 'IMD Dual-Pol DWR',
      icon: <Radar className="w-3.5 h-3.5" />,
      color: 'text-cyan-400'
    },
    {
      id: 'satellite',
      label: 'INSAT-3DR THERMAL',
      sublabel: 'TIR1 10.8µm Cloud Top',
      icon: <Satellite className="w-3.5 h-3.5" />,
      color: 'text-blue-400'
    },
    {
      id: 'lightning',
      label: 'LIGHTNING NETWORK',
      sublabel: 'IITM / ISRO LLN',
      icon: <Zap className="w-3.5 h-3.5" />,
      color: 'text-amber-400'
    },
    {
      id: 'nwp',
      label: 'NWP FLOW FIELD',
      sublabel: 'IMD WRF 3km Shear',
      icon: <Wind className="w-3.5 h-3.5" />,
      color: 'text-slate-400'
    },
    {
      id: 'cells',
      label: 'STORM TRACKS & CORES',
      sublabel: 'GNN Nowcast Vectors',
      icon: <Target className="w-3.5 h-3.5" />,
      color: 'text-emerald-400'
    }
  ];

  return (
    <aside className="absolute top-18 left-4 z-30 w-64 glass-panel rounded-lg border border-white/[0.08] shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="px-3.5 py-2.5 border-b border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-200">
            ATMOSPHERIC LAYERS
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="text-cyan-400">
            {Object.values(layers).filter(Boolean).length}/5
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
        </div>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-4">
          {/* Layer toggles */}
          <div className="space-y-1">
            {layerItems.map((item) => {
              const isActive = layers[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => onToggleLayer(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-all ${
                    isActive
                      ? 'bg-white/[0.05] border border-white/[0.1]'
                      : 'opacity-40 hover:opacity-80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={isActive ? item.color : 'text-slate-500'}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[11px] font-mono font-medium tracking-wide text-slate-200">
                        {item.label}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        {item.sublabel}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-7 h-4 rounded-full p-0.5 transition-colors ${
                      isActive ? 'bg-cyan-500/80 shadow-[0_0_8px_rgba(0,240,255,0.4)]' : 'bg-slate-700/60'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-3' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Engine View Mode Selector */}
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                FUSION ENGINE MODE
              </span>
              <Eye className="w-3 h-3 text-slate-500" />
            </div>

            <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 rounded border border-white/[0.06]">
              {(['blended', 'observed', 'forecast'] as ViewEngineMode[]).map((mode) => {
                const isCurrent = viewMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => onSetViewMode(mode)}
                    className={`py-1 text-[10px] font-mono uppercase tracking-wider rounded text-center transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radar Reflectivity Scale Legend */}
          <div className="pt-2 border-t border-white/[0.06] font-mono text-[9px] text-slate-400">
            <div className="flex items-center justify-between mb-1">
              <span>RADAR REFLECTIVITY</span>
              <span className="text-cyan-400">dBZ</span>
            </div>
            <div className="h-1.5 w-full rounded-sm flex overflow-hidden">
              <div className="h-full flex-1 bg-[#06b6d4]" title="< 30 dBZ Light" />
              <div className="h-full flex-1 bg-[#10b981]" title="30-40 dBZ Moderate" />
              <div className="h-full flex-1 bg-[#f59e0b]" title="40-50 dBZ Heavy" />
              <div className="h-full flex-1 bg-[#ef4444]" title="50-60 dBZ Severe" />
              <div className="h-full flex-1 bg-[#ec4899]" title="> 60 dBZ Extreme Hail" />
            </div>
            <div className="flex justify-between text-[8px] text-slate-400 mt-0.5">
              <span>20</span>
              <span>35</span>
              <span>45</span>
              <span>55</span>
              <span>70+</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
