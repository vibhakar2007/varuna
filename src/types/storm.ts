export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type SensorStatusType = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export type MapLayerType = 'radar' | 'satellite' | 'lightning' | 'nwp' | 'cells';

export type ViewEngineMode = 'blended' | 'observed' | 'forecast';

export interface ForecastPoint {
  timeOffsetMin: number; // 0, 30, 60, 90, 120, 180
  timeLabel: string;     // e.g. "11:50", "12:20"
  intensity: number;     // 0 - 100%
  lightningProb: number; // 0 - 100%
  confidence: ConfidenceLevel;
  lat: number;
  lng: number;
  dispersionRadiusKm: number; // Ellipse radius indicating uncertainty
}

export interface StormCell {
  id: string;                    // e.g. "CELL-042"
  name: string;                  // e.g. "Coimbatore Convective Core"
  state: string;                 // e.g. "Tamil Nadu"
  subRegion: string;             // e.g. "Near Coimbatore / Tiruppur"
  lat: number;                   // Base initial latitude
  lng: number;                   // Base initial longitude
  currentLat: number;            // Current lat at selected timeline offset
  currentLng: number;            // Current lng at selected timeline offset
  intensity: number;             // 0 - 100%
  lightningProb: number;         // 0 - 100%
  confidence: ConfidenceLevel;
  velocityKmH: number;           // e.g. 34
  direction: string;             // e.g. "NE"
  azimuthDeg: number;            // e.g. 48
  maxDbz: number;                // e.g. 62.4
  echoTopKm: number;             // e.g. 16.2
  capeJkg: number;               // Convective Available Potential Energy, e.g. 2850
  flashRatePerMin: number;       // e.g. 42
  severity: 'SEVERE' | 'MODERATE' | 'DEVELOPING' | 'WEAK';
  forecast: ForecastPoint[];
  radarStationNearest: string;
  sensorWeights: {
    radar: number;      // % contribution
    satellite: number;
    lightning: number;
    nwp: number;
  };
}

export interface LightningStrike {
  id: string;
  lat: number;
  lng: number;
  intensityKa: number; // kilo-amperes e.g. -28.4 kA
  type: 'CG' | 'IC';   // Cloud-to-ground or Intra-cloud
  timestamp: number;
  cellId?: string;
}

export interface CapAlert {
  id: string;
  identifier: string;
  headline: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor';
  urgency: 'Immediate' | 'Expected' | 'Future';
  certainty: 'Observed' | 'Likely' | 'Possible';
  event: string;
  areaDesc: string;
  state: string;
  cellId: string;
  lightningProb: number;
  validForMin: number;
  expires: string;
  coordinates: [number, number][]; // Polygon coordinates [[lng, lat], ...]
  description: string;
  instructions: string;
}

export interface SensorFeed {
  id: string;
  name: string;
  type: 'RADAR' | 'INSAT' | 'LIGHTNING' | 'NWP';
  fullName: string;
  status: SensorStatusType;
  latencySeconds: number;
  updateCycleMin: number;
  resolution: string;
  activeStations: number;
  totalStations: number;
  nominalWeight: number; // e.g. 0.35
  currentWeight: number; // dynamic reweighted if dropout occurs
  details: string;
}

export interface RadarStation {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  type: 'S-Band' | 'C-Band' | 'X-Band';
  rangeKm: number;
  status: 'ONLINE' | 'CALIBRATING' | 'STANDBY';
  elevationAngles: number;
}
