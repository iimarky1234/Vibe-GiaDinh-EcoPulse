import React from 'react';
import { Compass, Navigation } from 'lucide-react';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface CompassGaugeProps {
  windSpeed: number;
  windDirection: number;
  compass: string;
  language: Language;
}

export const CompassGauge: React.FC<CompassGaugeProps> = ({
  windSpeed,
  windDirection,
  compass,
  language
}) => {
  const t = translations[language];
  const speedKmh = (windSpeed * 3.6).toFixed(1);

  // Beaufort scale helper
  const getBeaufortDescription = (speed: number) => {
    if (speed < 0.3) return language === 'vi' ? 'Lặng gió (Cấp 0)' : 'Calm (Force 0)';
    if (speed < 1.6) return language === 'vi' ? 'Gió nhẹ thoảng (Cấp 1)' : 'Light Air (Force 1)';
    if (speed < 3.4) return language === 'vi' ? 'Gió nhẹ (Cấp 2)' : 'Light Breeze (Force 2)';
    if (speed < 5.5) return language === 'vi' ? 'Gió hiu hiu (Cấp 3)' : 'Gentle Breeze (Force 3)';
    if (speed < 8.0) return language === 'vi' ? 'Gió vừa (Cấp 4)' : 'Moderate Breeze (Force 4)';
    if (speed < 10.8) return language === 'vi' ? 'Gió khá mạnh (Cấp 5)' : 'Fresh Breeze (Force 5)';
    return language === 'vi' ? 'Gió mạnh (Cấp 6+)' : 'Strong Breeze (Force 6+)';
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-200">{t.wind}</span>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          {compass} ({windDirection}°)
        </span>
      </div>

      {/* Center dial */}
      <div className="flex items-center justify-around my-2">
        {/* Animated Compass Circle */}
        <div className="relative w-28 h-28 rounded-full border-2 border-slate-700 bg-slate-900/60 flex items-center justify-center shadow-inner">
          {/* Compass cardinal points */}
          <span className="absolute top-1 text-[10px] font-bold text-slate-400 font-mono">N</span>
          <span className="absolute right-2 text-[10px] font-bold text-slate-400 font-mono">E</span>
          <span className="absolute bottom-1 text-[10px] font-bold text-slate-400 font-mono">S</span>
          <span className="absolute left-2 text-[10px] font-bold text-slate-400 font-mono">W</span>

          {/* Cross lines */}
          <div className="absolute w-full h-[1px] bg-slate-800 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-slate-800 pointer-events-none" />

          {/* Rotating Needle */}
          <div
            className="absolute w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${windDirection}deg)` }}
          >
            <div className="flex flex-col items-center">
              <Navigation className="w-6 h-6 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <div className="w-1 h-7 bg-gradient-to-b from-cyan-400 to-transparent rounded-full" />
            </div>
          </div>

          {/* Center Hub */}
          <div className="w-3.5 h-3.5 rounded-full bg-slate-200 border-2 border-cyan-500 z-10 shadow" />
        </div>

        {/* Speed values */}
        <div className="flex flex-col items-start pl-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {windSpeed.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-400">m/s</span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            ≈ {speedKmh} km/h
          </div>
          <div className="text-[11px] text-cyan-300/90 font-medium mt-2 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
            {getBeaufortDescription(windSpeed)}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>{t.windDirection}: <strong className="text-slate-300 font-mono">{windDirection}°</strong></span>
        <span>{t.bearing}: <strong className="text-cyan-400 font-mono">{compass}</strong></span>
      </div>
    </div>
  );
};
