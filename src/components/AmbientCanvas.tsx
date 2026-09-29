import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Wind } from 'lucide-react';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface AmbientCanvasProps {
  windSpeed: number;
  windDirection: number;
  pm25: number;
  light: number;
  language: Language;
}

interface Particle {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  thickness: number;
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({
  windSpeed,
  windDirection,
  pm25,
  light,
  language
}) => {
  const t = translations[language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  // Particle vector setup
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize particles: count proportional to pm2.5
    const baseCount = 60 + Math.min(100, Math.round(pm25 * 1.5));
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    particlesRef.current = Array.from({ length: baseCount }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      length: 6 + Math.random() * 18,
      speed: (0.4 + Math.random() * 1.2) * (1 + windSpeed * 0.8),
      opacity: 0.15 + Math.random() * 0.5,
      thickness: 1 + Math.random() * 1.5
    }));

    // Wind direction angle in radians
    const angleRad = ((windDirection - 90) * Math.PI) / 180;
    const vx = Math.cos(angleRad);
    const vy = Math.sin(angleRad);

    const render = () => {
      if (!isRunning) return;

      const currentRect = canvas.getBoundingClientRect();
      const currentW = currentRect.width;
      const currentH = currentRect.height;

      // Color scheme based on solar lux & PM2.5 haze
      ctx.clearRect(0, 0, currentW, currentH);

      // Ambient background subtle gradient
      const isDay = light > 1000;
      const gradient = ctx.createLinearGradient(0, 0, currentW, currentH);
      if (isDay) {
        gradient.addColorStop(0, 'rgba(14, 116, 144, 0.12)'); // cyan/teal day
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.08)');
      } else {
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.4)'); // dark night
        gradient.addColorStop(1, 'rgba(30, 27, 75, 0.3)');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, currentW, currentH);

      // Draw wind & particulate streams
      const speedMultiplier = Math.max(0.5, windSpeed * 1.2);

      particlesRef.current.forEach((p) => {
        // Move particle along wind vector
        p.x += vx * p.speed * speedMultiplier;
        p.y += vy * p.speed * speedMultiplier;

        // Wrap around boundaries
        if (p.x < -40) p.x = currentW + 20;
        if (p.x > currentW + 40) p.x = -20;
        if (p.y < -40) p.y = currentH + 20;
        if (p.y > currentH + 40) p.y = -20;

        // Draw particle streak
        ctx.beginPath();
        ctx.lineWidth = p.thickness;
        
        // Color based on PM2.5 dust
        if (pm25 > 55) {
          ctx.strokeStyle = `rgba(244, 63, 94, ${p.opacity * 0.7})`;
        } else if (pm25 > 35) {
          ctx.strokeStyle = `rgba(251, 191, 36, ${p.opacity * 0.75})`;
        } else {
          ctx.strokeStyle = `rgba(56, 189, 248, ${p.opacity * 0.8})`;
        }

        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - vx * p.length, p.y - vy * p.length);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [windSpeed, windDirection, pm25, light, isRunning]);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 mb-8 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Wind className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-white m-0">
              {t.visualizerTitle}
            </h3>
            <p className="text-xs text-slate-400 m-0">
              {t.visualizerDesc}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition self-start sm:self-auto cursor-pointer"
        >
          {isRunning ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isRunning ? (language === 'vi' ? 'Tạm Dừng' : 'Pause') : (language === 'vi' ? 'Tiếp Tục' : 'Resume')}</span>
        </button>
      </div>

      {/* Canvas viewport */}
      <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-800/90 relative bg-slate-950/80 shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live Vector telemetry badge on canvas */}
        <div className="absolute bottom-2.5 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] font-mono text-slate-300 flex items-center gap-3">
          <span>
            {language === 'vi' ? 'Tốc độ' : 'Speed'}: <strong className="text-cyan-400">{windSpeed} m/s</strong>
          </span>
          <span>•</span>
          <span>
            {language === 'vi' ? 'Hướng' : 'Bearing'}: <strong className="text-cyan-400">{windDirection}°</strong>
          </span>
          <span>•</span>
          <span>
            PM2.5: <strong className={pm25 > 35 ? 'text-amber-400' : 'text-emerald-400'}>{pm25} µg/m³</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
