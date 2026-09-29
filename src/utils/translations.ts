export type Language = 'vi' | 'en';

export const translations = {
  vi: {
    siteTitle: 'GiaDinh EcoPulse',
    siteSubtitle: 'Trạm Quan Trắc Vi Khí Hậu & Sức Khỏe Đô Thị Gia Định, TP.HCM',
    liveStation: 'Trạm MakerLab Gia Định',
    openDataChannel: 'Kênh ThingSpeak',
    lastUpdated: 'Cập nhật',
    nextUpdateIn: 'Làm mới sau',
    refreshNow: 'Cập nhật ngay',
    connecting: 'Đang kết nối...',
    liveActive: 'TRỰC TIẾP',
    offline: 'NGOẠI TUYẾN',
    seconds: 'giây',
    
    // Quick overall assessment
    overallHeader: 'Chỉ Dẫn Sinh Hoạt Đô Thị',
    overallSubtitle: 'Đánh giá điều kiện vi khí hậu thực tế cho các hoạt động ngoài trời tại Gia Định',
    
    // Advisories
    activityRun: 'Chạy Bộ / Thể Thao',
    activityCafe: 'Cà Phê / Làm Việc Ngoài Trời',
    activityLaundry: 'Phơi Đồ Nhanh Khô',
    activityMask: 'Khẩu Trang Ra Đường',
    
    statusOptimal: 'Rất Tốt',
    statusModerate: 'Bình Thường',
    statusCaution: 'Lưu Ý',
    statusAvoid: 'Hạn Chế',

    // Metrics
    temperature: 'Nhiệt Độ',
    feelsLike: 'Cảm giác nhiệt',
    dewPoint: 'Điểm sương',
    heatIndex: 'Chỉ số nhiệt',
    
    wind: 'Gió & Độ Thông Thoáng',
    windSpeed: 'Tốc độ gió',
    windDirection: 'Hướng gió',
    bearing: 'Góc la bàn',
    
    airQuality: 'Chất Lượng Không Khí',
    pm25Dust: 'Bụi mịn PM2.5',
    aqiGood: 'Không khí tốt',
    aqiModerate: 'Trung bình',
    aqiSensitive: 'Kém cho người nhạy cảm',
    aqiUnhealthy: 'Có hại sức khỏe',
    aqiVeryUnhealthy: 'Rất có hại',
    aqiHazardous: 'Nguy hại',

    noise: 'Độ Ồn Môi Trường',
    noiseQuiet: 'Yên tĩnh',
    noiseModerate: 'Vừa phải',
    noiseBusy: 'Đường phố nhộn nhịp',
    noiseLoud: 'Ồn ào cao',
    noiseHazardous: 'Nguy cơ hại thính lực',

    solar: 'Cường Độ Ánh Sáng',
    luxUnit: 'lux',
    solarNight: 'Đêm / Tối',
    solarIndoor: 'Trong nhà / Ánh đèn',
    solarOvercast: 'Ban ngày / Dịu nhẹ',
    solarIntense: 'Nắng gắt / Bức xạ cao',

    humidity: 'Độ Ẩm Tương Đối',
    pressure: 'Áp Suất Khí Quyển',
    steady: 'Ổn định',
    
    // Canvas & Visualizer
    visualizerTitle: 'Mô Phỏng Gió & Vi Bụi Thời Gian Thực',
    visualizerDesc: 'Các hạt chuyển động theo tốc độ gió thực tế, hướng la bàn và mật độ bụi PM2.5 hiện tại.',
    toggleParticles: 'Bật/Tắt Hạt Gió',

    // Charts
    trendTitle: 'Xu Hướng Lịch Sử Môi Trường (60 Bản Ghi Gần Nhất)',
    metricAll: 'Tổng Quan',
    metricTemp: 'Nhiệt Độ & Nhiệt Cảm Nhận',
    metricPM25: 'Bụi Mịn PM2.5',
    metricNoise: 'Độ Ồn',
    metricHumidity: 'Độ Ẩm',

    // Developer / Maker Hub
    makerHubTitle: 'Dành Cho Maker & Lập Trình Viên',
    makerHubSubtitle: 'Dữ liệu mở trạm MakerLab Gia Định sẵn sàng để nhúng vào ESP32, Python, Web và Physical Installations.',
    exportJson: 'Tải JSON',
    exportCsv: 'Tải CSV',
    copyApi: 'Sao chép Endpoint API',
    copied: 'Đã chép!',
    viewStationOnMakerLab: 'Xem Trang Gốc MakerLab',
    
    // Footer
    footerCredit: 'Dự án mã nguồn mở phát triển cho IOT Workshop. Trạm đo môi trường MakerLab Gia Định, TP. Hồ Chí Minh.',
  },
  en: {
    siteTitle: 'GiaDinh EcoPulse',
    siteSubtitle: 'Urban Microclimate & Health Companion — Gia Dinh, Ho Chi Minh City',
    liveStation: 'MakerLab Gia Dinh Station',
    openDataChannel: 'ThingSpeak Channel',
    lastUpdated: 'Updated',
    nextUpdateIn: 'Auto-refresh in',
    refreshNow: 'Refresh Now',
    connecting: 'Connecting...',
    liveActive: 'LIVE',
    offline: 'OFFLINE',
    seconds: 's',

    // Quick overall assessment
    overallHeader: 'Urban Living & Activity Advisories',
    overallSubtitle: 'Real-time microclimate condition assessment for daily outdoor activities in Gia Dinh',

    // Advisories
    activityRun: 'Running & Exercise',
    activityCafe: 'Outdoor Cafe & Study',
    activityLaundry: 'Laundry Drying',
    activityMask: 'Commuter Mask',

    statusOptimal: 'Optimal',
    statusModerate: 'Moderate',
    statusCaution: 'Caution',
    statusAvoid: 'Avoid',

    // Metrics
    temperature: 'Temperature',
    feelsLike: 'Feels Like',
    dewPoint: 'Dew Point',
    heatIndex: 'Heat Index',

    wind: 'Wind & Airflow',
    windSpeed: 'Wind Speed',
    windDirection: 'Direction',
    bearing: 'Bearing',

    airQuality: 'Air Quality',
    pm25Dust: 'Fine Dust PM2.5',
    aqiGood: 'Good Air',
    aqiModerate: 'Moderate',
    aqiSensitive: 'Unhealthy for Sensitive',
    aqiUnhealthy: 'Unhealthy',
    aqiVeryUnhealthy: 'Very Unhealthy',
    aqiHazardous: 'Hazardous',

    noise: 'Ambient Noise',
    noiseQuiet: 'Quiet',
    noiseModerate: 'Moderate',
    noiseBusy: 'Busy Street',
    noiseLoud: 'Loud Traffic',
    noiseHazardous: 'Hearing Risk',

    solar: 'Light Intensity',
    luxUnit: 'lux',
    solarNight: 'Night / Dark',
    solarIndoor: 'Indoor / Dim',
    solarOvercast: 'Daylight / Overcast',
    solarIntense: 'Intense Sunlight',

    humidity: 'Relative Humidity',
    pressure: 'Barometric Pressure',
    steady: 'Steady',

    // Canvas & Visualizer
    visualizerTitle: 'Real-time Ambient Wind & Dust Simulation',
    visualizerDesc: 'Particles flow according to real-time wind speed, bearing vector, and local PM2.5 density.',
    toggleParticles: 'Toggle Particle Flow',

    // Charts
    trendTitle: 'Historical Trends & Telemetry (Latest 60 Readings)',
    metricAll: 'All Metrics',
    metricTemp: 'Temp & Heat Index',
    metricPM25: 'PM2.5 Dust',
    metricNoise: 'Noise Level',
    metricHumidity: 'Humidity',

    // Developer / Maker Hub
    makerHubTitle: 'For Makers & Developers',
    makerHubSubtitle: 'MakerLab Gia Dinh open IoT station feeds ready for ESP32, Python, Web, and Physical Installations.',
    exportJson: 'Download JSON',
    exportCsv: 'Download CSV',
    copyApi: 'Copy API Endpoint',
    copied: 'Copied!',
    viewStationOnMakerLab: 'View MakerLab Portal',

    // Footer
    footerCredit: 'Open-source project for IoT Workshop. Sensor station by MakerLab Gia Dinh, Ho Chi Minh City, Vietnam.',
  }
};
