import type {
  RawThingSpeakFeed,
  RawThingSpeakResponse,
  EnvironmentState
} from '../types/environment';
import {
  calculateHeatIndex,
  calculateDewPoint,
  getWindCompass,
  getAQILevel,
  getHeatExposureLevel,
  getNoiseCategory,
  getLightCondition
} from '../utils/calculations';

export const THINGSPEAK_CHANNEL_ID = '3428136';
export const THINGSPEAK_BASE_URL = 'https://api.thingspeak.com';

export function parseFeedToState(feed: RawThingSpeakFeed): EnvironmentState {
  const windSpeed = Number(feed.field1 ?? 0);
  const windDirection = Number(feed.field2 ?? 0);
  const temperature = Number(feed.field3 ?? 28);
  const pressure = Number(feed.field4 ?? 101.3);
  const light = Number(feed.field5 ?? 500);
  const humidity = Number(feed.field6 ?? 70);
  const noise = Number(feed.field7 ?? 55);
  const pm25 = Number(feed.field8 ?? 25);

  const heatIndex = calculateHeatIndex(temperature, humidity);
  const dewPoint = calculateDewPoint(temperature, humidity);
  const windCompass = getWindCompass(windDirection);
  const aqiLevel = getAQILevel(pm25);
  const heatLevel = getHeatExposureLevel(heatIndex);
  const noiseCategory = getNoiseCategory(noise);
  const lightCondition = getLightCondition(light);

  return {
    windSpeed,
    windDirection,
    windCompass,
    temperature,
    pressure,
    light,
    humidity,
    noise,
    pm25,
    createdAt: feed.created_at,
    entryId: feed.entry_id,
    heatIndex,
    dewPoint,
    aqiLevel,
    heatLevel,
    noiseCategory,
    lightCondition
  };
}

/**
 * Fallback baseline data if offline or API limit reached
 */
export const FALLBACK_FEED: RawThingSpeakFeed = {
  created_at: new Date().toISOString(),
  entry_id: 218700,
  field1: "1.20",
  field2: "215",
  field3: "33.40",
  field4: "100.40",
  field5: "1540",
  field6: "68.20",
  field7: "71.50",
  field8: "38.00"
};

/**
 * Fetches the most recent environmental reading
 */
export async function fetchLatestFeed(): Promise<EnvironmentState> {
  const url = `${THINGSPEAK_BASE_URL}/channels/${THINGSPEAK_CHANNEL_ID}/feeds/last.json`;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`ThingSpeak HTTP ${response.status}`);
    }
    const data: RawThingSpeakFeed = await response.json();
    return parseFeedToState(data);
  } catch (err) {
    console.warn('Falling back to default station data:', err);
    return parseFeedToState(FALLBACK_FEED);
  }
}

/**
 * Fetches historical environmental telemetry (default 60 points)
 */
export async function fetchFeedHistory(results = 60): Promise<EnvironmentState[]> {
  const url = `${THINGSPEAK_BASE_URL}/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?results=${results}`;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`ThingSpeak HTTP ${response.status}`);
    }
    const data: RawThingSpeakResponse = await response.json();
    if (!data.feeds || data.feeds.length === 0) {
      return [parseFeedToState(FALLBACK_FEED)];
    }
    return data.feeds.map(parseFeedToState);
  } catch (err) {
    console.warn('Could not fetch feed history, generating fallback curve:', err);
    const now = Date.now();
    return Array.from({ length: 20 }).map((_, i) => {
      const time = new Date(now - (20 - i) * 60000).toISOString();
      return parseFeedToState({
        ...FALLBACK_FEED,
        created_at: time,
        entry_id: 218700 + i,
        field3: (32 + Math.sin(i / 2) * 1.5).toFixed(1),
        field6: (66 + Math.cos(i / 2) * 4).toFixed(1),
        field8: (35 + Math.sin(i / 3) * 8).toFixed(1),
        field7: (70 + Math.sin(i) * 5).toFixed(1)
      });
    });
  }
}

/**
 * Export data to CSV
 */
export function exportToCSV(feeds: EnvironmentState[], filename = 'makerlab_giadinh_telemetry.csv') {
  const headers = [
    'Timestamp',
    'Entry ID',
    'Wind Speed (m/s)',
    'Wind Dir (deg)',
    'Compass',
    'Temperature (C)',
    'Heat Index (C)',
    'Humidity (%RH)',
    'Pressure (kPa)',
    'Light (lux)',
    'Noise (dB)',
    'PM2.5 (ug/m3)'
  ];

  const rows = feeds.map(f => [
    f.createdAt,
    f.entryId,
    f.windSpeed,
    f.windDirection,
    f.windCompass,
    f.temperature,
    f.heatIndex,
    f.humidity,
    f.pressure,
    f.light,
    f.noise,
    f.pm25
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to JSON
 */
export function exportToJSON(feeds: EnvironmentState[], filename = 'makerlab_giadinh_telemetry.json') {
  const blob = new Blob([JSON.stringify(feeds, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
