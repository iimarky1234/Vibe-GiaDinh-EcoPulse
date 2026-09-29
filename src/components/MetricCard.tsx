import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  statusText?: string;
  statusColor?: string;
  statusBg?: string;
  subMetricLabel?: string;
  subMetricValue?: string | number;
  subMetricUnit?: string;
  progressBarPercent?: number;
  progressBarColor?: string;
  footerNote?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  iconColor,
  iconBg,
  statusText,
  statusColor = 'text-emerald-400',
  statusBg = 'bg-emerald-500/10 border-emerald-500/20',
  subMetricLabel,
  subMetricValue,
  subMetricUnit,
  progressBarPercent,
  progressBarColor = 'bg-emerald-500',
  footerNote
}) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
      {/* Top row: Icon, Title, Status badge */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${iconBg} border flex items-center justify-center ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-200">{title}</span>
          </div>

          {statusText && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${statusBg} ${statusColor}`}>
              {statusText}
            </span>
          )}
        </div>

        {/* Primary Value */}
        <div className="my-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {value}
            </span>
            <span className="text-sm font-semibold text-slate-400">{unit}</span>
          </div>

          {/* Sub-metric (e.g. Heat Index, Dew point) */}
          {subMetricLabel && subMetricValue !== undefined && (
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{subMetricLabel}:</span>
              <strong className="text-slate-200 font-mono">
                {subMetricValue} {subMetricUnit}
              </strong>
            </div>
          )}
        </div>

        {/* Progress Bar (optional) */}
        {progressBarPercent !== undefined && (
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressBarColor}`}
              style={{ width: `${Math.min(100, Math.max(0, progressBarPercent))}%` }}
            />
          </div>
        )}
      </div>

      {/* Footer Note */}
      {footerNote && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
          {footerNote}
        </div>
      )}
    </div>
  );
};
