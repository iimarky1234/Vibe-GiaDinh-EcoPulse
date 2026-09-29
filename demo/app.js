// GiaDinh EcoPulse — Static Demo Logic
const CHANNEL_ID = '3428136';
let currentLanguage = 'vi';
let latestData = {
  windSpeed: 1.1,
  windDirection: 210,
  temperature: 32.5,
  pressure: 100.3,
  light: 2500,
  humidity: 65,
  noise: 72,
  pm25: 42,
  createdAt: new Date().toISOString()
};
let historyData = [];
let countdown = 20;
let activeMetric = 'temp';
let chartInstance = null;
let isCanvasRunning = true;

// Bilingual Translations Dictionary
const dict = {
  vi: {
    siteTitle: 'GiaDinh EcoPulse',
    siteSubtitle: 'Trạm Quan Trắc Vi Khí Hậu & Sức Khỏe Đô Thị Gia Định, TP.HCM',
    badgeLive: 'TRỰC TIẾP',
    txtLastUpdated: 'Cập nhật:',
    txtRefresh: 'Làm mới',
    heroTitle: 'Theo dõi Vi Khí Hậu & Sức Khỏe Đô Thị Thời Gian Thực',
    heroDesc: 'Dữ liệu môi trường đo đạc trực tiếp từ trạm IoT MakerLab Gia Định: 8 thông số khí tượng, nhiệt độ cảm nhận, chỉ số bụi mịn PM2.5 và gợi ý sinh hoạt thông minh.',
    heroTempLbl: 'Nhiệt độ',
    heroNoiseLbl: 'Độ ồn',
    advHeader: '✨ Chỉ Dẫn Sinh Hoạt Đô Thị',
    advSub: 'Đánh giá điều kiện vi khí hậu thực tế cho các hoạt động ngoài trời tại Gia Định',
    senHeader: '🛡️ Thông Số Cảm Biến Trực Tiếp (8 Tín Hiệu)',
    senSub: 'Dữ liệu đo đạc liên tục mỗi 20 giây qua kênh ThingSpeak 3428136',
    canvasTitle: 'Mô Phỏng Gió & Vi Bụi Thời Gian Thực',
    canvasDesc: 'Các hạt chuyển động theo tốc độ gió thực tế, hướng la bàn và mật độ bụi PM2.5 hiện tại.',
    chartHeader: 'Xu Hướng Lịch Sử Môi Trường (Gia Định)',
    chartSub: 'Dữ liệu thời gian thực từ trạm MakerLab',
    hubTitle: 'Dành Cho Maker & Lập Trình Viên',
    hubSub: 'Tải dữ liệu mở trạm MakerLab Gia Định dạng CSV hoặc JSON',
    txtExpCsv: 'Tải CSV',
    txtExpJson: 'Tải JSON',
    txtCopyApi: 'Sao chép API',
    footerText: 'Dự án mã nguồn mở phát triển cho IOT Workshop. Trạm đo môi trường MakerLab Gia Định, TP. Hồ Chí Minh.',
    actRun: 'Chạy Bộ / Thể Thao',
    actCafe: 'Cà Phê / Làm Việc Vỉa Hè',
    actLaundry: 'Phơi Đồ Nhanh Khô',
    actMask: 'Khẩu Trang Ra Đường',
    statusOptimal: 'Rất Tốt',
    statusModerate: 'Bình Thường',
    statusCaution: 'Lưu Ý',
    statusAvoid: 'Hạn Chế'
  },
  en: {
    siteTitle: 'GiaDinh EcoPulse',
    siteSubtitle: 'Urban Microclimate & Health Companion — Gia Dinh, HCMC',
    badgeLive: 'LIVE',
    txtLastUpdated: 'Updated:',
    txtRefresh: 'Refresh',
    heroTitle: 'Real-Time Urban Microclimate & Health Monitor',
    heroDesc: 'Live environmental readings streamed from MakerLab Gia Dinh IoT Station: 8 meteorological signals, heat index, PM2.5 particulates, and smart living advisories.',
    heroTempLbl: 'Temperature',
    heroNoiseLbl: 'Noise',
    advHeader: '✨ Urban Living Advisories',
    advSub: 'Real-time condition assessment for daily outdoor activities in Gia Dinh',
    senHeader: '🛡️ Live Sensor Feeds (8 Signals)',
    senSub: 'Continuous telemetry recorded every 20 seconds via ThingSpeak 3428136',
    canvasTitle: 'Real-time Ambient Wind & Dust Simulation',
    canvasDesc: 'Particles flow according to real-time wind speed, bearing vector, and local PM2.5 density.',
    chartHeader: 'Historical Telemetry Trends (Gia Dinh)',
    chartSub: 'Real-time continuous sensor readings from MakerLab',
    hubTitle: 'For Makers & Developers',
    hubSub: 'Download open IoT telemetry records as CSV or JSON format',
    txtExpCsv: 'Download CSV',
    txtExpJson: 'Download JSON',
    txtCopyApi: 'Copy API',
    footerText: 'Open-source project for IoT Workshop. Sensor station by MakerLab Gia Dinh, Ho Chi Minh City.',
    actRun: 'Running & Exercise',
    actCafe: 'Outdoor Cafe & Study',
    actLaundry: 'Laundry Drying',
    actMask: 'Commuter Mask',
    statusOptimal: 'Optimal',
    statusModerate: 'Moderate',
    statusCaution: 'Caution',
    statusAvoid: 'Avoid'
  }
};

// Heat Index (NOAA Rothfusz regression)
function calculateHeatIndex(tempC, humidity) {
  if (tempC < 26.7 || humidity < 40) return tempC;
  const tf = (tempC * 9) / 5 + 32;
  const rh = humidity;
  const c1 = -42.379, c2 = 2.04901523, c3 = 10.14333127, c4 = -0.22475541;
  const c5 = -0.00683783, c6 = -0.05481717, c7 = 0.00122874, c8 = 0.00085282, c9 = -0.00000199;
  const hif = c1 + c2*tf + c3*rh + c4*tf*rh + c5*tf*tf + c6*rh*rh + c7*tf*tf*rh + c8*tf*rh*rh + c9*tf*tf*rh*rh;
  return Number((((hif - 32) * 5) / 9).toFixed(1));
}

// Dew Point (Magnus-Tetens)
function calculateDewPoint(tempC, humidity) {
  const a = 17.27, b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
  return Number(((b * alpha) / (a - alpha)).toFixed(1));
}

// 16-point Compass
function getWindCompass(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

// Beaufort Scale
function getBeaufort(speed) {
  if (speed < 0.3) return currentLanguage === 'vi' ? 'Lặng gió (Cấp 0)' : 'Calm (Force 0)';
  if (speed < 1.6) return currentLanguage === 'vi' ? 'Gió thoảng (Cấp 1)' : 'Light Air (Force 1)';
  if (speed < 3.4) return currentLanguage === 'vi' ? 'Gió nhẹ (Cấp 2)' : 'Light Breeze (Force 2)';
  if (speed < 5.5) return currentLanguage === 'vi' ? 'Gió hiu hiu (Cấp 3)' : 'Gentle Breeze (Force 3)';
  if (speed < 8.0) return currentLanguage === 'vi' ? 'Gió vừa (Cấp 4)' : 'Moderate Breeze (Force 4)';
  return currentLanguage === 'vi' ? 'Gió mạnh (Cấp 5+)' : 'Fresh Breeze (Force 5+)';
}

// Activity Advisories Heuristic
function getAdvisories(d) {
  const hi = calculateHeatIndex(d.temperature, d.humidity);

  // Running
  let rScore = 100;
  if (hi > 32) rScore -= (hi - 32) * 5;
  if (d.pm25 > 35) rScore -= (d.pm25 - 35) * 1.5;
  rScore = Math.max(10, Math.min(100, Math.round(rScore)));
  const rStat = rScore >= 75 ? 'optimal' : rScore >= 50 ? 'moderate' : rScore >= 30 ? 'caution' : 'avoid';

  // Cafe
  let cScore = 100;
  if (d.noise > 65) cScore -= (d.noise - 65) * 2.5;
  if (hi > 33) cScore -= (hi - 33) * 6;
  cScore = Math.max(10, Math.min(100, Math.round(cScore)));
  const cStat = cScore >= 75 ? 'optimal' : cScore >= 50 ? 'moderate' : cScore >= 30 ? 'caution' : 'avoid';

  // Laundry
  let lScore = 50;
  if (d.light > 30000) lScore += 35;
  else if (d.light > 5000) lScore += 20;
  if (d.humidity < 60) lScore += 20;
  else if (d.humidity > 80) lScore -= 25;
  lScore = Math.max(10, Math.min(100, Math.round(lScore)));
  const lStat = lScore >= 75 ? 'optimal' : lScore >= 50 ? 'moderate' : lScore >= 30 ? 'caution' : 'avoid';

  // Mask
  let mScore = 100;
  if (d.pm25 > 25) mScore -= (d.pm25 - 25) * 1.5;
  mScore = Math.max(10, Math.min(100, Math.round(mScore)));
  const mStat = d.pm25 <= 25 ? 'optimal' : d.pm25 <= 45 ? 'moderate' : d.pm25 <= 65 ? 'caution' : 'avoid';

  return [
    {
      title: dict[currentLanguage].actRun,
      score: rScore,
      status: rStat,
      advice: rStat === 'optimal' ? (currentLanguage === 'vi' ? 'Thời tiết rất tốt để chạy bộ.' : 'Ideal for jogging and workout.') : (currentLanguage === 'vi' ? 'Nên tập nhẹ hoặc bù nước.' : 'Keep activity moderate and hydrated.'),
      reason: `Heat Index: ${hi}°C, PM2.5: ${d.pm25} µg/m³`,
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
    },
    {
      title: dict[currentLanguage].actCafe,
      score: cScore,
      status: cStat,
      advice: cStat === 'optimal' ? (currentLanguage === 'vi' ? 'Không gian lý tưởng ngồi chill, đọc sách.' : 'Great ambient noise for cafe study.') : (currentLanguage === 'vi' ? 'Đường phố khá ồn, chọn phòng lạnh.' : 'Noisy or warm. Air-con cafe suggested.'),
      reason: `${currentLanguage === 'vi' ? 'Độ ồn' : 'Noise'}: ${d.noise} dB, ${d.temperature}°C`,
      gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent'
    },
    {
      title: dict[currentLanguage].actLaundry,
      score: lScore,
      status: lStat,
      advice: lStat === 'optimal' ? (currentLanguage === 'vi' ? 'Nắng ráo thông thoáng, đồ khô nhanh!' : 'Sunny and breezy, dries rapidly!') : (currentLanguage === 'vi' ? 'Độ ẩm cao hoặc ít nắng, đồ lâu khô.' : 'High humidity, slow drying.'),
      reason: `${d.humidity}% RH, ${d.light.toLocaleString()} lux`,
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent'
    },
    {
      title: dict[currentLanguage].actMask,
      score: mScore,
      status: mStat,
      advice: mStat === 'optimal' ? (currentLanguage === 'vi' ? 'Không khí sạch, không bắt buộc.' : 'Air is clean, masks optional.') : (currentLanguage === 'vi' ? 'Nên đeo khẩu trang KF94 / N95 khi ra đường.' : 'Wear respirator mask when commuting.'),
      reason: `PM2.5: ${d.pm25} µg/m³`,
      gradient: 'from-purple-500/20 via-pink-500/10 to-transparent'
    }
  ];
}

// Render Advisory Cards
function renderAdvisories() {
  const container = document.getElementById('advisoryCardsGrid');
  if (!container) return;
  const cards = getAdvisories(latestData);
  
  const badgeStyles = {
    optimal: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', txt: dict[currentLanguage].statusOptimal },
    moderate: { bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400', txt: dict[currentLanguage].statusModerate },
    caution: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', txt: dict[currentLanguage].statusCaution },
    avoid: { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400', txt: dict[currentLanguage].statusAvoid }
  };

  container.innerHTML = cards.map(c => `
    <div class="glass-panel glass-hover relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between border border-slate-800 bg-gradient-to-b ${c.gradient}">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="text-xl">🏃</span>
          <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyles[c.status].bg}">
            ${badgeStyles[c.status].txt}
          </span>
        </div>
        <div class="mb-2">
          <h3 class="text-sm font-semibold text-slate-200 m-0">${c.title}</h3>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-black text-white font-mono">${c.score}</span>
            <span class="text-xs text-slate-400">/ 100</span>
          </div>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed min-h-[36px]">${c.advice}</p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 truncate">
        ${c.reason}
      </div>
    </div>
  `).join('');
}

// Render 8 Sensor Gauges
function renderGauges() {
  const d = latestData;
  const hi = calculateHeatIndex(d.temperature, d.humidity);
  const dp = calculateDewPoint(d.temperature, d.humidity);
  const compass = getWindCompass(d.windDirection);

  // Hero
  document.getElementById('heroTempVal').textContent = d.temperature + '°';
  document.getElementById('heroHeatIndex').textContent = 'HI: ' + hi + '°C';
  document.getElementById('heroPmVal').textContent = d.pm25;
  document.getElementById('heroNoiseVal').textContent = d.noise;

  // Card 1: Temp
  document.getElementById('cTempVal').textContent = d.temperature;
  document.getElementById('cTempFeelsVal').textContent = hi + ' °C';
  document.getElementById('cTempBar').style.width = Math.min(100, (d.temperature / 45) * 100) + '%';

  // Card 2: Hum
  document.getElementById('cHumVal').textContent = d.humidity;
  document.getElementById('cHumDewVal').textContent = dp + ' °C';
  document.getElementById('cHumBar').style.width = d.humidity + '%';

  // Card 3: Wind
  document.getElementById('cWindSpeedVal').textContent = d.windSpeed.toFixed(1);
  document.getElementById('cWindSpeedKmh').textContent = `≈ ${(d.windSpeed * 3.6).toFixed(1)} km/h`;
  document.getElementById('cWindBeaufort').textContent = getBeaufort(d.windSpeed);
  document.getElementById('cWindDirDeg').textContent = d.windDirection + '°';
  document.getElementById('cWindCompass').textContent = compass;
  document.getElementById('cWindBadge').textContent = `${compass} (${d.windDirection}°)`;
  document.getElementById('windNeedle').style.transform = `rotate(${d.windDirection}deg)`;

  // Card 4: PM2.5
  document.getElementById('cPmVal').textContent = d.pm25;
  document.getElementById('cPmBar').style.width = Math.min(100, (d.pm25 / 100) * 100) + '%';
  if (d.pm25 <= 12) {
    document.getElementById('cPmBadge').textContent = currentLanguage === 'vi' ? 'Không khí tốt' : 'Good Air';
    document.getElementById('cPmBadge').className = 'text-xs font-semibold px-2 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  } else if (d.pm25 <= 35.4) {
    document.getElementById('cPmBadge').textContent = currentLanguage === 'vi' ? 'Trung bình' : 'Moderate';
    document.getElementById('cPmBadge').className = 'text-xs font-semibold px-2 py-0.5 rounded border bg-sky-500/10 border-sky-500/20 text-sky-400';
  } else {
    document.getElementById('cPmBadge').textContent = currentLanguage === 'vi' ? 'Cần lưu ý' : 'Caution';
    document.getElementById('cPmBadge').className = 'text-xs font-semibold px-2 py-0.5 rounded border bg-amber-500/10 border-amber-500/20 text-amber-400';
  }

  // Card 5: Noise
  document.getElementById('cNoiseVal').textContent = d.noise;
  const eqContainer = document.getElementById('noiseEqualizerBars');
  eqContainer.innerHTML = Array.from({ length: 14 }).map((_, i) => {
    const h = Math.min(100, Math.max(15, (d.noise / 100) * Math.sin((i / 14) * Math.PI) * 100 + (i % 3) * 6));
    const col = h > 75 ? 'bg-rose-500' : h > 50 ? 'bg-amber-400' : 'bg-emerald-400';
    return `<div class="w-full rounded-sm transition-all duration-500 ${col}" style="height:${h}%"></div>`;
  }).join('');

  // Card 6: Solar Lux
  document.getElementById('cSolarVal').textContent = d.light.toLocaleString();
  document.getElementById('cSolarCond').textContent = d.light > 30000 ? (currentLanguage === 'vi' ? 'Nắng rực rỡ' : 'Bright Sun') : (currentLanguage === 'vi' ? 'Dịu nhẹ' : 'Diffused');
  document.getElementById('cSolarBar').style.width = Math.min(100, (d.light / 60000) * 100) + '%';

  // Card 7: Pressure
  document.getElementById('cPresVal').textContent = d.pressure;
  document.getElementById('cPresHpa').textContent = (d.pressure * 10).toFixed(0) + ' hPa';

  // Card 8: Heat Index
  document.getElementById('cHiVal').textContent = hi;
  document.getElementById('cHiDelta').textContent = (hi - d.temperature >= 0 ? '+' : '') + (hi - d.temperature).toFixed(1) + ' °C';

  // Canvas telemetry labels
  document.getElementById('canvasWindSpeed').textContent = d.windSpeed + ' m/s';
  document.getElementById('canvasWindDir').textContent = d.windDirection + '°';
  document.getElementById('canvasPm25').textContent = d.pm25 + ' µg/m³';

  // Update time
  try {
    const dt = new Date(d.createdAt);
    document.getElementById('lblUpdateTime').textContent = dt.toLocaleTimeString();
  } catch (e) {
    document.getElementById('lblUpdateTime').textContent = '--:--:--';
  }
}

// Chart.js Manager
function renderChart() {
  if (!historyData.length) return;
  const ctx = document.getElementById('trendChart')?.getContext('2d');
  if (!ctx) return;

  const labels = historyData.map(h => {
    try { return new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  });

  let values = [];
  let label = '';
  let color = '#10b981';
  let unit = '';

  if (activeMetric === 'temp') {
    values = historyData.map(h => h.temperature);
    label = currentLanguage === 'vi' ? 'Nhiệt độ (°C)' : 'Temperature (°C)';
    color = '#f97316';
    unit = '°C';
  } else if (activeMetric === 'pm25') {
    values = historyData.map(h => h.pm25);
    label = 'PM2.5 (µg/m³)';
    color = '#eab308';
    unit = 'µg/m³';
  } else if (activeMetric === 'noise') {
    values = historyData.map(h => h.noise);
    label = currentLanguage === 'vi' ? 'Độ ồn (dB)' : 'Noise (dB)';
    color = '#818cf8';
    unit = 'dB';
  } else if (activeMetric === 'humidity') {
    values = historyData.map(h => h.humidity);
    label = currentLanguage === 'vi' ? 'Độ ẩm (%RH)' : 'Humidity (%RH)';
    color = '#06b6d4';
    unit = '%RH';
  } else {
    values = historyData.map(h => h.windSpeed);
    label = currentLanguage === 'vi' ? 'Tốc độ gió (m/s)' : 'Wind Speed (m/s)';
    color = '#10b981';
    unit = 'm/s';
  }

  // Calculate min, max, avg
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a,b)=>a+b,0) / values.length;
  document.getElementById('statMinVal').textContent = `${min.toFixed(1)} ${unit}`;
  document.getElementById('statAvgVal').textContent = `${avg.toFixed(1)} ${unit}`;
  document.getElementById('statMaxVal').textContent = `${max.toFixed(1)} ${unit}`;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        borderColor: color,
        backgroundColor: color + '22',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      },
      scales: {
        x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#64748b' } },
        y: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#64748b' } }
      }
    }
  });
}

// HTML5 Canvas Particles Simulation
const canvas = document.getElementById('ambientCanvas');
const ctx = canvas?.getContext('2d');
let particles = [];

function initCanvas() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  particles = Array.from({ length: 65 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    len: 8 + Math.random() * 16,
    spd: 0.8 + Math.random() * 1.5,
    op: 0.2 + Math.random() * 0.6
  }));
}

function renderCanvas() {
  if (!ctx || !isCanvasRunning) {
    requestAnimationFrame(renderCanvas);
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const rad = ((latestData.windDirection - 90) * Math.PI) / 180;
  const vx = Math.cos(rad);
  const vy = Math.sin(rad);
  const spd = Math.max(0.5, latestData.windSpeed * 1.2);

  particles.forEach(p => {
    p.x += vx * p.spd * spd;
    p.y += vy * p.spd * spd;
    if (p.x < -30) p.x = canvas.width + 20;
    if (p.x > canvas.width + 30) p.x = -20;
    if (p.y < -30) p.y = canvas.height + 20;
    if (p.y > canvas.height + 30) p.y = -20;

    ctx.beginPath();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = latestData.pm25 > 35 ? `rgba(251, 191, 36, ${p.op})` : `rgba(56, 189, 248, ${p.op})`;
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - vx * p.len, p.y - vy * p.len);
    ctx.stroke();
  });

  requestAnimationFrame(renderCanvas);
}

// Live ThingSpeak Query
async function fetchLive() {
  try {
    const [lastRes, histRes] = await Promise.all([
      fetch(`https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json`),
      fetch(`https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=30`)
    ]);

    if (lastRes.ok) {
      const raw = await lastRes.json();
      latestData = {
        windSpeed: Number(raw.field1 || 0),
        windDirection: Number(raw.field2 || 0),
        temperature: Number(raw.field3 || 28),
        pressure: Number(raw.field4 || 101.3),
        light: Number(raw.field5 || 500),
        humidity: Number(raw.field6 || 70),
        noise: Number(raw.field7 || 60),
        pm25: Number(raw.field8 || 30),
        createdAt: raw.created_at
      };
    }

    if (histRes.ok) {
      const hist = await histRes.json();
      if (hist.feeds && hist.feeds.length) {
        historyData = hist.feeds.map(f => ({
          windSpeed: Number(f.field1 || 0),
          windDirection: Number(f.field2 || 0),
          temperature: Number(f.field3 || 28),
          pressure: Number(f.field4 || 101.3),
          light: Number(f.field5 || 500),
          humidity: Number(f.field6 || 70),
          noise: Number(f.field7 || 60),
          pm25: Number(f.field8 || 30),
          createdAt: f.created_at
        }));
      }
    }
  } catch (err) {
    console.warn('ThingSpeak live query notice, using local cache:', err);
  }

  renderAdvisories();
  renderGauges();
  renderChart();
}

// Switch Language Helper
function switchLang(lang) {
  currentLanguage = lang;
  if (lang === 'vi') {
    document.getElementById('btnLangVi').className = 'px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white shadow-sm transition';
    document.getElementById('btnLangEn').className = 'px-2.5 py-1 text-xs font-semibold rounded-md text-slate-400 hover:text-slate-200 transition';
  } else {
    document.getElementById('btnLangEn').className = 'px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white shadow-sm transition';
    document.getElementById('btnLangVi').className = 'px-2.5 py-1 text-xs font-semibold rounded-md text-slate-400 hover:text-slate-200 transition';
  }
  Object.keys(dict[lang]).forEach(k => {
    const el = document.getElementById(k);
    if (el) el.textContent = dict[lang][k];
  });
  renderAdvisories();
  renderGauges();
  renderChart();
}

// Attach Event Handlers
document.getElementById('btnLangVi')?.addEventListener('click', () => switchLang('vi'));
document.getElementById('btnLangEn')?.addEventListener('click', () => switchLang('en'));

document.getElementById('btnRefresh')?.addEventListener('click', () => {
  countdown = 20;
  fetchLive();
});

document.getElementById('btnToggleCanvas')?.addEventListener('click', () => {
  isCanvasRunning = !isCanvasRunning;
  document.getElementById('btnToggleCanvasTxt').textContent = isCanvasRunning ? (currentLanguage === 'vi' ? 'Tạm Dừng' : 'Pause') : (currentLanguage === 'vi' ? 'Tiếp Tục' : 'Resume');
});

document.querySelectorAll('#chartTabButtons button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#chartTabButtons button').forEach(b => {
      b.className = 'px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200';
    });
    btn.className = 'px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white shadow-sm border border-slate-700';
    activeMetric = btn.dataset.metric;
    renderChart();
  });
});

document.getElementById('btnCopyApi')?.addEventListener('click', () => {
  navigator.clipboard.writeText('https://api.thingspeak.com/channels/3428136/feeds/last.json');
  document.getElementById('txtCopyApi').textContent = currentLanguage === 'vi' ? 'Đã chép!' : 'Copied!';
  setTimeout(() => {
    document.getElementById('txtCopyApi').textContent = currentLanguage === 'vi' ? 'Sao chép API' : 'Copy API';
  }, 2000);
});

document.getElementById('btnExportCsv')?.addEventListener('click', () => {
  const csv = ['Time,WindSpeed,WindDir,Temp,Pres,Light,Hum,Noise,PM25', ...historyData.map(h => `${h.createdAt},${h.windSpeed},${h.windDirection},${h.temperature},${h.pressure},${h.light},${h.humidity},${h.noise},${h.pm25}`)].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'giadinh_telemetry.csv';
  a.click();
});

document.getElementById('btnExportJson')?.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'giadinh_telemetry.json';
  a.click();
});

// Periodic Countdown Loop
setInterval(() => {
  countdown--;
  if (countdown <= 0) {
    countdown = 20;
    fetchLive();
  }
  const el = document.getElementById('lblCountdown');
  if (el) el.textContent = countdown + 's';
}, 1000);

// Init Execution
window.addEventListener('resize', initCanvas);
initCanvas();
renderCanvas();
fetchLive();
