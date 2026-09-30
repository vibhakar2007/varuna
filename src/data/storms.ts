import type { StormCell, ForecastPoint, ConfidenceLevel } from '../types/storm';

function generateForecast(
  baseLat: number,
  baseLng: number,
  speedKmH: number,
  azimuthDeg: number,
  initialIntensity: number,
  initialLightning: number,
  initialConfidence: ConfidenceLevel
): ForecastPoint[] {
  const offsets = [0, 30, 60, 90, 120, 180];
  const rad = (azimuthDeg * Math.PI) / 180;
  const baseMinutesNow = 11 * 60 + 50; // 11:50 IST

  return offsets.map((min) => {
    const hours = min / 60;
    const distanceKm = speedKmH * hours;
    const dLat = (distanceKm * Math.cos(rad)) / 111;
    const dLng = (distanceKm * Math.sin(rad)) / (111 * Math.cos((baseLat * Math.PI) / 180));

    let intensityFactor = 1.0;
    let lightningFactor = 1.0;
    let conf = initialConfidence;

    if (min === 0) {
      intensityFactor = 1.0;
      lightningFactor = 1.0;
    } else if (min === 30) {
      intensityFactor = 1.06;
      lightningFactor = 1.08;
    } else if (min === 60) {
      intensityFactor = 0.98;
      lightningFactor = 0.95;
    } else if (min === 90) {
      intensityFactor = 0.88;
      lightningFactor = 0.80;
      if (conf === 'HIGH') conf = 'MEDIUM';
    } else if (min === 120) {
      intensityFactor = 0.74;
      lightningFactor = 0.65;
      if (conf === 'MEDIUM') conf = 'LOW';
    } else {
      intensityFactor = 0.54;
      lightningFactor = 0.45;
      conf = 'LOW';
    }

    const calcIntensity = Math.min(100, Math.max(15, Math.round(initialIntensity * intensityFactor)));
    const calcLightning = Math.min(100, Math.max(10, Math.round(initialLightning * lightningFactor)));
    const dispersionRadiusKm = 10 + min * 0.22;

    const totalMinutes = baseMinutesNow + min;
    const hh = Math.floor(totalMinutes / 60) % 24;
    const mm = totalMinutes % 60;
    const timeLabel = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;

    return {
      timeOffsetMin: min,
      timeLabel,
      intensity: calcIntensity,
      lightningProb: calcLightning,
      confidence: conf,
      lat: Number((baseLat + dLat).toFixed(4)),
      lng: Number((baseLng + dLng).toFixed(4)),
      dispersionRadiusKm: Number(dispersionRadiusKm.toFixed(1))
    };
  });
}

export const INITIAL_STORM_CELLS: StormCell[] = [
  {
    id: 'CELL-042',
    name: 'Coimbatore Supercell System',
    state: 'Tamil Nadu',
    subRegion: 'Near Coimbatore / Tiruppur',
    lat: 11.0168,
    lng: 76.9558,
    currentLat: 11.0168,
    currentLng: 76.9558,
    intensity: 82,
    lightningProb: 91,
    confidence: 'HIGH',
    velocityKmH: 34,
    direction: 'NE',
    azimuthDeg: 48,
    maxDbz: 62.4,
    echoTopKm: 16.2,
    capeJkg: 2850,
    flashRatePerMin: 42,
    severity: 'SEVERE',
    radarStationNearest: 'DWR Chennai / Bengaluru Beam',
    sensorWeights: { radar: 38, satellite: 26, lightning: 21, nwp: 15 },
    forecast: generateForecast(11.0168, 76.9558, 34, 48, 82, 91, 'HIGH')
  },
  {
    id: 'CELL-018',
    name: 'Hassan Convective Multicell',
    state: 'Karnataka',
    subRegion: 'Near Hassan / Mandya Corridor',
    lat: 13.0033,
    lng: 76.1004,
    currentLat: 13.0033,
    currentLng: 76.1004,
    intensity: 63,
    lightningProb: 71,
    confidence: 'MEDIUM',
    velocityKmH: 27,
    direction: 'E',
    azimuthDeg: 92,
    maxDbz: 53.8,
    echoTopKm: 13.8,
    capeJkg: 2100,
    flashRatePerMin: 26,
    severity: 'MODERATE',
    radarStationNearest: 'DWR Bengaluru',
    sensorWeights: { radar: 40, satellite: 24, lightning: 20, nwp: 16 },
    forecast: generateForecast(13.0033, 76.1004, 27, 92, 63, 71, 'MEDIUM')
  },
  {
    id: 'CELL-071',
    name: 'Mahanadi Basin Convective Cluster',
    state: 'Odisha',
    subRegion: 'Near Cuttack / Khordha',
    lat: 20.4625,
    lng: 85.8830,
    currentLat: 20.4625,
    currentLng: 85.8830,
    intensity: 48,
    lightningProb: 52,
    confidence: 'MEDIUM',
    velocityKmH: 22,
    direction: 'NE',
    azimuthDeg: 42,
    maxDbz: 46.2,
    echoTopKm: 11.4,
    capeJkg: 1750,
    flashRatePerMin: 14,
    severity: 'MODERATE',
    radarStationNearest: 'DWR Cuttack',
    sensorWeights: { radar: 35, satellite: 28, lightning: 18, nwp: 19 },
    forecast: generateForecast(20.4625, 85.8830, 22, 42, 48, 52, 'MEDIUM')
  },
  {
    id: 'CELL-093',
    name: 'Midnapore Convective Squall Line',
    state: 'West Bengal',
    subRegion: 'Near Kharagpur / Medinipur',
    lat: 22.3460,
    lng: 87.2320,
    currentLat: 22.3460,
    currentLng: 87.2320,
    intensity: 29,
    lightningProb: 31,
    confidence: 'LOW',
    velocityKmH: 18,
    direction: 'E',
    azimuthDeg: 86,
    maxDbz: 36.5,
    echoTopKm: 8.9,
    capeJkg: 1280,
    flashRatePerMin: 6,
    severity: 'WEAK',
    radarStationNearest: 'DWR Kolkata',
    sensorWeights: { radar: 30, satellite: 30, lightning: 15, nwp: 25 },
    forecast: generateForecast(22.3460, 87.2320, 18, 86, 29, 31, 'LOW')
  },
  {
    id: 'CELL-104',
    name: 'Khasi Hills Orographic Supercell',
    state: 'Meghalaya',
    subRegion: 'Near Shillong Plateau / Cherrapunji',
    lat: 25.3000,
    lng: 91.7000,
    currentLat: 25.3000,
    currentLng: 91.7000,
    intensity: 76,
    lightningProb: 85,
    confidence: 'HIGH',
    velocityKmH: 31,
    direction: 'ENE',
    azimuthDeg: 65,
    maxDbz: 59.1,
    echoTopKm: 15.6,
    capeJkg: 3200,
    flashRatePerMin: 38,
    severity: 'SEVERE',
    radarStationNearest: 'DWR Agartala / Guwahati',
    sensorWeights: { radar: 32, satellite: 30, lightning: 24, nwp: 14 },
    forecast: generateForecast(25.3000, 91.7000, 31, 65, 76, 85, 'HIGH')
  },
  {
    id: 'CELL-055',
    name: 'Western Ghats Leeward Convection',
    state: 'Maharashtra',
    subRegion: 'Near Pune / Lonavala Ridge',
    lat: 18.5204,
    lng: 73.8567,
    currentLat: 18.5204,
    currentLng: 73.8567,
    intensity: 54,
    lightningProb: 58,
    confidence: 'MEDIUM',
    velocityKmH: 24,
    direction: 'NE',
    azimuthDeg: 52,
    maxDbz: 49.3,
    echoTopKm: 12.1,
    capeJkg: 1950,
    flashRatePerMin: 18,
    severity: 'MODERATE',
    radarStationNearest: 'DWR Mumbai',
    sensorWeights: { radar: 37, satellite: 27, lightning: 18, nwp: 18 },
    forecast: generateForecast(18.5204, 73.8567, 24, 52, 54, 58, 'MEDIUM')
  },
  {
    id: 'CELL-112',
    name: 'Palakkad Gap Convective Inflow',
    state: 'Kerala',
    subRegion: 'Palakkad / Wayanad Foothills',
    lat: 10.7867,
    lng: 76.6548,
    currentLat: 10.7867,
    currentLng: 76.6548,
    intensity: 69,
    lightningProb: 78,
    confidence: 'HIGH',
    velocityKmH: 29,
    direction: 'ENE',
    azimuthDeg: 70,
    maxDbz: 56.7,
    echoTopKm: 14.5,
    capeJkg: 2450,
    flashRatePerMin: 32,
    severity: 'SEVERE',
    radarStationNearest: 'DWR Kochi',
    sensorWeights: { radar: 39, satellite: 25, lightning: 22, nwp: 14 },
    forecast: generateForecast(10.7867, 76.6548, 29, 70, 69, 78, 'HIGH')
  },
  {
    id: 'CELL-033',
    name: 'Northern Circars Coastal Cell',
    state: 'Andhra Pradesh',
    subRegion: 'North of Visakhapatnam',
    lat: 17.8500,
    lng: 83.3500,
    currentLat: 17.8500,
    currentLng: 83.3500,
    intensity: 38,
    lightningProb: 41,
    confidence: 'LOW',
    velocityKmH: 19,
    direction: 'NNE',
    azimuthDeg: 28,
    maxDbz: 41.5,
    echoTopKm: 10.2,
    capeJkg: 1450,
    flashRatePerMin: 9,
    severity: 'DEVELOPING',
    radarStationNearest: 'DWR Cuttack / Machilipatnam',
    sensorWeights: { radar: 34, satellite: 28, lightning: 16, nwp: 22 },
    forecast: generateForecast(17.8500, 83.3500, 19, 28, 38, 41, 'LOW')
  }
];
