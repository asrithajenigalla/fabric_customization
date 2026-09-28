import React, { useRef, useEffect, useState } from 'react';
import { WeaveType, YarnConfig } from '../types';
import { calculateFabricSpec, generateFabricTextureCanvas, isWarpOnTop } from '../engine/weaveEngine';
import { ZoomIn, ZoomOut, Eye, Grid, Sparkles, Sliders } from 'lucide-react';

interface MacroWeaveViewerProps {
  weaveType: WeaveType;
  yarn: YarnConfig;
  onUpdateYarn: (updates: Partial<YarnConfig>) => void;
}

export const MacroWeaveViewer: React.FC<MacroWeaveViewerProps> = ({
  weaveType,
  yarn,
  onUpdateYarn,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(2.5);
  const [viewMode, setViewMode] = useState<'photoreal' | 'technical_matrix' | 'normal_depth'>('photoreal');
  const [hoveredCoord, setHoveredCoord] = useState<{ x: number; y: number } | null>(null);

  const spec = calculateFabricSpec(weaveType, yarn);

  // Render high-magnification canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (viewMode === 'photoreal') {
      const generated = generateFabricTextureCanvas(weaveType, yarn, width, height, {
        zoomMultiplier: zoomLevel,
      });
      ctx.drawImage(generated, 0, 0);

      // If user hovers, draw subtle loupe reticle
      if (hoveredCoord) {
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hoveredCoord.x - 20, hoveredCoord.y - 20, 40, 40);
      }
    } else if (viewMode === 'normal_depth') {
      const generated = generateFabricTextureCanvas(weaveType, yarn, width, height, {
        showNormalMap: true,
        zoomMultiplier: zoomLevel,
      });
      ctx.drawImage(generated, 0, 0);
    } else if (viewMode === 'technical_matrix') {
      // Drawdown Loom Matrix (Weaving drafting diagram)
      const matrixSize = 16;
      const cellSize = Math.floor(Math.min(width, height) / matrixSize);
      const offsetX = (width - matrixSize * cellSize) / 2;
      const offsetY = (height - matrixSize * cellSize) / 2;

      ctx.fillStyle = '#f8f8f6';
      ctx.fillRect(0, 0, width, height);

      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          const warpUp = isWarpOnTop(c, r, weaveType);
          const px = offsetX + c * cellSize;
          const py = offsetY + r * cellSize;

          if (warpUp) {
            ctx.fillStyle = yarn.warpColor;
            ctx.fillRect(px, py, cellSize, cellSize);
            // Warp indicator line
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
          } else {
            ctx.fillStyle = yarn.weftColor;
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
          }
        }
      }

      // Draw Grid lines
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= matrixSize; i++) {
        ctx.beginPath();
        ctx.moveTo(offsetX + i * cellSize, offsetY);
        ctx.lineTo(offsetX + i * cellSize, offsetY + matrixSize * cellSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + i * cellSize);
        ctx.lineTo(offsetX + matrixSize * cellSize, offsetY + i * cellSize);
        ctx.stroke();
      }
    }
  }, [weaveType, yarn, zoomLevel, viewMode, hoveredCoord]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoveredCoord({ x, y });
  };

  const handleMouseLeave = () => {
    setHoveredCoord(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FDFDFC] overflow-y-auto">
      {/* Top Header & Mode Switcher */}
      <div className="p-4 border-b border-neutral-200/80 flex flex-wrap items-center justify-between gap-3 bg-white/70">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>Thread-Level Macro Inspection Loupe</span>
            <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 uppercase">
              {spec.totalThreadCount} Thread Count
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Interlaced yarn physics, specular luster, and micro fiber slub simulation.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setViewMode('photoreal')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'photoreal' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Tactile Photoreal
          </button>
          <button
            onClick={() => setViewMode('technical_matrix')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'technical_matrix' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Loom Drawdown Matrix
          </button>
          <button
            onClick={() => setViewMode('normal_depth')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'normal_depth' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            3D Relief Normal
          </button>
        </div>
      </div>

      {/* Main Center Canvas with Zoom Controls */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative min-h-[380px] bg-neutral-50/50">
        <div className="relative shadow-xl rounded-xl overflow-hidden border border-neutral-200 bg-white">
          <canvas
            ref={canvasRef}
            width={480}
            height={480}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="cursor-crosshair block"
          />

          {/* Zoom floating controller */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-neutral-200/80 shadow-sm text-xs">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(1.2, prev - 0.4))}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-600"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-neutral-700 min-w-[32px] text-center">
              {zoomLevel.toFixed(1)}x
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(4.5, prev + 0.4))}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-600"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Fabric Technical Specs Grid */}
      <div className="p-5 border-t border-neutral-200/80 bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-neutral-50/80 rounded-lg border border-neutral-200/50">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
              Fabric Weight
            </span>
            <span className="text-lg font-semibold text-neutral-900 font-mono tabular-nums">
              {spec.gsm} <span className="text-xs font-normal text-neutral-500">GSM</span>
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">
              ~{spec.ozPerSqYard} oz/yd²
            </span>
          </div>

          <div className="p-3 bg-neutral-50/80 rounded-lg border border-neutral-200/50">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
              Thread Density
            </span>
            <span className="text-lg font-semibold text-neutral-900 font-mono tabular-nums">
              {spec.epi} <span className="text-xs font-normal text-neutral-500">EPI</span> × {spec.ppi}{' '}
              <span className="text-xs font-normal text-neutral-500">PPI</span>
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">
              Warp Ends / Weft Picks
            </span>
          </div>

          <div className="p-3 bg-neutral-50/80 rounded-lg border border-neutral-200/50">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
              Fiber Composition
            </span>
            <span className="text-lg font-semibold text-neutral-900 capitalize">
              {yarn.fiberType}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">
              {yarn.fiberLuster > 0.6 ? 'Mercerized High Sheen' : 'Natural Combed Finish'}
            </span>
          </div>

          <div className="p-3 bg-neutral-50/80 rounded-lg border border-neutral-200/50">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
              Handfeel & Drape
            </span>
            <span className="text-lg font-semibold text-neutral-900">
              {yarn.slubIntensity > 0.5 ? 'Tactile Slub' : 'Smooth Hand'}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">
              Drape rating: {(1 - spec.drapeCoeff).toFixed(2)} / 1.00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
