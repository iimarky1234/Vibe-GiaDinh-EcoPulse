import React, { useState, useEffect, useCallback } from 'react';
import {
  Thermometer,
  Droplets,
  Gauge,
  Sun,
  Flame,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { Header } from './components/Header';
import { ActivityAdvisory } from './components/ActivityAdvisory';
import { CompassGauge } from './components/CompassGauge';
import { NoiseVisualizer } from './components/NoiseVisualizer';
import { MetricCard } from './components/MetricCard';
import { AmbientCanvas } from './components/AmbientCanvas';
import { TrendCharts } from './components/TrendCharts';
import { DeveloperPanel } from './components/DeveloperPanel';
import type { EnvironmentState } from './types/environment';
import {
  fetchLatestFeed,
  fetchFeedHistory,
  FALLBACK_FEED,
  parseFeedToState
} from './services/thingspeak';
import { calculateActivityAdvisories } from './utils/calculations';
import type { Language } from './utils/translations';
import { translations } from './utils/translations';

export const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('vi');
  const [current, setCurrent] = useState<EnvironmentState>(() => parseFeedToState(FALLBACK_FEED));
  const [history, setHistory] = useState<EnvironmentState[]>([]);
  const [countdown, setCountdown] = useState<number>(20);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const t = translations[language];

  // Refresh handler
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [latest, hist] = await Promise.all([
        fetchLatestFeed(),
        fetchFeedHistory(60)
      ]);
      setCurrent(latest);
      setHistory(hist);
      setCountdown(20);
    } catch (err) {
      console.error('Failed to update telemetry:', err);
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 20-second countdown timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadData();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadData]);

  // Derived activity advisories
  const advisories = calculateActivityAdvisories(current);

  // Status helpers for MetricCards
  const getAqiConfig = () => {
    switch (current.aqiLevel) {
      case 'good':
        return { text: t.aqiGood, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      case 'moderate':
        return { text: t.aqiModerate, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' };
      case 'unhealthy-sensitive':
        return { text: t.aqiSensitive, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
      case 'unhealthy':
        return { text: t.aqiUnhealthy, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
      case 'very-unhealthy':
        return { text: t.aqiVeryUnhealthy, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
      case 'hazardous':
      default:
        return { text: t.aqiHazardous, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
    }
  };

  const getSolarConfig = () => {
    switch (current.lightCondition) {
      case 'night':
        return { text: t.solarNight, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' };
      case 'indoor':
        return { text: t.solarIndoor, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' };
      case 'overcast':
        return { text: t.solarOvercast, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
      case 'direct-sun':
      default:
        return { text: t.solarIntense, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    }
  };

  const aqiConfig = getAqiConfig();
  const solarConfig = getSolarConfig();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        countdown={countdown}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        lastUpdatedTime={current.createdAt}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 md:py-8">
        {/* Hero Station Banner */}
        <div className="glass-panel relative rounded-3xl p-6 md:p-8 mb-8 border border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-cyan-950/40 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <MapPin className="w-3.5 h-3.5" />
                  Gia Định, Bình Thạnh, TP. Hồ Chí Minh
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  20s live sync
                </span>
              </div>

              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight m-0">
                {language === 'vi'
                  ? 'Theo dõi Vi Khí Hậu & Sức Khỏe Đô Thị Thời Gian Thực'
                  : 'Real-Time Urban Microclimate & Health Monitor'}
              </h2>
              <p className="text-sm md:text-base text-slate-300 max-w-2xl mt-2 leading-relaxed font-normal">
                {language === 'vi'
                  ? 'Dữ liệu môi trường đo đạc trực tiếp từ trạm IoT MakerLab Gia Định: 8 thông số khí tượng, nhiệt độ cảm nhận, chỉ số bụi mịn PM2.5 và gợi ý sinh hoạt thông minh.'
                  : 'Live environmental readings streamed directly from MakerLab Gia Dinh IoT Station: 8 meteorological signals, heat index, PM2.5 particulates, and smart living advisories.'}
              </p>
            </div>

            {/* Quick Hero Vital Badges */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center min-w-[110px] shadow-lg">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                  {t.temperature}
                </span>
                <span className="text-3xl font-black text-white font-mono mt-0.5">
                  {current.temperature}°
                </span>
                <span className="text-[11px] text-orange-400 font-medium mt-0.5">
                  HI: {current.heatIndex}°C
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center min-w-[110px] shadow-lg">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                  PM2.5
                </span>
                <span className={`text-3xl font-black font-mono mt-0.5 ${current.pm25 > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {current.pm25}
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                  µg/m³
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center min-w-[110px] shadow-lg">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                  {t.noise}
                </span>
                <span className="text-3xl font-black text-white font-mono mt-0.5">
                  {current.noise}
                </span>
                <span className="text-[11px] text-indigo-400 font-medium mt-0.5">
                  dB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Smart Lifestyle Activity Advisories */}
        <ActivityAdvisory advisories={advisories} language={language} />

        {/* Section 2: 8 Real-time Telemetry Sensor Cards */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 m-0">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              {language === 'vi' ? 'Thông Số Cảm Biến Trực Tiếp (8 Tín Hiệu)' : 'Live Sensor Feeds (8 Signals)'}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 m-0 mt-0.5">
              {language === 'vi'
                ? 'Dữ liệu đo đạc liên tục mỗi 20 giây qua kênh ThingSpeak 3428136'
                : 'Continuous telemetry recorded every 20 seconds via ThingSpeak channel 3428136'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Temperature */}
            <MetricCard
              title={t.temperature}
              value={current.temperature}
              unit="°C"
              icon={Thermometer}
              iconColor="text-orange-400"
              iconBg="bg-orange-500/10 border-orange-500/20"
              statusText={current.temperature > 34 ? (language === 'vi' ? 'Nóng gắt' : 'Hot') : (language === 'vi' ? 'Ấm áp' : 'Warm')}
              statusColor="text-orange-400"
              statusBg="bg-orange-500/10 border-orange-500/20"
              subMetricLabel={t.feelsLike}
              subMetricValue={current.heatIndex}
              subMetricUnit="°C"
              progressBarPercent={(current.temperature / 45) * 100}
              progressBarColor="bg-gradient-to-r from-orange-400 to-rose-500"
              footerNote={`${language === 'vi' ? 'Cảm biến nhiệt độ không khí tại vị trí trạm' : 'Ambient air temperature at station'}`}
            />

            {/* 2. Humidity */}
            <MetricCard
              title={t.humidity}
              value={current.humidity}
              unit="%RH"
              icon={Droplets}
              iconColor="text-cyan-400"
              iconBg="bg-cyan-500/10 border-cyan-500/20"
              statusText={current.humidity > 70 ? (language === 'vi' ? 'Ẩm cao' : 'High Humidity') : (language === 'vi' ? 'Dễ chịu' : 'Comfortable')}
              statusColor="text-cyan-400"
              statusBg="bg-cyan-500/10 border-cyan-500/20"
              subMetricLabel={t.dewPoint}
              subMetricValue={current.dewPoint}
              subMetricUnit="°C"
              progressBarPercent={current.humidity}
              progressBarColor="bg-gradient-to-r from-cyan-400 to-blue-500"
              footerNote={`${language === 'vi' ? 'Độ ẩm tương đối & Điểm sương nhiệt' : 'Relative humidity & calculated dew point'}`}
            />

            {/* 3. Wind Compass Gauge */}
            <CompassGauge
              windSpeed={current.windSpeed}
              windDirection={current.windDirection}
              compass={current.windCompass}
              language={language}
            />

            {/* 4. PM2.5 Air Quality */}
            <MetricCard
              title={t.pm25Dust}
              value={current.pm25}
              unit="µg/m³"
              icon={Flame}
              iconColor={current.pm25 > 35 ? 'text-amber-400' : 'text-emerald-400'}
              iconBg={current.pm25 > 35 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}
              statusText={aqiConfig.text}
              statusColor={aqiConfig.color}
              statusBg={aqiConfig.bg}
              subMetricLabel="US EPA Standard"
              subMetricValue={current.pm25 <= 12 ? '≤12 Good' : current.pm25 <= 35 ? '12-35 Moderate' : '35+ Caution'}
              subMetricUnit=""
              progressBarPercent={(current.pm25 / 100) * 100}
              progressBarColor={current.pm25 > 35 ? 'bg-amber-400' : 'bg-emerald-400'}
              footerNote={`${language === 'vi' ? 'Hạt bụi mịn đường kính ≤2.5 micromet' : 'Particulate matter diameter ≤2.5 micrometers'}`}
            />

            {/* 5. Environmental Noise */}
            <NoiseVisualizer
              noise={current.noise}
              category={current.noiseCategory}
              language={language}
            />

            {/* 6. Light Intensity (Lux) */}
            <MetricCard
              title={t.solar}
              value={current.light.toLocaleString()}
              unit={t.luxUnit}
              icon={Sun}
              iconColor="text-yellow-400"
              iconBg="bg-yellow-500/10 border-yellow-500/20"
              statusText={solarConfig.text}
              statusColor={solarConfig.color}
              statusBg={solarConfig.bg}
              subMetricLabel={language === 'vi' ? 'Điều kiện' : 'Condition'}
              subMetricValue={current.light > 30000 ? (language === 'vi' ? 'Nắng rực rỡ' : 'Bright Sun') : (language === 'vi' ? 'Ánh sáng dịu' : 'Diffused')}
              subMetricUnit=""
              progressBarPercent={(Math.min(60000, current.light) / 60000) * 100}
              progressBarColor="bg-gradient-to-r from-yellow-400 to-amber-500"
              footerNote={`${language === 'vi' ? 'Cường độ quang thông trên bề mặt cảm biến' : 'Luminous flux incident on sensor surface'}`}
            />

            {/* 7. Barometric Pressure */}
            <MetricCard
              title={t.pressure}
              value={current.pressure}
              unit="kPa"
              icon={Gauge}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/10 border-purple-500/20"
              statusText={t.steady}
              statusColor="text-purple-400"
              statusBg="bg-purple-500/10 border-purple-500/20"
              subMetricLabel="hPa"
              subMetricValue={(current.pressure * 10).toFixed(0)}
              subMetricUnit="hPa"
              progressBarPercent={((current.pressure - 98) / 6) * 100}
              progressBarColor="bg-gradient-to-r from-purple-400 to-indigo-500"
              footerNote={`${language === 'vi' ? 'Áp suất khí quyển địa phương Gia Định' : 'Atmospheric barometric pressure'}`}
            />

            {/* 8. Heat Index Card */}
            <MetricCard
              title={t.heatIndex}
              value={current.heatIndex}
              unit="°C"
              icon={Sparkles}
              iconColor="text-rose-400"
              iconBg="bg-rose-500/10 border-rose-500/20"
              statusText={
                current.heatLevel === 'normal' ? (language === 'vi' ? 'Bình thường' : 'Normal') :
                current.heatLevel === 'caution' ? (language === 'vi' ? 'Cảnh báo nhiệt' : 'Heat Caution') :
                (language === 'vi' ? 'Nguy cơ sốc nhiệt' : 'Extreme Caution')
              }
              statusColor={current.heatLevel === 'normal' ? 'text-emerald-400' : 'text-rose-400'}
              statusBg={current.heatLevel === 'normal' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}
              subMetricLabel={language === 'vi' ? 'Chênh lệch so với đo' : 'Delta from temp'}
              subMetricValue={(current.heatIndex - current.temperature >= 0 ? '+' : '') + (current.heatIndex - current.temperature).toFixed(1)}
              subMetricUnit="°C"
              progressBarPercent={(current.heatIndex / 50) * 100}
              progressBarColor="bg-gradient-to-r from-rose-400 to-red-600"
              footerNote={`${language === 'vi' ? 'Độ oi bức tính từ Nhiệt độ & Độ ẩm (NOAA)' : 'Perceived heat from Temp + Humidity (NOAA)'}`}
            />
          </div>
        </section>

        {/* Section 3: Interactive Generative Ambient Canvas */}
        <AmbientCanvas
          windSpeed={current.windSpeed}
          windDirection={current.windDirection}
          pm25={current.pm25}
          light={current.light}
          language={language}
        />

        {/* Section 4: 24h Trend Charts & Historical Telemetry */}
        <TrendCharts history={history} language={language} />

        {/* Section 5: Developer & Maker Open Data Hub */}
        <DeveloperPanel history={history} language={language} />
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="m-0">
            {t.footerCredit}
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://www.makerlab.vn/opendata/giadinh/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition"
            >
              MakerLab Gia Định
            </a>
            <span>•</span>
            <a
              href="https://thingspeak.mathworks.com/channels/3428136"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition"
            >
              ThingSpeak #3428136
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
