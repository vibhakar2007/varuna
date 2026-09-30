import type { SensorFeed } from '../types/storm';

export const INITIAL_SENSOR_FEEDS: SensorFeed[] = [
  {
    id: 'sensor-radar',
    name: 'RADAR',
    type: 'RADAR',
    fullName: 'IMD Doppler Weather Radar Network (DWR)',
    status: 'ONLINE',
    latencySeconds: 78,
    updateCycleMin: 10,
    resolution: '500m / 0.5° Azimuth',
    activeStations: 34,
    totalStations: 34,
    nominalWeight: 0.38,
    currentWeight: 0.38,
    details: 'Dual-pol reflectivity (Z_H), differential reflectivity (Z_DR), radial velocity (V_r)'
  },
  {
    id: 'sensor-insat',
    name: 'INSAT-3DR',
    type: 'INSAT',
    fullName: 'ISRO INSAT-3DR Geostationary Imager',
    status: 'ONLINE',
    latencySeconds: 142,
    updateCycleMin: 15,
    resolution: '4.0 km (TIR1 / WV)',
    activeStations: 1,
    totalStations: 1,
    nominalWeight: 0.26,
    currentWeight: 0.26,
    details: 'TIR1 10.8 µm cloud top brightness temp & 6.8 µm upper-level water vapor divergence'
  },
  {
    id: 'sensor-lightning',
    name: 'LIGHTNING',
    type: 'LIGHTNING',
    fullName: 'IITM / ISRO Lightning Location Network (LLN)',
    status: 'ONLINE',
    latencySeconds: 12,
    updateCycleMin: 1,
    resolution: '< 250m accuracy',
    activeStations: 82,
    totalStations: 82,
    nominalWeight: 0.21,
    currentWeight: 0.21,
    details: 'VLF/LF sensors detecting IC (intra-cloud) and CG (cloud-to-ground) return strokes'
  },
  {
    id: 'sensor-nwp',
    name: 'NWP MODEL',
    type: 'NWP',
    fullName: 'IMD High-Resolution WRF / GFS Dynamical Model',
    status: 'ONLINE',
    latencySeconds: 620,
    updateCycleMin: 60,
    resolution: '3.0 km Convection-Permitting',
    activeStations: 1,
    totalStations: 1,
    nominalWeight: 0.15,
    currentWeight: 0.15,
    details: 'CAPE, 0-6 km bulk wind shear, convective inhibition (CIN), moisture convergence'
  }
];
