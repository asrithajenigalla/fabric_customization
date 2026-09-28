import React, { useRef, useState } from 'react';
import {
  BlendMode,
  FiberType,
  GarmentId,
  PrintConfig,
  RepeatMode,
  WeaveType,
  YarnConfig,
  ZoneConfig,
  ZoneId,
} from '../types';
import { GARMENTS } from '../data/garments';
import { CURATED_COLORWAYS, DESIGNER_PRESETS, WEAVE_ARCHETYPES } from '../data/presets';
import { CURATED_PRINTS } from '../engine/printEngine';
import {
  Palette,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Layers,
  Upload,
  RotateCw,
  Maximize2,
  Check,
  ChevronDown,
} from 'lucide-react';

interface CustomizerSidebarProps {
  garmentId: GarmentId;
  onSelectGarment: (id: GarmentId) => void;
  weaveType: WeaveType;
  onSelectWeave: (weave: WeaveType) => void;
  yarn: YarnConfig;
  onUpdateYarn: (updates: Partial<YarnConfig>) => void;
  print?: PrintConfig;
  onUpdatePrint: (print?: PrintConfig) => void;
  contrastZones: Record<ZoneId, Partial<ZoneConfig>>;
  onUpdateZone: (zoneId: ZoneId, updates: Partial<ZoneConfig> | null) => void;
  activeZoneId: ZoneId;
  onSelectZone: (zoneId: ZoneId) => void;
  onApplyPreset: (presetId: string) => void;
  onUploadCustomPrint: (img: HTMLImageElement | null) => void;
}

export const CustomizerSidebar: React.FC<CustomizerSidebarProps> = ({
  garmentId,
  onSelectGarment,
  weaveType,
  onSelectWeave,
  yarn,
  onUpdateYarn,
  print,
  onUpdatePrint,
  contrastZones,
  onUpdateZone,
  activeZoneId,
  onSelectZone,
  onApplyPreset,
  onUploadCustomPrint,
}) => {
  const [activeTab, setActiveTab] = useState<'weave' | 'yarn' | 'print' | 'zones' | 'presets'>('weave');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentGarment = GARMENTS.find((g) => g.id === garmentId) || GARMENTS[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        onUploadCustomPrint(img);
        onUpdatePrint({
          id: 'custom_upload',
          name: file.name.replace(/\.[^/.]+$/, ''),
          scale: 1.0,
          rotation: 0,
          repeatMode: 'grid',
          blendMode: 'multiply',
          opacity: 0.85,
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isZoneContrastActive = !!contrastZones[activeZoneId];

  return (
    <div className="w-full h-full flex flex-col bg-white border-l border-neutral-200/80 shadow-sm overflow-hidden">
      {/* Category Navigation Tabs */}
      <div className="flex items-center border-b border-neutral-200/80 px-2 bg-neutral-50/60 overflow-x-auto text-xs font-medium shrink-0">
        <button
          onClick={() => setActiveTab('weave')}
          className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'weave'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Weave Pattern</span>
        </button>

        <button
          onClick={() => setActiveTab('yarn')}
          className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'yarn'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Yarn & Fiber</span>
        </button>

        <button
          onClick={() => setActiveTab('print')}
          className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'print'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Prints & Decals</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'zones'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Multi-Zones</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'presets'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Presets</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* ================= WEAVE PATTERN TAB ================= */}
        {activeTab === 'weave' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Textile Weave Architecture</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Select interlacing structure to determine drape, handfeel, and surface luster.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WEAVE_ARCHETYPES.map((arch) => {
                const isSelected = weaveType === arch.id;
                return (
                  <button
                    key={arch.id}
                    onClick={() => onSelectWeave(arch.id)}
                    className={`text-left p-3 rounded-lg border transition-all relative ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                        : 'border-neutral-200/90 bg-neutral-50/50 hover:border-neutral-400 text-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{arch.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span
                      className={`text-[10px] block mt-0.5 font-medium ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {arch.category}
                    </span>
                    <p
                      className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-600'
                      }`}
                    >
                      {arch.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Yarn Gauge & Slub Controls */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-4">
              <h5 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Yarn Thickness & Surface Texture
              </h5>

              <div>
                <div className="flex justify-between text-xs text-neutral-700 mb-1">
                  <span>Yarn Gauge</span>
                  <span className="font-mono text-neutral-500">
                    {yarn.threadGauge === 1
                      ? 'Superfine 80s'
                      : yarn.threadGauge === 2
                      ? 'Fine 50s'
                      : yarn.threadGauge === 3
                      ? 'Medium 30s'
                      : yarn.threadGauge === 4
                      ? 'Heavy 16s'
                      : 'Chunky 8s'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={yarn.threadGauge}
                  onChange={(e) => onUpdateYarn({ threadGauge: parseInt(e.target.value) })}
                  className="w-full accent-neutral-900 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-neutral-700 mb-1">
                  <span>Artisanal Slub (Raw Linen Texture)</span>
                  <span className="font-mono text-neutral-500">{Math.round(yarn.slubIntensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={yarn.slubIntensity}
                  onChange={(e) => onUpdateYarn({ slubIntensity: parseFloat(e.target.value) })}
                  className="w-full accent-neutral-900 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= YARN & FIBER TAB ================= */}
        {activeTab === 'yarn' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Warp & Weft Yarn Colorways</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Customize vertical warp and horizontal weft threads independently for rich cross-dyed chambray and iridescent effects.
              </p>
            </div>

            {/* Warp Yarn Color */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-800 block">Warp Yarn (Vertical)</span>
                  <span className="text-[11px] text-neutral-500">Structural longitudinal threads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-neutral-300 shadow-sm"
                    style={{ backgroundColor: yarn.warpColor }}
                  />
                  <input
                    type="color"
                    value={yarn.warpColor}
                    onChange={(e) => onUpdateYarn({ warpColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                </div>
              </div>

              {/* Quick Swatches */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['#1C1B1A', '#F4F2EC', '#1E3A8A', '#2D4A3E', '#9A3412', '#716558', '#CBD5E1'].map(
                  (hex) => (
                    <button
                      key={hex}
                      onClick={() => onUpdateYarn({ warpColor: hex })}
                      className="w-6 h-6 rounded-full border border-neutral-300 transition-transform hover:scale-110"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  )
                )}
              </div>
            </div>

            {/* Weft Yarn Color */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-800 block">Weft Yarn (Horizontal)</span>
                  <span className="text-[11px] text-neutral-500">Crosswise picks interlacing across width</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-neutral-300 shadow-sm"
                    style={{ backgroundColor: yarn.weftColor }}
                  />
                  <input
                    type="color"
                    value={yarn.weftColor}
                    onChange={(e) => onUpdateYarn({ weftColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                </div>
              </div>

              {/* Quick Swatches */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['#F4F2EC', '#DDD2C1', '#1C1B1A', '#93C5FD', '#84A98C', '#D97706', '#581C2B'].map(
                  (hex) => (
                    <button
                      key={hex}
                      onClick={() => onUpdateYarn({ weftColor: hex })}
                      className="w-6 h-6 rounded-full border border-neutral-300 transition-transform hover:scale-110"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  )
                )}
              </div>
            </div>

            {/* Fiber Material & Luster */}
            <div className="space-y-4">
              <h5 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Fiber Base & Sheen
              </h5>

              <div className="grid grid-cols-3 gap-2">
                {(['silk', 'linen', 'wool', 'cotton', 'cashmere', 'hemp'] as FiberType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      const lusterMap: Record<FiberType, number> = {
                        silk: 0.9,
                        linen: 0.2,
                        wool: 0.45,
                        cotton: 0.35,
                        cashmere: 0.5,
                        hemp: 0.15,
                      };
                      onUpdateYarn({ fiberType: f, fiberLuster: lusterMap[f] });
                    }}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium capitalize text-center transition-all ${
                      yarn.fiberType === f
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                        : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-xs text-neutral-700 mb-1">
                  <span>Fiber Specular Luster</span>
                  <span className="font-mono text-neutral-500">{Math.round(yarn.fiberLuster * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={yarn.fiberLuster}
                  onChange={(e) => onUpdateYarn({ fiberLuster: parseFloat(e.target.value) })}
                  className="w-full accent-neutral-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Curated Colorway Palettes */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Atelier Seasonal Palettes
              </h5>
              <div className="space-y-3">
                {CURATED_COLORWAYS.map((cw, i) => (
                  <div key={i} className="p-3 bg-neutral-50/70 rounded-lg border border-neutral-200/60">
                    <span className="text-[11px] font-medium text-neutral-600 block mb-2">
                      {cw.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {cw.colors.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            // Apply harmonized warp/weft
                            onUpdateYarn({
                              warpColor: c.hex,
                              weftColor: cw.colors[0].hex === c.hex ? cw.colors[1].hex : cw.colors[0].hex,
                            });
                          }}
                          className="group relative flex flex-col items-center"
                          title={`${c.name} (${c.pantone})`}
                        >
                          <div
                            className="w-8 h-8 rounded-md border border-neutral-300 shadow-xs transition-transform group-hover:scale-105"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[9px] text-neutral-500 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute -bottom-5 bg-black text-white px-1 rounded z-20 pointer-events-none">
                            {c.pantone}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= PRINTS & DECALS TAB ================= */}
        {activeTab === 'print' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Textile Prints & Surface Ornament</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Apply heritage engravings, modernist geometric repeats, or upload custom artwork.
              </p>
            </div>

            {/* Curated Prints Selector */}
            <div className="grid grid-cols-2 gap-2.5">
              {CURATED_PRINTS.map((pr) => {
                const isActive = print?.id === pr.id;
                return (
                  <button
                    key={pr.id}
                    onClick={() => {
                      if (isActive) {
                        onUpdatePrint(undefined);
                      } else {
                        onUpdatePrint({
                          id: pr.id,
                          name: pr.name,
                          scale: 1.0,
                          rotation: 0,
                          repeatMode: 'half_drop',
                          blendMode: 'multiply',
                          opacity: 0.75,
                        });
                      }
                    }}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                        : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-400 text-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{pr.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span
                      className={`text-[10px] block mt-0.5 font-medium ${
                        isActive ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {pr.category}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Upload Artwork */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-dashed border-neutral-300 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-medium rounded-lg text-neutral-700 shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Print (PNG / JPEG)</span>
              </button>
              <p className="text-[11px] text-neutral-400 mt-2">
                Seamless tiles or placement motifs will drape over the woven cloth.
              </p>
            </div>

            {/* Print Settings (if active) */}
            {print && (
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-900">
                    Active: {print.name}
                  </span>
                  <button
                    onClick={() => onUpdatePrint(undefined)}
                    className="text-xs text-rose-600 hover:text-rose-700 underline font-medium"
                  >
                    Remove Print
                  </button>
                </div>

                {/* Repeat Mode */}
                <div>
                  <span className="text-xs text-neutral-700 block mb-1.5 font-medium">
                    Repeat Pattern Geometry
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-xs">
                    {(['grid', 'half_drop', 'mirror', 'single'] as RepeatMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => onUpdatePrint({ ...print, repeatMode: mode })}
                        className={`py-1.5 px-1 rounded border text-[11px] capitalize text-center ${
                          print.repeatMode === mode
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {mode.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blend Mode */}
                <div>
                  <span className="text-xs text-neutral-700 block mb-1.5 font-medium">
                    Textile Dye Blend Mode
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-xs">
                    {(['multiply', 'overlay', 'normal', 'screen'] as BlendMode[]).map((bm) => (
                      <button
                        key={bm}
                        onClick={() => onUpdatePrint({ ...print, blendMode: bm })}
                        className={`py-1.5 px-1 rounded border text-[11px] capitalize text-center ${
                          print.blendMode === bm
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {bm}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <div className="flex justify-between text-xs text-neutral-700 mb-1">
                    <span>Print Scale</span>
                    <span className="font-mono text-neutral-500">{print.scale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.5"
                    step="0.05"
                    value={print.scale}
                    onChange={(e) => onUpdatePrint({ ...print, scale: parseFloat(e.target.value) })}
                    className="w-full accent-neutral-900 cursor-pointer"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex justify-between text-xs text-neutral-700 mb-1">
                    <span>Angle Rotation</span>
                    <span className="font-mono text-neutral-500">{print.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={print.rotation}
                    onChange={(e) => onUpdatePrint({ ...print, rotation: parseInt(e.target.value) })}
                    className="w-full accent-neutral-900 cursor-pointer"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex justify-between text-xs text-neutral-700 mb-1">
                    <span>Dye Saturation / Opacity</span>
                    <span className="font-mono text-neutral-500">{Math.round(print.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={print.opacity}
                    onChange={(e) => onUpdatePrint({ ...print, opacity: parseFloat(e.target.value) })}
                    className="w-full accent-neutral-900 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= MULTI-ZONES TAB ================= */}
        {activeTab === 'zones' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Garment Architectural Zones</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Assign bespoke contrast weaves and yarns to lapels, collars, sleeves, and trims.
              </p>
            </div>

            <div className="space-y-2.5">
              {currentGarment.availableZones.map((z) => {
                const isSelected = activeZoneId === z.id;
                const hasContrast = !!contrastZones[z.id];

                return (
                  <div
                    key={z.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onSelectZone(z.id)}
                        className="text-left font-semibold text-xs text-neutral-900 flex items-center gap-2"
                      >
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-600' : 'bg-neutral-300'}`} />
                        <span>{z.label}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {hasContrast ? (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Customized
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400">Default Fabric</span>
                        )}
                        <button
                          onClick={() => onSelectZone(z.id)}
                          className="text-xs text-neutral-600 hover:text-neutral-900 font-medium underline"
                        >
                          Select
                        </button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-neutral-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-neutral-700 flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasContrast}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Initialize contrast zone with cloned values
                                  onUpdateZone(z.id, {
                                    id: z.id,
                                    name: z.label,
                                    weaveType: weaveType === 'twill_2_2' ? 'satin' : 'twill_2_2',
                                    yarn: {
                                      ...yarn,
                                      warpColor: '#1c1b1a',
                                      weftColor: '#e7e3dc',
                                    },
                                  });
                                } else {
                                  onUpdateZone(z.id, null);
                                }
                              }}
                              className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                            />
                            <span className="font-medium">Independent Contrast Fabric</span>
                          </label>
                        </div>

                        {hasContrast && (
                          <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-3">
                            <div>
                              <span className="text-[11px] font-medium text-neutral-500 block mb-1">
                                Zone Weave
                              </span>
                              <select
                                value={contrastZones[z.id]?.weaveType || weaveType}
                                onChange={(e) => {
                                  const wz = e.target.value as WeaveType;
                                  onUpdateZone(z.id, { weaveType: wz });
                                }}
                                className="w-full text-xs py-1.5 px-2 rounded border border-neutral-300 bg-white"
                              >
                                {WEAVE_ARCHETYPES.map((wa) => (
                                  <option key={wa.id} value={wa.id}>
                                    {wa.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-neutral-600">Warp</span>
                                <input
                                  type="color"
                                  value={contrastZones[z.id]?.yarn?.warpColor || yarn.warpColor}
                                  onChange={(e) => {
                                    const currYarn = contrastZones[z.id]?.yarn || { ...yarn };
                                    onUpdateZone(z.id, {
                                      yarn: { ...currYarn, warpColor: e.target.value },
                                    });
                                  }}
                                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-neutral-600">Weft</span>
                                <input
                                  type="color"
                                  value={contrastZones[z.id]?.yarn?.weftColor || yarn.weftColor}
                                  onChange={(e) => {
                                    const currYarn = contrastZones[z.id]?.yarn || { ...yarn };
                                    onUpdateZone(z.id, {
                                      yarn: { ...currYarn, weftColor: e.target.value },
                                    });
                                  }}
                                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= PRESETS TAB ================= */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Atelier Curated Editions</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Ready-to-wear master pairings crafted by textile artisans and tailors.
              </p>
            </div>

            <div className="space-y-3">
              {DESIGNER_PRESETS.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-amber-700 block uppercase">
                        {p.season}
                      </span>
                      <h5 className="text-sm font-semibold text-neutral-900">{p.title}</h5>
                      <span className="text-xs text-neutral-500 block">{p.tagline}</span>
                    </div>

                    <button
                      onClick={() => onApplyPreset(p.id)}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed italic border-l-2 border-neutral-300 pl-2.5">
                    "{p.story}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
