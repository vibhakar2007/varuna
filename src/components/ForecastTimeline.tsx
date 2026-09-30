import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward 
} from 'lucide-react';

interface ForecastTimelineProps {
  timeOffsetMin: number;
  onSetTimeOffset: (offset: number) => void;
  isPlaying: boolean;
  onTogglePlay: (playing: boolean) => void;
  playbackSpeed: number;
  onSetPlaybackSpeed: (speed: number) => void;
}

const TIMELINE_STEPS = [
  { offset: 0, label: 'NOW', clock: '11:50', desc: 'Real-time Observed' },
  { offset: 30, label: '+30 MIN', clock: '12:20', desc: 'Short-range Extrap' },
  { offset: 60, label: '+60 MIN', clock: '12:50', desc: 'Convective Peak' },
  { offset: 90, label: '+90 MIN', clock: '13:20', desc: 'Deep Convection' },
  { offset: 120, label: '+120 MIN', clock: '13:50', desc: 'Dissipation Phase' },
  { offset: 180, label: '+180 MIN', clock: '14:50', desc: 'Residual Outflow' }
];

export const ForecastTimeline: React.FC<ForecastTimelineProps> = ({
  timeOffsetMin,
  onSetTimeOffset,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSetPlaybackSpeed
}) => {
  const currentStep = TIMELINE_STEPS.find((s) => s.offset === timeOffsetMin) || TIMELINE_STEPS[0];

  const handleSpeedCycle = () => {
    if (playbackSpeed === 1) onSetPlaybackSpeed(2);
    else if (playbackSpeed === 2) onSetPlaybackSpeed(4);
    else onSetPlaybackSpeed(1);
  };

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-30 h-16 glass-panel border-t border-white/[0.08] px-4 flex items-center justify-between">
      {/* Left: Playback Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onTogglePlay(!isPlaying)}
          className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 flex items-center justify-center transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          title={isPlaying ? 'Pause Forecast Simulation' : 'Play Nowcast Loop'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-cyan-400" /> : <Play className="w-4 h-4 fill-cyan-400 ml-0.5" />}
        </button>

        <button
          onClick={handleSpeedCycle}
          className="px-2 py-1 rounded glass-pill text-[10px] font-mono text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors flex items-center gap-1"
          title="Change playback speed"
        >
          <FastForward className="w-3 h-3 text-cyan-400" />
          <span>{playbackSpeed}x</span>
        </button>

        <button
          onClick={() => onSetTimeOffset(0)}
          className="p-1.5 rounded glass-pill text-slate-400 hover:text-white transition-colors"
          title="Reset to Real-Time Now"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="hidden md:flex flex-col font-mono text-[10px] leading-tight pl-2 border-l border-white/10">
          <div className="text-cyan-400 font-bold flex items-center gap-1.5">
            <span>{currentStep.label}</span>
            <span className="text-slate-300 font-normal">({currentStep.clock} IST)</span>
          </div>
          <div className="text-[9px] text-slate-400">{currentStep.desc}</div>
        </div>
      </div>

      {/* Center: Interactive Scrubber Track */}
      <div className="flex-1 max-w-2xl mx-6">
        <div className="relative flex items-center justify-between">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
              style={{
                width: `${(timeOffsetMin / 180) * 100}%`
              }}
            />
          </div>

          {TIMELINE_STEPS.map((step) => {
            const isSelected = step.offset === timeOffsetMin;
            const isPast = step.offset <= timeOffsetMin;

            return (
              <button
                key={step.offset}
                onClick={() => onSetTimeOffset(step.offset)}
                className="relative z-10 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 border flex items-center justify-center ${
                    isSelected
                      ? 'bg-cyan-400 border-white shadow-[0_0_10px_#00f0ff] scale-125'
                      : isPast
                      ? 'bg-cyan-900 border-cyan-400'
                      : 'bg-black border-slate-600 group-hover:border-slate-400'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>

                <div
                  className={`text-[10px] font-mono mt-1.5 transition-colors ${
                    isSelected
                      ? 'text-cyan-300 font-bold'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {step.label}
                </div>

                <div className="text-[8px] font-mono text-slate-400 hidden sm:block">
                  {step.clock}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Confidence Legend */}
      <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-white/10 font-mono text-[10px]">
        <span className="text-slate-400 uppercase tracking-widest text-[9px]">
          CONFIDENCE:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
          <span className="text-slate-300">HIGH</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <span className="text-slate-300">MED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f97316]" />
          <span className="text-slate-300">LOW</span>
        </div>
      </div>
    </footer>
  );
};
