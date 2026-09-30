import { useState, useEffect } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { Landing } from './components/Landing';
import { Navbar } from './components/Navbar';
import { AtmosphericMap } from './components/AtmosphericMap';
import { MapControls } from './components/MapControls';
import { StormDetails } from './components/StormDetails';
import { ForecastTimeline } from './components/ForecastTimeline';
import { MetricsBar } from './components/MetricsBar';
import { SensorHealth } from './components/SensorHealth';
import { AlertsPanel } from './components/AlertsPanel';
import { FusionPanel } from './components/FusionPanel';
import { DemoTour } from './components/DemoTour';
import { CAP_ALERTS } from './data/alerts';
import { AlertTriangle, X } from 'lucide-react';

export function App() {
  const [showLanding, setShowLanding] = useState<boolean>(true);

  const {
    cells,
    selectedCell,
    selectedCellId,
    selectCell,
    timeOffsetMin,
    setTimeOffsetMin,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    layers,
    toggleLayer,
    viewMode,
    setViewMode,
    sensors,
    isDropoutSimulated,
    toggleSensorDropout,
    dropoutNotification,
    clearDropoutNotification,
    lightningStrikes,
    radarSweepAngle,
    currentUtcTime,
    currentIstTime,
    isAlertsOpen,
    setIsAlertsOpen,
    selectedAlertId,
    setSelectedAlertId,
    isFusionModalOpen,
    setIsFusionModalOpen,
    isSensorModalOpen,
    setIsSensorModalOpen,
    isTourOpen,
    setIsTourOpen
  } = useSimulation();

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'Escape') {
        selectCell(null);
        setIsAlertsOpen(false);
        setIsFusionModalOpen(false);
        setIsSensorModalOpen(false);
        setIsTourOpen(false);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFusionModalOpen(!isFusionModalOpen);
      } else if (e.key === 'a' || e.key === 'A') {
        setIsAlertsOpen(!isAlertsOpen);
      } else if (e.key === 't' || e.key === 'T') {
        setIsTourOpen(!isTourOpen);
      } else if (e.key === 'd' || e.key === 'D') {
        toggleSensorDropout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    setIsPlaying,
    selectCell,
    isFusionModalOpen,
    setIsFusionModalOpen,
    isAlertsOpen,
    setIsAlertsOpen,
    isTourOpen,
    setIsTourOpen,
    toggleSensorDropout
  ]);

  const activeSensorsCount = sensors.filter((s) => s.status === 'ONLINE').length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070a] text-slate-200">
      {/* 1. Cinematic Landing Screen */}
      {showLanding ? (
        <Landing
          onEnter={() => setShowLanding(false)}
          onEnterWithTour={() => {
            setShowLanding(false);
            setIsTourOpen(true);
          }}
        />
      ) : (
        <div className="relative w-full h-full">
          {/* Top Navigation */}
          <Navbar
            currentIstTime={currentIstTime}
            currentUtcTime={currentUtcTime}
            activeSensorsCount={activeSensorsCount}
            totalSensorsCount={sensors.length}
            isDropoutSimulated={isDropoutSimulated}
            alertsCount={CAP_ALERTS.length}
            onOpenAlerts={() => setIsAlertsOpen(true)}
            onOpenFusion={() => setIsFusionModalOpen(true)}
            onOpenSensorHealth={() => setIsSensorModalOpen(true)}
            onOpenTour={() => setIsTourOpen(true)}
            onSelectScenario={(cellId) => {
              selectCell(cellId);
            }}
          />

          {/* Top-Level Metrics Strip */}
          <MetricsBar cells={cells} isDropoutSimulated={isDropoutSimulated} />

          {/* Core Fullscreen Atmospheric Map & Canvas */}
          <AtmosphericMap
            cells={cells}
            selectedCellId={selectedCellId}
            onSelectCell={selectCell}
            timeOffsetMin={timeOffsetMin}
            layers={layers}
            viewMode={viewMode}
            lightningStrikes={lightningStrikes}
            radarSweepAngle={radarSweepAngle}
            selectedAlertId={selectedAlertId}
            onSelectAlert={setSelectedAlertId}
          />

          {/* Left Layer Controls */}
          <MapControls
            layers={layers}
            onToggleLayer={toggleLayer}
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            radarSweepAngle={radarSweepAngle}
          />

          {/* Right Storm Intelligence Panel */}
          <StormDetails
            cell={selectedCell}
            onClose={() => selectCell(null)}
            sensors={sensors}
            timeOffsetMin={timeOffsetMin}
          />

          {/* Bottom Forecast Timeline */}
          <ForecastTimeline
            timeOffsetMin={timeOffsetMin}
            onSetTimeOffset={setTimeOffsetMin}
            isPlaying={isPlaying}
            onTogglePlay={setIsPlaying}
            playbackSpeed={playbackSpeed}
            onSetPlaybackSpeed={setPlaybackSpeed}
          />

          {/* Sensor Dropout Notification Toast */}
          {dropoutNotification && (
            <div className="fixed top-18 right-4 z-40 max-w-md p-3.5 rounded-xl glass-panel border border-amber-500/40 shadow-2xl font-mono text-xs flex items-start gap-3 animate-fade-in">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-amber-300">
                  {isDropoutSimulated ? 'SENSOR DROPOUT DETECTED' : 'SYSTEM STATUS NORMAL'}
                </div>
                <div className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                  {dropoutNotification}
                </div>
              </div>
              <button
                onClick={clearDropoutNotification}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sensor Health Modal */}
          <SensorHealth
            isOpen={isSensorModalOpen}
            onClose={() => setIsSensorModalOpen(false)}
            sensors={sensors}
            isDropoutSimulated={isDropoutSimulated}
            onToggleDropout={toggleSensorDropout}
          />

          {/* Multi-Source Fusion Modal */}
          <FusionPanel
            isOpen={isFusionModalOpen}
            onClose={() => setIsFusionModalOpen(false)}
            sensors={sensors}
            isDropoutSimulated={isDropoutSimulated}
            onToggleDropout={toggleSensorDropout}
          />

          {/* CAP Alerts Drawer */}
          <AlertsPanel
            isOpen={isAlertsOpen}
            onClose={() => setIsAlertsOpen(false)}
            selectedAlertId={selectedAlertId}
            onSelectAlert={setSelectedAlertId}
            onSelectCell={(cellId) => selectCell(cellId)}
          />

          {/* Interactive Guided Demo Tour */}
          <DemoTour
            isOpen={isTourOpen}
            onClose={() => setIsTourOpen(false)}
            onSelectCell={selectCell}
            onSetTimeOffset={setTimeOffsetMin}
            onOpenFusion={() => setIsFusionModalOpen(true)}
            onCloseFusion={() => setIsFusionModalOpen(false)}
            onOpenAlerts={() => setIsAlertsOpen(true)}
            onCloseAlerts={() => setIsAlertsOpen(false)}
            onToggleDropout={toggleSensorDropout}
            isDropoutSimulated={isDropoutSimulated}
          />
        </div>
      )}
    </div>
  );
}

export default App;
