import type {
  AQILevel,
  HeatExposureLevel,
  NoiseCategory,
  LightCondition,
  EnvironmentState,
  ActivityAdvisories
} from '../types/environment';

/**
 * Calculates perceived Heat Index using NOAA regression formula (Celsius)
 */
export function calculateHeatIndex(temperatureC: number, humidity: number): number {
  if (temperatureC < 26.7 || humidity < 40) {
    return temperatureC;
  }

  // Convert to Fahrenheit for standard NOAA formula
  const tf = (temperatureC * 9) / 5 + 32;
  const rh = humidity;

  const c1 = -42.379;
  const c2 = 2.04901523;
  const c3 = 10.14333127;
  const c4 = -0.22475541;
  const c5 = -0.00683783;
  const c6 = -0.05481717;
  const c7 = 0.00122874;
  const c8 = 0.00085282;
  const c9 = -0.00000199;

  const hif =
    c1 +
    c2 * tf +
    c3 * rh +
    c4 * tf * rh +
    c5 * tf * tf +
    c6 * rh * rh +
    c7 * tf * tf * rh +
    c8 * tf * rh * rh +
    c9 * tf * tf * rh * rh;

  // Convert back to Celsius
  const hic = ((hif - 32) * 5) / 9;
  return Number(hic.toFixed(1));
}

/**
 * Calculates Dew Point using the Magnus-Tetens formula (Celsius)
 */
export function calculateDewPoint(temperatureC: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temperatureC) / (b + temperatureC)) + Math.log(humidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Number(dewPoint.toFixed(1));
}

/**
 * Converts degree (0-360) to 16-point wind compass
 */
export function getWindCompass(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

/**
 * Evaluates US EPA AQI category based on PM2.5 (ug/m3)
 */
export function getAQILevel(pm25: number): AQILevel {
  if (pm25 <= 12.0) return 'good';
  if (pm25 <= 35.4) return 'moderate';
  if (pm25 <= 55.4) return 'unhealthy-sensitive';
  if (pm25 <= 150.4) return 'unhealthy';
  if (pm25 <= 250.4) return 'very-unhealthy';
  return 'hazardous';
}

/**
 * Evaluates Heat Exposure Level
 */
export function getHeatExposureLevel(heatIndexC: number): HeatExposureLevel {
  if (heatIndexC < 30) return 'normal';
  if (heatIndexC < 38) return 'caution';
  if (heatIndexC < 45) return 'extreme-caution';
  return 'danger';
}

/**
 * Evaluates Urban Noise Category
 */
export function getNoiseCategory(dB: number): NoiseCategory {
  if (dB < 50) return 'quiet';
  if (dB < 65) return 'moderate';
  if (dB < 75) return 'busy';
  if (dB < 85) return 'very-loud';
  return 'hazardous';
}

/**
 * Evaluates Solar Light condition
 */
export function getLightCondition(lux: number): LightCondition {
  if (lux < 20) return 'night';
  if (lux < 2000) return 'indoor';
  if (lux < 30000) return 'overcast';
  return 'direct-sun';
}

/**
 * Computes Smart Activity Advisories from live environmental signals
 */
export function calculateActivityAdvisories(env: EnvironmentState): ActivityAdvisories {
  // 1. Jogging / Outdoor Workout Score
  let runScore = 100;
  if (env.heatIndex > 32) runScore -= (env.heatIndex - 32) * 5;
  if (env.humidity > 80) runScore -= 10;
  if (env.pm25 > 35) runScore -= (env.pm25 - 35) * 1.5;
  if (env.pm25 > 55) runScore -= 20;
  if (env.light > 40000) runScore -= 10;
  runScore = Math.max(10, Math.min(100, Math.round(runScore)));

  const runStatus =
    runScore >= 75 ? 'optimal' :
    runScore >= 50 ? 'moderate' :
    runScore >= 30 ? 'caution' : 'avoid';

  const runAdviceVi =
    runStatus === 'optimal' ? 'Thời tiết lý tưởng để chạy bộ và rèn luyện thể lực.' :
    runStatus === 'moderate' ? 'Điều kiện tập chấp nhận được, nên bù nước đầy đủ.' :
    runStatus === 'caution' ? 'Thời tiết oi bức hoặc bụi mịn cao, chỉ nên tập nhẹ.' :
    'Không nên chạy bộ ngoài trời lúc này, hãy tập trong phòng kín.';

  const runAdviceEn =
    runStatus === 'optimal' ? 'Great conditions for outdoor jogging and workout.' :
    runStatus === 'moderate' ? 'Fair conditions. Stay hydrated during activity.' :
    runStatus === 'caution' ? 'High heat or dust. Keep workout moderate.' :
    'Unfavorable conditions. Workout indoors today.';

  const runReasonVi = `Cảm giác nhiệt: ${env.heatIndex}°C, Bụi mịn PM2.5: ${env.pm25} µg/m³`;
  const runReasonEn = `Heat Index: ${env.heatIndex}°C, PM2.5: ${env.pm25} µg/m³`;

  // 2. Sidewalk Cafe / Outdoor Work Score
  let cafeScore = 100;
  if (env.noise > 65) cafeScore -= (env.noise - 65) * 2.5;
  if (env.heatIndex > 33) cafeScore -= (env.heatIndex - 33) * 6;
  if (env.windSpeed < 0.5) cafeScore -= 10; // Stuffy
  if (env.windSpeed > 4.5) cafeScore -= 15; // Windy blows papers
  if (env.light > 45000) cafeScore -= 15; // Direct sun glare
  cafeScore = Math.max(10, Math.min(100, Math.round(cafeScore)));

  const cafeStatus =
    cafeScore >= 75 ? 'optimal' :
    cafeScore >= 50 ? 'moderate' :
    cafeScore >= 30 ? 'caution' : 'avoid';

  const cafeAdviceVi =
    cafeStatus === 'optimal' ? 'Rất thích hợp ngồi cà phê vỉa hè làm việc, đọc sách.' :
    cafeStatus === 'moderate' ? 'Thích hợp ngồi chill, nói chuyện cùng bạn bè.' :
    cafeStatus === 'caution' ? 'Hơi ồn hoặc nóng, nên chọn quán có máy lạnh.' :
    'Đường phố ồn ào và nóng gắt, hãy vào không gian kín có điều hòa.';

  const cafeAdviceEn =
    cafeStatus === 'optimal' ? 'Pleasant ambience for outdoor cafe work & reading.' :
    cafeStatus === 'moderate' ? 'Good for socializing and relaxing with friends.' :
    cafeStatus === 'caution' ? 'Noisy or warm. Air-conditioned cafe recommended.' :
    'Heavy urban noise & heat. Choose an indoor space.';

  const cafeReasonVi = `Độ ồn: ${env.noise} dB, Nhiệt độ: ${env.temperature}°C`;
  const cafeReasonEn = `Noise: ${env.noise} dB, Temp: ${env.temperature}°C`;

  // 3. Laundry Drying Index
  let laundryScore = 50;
  if (env.light > 30000) laundryScore += 35;
  else if (env.light > 5000) laundryScore += 20;
  else if (env.light < 50) laundryScore -= 25; // Night

  if (env.humidity < 60) laundryScore += 20;
  else if (env.humidity > 80) laundryScore -= 25;

  if (env.windSpeed > 1.2) laundryScore += 15;
  else if (env.windSpeed < 0.3) laundryScore -= 10;
  laundryScore = Math.max(10, Math.min(100, Math.round(laundryScore)));

  const laundryStatus =
    laundryScore >= 75 ? 'optimal' :
    laundryScore >= 50 ? 'moderate' :
    laundryScore >= 30 ? 'caution' : 'avoid';

  const laundryAdviceVi =
    laundryStatus === 'optimal' ? 'Nắng ráo và thông thoáng, quần áo khô cực nhanh!' :
    laundryStatus === 'moderate' ? 'Điều kiện phơi đồ bình thường trong ngày.' :
    laundryStatus === 'caution' ? 'Độ ẩm cao hoặc ít nắng, đồ sẽ lâu khô.' :
    'Trời tối hoặc độ ẩm rất cao, không nên phơi đồ ngoài trời.';

  const laundryAdviceEn =
    laundryStatus === 'optimal' ? 'Sunny & breezy, laundry will dry quickly!' :
    laundryStatus === 'moderate' ? 'Normal drying conditions today.' :
    laundryStatus === 'caution' ? 'High humidity or low sun, slow drying.' :
    'Dark or very humid. Dry indoors or wait.';

  const laundryReasonVi = `Độ ẩm: ${env.humidity}%, Ánh sáng: ${env.light.toLocaleString()} lux`;
  const laundryReasonEn = `Humidity: ${env.humidity}%, Light: ${env.light.toLocaleString()} lux`;

  // 4. Commute & Mask Recommendation
  let maskScore = 100;
  if (env.pm25 > 25) maskScore -= (env.pm25 - 25) * 1.5;
  maskScore = Math.max(10, Math.min(100, Math.round(maskScore)));

  const maskStatus =
    env.pm25 <= 25 ? 'optimal' :
    env.pm25 <= 45 ? 'moderate' :
    env.pm25 <= 65 ? 'caution' : 'avoid';

  const maskAdviceVi =
    env.pm25 <= 25 ? 'Không khí sạch, không bắt buộc phải đeo khẩu trang.' :
    env.pm25 <= 45 ? 'Nên đeo khẩu trang y tế tiêu chuẩn khi lưu thông xe máy.' :
    env.pm25 <= 65 ? 'Nên đeo khẩu trang chống bụi mịn (KF94 / N95) khi ra đường.' :
    'Cảnh báo ô nhiễm! Bắt buộc đeo khẩu trang lọc bụi mịn N95 chuyên dụng.';

  const maskAdviceEn =
    env.pm25 <= 25 ? 'Air is clean. Masks not strictly required.' :
    env.pm25 <= 45 ? 'Wear standard mask when commuting on motorbikes.' :
    env.pm25 <= 65 ? 'Recommend particulate respirator (KF94 / N95).' :
    'Heavy dust pollution! High-grade N95 mask strongly advised.';

  const maskReasonVi = `Bụi mịn PM2.5: ${env.pm25} µg/m³`;
  const maskReasonEn = `PM2.5 concentration: ${env.pm25} µg/m³`;

  return {
    running: {
      title: 'Chạy bộ / Thể dục',
      score: runScore,
      status: runStatus,
      recommendationVi: runAdviceVi,
      recommendationEn: runAdviceEn,
      reasonVi: runReasonVi,
      reasonEn: runReasonEn
    },
    cafeStudy: {
      title: 'Cà phê vỉa hè / Làm việc',
      score: cafeScore,
      status: cafeStatus,
      recommendationVi: cafeAdviceVi,
      recommendationEn: cafeAdviceEn,
      reasonVi: cafeReasonVi,
      reasonEn: cafeReasonEn
    },
    laundry: {
      title: 'Phơi đồ ngoài trời',
      score: laundryScore,
      status: laundryStatus,
      recommendationVi: laundryAdviceVi,
      recommendationEn: laundryAdviceEn,
      reasonVi: laundryReasonVi,
      reasonEn: laundryReasonEn
    },
    maskWearing: {
      title: 'Khẩu trang khi ra đường',
      score: maskScore,
      status: maskStatus,
      recommendationVi: maskAdviceVi,
      recommendationEn: maskAdviceEn,
      reasonVi: maskReasonVi,
      reasonEn: maskReasonEn
    }
  };
}
