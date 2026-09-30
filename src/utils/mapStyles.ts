// Color ramp for Radar reflectivity (dBZ)
export function getDbzColor(intensity: number): string {
  if (intensity >= 80) return '#ec4899'; // > 60 dBZ (Severe hail/supercell: magenta)
  if (intensity >= 65) return '#ef4444'; // 50-60 dBZ (Severe rain/lightning: red)
  if (intensity >= 50) return '#f59e0b'; // 40-50 dBZ (Moderate/Heavy rain: amber)
  if (intensity >= 35) return '#10b981'; // 30-40 dBZ (Moderate rain: emerald)
  return '#06b6d4';                      // < 30 dBZ (Light rain: cyan)
}

export function getConfidenceColor(conf: string): string {
  switch (conf) {
    case 'HIGH': return '#00f0ff';
    case 'MEDIUM': return '#f59e0b';
    case 'LOW': return '#f97316';
    default: return '#64748b';
  }
}
