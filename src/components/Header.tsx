import React from 'react';
import { Activity, RefreshCw, Radio, ExternalLink } from 'lucide-react';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';
import { THINGSPEAK_CHANNEL_ID } from '../services/thingspeak';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  countdown: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdatedTime: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  countdown,
  onRefresh,
  isRefreshing,
  lastUpdatedTime
}) => {
  const t = translations[language];

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return isoString;
    }
  };

  return (
    <header className="glass-panel border-b border-slate-800/80 sticky top-0 z-50 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Station title */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 shadow-lg shadow-emerald-500/20 text-white">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">
                {t.siteTitle}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {t.liveActive}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium m-0 flex items-center gap-1.5">
              <span>{t.siteSubtitle}</span>
              <span>•</span>
              <a
                href="https://www.makerlab.vn/opendata/giadinh/"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-0.5 underline-offset-2 hover:underline"
              >
                MakerLab <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Right side controls: countdown, refresh, language */}
        <div className="flex items-center flex-wrap gap-2.5 justify-end w-full md:w-auto">
          {/* Channel badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Channel:</span>
            <span className="font-mono text-cyan-400 font-medium">{THINGSPEAK_CHANNEL_ID}</span>
          </div>

          {/* Time & Countdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400">{t.lastUpdated}:</span>
            <span className="font-mono text-emerald-400 font-medium">{formatTime(lastUpdatedTime)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {countdown}s
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
            title={t.refreshNow}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t.refreshNow}</span>
          </button>

          {/* Language Switch */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => onLanguageChange('vi')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                language === 'vi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇻🇳 VI
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
