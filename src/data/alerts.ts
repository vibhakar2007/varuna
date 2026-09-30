import type { CapAlert } from '../types/storm';

export const CAP_ALERTS: CapAlert[] = [
  {
    id: 'ALERT-2026-TN-042',
    identifier: 'IMD-CAP-20260930-042-TN',
    headline: 'SEVERE THUNDERSTORM & INTENSE LIGHTNING WARNING',
    severity: 'Extreme',
    urgency: 'Immediate',
    certainty: 'Observed',
    event: 'Severe Convective Thunderstorm',
    areaDesc: 'Tamil Nadu: Coimbatore, Tiruppur, Nilgiris, Erode Districts',
    state: 'Tamil Nadu',
    cellId: 'CELL-042',
    lightningProb: 91,
    validForMin: 60,
    expires: '12:50 IST',
    coordinates: [
      [76.60, 10.85],
      [77.40, 10.85],
      [77.55, 11.35],
      [76.85, 11.45],
      [76.60, 10.85]
    ],
    description: 'Doppler Radar confirms rapid vertical updraft (>32 m/s) with echo top exceeding 16.2 km. Severe cloud-to-ground lightning frequency of 42 strokes/min and microburst wind gusts up to 75 km/h expected along the Coimbatore-Tiruppur corridor.',
    instructions: 'Take immediate shelter in sturdy enclosed buildings. Avoid open fields, metal structures, elevated ground, and water bodies. Unplug sensitive electrical appliances.'
  },
  {
    id: 'ALERT-2026-KA-018',
    identifier: 'IMD-CAP-20260930-018-KA',
    headline: 'THUNDERSTORM WITH GUSTY WINDS & LIGHTNING ADVISORY',
    severity: 'Severe',
    urgency: 'Expected',
    certainty: 'Likely',
    event: 'Multicell Thunderstorm',
    areaDesc: 'Karnataka: Hassan, Mandya, Ramanagara, Tumakuru Border',
    state: 'Karnataka',
    cellId: 'CELL-018',
    lightningProb: 71,
    validForMin: 90,
    expires: '13:20 IST',
    coordinates: [
      [75.80, 12.75],
      [76.55, 12.80],
      [76.70, 13.35],
      [75.95, 13.30],
      [75.80, 12.75]
    ],
    description: 'Convective cell propagating eastward at 27 km/h with 53.8 dBZ reflectivity core. Moderate hail potential (diameter 10-18mm) and frequent IC/CG lightning discharges.',
    instructions: 'Farmers and outdoor personnel advised to suspend field operations. Secure temporary loose roofings and solar installations.'
  },
  {
    id: 'ALERT-2026-ME-104',
    identifier: 'IMD-CAP-20260930-104-ME',
    headline: 'VERY SEVERE OROGRAPHIC THUNDERSTORM WARNING',
    severity: 'Extreme',
    urgency: 'Immediate',
    certainty: 'Observed',
    event: 'Supercell Convective Core',
    areaDesc: 'Meghalaya: East Khasi Hills, Ri-Bhoi, Cherrapunji Plateau',
    state: 'Meghalaya',
    cellId: 'CELL-104',
    lightningProb: 85,
    validForMin: 90,
    expires: '13:20 IST',
    coordinates: [
      [91.40, 25.05],
      [92.15, 25.10],
      [92.10, 25.65],
      [91.45, 25.60],
      [91.40, 25.05]
    ],
    description: 'Extreme orographic moisture pumping generating intense convective updraft with CAPE exceeding 3200 J/kg. Dangerous high-density lightning and flash runoff threat.',
    instructions: 'Stay indoors away from steep slopes prone to sudden mudslips. Avoid crossing swift drainage streams.'
  },
  {
    id: 'ALERT-2026-OD-071',
    identifier: 'IMD-CAP-20260930-071-OD',
    headline: 'CONVECTIVE THUNDERSTORM DEVELOPMENT WATCH',
    severity: 'Moderate',
    urgency: 'Expected',
    certainty: 'Likely',
    event: 'Convective Cluster',
    areaDesc: 'Odisha: Cuttack, Khordha, Kendrapara Coastal Plains',
    state: 'Odisha',
    cellId: 'CELL-071',
    lightningProb: 52,
    validForMin: 120,
    expires: '13:50 IST',
    coordinates: [
      [85.45, 20.15],
      [86.25, 20.20],
      [86.35, 20.75],
      [85.55, 20.70],
      [85.45, 20.15]
    ],
    description: 'Developing cluster in Mahanadi basin exhibiting rapid reflectivity intensification from 35 dBZ to 46 dBZ over past 20 minutes.',
    instructions: 'Monitor IMD VARUNA nowcast stream. Stay alert for sudden squall wind shifts.'
  }
];
