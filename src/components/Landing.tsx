import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Radio, Shield, Zap, Sparkles } from 'lucide-react';
import { playUiTick, playRadarPing } from '../utils/audio';

interface LandingProps {
  onEnter: () => void;
  onEnterWithTour: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnter, onEnterWithTour }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      metaRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
    )
      .fromTo(
        titleRef.current,
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 1.0 },
        '-=0.4'
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.5'
      )
      .fromTo(
        actionsRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.4'
      );
  }, []);

  const handleEnterNowcast = () => {
    playUiTick();
    playRadarPing();
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.05,
        filter: 'blur(10px)',
        duration: 0.65,
        ease: 'power3.inOut',
        onComplete: onEnter
      });
    } else {
      onEnter();
    }
  };

  const handleEnterWithTour = () => {
    playUiTick();
    playRadarPing();
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.05,
        filter: 'blur(10px)',
        duration: 0.65,
        ease: 'power3.inOut',
        onComplete: onEnterWithTour
      });
    } else {
      onEnterWithTour();
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#040609] flex flex-col justify-between p-8 md:p-12 overflow-hidden select-none"
    >
      {/* Background Animated Subtle Radar Concentric Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full border border-cyan-500/20 animate-pulse-subtle" />
        <div className="absolute w-[500px] h-[500px] md:w-[900px] md:h-[900px] rounded-full border border-cyan-500/10" />
        <div className="absolute w-[700px] h-[700px] md:w-[1200px] md:h-[1200px] rounded-full border border-white/[0.04]" />
        <div className="absolute w-full h-[1px] bg-white/[0.04]" />
        <div className="absolute h-full w-[1px] bg-white/[0.04]" />
      </div>

      {/* Top Header Metadata */}
      <div
        ref={metaRef}
        className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400"
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="tracking-widest uppercase text-slate-300">
            SIH26072 · SUB-CONTINENTAL ATMOSPHERIC INTELLIGENCE
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
          <span>INDIA METEOROLOGICAL NETWORK</span>
          <span>·</span>
          <span>DWR · INSAT-3DR · IITM LLN · WRF</span>
        </div>
      </div>

      {/* Center Hero Block */}
      <div className="relative z-10 my-auto max-w-4xl mx-auto text-center space-y-8">
        {/* Wordmark */}
        <div className="space-y-4">
          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-white font-['Space_Grotesk'] leading-none"
          >
            VARUNA
          </h1>

          <div
            ref={subtitleRef}
            className="space-y-3 font-mono text-slate-300"
          >
            <div className="text-xs md:text-sm tracking-[0.28em] uppercase text-cyan-400 font-semibold">
              Visual Atmospheric Radar Unified Nowcasting & Analytics
            </div>
            <p className="text-base md:text-lg text-slate-400 font-sans font-normal italic">
              "Seeing the next storm before it arrives."
            </p>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 font-mono text-[11px] text-slate-400">
          <div className="px-3 py-1 rounded-full glass-panel border border-white/[0.08] flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>0 — 3 Hour Lead Time</span>
          </div>
          <div className="px-3 py-1 rounded-full glass-panel border border-white/[0.08] flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Sensor Lightning Fusion</span>
          </div>
          <div className="px-3 py-1 rounded-full glass-panel border border-white/[0.08] flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dynamic Sensor Dropout Resilience</span>
          </div>
        </div>

        {/* CTA Actions */}
        <div
          ref={actionsRef}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono"
        >
          <button
            onClick={handleEnterNowcast}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>ENTER NOWCAST</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={handleEnterWithTour}
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg glass-panel hover:bg-white/[0.06] border border-white/[0.12] text-slate-200 text-sm tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>GUIDED DEMO TOUR</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Metadata */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/[0.06] pt-4">
        <div>Smart India Hackathon 2026 Prototype · Frontend Only Simulation</div>
        <div className="text-slate-400 mt-2 sm:mt-0">
          Spatial Resolution: 1.0 km · Temporal Cycle: 10 min
        </div>
      </div>
    </div>
  );
};
