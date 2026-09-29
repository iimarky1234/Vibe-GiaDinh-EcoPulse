import React from 'react';
import { Footprints, Coffee, Sun, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import type { ActivityAdvisories, ActivityRating } from '../types/environment';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface ActivityAdvisoryProps {
  advisories: ActivityAdvisories;
  language: Language;
}

export const ActivityAdvisory: React.FC<ActivityAdvisoryProps> = ({ advisories, language }) => {
  const t = translations[language];

  const getStatusBadge = (status: ActivityRating['status']) => {
    switch (status) {
      case 'optimal':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
          text: t.statusOptimal
        };
      case 'moderate':
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          dot: 'bg-sky-400',
          icon: Info,
          text: t.statusModerate
        };
      case 'caution':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          icon: AlertTriangle,
          text: t.statusCaution
        };
      case 'avoid':
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          icon: XCircle,
          text: t.statusAvoid
        };
    }
  };

  const cards = [
    {
      key: 'running',
      icon: Footprints,
      title: t.activityRun,
      data: advisories.running,
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
    },
    {
      key: 'cafeStudy',
      icon: Coffee,
      title: t.activityCafe,
      data: advisories.cafeStudy,
      gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent'
    },
    {
      key: 'laundry',
      icon: Sun,
      title: t.activityLaundry,
      data: advisories.laundry,
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent'
    },
    {
      key: 'maskWearing',
      icon: ShieldAlert,
      title: t.activityMask,
      data: advisories.maskWearing,
      gradient: 'from-purple-500/20 via-pink-500/10 to-transparent'
    }
  ];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 m-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            {t.overallHeader}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 m-0 mt-0.5">
            {t.overallSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ key, icon: Icon, title, data, gradient }) => {
          const badge = getStatusBadge(data.status);
          const StatusIcon = badge.icon;

          return (
            <div
              key={key}
              className={`glass-panel glass-panel-hover relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between border border-slate-800 bg-gradient-to-b ${gradient}`}
            >
              <div>
                {/* Header row: Icon & Status badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-200">
                    <Icon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{badge.text}</span>
                  </div>
                </div>

                {/* Title & Score */}
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-slate-200 m-0">
                    {title}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black tracking-tight text-white font-mono">
                      {data.score}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>

                {/* Advice text */}
                <p className="text-xs text-slate-300 leading-relaxed font-normal min-h-[36px]">
                  {language === 'vi' ? data.recommendationVi : data.recommendationEn}
                </p>
              </div>

              {/* Reason / Driver footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">
                  {language === 'vi' ? data.reasonVi : data.reasonEn}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
