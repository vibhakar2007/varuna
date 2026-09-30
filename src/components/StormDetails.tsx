import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Zap, 
  Gauge, 
  CloudRain, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Navigation
} from 'lucide-react';
import gsap from 'gsap';
import type { StormCell, SensorFeed } from '../types/storm';
import { getConfidenceColor } from '../utils/mapStyles';

interface StormDetailsProps {
  cell: StormCell | null;
  onClose: () => void;
  sensors: SensorFeed[];
  timeOffsetMin: number;
}

export const StormDetails: React.FC<StormDetailsProps> = ({
  cell,
  onClose,
  sensors,
  timeOffsetMin
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  // Animate panel entry when cell changes
  useEffect(() => {
    if (panelRef.current && cell) {
      gsap.fromTo(
        panelRef.current,
        { x: 340, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }
      );
    }
  }, [cell?.id]);

  // Render Mini Chart: Probability vs Time & Intensity vs Time
  useEffect(() => {
    if (!cell || !chartCanvasRef.current) return;
    const canvas = chartCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 280);
    const height = (canvas.height = 110);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 18, bottom: 22, left: 28, right: 14 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const forecast = cell.forecast;
    if (forecast.length < 2) return;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    [0, 50, 100].forEach((val) => {
      const y = padding.top + chartH - (val / 100) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(`${val}%`, 6, y + 3);
    });

    const getX = (idx: number) => padding.left + (idx / (forecast.length - 1)) * chartW;
    const getY = (val: number) => padding.top + chartH - (val / 100) * chartH;

    // 1. Draw Lightning Probability Curve
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(forecast[0].lightningProb));
    forecast.forEach((pt, idx) => {
      ctx.lineTo(getX(idx), getY(pt.lightningProb));
    });

    const gradCyan = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradCyan.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    gradCyan.addColorStop(1, 'rgba(0, 240, 255, 0.01)');

    ctx.lineTo(getX(forecast.length - 1), height - padding.bottom);
    ctx.lineTo(getX(0), height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradCyan;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(forecast[0].lightningProb));
    forecast.forEach((pt, idx) => {
      ctx.lineTo(getX(idx), getY(pt.lightningProb));
    });
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Draw Intensity Curve
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(forecast[0].intensity));
    forecast.forEach((pt, idx) => {
      ctx.lineTo(getX(idx), getY(pt.intensity));
    });
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Mark data points
    forecast.forEach((pt, idx) => {
      const x = getX(idx);
      const yProb = getY(pt.lightningProb);
      const isCurrentTime = pt.timeOffsetMin === timeOffsetMin;

      ctx.beginPath();
      ctx.arc(x, yProb, isCurrentTime ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isCurrentTime ? '#ffffff' : '#00f0ff';
      ctx.fill();
      if (isCurrentTime) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = isCurrentTime ? '#00f0ff' : 'rgba(255, 255, 255, 0.4)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(idx === 0 ? 'NOW' : `+${pt.timeOffsetMin}m`, x, height - 6);
    });
  }, [cell, timeOffsetMin]);

  if (!cell) return null;

  const currentFc =
    cell.forecast.find((f) => f.timeOffsetMin === timeOffsetMin) || cell.forecast[0];
  const confColor = getConfidenceColor(cell.confidence);

  return (
    <aside
      ref={panelRef}
      className="absolute top-18 right-4 z-30 w-84 max-w-[calc(100vw-2rem)] glass-panel rounded-lg border border-white/[0.08] shadow-2xl overflow-y-auto max-h-[calc(100vh-8.5rem)] text-slate-200"
    >
      {/* Panel Header */}
      <div className="p-3.5 border-b border-white/[0.06] flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-white tracking-wider">
              {cell.id}
            </span>
            <span
              className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded border"
              style={{
                color: confColor,
                borderColor: `${confColor}40`,
                backgroundColor: `${confColor}15`
              }}
            >
              {cell.confidence} CONFIDENCE
            </span>
          </div>
          <div className="text-[12px] font-medium text-slate-200 mt-0.5">
            {cell.name}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {cell.state} · {cell.subRegion}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-4">
        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded bg-white/[0.03] border border-white/[0.05]">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span>CORE INTENSITY</span>
              <CloudRain className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-xl font-mono font-bold text-white mt-1">
              {currentFc.intensity}
              <span className="text-xs text-slate-400 font-normal">%</span>
            </div>
            <div className="text-[9px] font-mono text-cyan-400 mt-0.5">
              Max {cell.maxDbz} dBZ
            </div>
          </div>

          <div className="p-2.5 rounded bg-white/[0.03] border border-white/[0.05]">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span>LIGHTNING PROB</span>
              <Zap className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-xl font-mono font-bold text-amber-300 mt-1">
              {currentFc.lightningProb}
              <span className="text-xs text-slate-400 font-normal">%</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 mt-0.5">
              {cell.flashRatePerMin} strikes/min
            </div>
          </div>

          <div className="p-2.5 rounded bg-white/[0.03] border border-white/[0.05]">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span>VELOCITY & VECTOR</span>
              <Navigation className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-lg font-mono font-bold text-white mt-1">
              {cell.direction} → {cell.velocityKmH}{' '}
              <span className="text-xs text-slate-400 font-normal">km/h</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 mt-0.5">
              Azimuth {cell.azimuthDeg}°
            </div>
          </div>

          <div className="p-2.5 rounded bg-white/[0.03] border border-white/[0.05]">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span>RADAR ECHO TOP</span>
              <Gauge className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-lg font-mono font-bold text-white mt-1">
              {cell.echoTopKm}{' '}
              <span className="text-xs text-slate-400 font-normal">km</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 mt-0.5">
              CAPE: {cell.capeJkg} J/kg
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              NOWCAST DECAY & EVOLUTION (+3H)
            </span>
            <div className="flex items-center gap-2 text-[8px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Lightning
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Intensity
              </span>
            </div>
          </div>
          <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
            <canvas ref={chartCanvasRef} className="w-full h-[110px]" />
          </div>
        </div>

        {/* Matrix Table */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
            LEAD-TIME PREDICTION MATRIX
          </div>
          <div className="border border-white/[0.06] rounded divide-y divide-white/[0.04] text-[10px] font-mono">
            {cell.forecast.map((fc) => {
              const isCurrent = fc.timeOffsetMin === timeOffsetMin;
              return (
                <div
                  key={fc.timeOffsetMin}
                  className={`flex items-center justify-between px-2.5 py-1.5 ${
                    isCurrent ? 'bg-cyan-950/40 text-cyan-300 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-12">
                      {fc.timeOffsetMin === 0 ? 'NOW' : `+${fc.timeOffsetMin}m`}
                    </span>
                    <span className="text-slate-500">{fc.timeLabel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      Int: <span className="text-white">{fc.intensity}%</span>
                    </span>
                    <span className="text-amber-400">
                      ⚡ {fc.lightningProb}%
                    </span>
                    <span
                      className="px-1 py-0.2 rounded text-[8px] border"
                      style={{
                        borderColor: `${getConfidenceColor(fc.confidence)}40`,
                        color: getConfidenceColor(fc.confidence)
                      }}
                    >
                      {fc.confidence}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-Sensor Fusion Contributions */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              MULTI-SOURCE FUSION PIPELINE
            </span>
            <Layers className="w-3 h-3 text-cyan-400" />
          </div>

          <div className="space-y-1 font-mono text-[10px]">
            {sensors.map((sensor) => {
              const isDegraded = sensor.status !== 'ONLINE';
              return (
                <div
                  key={sensor.id}
                  className="flex items-center justify-between p-1.5 rounded bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    {isDegraded ? (
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                    <span className="text-slate-300">{sensor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[9px]">
                      Weight: {Math.round(sensor.currentWeight * 100)}%
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[8px] font-semibold ${
                        isDegraded
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      {sensor.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[9px] font-mono text-slate-400 border-t border-white/[0.06] pt-2 flex items-center justify-between">
          <span>NEAREST DWR: {cell.radarStationNearest}</span>
          <span className="text-cyan-400">GNN v2.4</span>
        </div>
      </div>
    </aside>
  );
};
