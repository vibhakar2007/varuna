import React, { useEffect, useRef, useState } from 'react';
import type { StormCell, LightningStrike, ViewEngineMode } from '../types/storm';
import { IMD_RADAR_STATIONS } from '../data/radarStations';
import { CAP_ALERTS } from '../data/alerts';
import { 
  INDIA_MAINLAND_OUTLINE, 
  STATE_BOUNDARIES, 
  SRI_LANKA_OUTLINE, 
  STRATEGIC_CITIES 
} from '../data/indiaGeo';
import { getDbzColor } from '../utils/mapStyles';
import { playThunderRumble } from '../utils/audio';
import { Compass, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface AtmosphericMapProps {
  cells: StormCell[];
  selectedCellId: string | null;
  onSelectCell: (id: string | null) => void;
  timeOffsetMin: number;
  layers: {
    radar: boolean;
    satellite: boolean;
    lightning: boolean;
    nwp: boolean;
    cells: boolean;
  };
  viewMode: ViewEngineMode;
  lightningStrikes: LightningStrike[];
  radarSweepAngle: number;
  selectedAlertId: string | null;
  onSelectAlert: (id: string | null) => void;
}

// Mathematical Web Mercator projection (Exact GIS standard)
function projectMercator(
  lng: number,
  lat: number,
  centerLng: number,
  centerLat: number,
  zoom: number,
  width: number,
  height: number
) {
  const scale = (256 / Math.PI) * Math.pow(2, zoom);

  const centerLatRad = (Math.max(-85, Math.min(85, centerLat)) * Math.PI) / 180;
  const centerY = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));
  const centerX = (centerLng * Math.PI) / 180;

  const latRad = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
  const pointY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const pointX = (lng * Math.PI) / 180;

  const x = width / 2 + (pointX - centerX) * scale;
  const y = height / 2 - (pointY - centerY) * scale;

  return { x, y };
}

function unprojectMercator(
  x: number,
  y: number,
  centerLng: number,
  centerLat: number,
  zoom: number,
  width: number,
  height: number
) {
  const scale = (256 / Math.PI) * Math.pow(2, zoom);

  const centerLatRad = (centerLat * Math.PI) / 180;
  const centerY = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));
  const centerX = (centerLng * Math.PI) / 180;

  const pointX = (x - width / 2) / scale + centerX;
  const pointY = centerY - (y - height / 2) / scale;

  const lng = (pointX * 180) / Math.PI;
  const latRad = 2 * Math.atan(Math.exp(pointY)) - Math.PI / 2;
  const lat = (latRad * 180) / Math.PI;

  return { lng, lat };
}

export const AtmosphericMap: React.FC<AtmosphericMapProps> = ({
  cells,
  selectedCellId,
  onSelectCell,
  timeOffsetMin,
  layers,
  lightningStrikes,
  radarSweepAngle,
  selectedAlertId,
  onSelectAlert
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera viewport state (India centered by default)
  const [center, setCenter] = useState<{ lng: number; lat: number }>({ lng: 80.5, lat: 21.0 });
  const [zoom, setZoom] = useState<number>(3.1);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Dragging state for smooth panning
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; centerLng: number; centerLat: number }>({
    x: 0,
    y: 0,
    centerLng: 80.5,
    centerLat: 21.0
  });

  // Smooth camera animation target
  const targetCameraRef = useRef<{ lng: number; lat: number; zoom: number } | null>(null);

  // NWP particle flow simulation
  const particlesRef = useRef<
    Array<{ x: number; y: number; age: number; maxAge: number; speed: number; angle: number }>
  >([]);

  useEffect(() => {
    const pts = [];
    for (let i = 0; i < 140; i++) {
      pts.push({
        x: Math.random() * 1400,
        y: Math.random() * 900,
        age: Math.floor(Math.random() * 60),
        maxAge: 40 + Math.random() * 60,
        speed: 0.9 + Math.random() * 1.5,
        angle: (35 + Math.random() * 25) * (Math.PI / 180) // General SW-NE monsoon/shear
      });
    }
    particlesRef.current = pts;
  }, []);

  // Smooth camera animation loop (flyTo)
  useEffect(() => {
    let animId: number;
    const animateCamera = () => {
      if (targetCameraRef.current) {
        const target = targetCameraRef.current;
        const dLng = target.lng - center.lng;
        const dLat = target.lat - center.lat;
        const dZoom = target.zoom - zoom;

        if (Math.abs(dLng) < 0.01 && Math.abs(dLat) < 0.01 && Math.abs(dZoom) < 0.01) {
          setCenter({ lng: target.lng, lat: target.lat });
          setZoom(target.zoom);
          targetCameraRef.current = null;
        } else {
          setCenter((prev) => ({
            lng: prev.lng + dLng * 0.12,
            lat: prev.lat + dLat * 0.12
          }));
          setZoom((prev) => prev + dZoom * 0.12);
        }
      }
      animId = requestAnimationFrame(animateCamera);
    };
    animId = requestAnimationFrame(animateCamera);
    return () => cancelAnimationFrame(animId);
  }, [center, zoom]);

  // When a storm cell is selected, smoothly fly to it
  useEffect(() => {
    if (!selectedCellId) return;
    const cell = cells.find((c) => c.id === selectedCellId);
    if (!cell) return;

    targetCameraRef.current = {
      lng: cell.currentLng,
      lat: cell.currentLat,
      zoom: 4.1
    };
  }, [selectedCellId, cells]);

  // When an alert is selected, smoothly fly to it
  useEffect(() => {
    if (!selectedAlertId) return;
    const alert = CAP_ALERTS.find((a) => a.id === selectedAlertId);
    if (!alert || alert.coordinates.length === 0) return;

    const centerLng =
      alert.coordinates.reduce((acc, curr) => acc + curr[0], 0) / alert.coordinates.length;
    const centerLat =
      alert.coordinates.reduce((acc, curr) => acc + curr[1], 0) / alert.coordinates.length;

    targetCameraRef.current = {
      lng: centerLng,
      lat: centerLat,
      zoom: 4.3
    };
  }, [selectedAlertId]);

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.2 : -0.2;
    setZoom((prev) => Math.max(2.4, Math.min(6.5, prev + zoomDelta)));
  };

  // Drag start
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Left click only
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      centerLng: center.lng,
      centerLat: center.lat
    };
  };

  // Dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Update real-world coordinate readout
    const geo = unprojectMercator(
      mouseX,
      mouseY,
      center.lng,
      center.lat,
      zoom,
      canvas.width,
      canvas.height
    );
    setMouseCoords({
      lat: Number(geo.lat.toFixed(4)),
      lng: Number(geo.lng.toFixed(4))
    });

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      const scale = (256 / Math.PI) * Math.pow(2, zoom);
      const dLng = -(dx / scale) * (180 / Math.PI);
      const dLat = (dy / scale) * (180 / Math.PI);

      setCenter({
        lng: dragStartRef.current.centerLng + dLng,
        lat: Math.max(5, Math.min(38, dragStartRef.current.centerLat + dLat))
      });
      targetCameraRef.current = null; // Interrupt ongoing auto-animation
    }
  };

  // Drag end
  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Click on Canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check distance to storm cells
    let clickedCellId: string | null = null;
    let minDistance = 35;

    cells.forEach((cell) => {
      const pt = projectMercator(
        cell.currentLng,
        cell.currentLat,
        center.lng,
        center.lat,
        zoom,
        canvas.width,
        canvas.height
      );
      const dist = Math.hypot(pt.x - clickX, pt.y - clickY);
      if (dist < minDistance) {
        minDistance = dist;
        clickedCellId = cell.id;
      }
    });

    if (clickedCellId) {
      onSelectCell(clickedCellId);
      playThunderRumble();
    } else {
      // Check if clicked inside CAP alert
      let clickedAlertId: string | null = null;
      CAP_ALERTS.forEach((alert) => {
        if (alert.coordinates.length < 3) return;
        const pt = projectMercator(
          alert.coordinates[0][0],
          alert.coordinates[0][1],
          center.lng,
          center.lat,
          zoom,
          canvas.width,
          canvas.height
        );
        const dist = Math.hypot(pt.x - clickX, pt.y - clickY);
        if (dist < 45) {
          clickedAlertId = alert.id;
        }
      });

      if (clickedAlertId) {
        onSelectAlert(clickedAlertId);
      } else {
        onSelectCell(null);
      }
    }
  };

  // Main High-Performance Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Helper for projecting points with current center & zoom
      const project = (lng: number, lat: number) =>
        projectMercator(lng, lat, center.lng, center.lat, zoom, width, height);

      // 1. DEEP OCEANIC BACKGROUND & SUB-CONTINENTAL SEA GRADIENTS
      const oceanGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      oceanGrad.addColorStop(0, '#060911');
      oceanGrad.addColorStop(0.5, '#05070c');
      oceanGrad.addColorStop(1, '#020306');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. LAT/LON GRATICULE GRID LINES
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);

      const latitudes = [10, 15, 20, 25, 30, 35];
      const longitudes = [68, 72, 76, 80, 84, 88, 92, 96];

      latitudes.forEach((lat) => {
        const p1 = project(64, lat);
        const p2 = project(100, lat);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`${lat}°00' N`, p1.x + 8, p1.y - 4);
      });

      longitudes.forEach((lng) => {
        const p1 = project(lng, 6);
        const p2 = project(lng, 38);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`${lng}°00' E`, p1.x + 4, p1.y + 14);
      });
      ctx.restore();

      // 3. SRI LANKA OUTLINE (Southern context)
      ctx.save();
      const slPoints = SRI_LANKA_OUTLINE.map((coord) => project(coord[0], coord[1]));
      if (slPoints.length > 2) {
        ctx.beginPath();
        ctx.moveTo(slPoints[0].x, slPoints[0].y);
        for (let i = 1; i < slPoints.length; i++) {
          ctx.lineTo(slPoints[i].x, slPoints[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = '#0b0f19';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // 4. INDIA MAINLAND VECTOR BASEMAP
      ctx.save();
      const mainlandPoints = INDIA_MAINLAND_OUTLINE.map((coord) => project(coord[0], coord[1]));

      if (mainlandPoints.length > 2) {
        ctx.beginPath();
        ctx.moveTo(mainlandPoints[0].x, mainlandPoints[0].y);
        for (let i = 1; i < mainlandPoints.length; i++) {
          ctx.lineTo(mainlandPoints[i].x, mainlandPoints[i].y);
        }
        ctx.closePath();

        // Atmospheric Landmass Fill
        const landGrad = ctx.createLinearGradient(0, 0, width, height);
        landGrad.addColorStop(0, '#0d1322');
        landGrad.addColorStop(1, '#090e18');
        ctx.fillStyle = landGrad;
        ctx.fill();

        // Coastline Glow & Stroke
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      ctx.restore();

      // 5. REGIONAL STATE BOUNDARIES (Subtle technical borders)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      STATE_BOUNDARIES.forEach((st) => {
        const pts = st.path.map((coord) => project(coord[0], coord[1]));
        if (pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      });
      ctx.restore();

      // 6. STRATEGIC METROS & RADAR SITES (Reference labels)
      ctx.save();
      STRATEGIC_CITIES.forEach((city) => {
        const pt = project(city.lng, city.lat);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText(city.name, pt.x + 5, pt.y + 3);
      });
      ctx.restore();

      // 7. SATELLITE MODE (Thermal Infrared Cloud Top Simulation)
      if (layers.satellite) {
        ctx.save();
        cells.forEach((cell) => {
          const pt = project(cell.currentLng, cell.currentLat);
          const rad = (cell.intensity / 100) * (zoom * 26) + 30;

          const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, rad);
          grad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
          grad.addColorStop(0.35, 'rgba(45, 85, 155, 0.16)');
          grad.addColorStop(0.7, 'rgba(20, 35, 65, 0.10)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 8. CAP ALERT POLYGONS
      ctx.save();
      CAP_ALERTS.forEach((alert) => {
        if (alert.coordinates.length < 3) return;

        const isSelected = selectedAlertId === alert.id;
        const screenPoints = alert.coordinates.map((coord) => project(coord[0], coord[1]));

        ctx.beginPath();
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
        for (let i = 1; i < screenPoints.length; i++) {
          ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }
        ctx.closePath();

        const alertColor =
          alert.severity === 'Extreme' ? 'rgba(239, 68, 68,' : 'rgba(245, 158, 11,';

        ctx.fillStyle = `${alertColor} ${isSelected ? '0.18' : '0.08'})`;
        ctx.fill();

        ctx.strokeStyle = `${alertColor} ${isSelected ? '0.9' : '0.5'})`;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.setLineDash(isSelected ? [6, 3] : [4, 4]);
        ctx.stroke();

        const centerPt = screenPoints[0];
        ctx.fillStyle = alert.severity === 'Extreme' ? '#ef4444' : '#f59e0b';
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.fillText(`CAP: ${alert.areaDesc.split(':')[0]}`, centerPt.x + 12, centerPt.y);
      });
      ctx.restore();

      // 9. RADAR SWEEPS (IMD Doppler Weather Radar Sites)
      if (layers.radar) {
        ctx.save();
        IMD_RADAR_STATIONS.forEach((station) => {
          const pt = project(station.lng, station.lat);
          const radius = (station.rangeKm / 111) * (zoom * 7.5);

          // Station perimeter range
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.stroke();

          // Radar sweeping beam
          const sweepRad = (radarSweepAngle * Math.PI) / 180;
          const sectorAngle = 0.45;

          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.arc(pt.x, pt.y, radius, sweepRad - sectorAngle, sweepRad);
          ctx.closePath();

          const sweepGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);
          sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
          sweepGrad.addColorStop(1, 'rgba(0, 240, 255, 0.01)');
          ctx.fillStyle = sweepGrad;
          ctx.fill();

          // Station center emitter dot
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 10. NWP ENVIRONMENTAL FLOW PARTICLES
      if (layers.nwp) {
        ctx.save();
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
        ctx.lineWidth = 1;

        particlesRef.current.forEach((p) => {
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;
          p.age++;

          if (p.age > p.maxAge || p.x > width || p.y > height || p.x < 0 || p.y < 0) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.age = 0;
          }

          const lifeFactor = Math.sin((p.age / p.maxAge) * Math.PI);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - Math.cos(p.angle) * 7, p.y - Math.sin(p.angle) * 7);
          ctx.globalAlpha = lifeFactor * 0.4;
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // 11. STORM CELLS & TRAJECTORIES
      if (layers.cells) {
        cells.forEach((cell) => {
          const isSelected = selectedCellId === cell.id;
          const currentPoint = project(cell.currentLng, cell.currentLat);

          ctx.save();

          // Trajectory Waypoints
          const waypoints = cell.forecast.map((fc) => project(fc.lng, fc.lat));

          if (waypoints.length > 1) {
            ctx.beginPath();
            ctx.moveTo(waypoints[0].x, waypoints[0].y);
            for (let i = 1; i < waypoints.length; i++) {
              ctx.lineTo(waypoints[i].x, waypoints[i].y);
            }
            ctx.strokeStyle = isSelected
              ? 'rgba(0, 240, 255, 0.7)'
              : 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.setLineDash(isSelected ? [4, 4] : [2, 3]);
            ctx.stroke();

            waypoints.forEach((wp, idx) => {
              const fc = cell.forecast[idx];
              ctx.beginPath();
              ctx.arc(wp.x, wp.y, idx === 0 ? 3 : 2, 0, Math.PI * 2);
              ctx.fillStyle =
                fc.timeOffsetMin === timeOffsetMin
                  ? '#00f0ff'
                  : 'rgba(255, 255, 255, 0.5)';
              ctx.fill();

              if (isSelected && (idx === 1 || idx === 3 || idx === 5)) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '8px "JetBrains Mono", monospace';
                ctx.fillText(`+${fc.timeOffsetMin}m`, wp.x + 6, wp.y + 3);
              }
            });
          }

          // Forecast Dispersion Ellipse
          const currentFc =
            cell.forecast.find((f) => f.timeOffsetMin === timeOffsetMin) || cell.forecast[0];
          const dispersionPx = (currentFc.dispersionRadiusKm / 111) * (zoom * 8);

          ctx.beginPath();
          ctx.ellipse(
            currentPoint.x,
            currentPoint.y,
            dispersionPx * 1.3,
            dispersionPx * 0.9,
            (cell.azimuthDeg * Math.PI) / 180,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = isSelected
            ? 'rgba(0, 240, 255, 0.45)'
            : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.stroke();

          // Reflectivity Contours (dBZ rings)
          const coreRadius = Math.max(14, (cell.intensity / 100) * (zoom * 9));
          const dbzColor = getDbzColor(cell.intensity);

          const radialGrad = ctx.createRadialGradient(
            currentPoint.x,
            currentPoint.y,
            coreRadius * 0.1,
            currentPoint.x,
            currentPoint.y,
            coreRadius
          );
          radialGrad.addColorStop(0, `${dbzColor}99`);
          radialGrad.addColorStop(0.5, `${dbzColor}44`);
          radialGrad.addColorStop(1, `${dbzColor}00`);

          ctx.fillStyle = radialGrad;
          ctx.beginPath();
          ctx.arc(currentPoint.x, currentPoint.y, coreRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#00f0ff' : dbzColor;
          ctx.lineWidth = isSelected ? 2 : 1.2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(currentPoint.x, currentPoint.y, coreRadius * 0.45, 0, Math.PI * 2);
          ctx.stroke();

          // Velocity Vector Arrow
          const arrowLength = (cell.velocityKmH / 35) * (zoom * 6);
          const arrowAngle = (cell.azimuthDeg - 90) * (Math.PI / 180);
          const arrowEndX = currentPoint.x + Math.cos(arrowAngle) * arrowLength;
          const arrowEndY = currentPoint.y + Math.sin(arrowAngle) * arrowLength;

          ctx.strokeStyle = isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(currentPoint.x, currentPoint.y);
          ctx.lineTo(arrowEndX, arrowEndY);
          ctx.stroke();

          const tipAngle = 0.4;
          const tipLen = 6;
          ctx.fillStyle = isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.moveTo(arrowEndX, arrowEndY);
          ctx.lineTo(
            arrowEndX - tipLen * Math.cos(arrowAngle - tipAngle),
            arrowEndY - tipLen * Math.sin(arrowAngle - tipAngle)
          );
          ctx.lineTo(
            arrowEndX - tipLen * Math.cos(arrowAngle + tipAngle),
            arrowEndY - tipLen * Math.sin(arrowAngle + tipAngle)
          );
          ctx.closePath();
          ctx.fill();

          // Cell Metadata Badge
          const badgeX = currentPoint.x + coreRadius * 0.6 + 6;
          const badgeY = currentPoint.y - 12;

          ctx.fillStyle = 'rgba(7, 10, 16, 0.85)';
          ctx.strokeStyle = isSelected
            ? 'rgba(0, 240, 255, 0.6)'
            : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, 96, 26, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isSelected ? '#00f0ff' : '#f8fafc';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillText(cell.id, badgeX + 6, badgeY + 12);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillText(`${cell.intensity}% | ⚡${cell.lightningProb}%`, badgeX + 6, badgeY + 22);

          // Selection Reticle Crosshair
          if (isSelected) {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
            ctx.lineWidth = 1.2;
            const reticleSize = coreRadius + 10;
            const b = 6;

            ctx.beginPath();
            ctx.moveTo(currentPoint.x - reticleSize, currentPoint.y - reticleSize + b);
            ctx.lineTo(currentPoint.x - reticleSize, currentPoint.y - reticleSize);
            ctx.lineTo(currentPoint.x - reticleSize + b, currentPoint.y - reticleSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(currentPoint.x + reticleSize - b, currentPoint.y - reticleSize);
            ctx.lineTo(currentPoint.x + reticleSize, currentPoint.y - reticleSize);
            ctx.lineTo(currentPoint.x + reticleSize, currentPoint.y - reticleSize + b);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(currentPoint.x - reticleSize, currentPoint.y + reticleSize - b);
            ctx.lineTo(currentPoint.x - reticleSize, currentPoint.y + reticleSize);
            ctx.lineTo(currentPoint.x - reticleSize + b, currentPoint.y + reticleSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(currentPoint.x + reticleSize - b, currentPoint.y + reticleSize);
            ctx.lineTo(currentPoint.x + reticleSize, currentPoint.y + reticleSize);
            ctx.lineTo(currentPoint.x + reticleSize, currentPoint.y + reticleSize - b);
            ctx.stroke();
          }

          ctx.restore();
        });
      }

      // 12. REAL-TIME LIGHTNING FLASHES
      if (layers.lightning && lightningStrikes.length > 0) {
        ctx.save();
        const now = Date.now();

        lightningStrikes.forEach((strike) => {
          const ageMs = now - strike.timestamp;
          if (ageMs > 2500) return;

          const progress = ageMs / 2500;
          const alpha = Math.max(0, 1 - progress);
          const pt = project(strike.lng, strike.lat);

          const ringRad = 8 + progress * 24;
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.7})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, ringRad, 0, Math.PI * 2);
          ctx.stroke();

          const flashRad = Math.max(2, 6 * (1 - progress * 1.5));
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, flashRad, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(180, 240, 255, ${alpha * 0.9})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - 14);
          ctx.lineTo(pt.x - 3, pt.y - 6);
          ctx.lineTo(pt.x + 3, pt.y);
          ctx.lineTo(pt.x, pt.y + 4);
          ctx.stroke();

          if (progress < 0.6) {
            ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.8})`;
            ctx.font = '7px "JetBrains Mono", monospace';
            ctx.fillText(`${strike.intensityKa}kA`, pt.x + 8, pt.y - 4);
          }
        });

        ctx.restore();
      }

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [
    center,
    zoom,
    cells,
    selectedCellId,
    timeOffsetMin,
    layers,
    lightningStrikes,
    radarSweepAngle,
    selectedAlertId
  ]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(6.5, prev + 0.5));
  };
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(2.4, prev - 0.5));
  };
  const handleResetOverview = () => {
    targetCameraRef.current = {
      lng: 80.5,
      lat: 21.0,
      zoom: 3.1
    };
    onSelectCell(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#05070a]">
      {/* 100% Standalone Canvas Engine */}
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full cursor-crosshair active:cursor-grabbing z-10"
      />

      {/* Floating Coordinates & Telemetry Stamp (Bottom Left) */}
      <div className="absolute bottom-20 left-4 z-20 hidden md:flex items-center gap-3 px-3 py-1.5 glass-panel rounded border border-white/[0.08] text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Compass className="w-3.5 h-3.5" />
          <span>SUB-CONTINENT</span>
        </div>
        <div className="w-[1px] h-3 bg-white/10" />
        <div>
          {mouseCoords ? (
            <span>
              {mouseCoords.lat.toFixed(4)}°N, {mouseCoords.lng.toFixed(4)}°E
            </span>
          ) : (
            <span>20.5937°N, 78.9629°E</span>
          )}
        </div>
        <div className="w-[1px] h-3 bg-white/10" />
        <div className="text-slate-400">
          ZOOM: <span className="text-white">{zoom.toFixed(1)}x</span>
        </div>
        <div className="w-[1px] h-3 bg-white/10" />
        <div className="text-slate-400">
          GRID: <span className="text-white">1.0 km²</span>
        </div>
      </div>

      {/* Quick Map Floating Controls (Bottom Right above timeline) */}
      <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded glass-panel flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded glass-panel flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetOverview}
          title="Reset to India Sub-Continent Overview"
          className="w-8 h-8 rounded glass-panel flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
