// Standalone geographic vectors for India (100% self-contained, zero API keys required)

export interface GeoPolygon {
  name: string;
  type: 'country' | 'state' | 'water' | 'island';
  coordinates: [number, number][]; // [lng, lat]
}

export interface CityMarker {
  name: string;
  lat: number;
  lng: number;
  type: 'metro' | 'radar_site' | 'storm_center';
}

// India Outer Mainland Boundary Polygon (Simplified high-precision boundary)
export const INDIA_MAINLAND_OUTLINE: [number, number][] = [
  // Northwest / Gujarat / Rann of Kutch
  [68.15, 23.65],
  [68.80, 24.50],
  [70.50, 24.60],
  [71.20, 24.70],
  [71.00, 26.50],
  [70.00, 27.50],
  [71.50, 28.50],
  [73.50, 29.80],
  [74.50, 31.00],
  [74.90, 32.20],
  // North / Kashmir / Ladakh / Himalayas
  [74.00, 34.50],
  [75.00, 35.50],
  [77.00, 35.80],
  [79.00, 34.50],
  [78.50, 32.50],
  [80.00, 31.00],
  // Nepal border (along south of Himalayas)
  [81.00, 30.00],
  [83.00, 28.50],
  [85.00, 27.50],
  [88.00, 27.20],
  // Sikkim
  [88.50, 28.00],
  [88.90, 27.30],
  // Bhutan border
  [89.50, 26.80],
  [91.50, 27.20],
  // Arunachal Pradesh
  [92.00, 27.80],
  [94.00, 28.50],
  [96.50, 28.20],
  [97.40, 27.80],
  // Eastern border with Myanmar
  [96.00, 26.50],
  [95.00, 25.50],
  [94.50, 24.00],
  [93.00, 23.00],
  [92.50, 22.00],
  // Bangladesh indentation
  [92.20, 24.00],
  [91.80, 25.20],
  [89.80, 25.50],
  [88.80, 26.00],
  [88.20, 24.50],
  [89.00, 22.00],
  // East Coast / Bay of Bengal
  [87.50, 21.60],
  [86.80, 21.00],
  [85.80, 20.00],
  [84.80, 19.00],
  [83.20, 17.70],
  [82.20, 16.90],
  [80.80, 15.80],
  [80.20, 13.50],
  [80.25, 13.08], // Chennai
  [79.85, 11.90],
  [79.80, 10.30],
  [79.20, 9.20],
  [78.00, 8.80],
  [77.55, 8.08],  // Kanyakumari (Southernmost tip)
  // West Coast / Arabian Sea
  [76.80, 8.50],
  [76.25, 9.93],  // Kochi
  [75.80, 11.25],
  [74.80, 12.90],
  [74.00, 15.00], // Goa
  [73.50, 16.00],
  [73.00, 18.00],
  [72.85, 19.07], // Mumbai
  [72.60, 21.00], // Surat
  [72.40, 22.00], // Gulf of Khambhat
  [71.50, 21.00],
  [70.00, 21.00],
  [69.00, 22.30],
  [69.00, 23.00],
  [68.15, 23.65]  // Loop close to Kutch
];

// Major Regional State Boundaries (for tactical atmospheric context)
export const STATE_BOUNDARIES: Array<{ name: string; path: [number, number][] }> = [
  // Tamil Nadu
  {
    name: 'Tamil Nadu',
    path: [
      [77.55, 8.08],
      [78.00, 8.80],
      [79.20, 9.20],
      [79.80, 10.30],
      [79.85, 11.90],
      [80.25, 13.08],
      [80.00, 13.50],
      [79.00, 13.00],
      [78.20, 12.20],
      [77.00, 11.80],
      [76.80, 11.00],
      [76.60, 9.80],
      [77.20, 8.80],
      [77.55, 8.08]
    ]
  },
  // Karnataka
  {
    name: 'Karnataka',
    path: [
      [74.80, 12.90],
      [74.00, 15.00],
      [74.20, 16.00],
      [75.00, 17.00],
      [77.00, 17.80],
      [77.60, 16.20],
      [77.50, 14.00],
      [78.20, 13.00],
      [77.60, 12.00],
      [76.60, 11.80],
      [75.50, 12.20],
      [74.80, 12.90]
    ]
  },
  // Kerala
  {
    name: 'Kerala',
    path: [
      [77.55, 8.08],
      [76.80, 8.50],
      [76.25, 9.93],
      [75.80, 11.25],
      [75.00, 12.50],
      [75.50, 12.20],
      [76.60, 11.80],
      [76.80, 10.50],
      [77.20, 8.80],
      [77.55, 8.08]
    ]
  },
  // Odisha
  {
    name: 'Odisha',
    path: [
      [84.80, 19.00],
      [85.80, 20.00],
      [86.80, 21.00],
      [87.50, 21.60],
      [86.80, 22.20],
      [85.00, 22.00],
      [83.80, 21.50],
      [82.80, 20.00],
      [82.50, 18.50],
      [84.00, 18.80],
      [84.80, 19.00]
    ]
  },
  // West Bengal
  {
    name: 'West Bengal',
    path: [
      [87.50, 21.60],
      [89.00, 22.00],
      [88.80, 24.50],
      [88.00, 26.50],
      [88.50, 27.20],
      [88.00, 26.80],
      [87.50, 24.50],
      [86.80, 22.80],
      [87.50, 21.60]
    ]
  },
  // Maharashtra
  {
    name: 'Maharashtra',
    path: [
      [72.85, 19.07],
      [73.50, 16.00],
      [74.20, 16.00],
      [75.00, 17.00],
      [77.00, 17.80],
      [79.00, 18.50],
      [80.50, 19.50],
      [80.00, 21.50],
      [78.00, 21.50],
      [75.00, 21.30],
      [73.00, 20.50],
      [72.85, 19.07]
    ]
  },
  // Andhra Pradesh / Telangana
  {
    name: 'Andhra Pradesh',
    path: [
      [80.20, 13.50],
      [80.80, 15.80],
      [82.20, 16.90],
      [83.20, 17.70],
      [84.80, 19.00],
      [83.50, 19.00],
      [81.00, 18.00],
      [79.00, 15.00],
      [78.20, 13.50],
      [80.20, 13.50]
    ]
  },
  // Meghalaya / Assam Plateau
  {
    name: 'Meghalaya',
    path: [
      [89.80, 25.50],
      [92.50, 25.20],
      [92.80, 25.80],
      [90.50, 26.00],
      [89.80, 25.50]
    ]
  }
];

// Sri Lanka Outline for Southern Context
export const SRI_LANKA_OUTLINE: [number, number][] = [
  [79.80, 9.80],
  [80.50, 9.60],
  [81.20, 8.80],
  [81.80, 7.50],
  [81.50, 6.00],
  [80.50, 5.90],
  [79.80, 6.80],
  [79.80, 8.50],
  [79.80, 9.80]
];

// Major Metros & Strategic Atmospheric Observation Centers
export const STRATEGIC_CITIES: CityMarker[] = [
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'metro' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, type: 'metro' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, type: 'metro' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'metro' },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, type: 'metro' },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, type: 'storm_center' },
  { name: 'Hassan', lat: 13.0033, lng: 76.1004, type: 'storm_center' },
  { name: 'Cuttack', lat: 20.4625, lng: 85.8830, type: 'radar_site' },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, type: 'radar_site' },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, type: 'metro' },
  { name: 'Shillong', lat: 25.5788, lng: 91.8933, type: 'storm_center' },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, type: 'radar_site' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, type: 'radar_site' }
];
