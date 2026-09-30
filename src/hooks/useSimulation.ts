import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  StormCell, 
  MapLayerType, 
  ViewEngineMode, 
  SensorFeed, 
  LightningStrike 
} from '../types/storm';
import { INITIAL_STORM_CELLS } from '../data/storms';
import { INITIAL_SENSOR_FEEDS } from '../data/sensors';
import { playUiTick, playRadarPing, playThunderRumble, playAlertChime } from '../utils/audio';

export function useSimulation() {
  const [cells, setCells] = useState<StormCell[]>(INITIAL_STORM_CELLS);
  const [selectedCellId, setSelectedCellId] = useState<string | null>('CELL-042');
  const [timeOffsetMin, setTimeOffsetMin] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewEngineMode>('blended');
  
  // Layer visibility
  const [layers, setLayers] = useState<Record<MapLayerType, boolean>>({
    radar: true,
    satellite: true,
    lightning: true,
    nwp: true,
    cells: true
  });

  // Sensor feeds & dropout status
  const [sensors, setSensors] = useState<SensorFeed[]>(INITIAL_SENSOR_FEEDS);
  const [isDropoutSimulated, setIsDropoutSimulated] = useState<boolean>(false);
  const [dropoutNotification, setDropoutNotification] = useState<string | null>(null);

  // Lightning strikes on canvas
  const [lightningStrikes, setLightningStrikes] = useState<LightningStrike[]>([]);

  // Modals & Drawers
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isFusionModalOpen, setIsFusionModalOpen] = useState<boolean>(false);
  const [isSensorModalOpen, setIsSensorModalOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [radarSweepAngle, setRadarSweepAngle] = useState<number>(0);

  // Time reference
  const [currentUtcTime, setCurrentUtcTime] = useState<string>('');
  const [currentIstTime, setCurrentIstTime] = useState<string>('');

  // Clock ticker
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setCurrentUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
      setCurrentIstTime(
        now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST'
      );
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update cell positions based on timeOffsetMin
  useEffect(() => {
    setCells((prev) =>
      prev.map((cell) => {
        const pt = cell.forecast.find((f) => f.timeOffsetMin === timeOffsetMin) || cell.forecast[0];
        return {
          ...cell,
          currentLat: pt.lat,
          currentLng: pt.lng,
          intensity: pt.intensity,
          lightningProb: pt.lightningProb,
          confidence: pt.confidence
        };
      })
    );
  }, [timeOffsetMin]);

  // Automated forecast playback
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 1600 / playbackSpeed;
    const timer = setInterval(() => {
      setTimeOffsetMin((prev) => {
        const offsets = [0, 30, 60, 90, 120, 180];
        const currentIndex = offsets.indexOf(prev);
        if (currentIndex === -1 || currentIndex === offsets.length - 1) {
          return 0; // Loop back
        }
        return offsets[currentIndex + 1];
      });
      playRadarPing();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Radar sweep angle continuous animation
  const sweepRef = useRef<number | null>(null);
  useEffect(() => {
    let lastTime = performance.now();
    const animateSweep = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setRadarSweepAngle((prev) => (prev + dt * 45) % 360);
      sweepRef.current = requestAnimationFrame(animateSweep);
    };
    sweepRef.current = requestAnimationFrame(animateSweep);
    return () => {
      if (sweepRef.current) cancelAnimationFrame(sweepRef.current);
    };
  }, []);

  // Simulated live lightning discharges around active cells
  useEffect(() => {
    if (!layers.lightning) return;

    const lightningTimer = setInterval(() => {
      const activeCells = cells.filter((c) => c.lightningProb > 40);
      if (activeCells.length === 0) return;

      const randomCell = activeCells[Math.floor(Math.random() * activeCells.length)];
      const dLat = (Math.random() - 0.5) * 0.35;
      const dLng = (Math.random() - 0.5) * 0.35;
      const isCg = Math.random() > 0.4;
      const intensity = -(15 + Math.random() * 45);

      const newStrike: LightningStrike = {
        id: `STRIKE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        lat: randomCell.currentLat + dLat,
        lng: randomCell.currentLng + dLng,
        intensityKa: Number(intensity.toFixed(1)),
        type: isCg ? 'CG' : 'IC',
        timestamp: Date.now(),
        cellId: randomCell.id
      };

      setLightningStrikes((prev) => [...prev.slice(-18), newStrike]);

      if (randomCell.id === selectedCellId && Math.random() > 0.6) {
        playThunderRumble();
      }
    }, 1800);

    return () => clearInterval(lightningTimer);
  }, [cells, layers.lightning, selectedCellId]);

  // Clean old lightning strikes
  useEffect(() => {
    const cleaner = setInterval(() => {
      const now = Date.now();
      setLightningStrikes((prev) => prev.filter((s) => now - s.timestamp < 3200));
    }, 1000);
    return () => clearInterval(cleaner);
  }, []);

  // Live minor telemetry fluctuations every 4s
  useEffect(() => {
    const jitter = setInterval(() => {
      setCells((prev) =>
        prev.map((c) => {
          const delta = (Math.random() - 0.5) * 2;
          const newInt = Math.min(100, Math.max(10, Math.round(c.intensity + delta)));
          return {
            ...c,
            intensity: newInt,
            flashRatePerMin: Math.max(2, Math.round(c.flashRatePerMin + (Math.random() - 0.5) * 3))
          };
        })
      );
    }, 4000);
    return () => clearInterval(jitter);
  }, []);

  // Sensor Dropout Simulation
  const toggleSensorDropout = useCallback(() => {
    playAlertChime();
    setIsDropoutSimulated((prev) => {
      const nextState = !prev;
      if (nextState) {
        setSensors((sList) =>
          sList.map((s) => {
            if (s.type === 'LIGHTNING') {
              return { ...s, status: 'DEGRADED', currentWeight: 0.0, latencySeconds: 999 };
            }
            if (s.type === 'RADAR') {
              return { ...s, currentWeight: 0.46 };
            }
            if (s.type === 'INSAT') {
              return { ...s, currentWeight: 0.39 };
            }
            return s;
          })
        );
        setDropoutNotification(
          'SENSOR DROPOUT DETECTED: IITM Lightning LLN feed unavailable. VARUNA GNN-Attention has dynamically reweighted Radar (+8%) and INSAT IR-10.8µm (+13%). Thunderstorm nowcasting operational at 91.4% CSI.'
        );
      } else {
        setSensors(INITIAL_SENSOR_FEEDS);
        setDropoutNotification('ALL SENSORS NOMINAL: 4/4 Data Pipelines Synced.');
      }
      return nextState;
    });
  }, []);

  const toggleLayer = useCallback((layer: MapLayerType) => {
    playUiTick();
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const selectCell = useCallback((cellId: string | null) => {
    playUiTick();
    setSelectedCellId(cellId);
  }, []);

  const selectedCell = cells.find((c) => c.id === selectedCellId) || null;

  return {
    cells,
    selectedCell,
    selectedCellId,
    selectCell,
    timeOffsetMin,
    setTimeOffsetMin: (val: number) => {
      playUiTick();
      setTimeOffsetMin(val);
    },
    isPlaying,
    setIsPlaying: (val: boolean) => {
      playUiTick();
      setIsPlaying(val);
    },
    playbackSpeed,
    setPlaybackSpeed: (val: number) => {
      playUiTick();
      setPlaybackSpeed(val);
    },
    layers,
    toggleLayer,
    viewMode,
    setViewMode: (mode: ViewEngineMode) => {
      playUiTick();
      setViewMode(mode);
    },
    sensors,
    isDropoutSimulated,
    toggleSensorDropout,
    dropoutNotification,
    clearDropoutNotification: () => setDropoutNotification(null),
    lightningStrikes,
    radarSweepAngle,
    currentUtcTime,
    currentIstTime,
    isAlertsOpen,
    setIsAlertsOpen: (val: boolean) => {
      playUiTick();
      setIsAlertsOpen(val);
    },
    selectedAlertId,
    setSelectedAlertId,
    isFusionModalOpen,
    setIsFusionModalOpen: (val: boolean) => {
      playUiTick();
      setIsFusionModalOpen(val);
    },
    isSensorModalOpen,
    setIsSensorModalOpen: (val: boolean) => {
      playUiTick();
      setIsSensorModalOpen(val);
    },
    isTourOpen,
    setIsTourOpen: (val: boolean) => {
      playUiTick();
      setIsTourOpen(val);
    }
  };
}
