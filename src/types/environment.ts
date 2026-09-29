export interface RawThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1: string | null; // Wind speed (m/s)
  field2: string | null; // Wind direction (degrees)
  field3: string | null; // Temperature (°C)
  field4: string | null; // Pressure (kPa)
  field5: string | null; // Light (lux)
  field6: string | null; // Humidity (%RH)
  field7: string | null; // Noise (dB)
  field8: string | null; // PM2.5 (µg/m³)
}

export interface RawThingSpeakResponse {
  channel: {
    id: number;
    name: string;
    description: string;
    latitude: string;
    longitude: string;
    created_at: string;
    updated_at: string;
    last_entry_id: number;
  };
  feeds: RawThingSpeakFeed[];
}

export type AQILevel = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
export type HeatExposureLevel = 'normal' | 'caution' | 'extreme-caution' | 'danger';
export type NoiseCategory = 'quiet' | 'moderate' | 'busy' | 'very-loud' | 'hazardous';
export type LightCondition = 'night' | 'indoor' | 'overcast' | 'direct-sun';

export interface EnvironmentState {
  windSpeed: number;
  windDirection: number;
  windCompass: string;
  temperature: number;
  pressure: number;
  light: number;
  humidity: number;
  noise: number;
  pm25: number;
  createdAt: string;
  entryId: number;
  
  // Computed indices
  heatIndex: number;
  dewPoint: number;
  aqiLevel: AQILevel;
  heatLevel: HeatExposureLevel;
  noiseCategory: NoiseCategory;
  lightCondition: LightCondition;
}

export interface ActivityRating {
  title: string;
  score: number; // 0 - 100
  status: 'optimal' | 'moderate' | 'caution' | 'avoid';
  recommendationVi: string;
  recommendationEn: string;
  reasonVi: string;
  reasonEn: string;
}

export interface ActivityAdvisories {
  running: ActivityRating;
  cafeStudy: ActivityRating;
  laundry: ActivityRating;
  maskWearing: ActivityRating;
}
