import React from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Layers, 
  PlayCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { setSoundEnabled, isSoundEnabled, playUiTick } from '../utils/audio';

interface NavbarProps {
  currentIstTime: string;
  currentUtcTime: string;
  activeSensorsCount: number;
  totalSensorsCount: number;
  isDropoutSimulated: boolean;
  alertsCount: number;
  onOpenAlerts: () => void;
  onOpenFusion: () => void;
  onOpenSensorHealth: () => void;
  onOpenTour: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentIstTime,
  currentUtcTime,
  activeSensorsCount,
  totalSensorsCount,
  isDropoutSimulated,
  alertsCount,
  onOpenAlerts,
  onOpenFusion,
  onOpenSensorHealth,
  onOpenTour,
  onSelectScenario
}) => {
  const [soundOn, setSoundOn] = React.useState<boolean>(isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    playUiTick();
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-40 h-14 px-4 glass-panel border-b border-white/[0.07] flex items-center justify-between">
      {/* Left: Brand & Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded border border-cyan-500/30 bg-cyan-950/20">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-white font-['Space_Grotesk']">
                VARUNA
              </span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
                SIH26072
              </span>
            </div>
            <div className="text-[9px] font-mono tracking-wider text-slate-400 uppercase -mt-0.5">
              Atmospheric Intelligence Platform
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-white/10 hidden lg:block" />

        {/* Live Nowcast Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-black/40 border border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="text-[11px] font-mono tracking-wide font-medium text-slate-200">
            LIVE NOWCAST
          </span>
          <span className="text-[10px] font-mono text-slate-500">|</span>
          <span className="text-[10px] font-mono text-cyan-400">10-MIN CYCLE</span>
        </div>
      </div>

      {/* Center: Quick Scenarios for Hackathon Presentation */}
      <div className="hidden xl:flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
          Preset Scenarios:
        </span>
        <button
          onClick={() => onSelectScenario('CELL-042')}
          className="text-[11px] font-mono px-2.5 py-1 rounded glass-pill text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center gap-1.5"
        >
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Coimbatore Cell (TN)</span>
        </button>
        <button
          onClick={() => onSelectScenario('CELL-018')}
          className="text-[11px] font-mono px-2.5 py-1 rounded glass-pill text-slate-300 hover:text-amber-400 hover:border-amber-500/30 transition-all"
        >
          <span>Hassan Squall (KA)</span>
        </button>
        <button
          onClick={() => onSelectScenario('CELL-104')}
          className="text-[11px] font-mono px-2.5 py-1 rounded glass-pill text-slate-300 hover:text-red-400 hover:border-red-500/30 transition-all"
        >
          <span>Khasi Supercell (ML)</span>
        </button>
      </div>

      {/* Right: Telemetry, Pipelines & Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col text-right font-mono text-[10px] text-slate-400 leading-tight">
          <div className="text-slate-200">{currentIstTime || '11:50:00 IST'}</div>
          <div className="text-slate-500">{currentUtcTime || '06:20:00 UTC'}</div>
        </div>

        {/* Multi-sensor Health Badge */}
        <button
          onClick={onOpenSensorHealth}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono transition-all ${
            isDropoutSimulated
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/30'
              : 'bg-black/40 border-white/[0.08] text-slate-300 hover:border-cyan-500/30 hover:text-cyan-300'
          }`}
          title="Click to view multi-sensor pipeline and test sensor dropout"
        >
          {isDropoutSimulated ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>
            {isDropoutSimulated
              ? `DEGRADED (${activeSensorsCount}/${totalSensorsCount})`
              : `PIPELINE (${activeSensorsCount}/${totalSensorsCount})`}
          </span>
        </button>

        {/* Fusion Architecture Button */}
        <button
          onClick={onOpenFusion}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded glass-pill text-[11px] font-mono text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
          title="Inspect Multi-Source Fusion Engine"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>FUSION</span>
        </button>

        {/* CAP Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative flex items-center gap-1.5 px-2.5 py-1 rounded glass-pill text-[11px] font-mono text-slate-300 hover:text-red-400 hover:border-red-500/30 transition-colors"
          title="View CAP Bulletins"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">ALERTS</span>
          {alertsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-600/80 text-white font-bold">
              {alertsCount}
            </span>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className="w-8 h-8 rounded glass-panel flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
          title={soundOn ? 'Atmospheric Synthesizer: ON' : 'Atmospheric Synthesizer: OFF'}
        >
          {soundOn ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Demo Tour Button */}
        <button
          onClick={onOpenTour}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 text-[11px] font-mono tracking-wider font-semibold transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)]"
        >
          <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">DEMO TOUR</span>
        </button>
      </div>
    </header>
  );
};
