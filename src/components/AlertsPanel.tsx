import React from 'react';
import { 
  X, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Zap, 
  FileText, 
  ChevronRight
} from 'lucide-react';
import { CAP_ALERTS } from '../data/alerts';
import type { CapAlert } from '../types/storm';

interface AlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAlertId: string | null;
  onSelectAlert: (id: string | null) => void;
  onSelectCell: (cellId: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  isOpen,
  onClose,
  selectedAlertId,
  onSelectAlert,
  onSelectCell
}) => {
  if (!isOpen) return null;

  const handleAlertClick = (alert: CapAlert) => {
    onSelectAlert(alert.id);
    onSelectCell(alert.cellId);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md glass-panel border-l border-white/[0.1] shadow-2xl flex flex-col font-mono text-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-red-950/40 border border-red-500/30 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">
              CAP WARNING BULLETINS
            </div>
            <div className="text-[10px] text-slate-400">
              Common Alerting Protocol v1.2 Compliant
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

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {CAP_ALERTS.map((alert) => {
          const isSelected = selectedAlertId === alert.id;
          const isExtreme = alert.severity === 'Extreme';

          return (
            <div
              key={alert.id}
              onClick={() => handleAlertClick(alert)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-red-950/30 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isExtreme
                      ? 'bg-red-600/30 text-red-300 border border-red-500/40'
                      : 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {alert.severity} · {alert.urgency}
                </span>

                <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Valid for {alert.validForMin}m (until {alert.expires})</span>
                </div>
              </div>

              <div className="text-xs font-bold text-white leading-snug">
                {alert.headline}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-1.5">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{alert.areaDesc}</span>
              </div>

              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/[0.04] text-[10px]">
                <span className="flex items-center gap-1 text-amber-400">
                  <Zap className="w-3 h-3" />
                  Lightning: {alert.lightningProb}%
                </span>
                <span className="text-slate-400">Cell: {alert.cellId}</span>
                <span className="text-slate-400">Certainty: {alert.certainty}</span>
              </div>

              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                {alert.description}
              </p>

              <div className="mt-2.5 p-2 rounded bg-black/40 border border-white/[0.04] text-[9px] text-amber-200/90 leading-tight">
                <span className="font-bold text-amber-300">ACTION: </span>
                {alert.instructions}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[9px] text-cyan-400">
                <span>{alert.identifier}</span>
                <span className="flex items-center gap-1 hover:underline">
                  Center on Map <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400">
          Dissemination: NDMA · IMD · State SDMA
        </span>
        <button
          onClick={() => {
            alert('CAP Alert XML package exported according to OASIS CAP-v1.2 standard.');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded glass-pill text-cyan-300 text-[10px] hover:border-cyan-400 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>EXPORT CAP XML</span>
        </button>
      </div>
    </div>
  );
};
