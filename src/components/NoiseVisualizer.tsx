import React from 'react';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';
import type { NoiseCategory } from '../types/environment';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface NoiseVisualizerProps {
  noise: number;
  category: NoiseCategory;
  language: Language;
}

export const NoiseVisualizer: React.FC<NoiseVisualizerProps> = ({
  noise,
  category,
  language
}) => {
  const t = translations[language];

  const getNoiseConfig = (cat: NoiseCategory) => {
    switch (cat) {
      case 'quiet':
        return {
          label: t.noiseQuiet,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          barColor: 'bg-emerald-500',
          warning: false
        };
      case 'moderate':
        return {
          label: t.noiseModerate,
          color: 'text-sky-400',
          bg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
          barColor: 'bg-sky-500',
          warning: false
        };
      case 'busy':
        return {
          label: t.noiseBusy,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          barColor: 'bg-amber-500',
          warning: false
        };
      case 'very-loud':
        return {
          label: t.noiseLoud,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
          barColor: 'bg-orange-500',
          warning: true
        };
      case 'hazardous':
      default:
        return {
          label: t.noiseHazardous,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          barColor: 'bg-rose-500',
          warning: true
        };
    }
  };

  const config = getNoiseConfig(category);

  // Generate 14 equalizer bars whose height correlates to noise level
  const numBars = 14;
  const normalizedLevel = Math.min(100, Math.max(20, noise));

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            {noise === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </div>
          <span className="text-sm font-semibold text-slate-200">{t.noise}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${config.bg}`}>
          {config.label}
        </span>
      </div>

      {/* Main value & Equalizer */}
      <div className="my-2">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {noise.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-400">dB</span>
          </div>

          {config.warning && (
            <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium bg-amber-500/10 px-2 py-0.5 rounded">
              <AlertCircle className="w-3 h-3" />
              {language === 'vi' ? 'Tiếng ồn cao' : 'High Noise'}
            </span>
          )}
        </div>

        {/* Dynamic Spectrum Equalizer Bars */}
        <div className="h-10 bg-slate-900/80 rounded-xl p-2 border border-slate-800 flex items-end justify-between gap-1">
          {Array.from({ length: numBars }).map((_, i) => {
            const wave = Math.sin((i / numBars) * Math.PI);
            const heightPercent = Math.min(
              100,
              Math.max(15, (normalizedLevel / 100) * wave * 100 + ((i % 3) * 6))
            );
            return (
              <div
                key={i}
                className={`w-full rounded-sm transition-all duration-500 ${
                  heightPercent > 75
                    ? 'bg-rose-500'
                    : heightPercent > 50
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Acoustic reference scale */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>45dB: {language === 'vi' ? 'Phòng yên tĩnh' : 'Quiet Room'}</span>
        <span>•</span>
        <span>70dB: {language === 'vi' ? 'Xe cộ SG' : 'Traffic'}</span>
        <span>•</span>
        <span>85dB+: {language === 'vi' ? 'Còi xe/Công trình' : 'Hazardous'}</span>
      </div>
    </div>
  );
};
