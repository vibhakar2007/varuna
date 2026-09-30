import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles 
} from 'lucide-react';
import { playUiTick } from '../utils/audio';

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  sihKeyPoint: string;
  actionLabel: string;
  onApply: () => void;
}

interface DemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCell: (id: string | null) => void;
  onSetTimeOffset: (offset: number) => void;
  onOpenFusion: () => void;
  onCloseFusion: () => void;
  onOpenAlerts: () => void;
  onCloseAlerts: () => void;
  onToggleDropout: () => void;
  isDropoutSimulated: boolean;
}

export const DemoTour: React.FC<DemoTourProps> = ({
  isOpen,
  onClose,
  onSelectCell,
  onSetTimeOffset,
  onOpenFusion,
  onCloseFusion,
  onOpenAlerts,
  onCloseAlerts,
  onToggleDropout,
  isDropoutSimulated
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      title: '1. SUB-CONTINENTAL ATMOSPHERIC OVERVIEW',
      subtitle: 'Real-Time Convective Field Tracking',
      description:
        'The command center displays high-resolution Doppler radar, INSAT-3DR infrared imagery, IITM lightning detection, and NWP environmental shear across India.',
      sihKeyPoint: 'Replaces fragmented regional tools with a single unified 1km² atmospheric intelligence grid.',
      actionLabel: 'Center Sub-Continent',
      onApply: () => {
        onSelectCell(null);
        onSetTimeOffset(0);
        onCloseFusion();
        onCloseAlerts();
      }
    },
    {
      title: '2. SEVERE SUPERCELL IN TAMIL NADU',
      subtitle: 'Inspecting CELL-042 (Coimbatore Core)',
      description:
        'Selecting CELL-042 zooms the camera and opens the Storm Intelligence panel. We observe 82% intensity, 91% lightning probability, 62.4 dBZ peak reflectivity, and 34 km/h NE vector.',
      sihKeyPoint: 'Identifies rapid convective vertical updrafts (>32 m/s) with echo tops over 16 km.',
      actionLabel: 'Inspect Tamil Nadu Cell',
      onApply: () => {
        onSelectCell('CELL-042');
        onSetTimeOffset(0);
        onCloseFusion();
        onCloseAlerts();
      }
    },
    {
      title: '3. +60 MINUTE NOWCAST EXTRAPOLATION',
      subtitle: 'Scrubbing Predictive Lead Time',
      description:
        'Moving the forecast timeline to +60 min recalculates the storm trajectory. Notice how the core translates along its azimuth, lightning decay curves update, and the dispersion ellipse widens to communicate ML uncertainty.',
      sihKeyPoint: 'Fills the critical 0-3 hour nowcasting gap where NWP models struggle with convective initiation.',
      actionLabel: 'Fast-Forward to +60m',
      onApply: () => {
        onSelectCell('CELL-042');
        onSetTimeOffset(60);
      }
    },
    {
      title: '4. MULTI-SOURCE SENSOR FUSION ENGINE',
      subtitle: 'Graph Attention Neural Network (ST-GNN)',
      description:
        'Opening the Fusion architecture panel reveals how VARUNA synergistically fuses 500m Radar reflectivity, 4km INSAT-3DR infrared thermal tops, IITM lightning strokes, and NWP WRF shear.',
      sihKeyPoint: 'Cross-modal attention dynamically aligns heterogeneous multi-rate sensor resolutions.',
      actionLabel: 'Open Fusion Diagram',
      onApply: () => {
        onOpenFusion();
        onCloseAlerts();
      }
    },
    {
      title: '5. SENSOR DROPOUT & FAULT TOLERANCE',
      subtitle: 'Zero Downtime Under Sensor Failure',
      description:
        'What happens when a sensor feed fails? Simulating a lightning network dropout shows the GNN dynamically re-weighting Radar (+8%) and INSAT IR (+13%), maintaining 91.4% CSI without crashing.',
      sihKeyPoint: 'Core differentiator: resilient against real-world hardware outages during severe storm events.',
      actionLabel: isDropoutSimulated ? 'Dropout Already Active' : 'Trigger Sensor Dropout',
      onApply: () => {
        if (!isDropoutSimulated) onToggleDropout();
        onOpenFusion();
      }
    },
    {
      title: '6. COMMON ALERTING PROTOCOL (CAP)',
      subtitle: 'Automated Regional Warning Polygons',
      description:
        'Opening the CAP Alerts drawer reveals machine-actionable warnings with polygon boundaries on the map, ready for direct ingestion by NDMA and State Disaster Management Authorities.',
      sihKeyPoint: 'Full compliance with OASIS CAP-v1.2 standard for instant public dissemination.',
      actionLabel: 'Open CAP Bulletins',
      onApply: () => {
        onCloseFusion();
        onOpenAlerts();
      }
    }
  ];

  const currentStep = tourSteps[currentStepIndex];

  const handleNext = () => {
    playUiTick();
    if (currentStepIndex < tourSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      tourSteps[nextIdx].onApply();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    playUiTick();
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      tourSteps[prevIdx].onApply();
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 font-mono text-slate-200 animate-fade-in">
      <div className="glass-panel rounded-2xl border border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.15)] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 bg-cyan-950/60 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>SIH26072 DEMO WALKTHROUGH</span>
            <span className="text-[10px] text-slate-400">
              ({currentStepIndex + 1} of {tourSteps.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {currentStep.title}
            </div>
            <div className="text-[11px] text-cyan-400 font-semibold mt-0.5">
              {currentStep.subtitle}
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          <div className="p-2.5 rounded bg-black/50 border border-white/[0.06] text-[10px] text-amber-200/90 leading-tight">
            <span className="font-bold text-amber-300">JUDGE PITCH: </span>
            {currentStep.sihKeyPoint}
          </div>

          {/* Step Actions */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <button
              onClick={currentStep.onApply}
              className="px-3 py-1.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold hover:bg-cyan-900/60 transition-colors"
            >
              {currentStep.actionLabel}
            </button>

            <div className="flex items-center gap-2">
              <button
                disabled={currentStepIndex === 0}
                onClick={handlePrev}
                className="p-1.5 rounded glass-pill text-slate-400 disabled:opacity-30 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="px-3.5 py-1.5 rounded bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1 shadow-[0_0_10px_#00f0ff]"
              >
                <span>
                  {currentStepIndex === tourSteps.length - 1 ? 'Finish Tour' : 'Next Step'}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
