import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import type { EnvironmentState } from '../types/environment';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendChartsProps {
  history: EnvironmentState[];
  language: Language;
}

type MetricTab = 'temperature' | 'pm25' | 'noise' | 'humidity' | 'wind';

export const TrendCharts: React.FC<TrendChartsProps> = ({ history, language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<MetricTab>('temperature');

  // Format timestamps for X-axis
  const labels = history.map((item) => {
    try {
      const d = new Date(item.createdAt);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  });

  // Calculate min, max, avg for the active metric
  const getStats = (values: number[]) => {
    if (!values.length) return { min: 0, max: 0, avg: 0 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      min: Number(min.toFixed(1)),
      max: Number(max.toFixed(1)),
      avg: Number(avg.toFixed(1))
    };
  };

  const getChartConfig = () => {
    switch (activeTab) {
      case 'temperature': {
        const temps = history.map((h) => h.temperature);
        const heatIndices = history.map((h) => h.heatIndex);
        const stats = getStats(temps);

        return {
          unit: '°C',
          stats,
          data: {
            labels,
            datasets: [
              {
                label: language === 'vi' ? 'Nhiệt độ đo (°C)' : 'Measured Temp (°C)',
                data: temps,
                borderColor: '#f97316', // orange
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 5,
                tension: 0.35,
                fill: true
              },
              {
                label: language === 'vi' ? 'Cảm giác nhiệt (°C)' : 'Feels Like (°C)',
                data: heatIndices,
                borderColor: '#ef4444', // red
                borderDash: [5, 5],
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.35,
                fill: false
              }
            ]
          }
        };
      }
      case 'pm25': {
        const pmValues = history.map((h) => h.pm25);
        const stats = getStats(pmValues);

        return {
          unit: 'µg/m³',
          stats,
          data: {
            labels,
            datasets: [
              {
                label: 'PM2.5 (µg/m³)',
                data: pmValues,
                borderColor: '#eab308', // yellow
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 5,
                tension: 0.35,
                fill: true
              }
            ]
          }
        };
      }
      case 'noise': {
        const noiseValues = history.map((h) => h.noise);
        const stats = getStats(noiseValues);

        return {
          unit: 'dB',
          stats,
          data: {
            labels,
            datasets: [
              {
                label: language === 'vi' ? 'Độ ồn (dB)' : 'Noise Level (dB)',
                data: noiseValues,
                borderColor: '#818cf8', // indigo
                backgroundColor: 'rgba(129, 140, 248, 0.15)',
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 5,
                tension: 0.35,
                fill: true
              }
            ]
          }
        };
      }
      case 'humidity': {
        const humValues = history.map((h) => h.humidity);
        const dewPoints = history.map((h) => h.dewPoint);
        const stats = getStats(humValues);

        return {
          unit: '%RH',
          stats,
          data: {
            labels,
            datasets: [
              {
                label: language === 'vi' ? 'Độ ẩm (%RH)' : 'Humidity (%RH)',
                data: humValues,
                borderColor: '#06b6d4', // cyan
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 5,
                tension: 0.35,
                fill: true
              },
              {
                label: language === 'vi' ? 'Điểm sương (°C)' : 'Dew Point (°C)',
                data: dewPoints,
                borderColor: '#3b82f6',
                borderDash: [4, 4],
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.35,
                fill: false
              }
            ]
          }
        };
      }
      case 'wind': {
        const windValues = history.map((h) => h.windSpeed);
        const stats = getStats(windValues);

        return {
          unit: 'm/s',
          stats,
          data: {
            labels,
            datasets: [
              {
                label: language === 'vi' ? 'Tốc độ gió (m/s)' : 'Wind Speed (m/s)',
                data: windValues,
                borderColor: '#10b981', // emerald
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 5,
                tension: 0.35,
                fill: true
              }
            ]
          }
        };
      }
    }
  };

  const currentConfig = getChartConfig();

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: {
          color: '#64748b',
          font: { size: 10 }
        }
      }
    }
  };

  const tabs: { key: MetricTab; labelVi: string; labelEn: string }[] = [
    { key: 'temperature', labelVi: 'Nhiệt Độ', labelEn: 'Temperature' },
    { key: 'pm25', labelVi: 'Bụi Mịn PM2.5', labelEn: 'PM2.5 Dust' },
    { key: 'noise', labelVi: 'Độ Ồn (dB)', labelEn: 'Noise Level' },
    { key: 'humidity', labelVi: 'Độ Ẩm (%)', labelEn: 'Humidity' },
    { key: 'wind', labelVi: 'Tốc Độ Gió', labelEn: 'Wind Speed' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 mb-8">
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">
              {t.trendTitle}
            </h3>
            <p className="text-xs text-slate-400 m-0">
              {history.length} {language === 'vi' ? 'mẫu dữ liệu trực tiếp gần nhất từ trạm' : 'recent live telemetry records'}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'vi' ? tab.labelVi : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Summary statistics row (Min / Avg / Max) */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {language === 'vi' ? 'Thấp Nhất' : 'Minimum'}
          </span>
          <span className="text-lg font-bold font-mono text-cyan-400">
            {currentConfig.stats.min} <span className="text-xs text-slate-400 font-sans">{currentConfig.unit}</span>
          </span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {language === 'vi' ? 'Trung Bình' : 'Average'}
          </span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {currentConfig.stats.avg} <span className="text-xs text-slate-400 font-sans">{currentConfig.unit}</span>
          </span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {language === 'vi' ? 'Cao Nhất' : 'Maximum'}
          </span>
          <span className="text-lg font-bold font-mono text-rose-400">
            {currentConfig.stats.max} <span className="text-xs text-slate-400 font-sans">{currentConfig.unit}</span>
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <Line data={currentConfig.data} options={options} />
      </div>
    </div>
  );
};
