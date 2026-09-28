import React, { useState } from 'react';
import { GarmentId, PrintConfig, WeaveType, YarnConfig, ZoneConfig, ZoneId } from '../types';
import { GARMENTS } from '../data/garments';
import { calculateFabricSpec } from '../engine/weaveEngine';
import { WEAVE_ARCHETYPES } from '../data/presets';
import { X, Download, Copy, Check, FileText, Scissors } from 'lucide-react';

interface TechPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  garmentId: GarmentId;
  weaveType: WeaveType;
  yarn: YarnConfig;
  print?: PrintConfig;
  contrastZones: Record<ZoneId, Partial<ZoneConfig>>;
}

export const TechPackModal: React.FC<TechPackModalProps> = ({
  isOpen,
  onClose,
  garmentId,
  weaveType,
  yarn,
  print,
  contrastZones,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const garment = GARMENTS.find((g) => g.id === garmentId) || GARMENTS[0];
  const spec = calculateFabricSpec(weaveType, yarn);
  const weaveInfo = WEAVE_ARCHETYPES.find((w) => w.id === weaveType);

  const techPackData = {
    productionCode: `ATR-${garmentId.toUpperCase()}-${Date.now().toString().slice(-6)}`,
    garmentName: garment.name,
    category: garment.category,
    dateGenerated: new Date().toISOString().split('T')[0],
    fabricSpecs: {
      weaveArchitecture: weaveInfo?.name,
      baseFiber: yarn.fiberType.toUpperCase(),
      weightGsm: spec.gsm,
      weightOzYd: spec.ozPerSqYard,
      threadCount: {
        epi: spec.epi,
        ppi: spec.ppi,
        total: spec.totalThreadCount,
      },
      warpColor: yarn.warpColor,
      weftColor: yarn.weftColor,
      slubIntensity: yarn.slubIntensity,
      fiberLuster: yarn.fiberLuster,
    },
    printFinish: print
      ? {
          patternName: print.name,
          repeatMode: print.repeatMode,
          blendMode: print.blendMode,
          scale: print.scale,
          opacity: print.opacity,
        }
      : 'None (Natural Solid Weave)',
    contrastZones: Object.entries(contrastZones).map(([zone, conf]) => ({
      zone,
      weave: conf.weaveType || weaveType,
      warp: conf.yarn?.warpColor || yarn.warpColor,
      weft: conf.yarn?.weftColor || yarn.weftColor,
    })),
    cuttingYield: `${garment.fabricConsumptionYards} yards per garment`,
    careInstructions: garment.careInstructions,
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(techPackData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(techPackData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TECH_PACK_${techPackData.productionCode}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Atelier Technical Specification Sheet (Tech Pack)
              </h3>
              <span className="text-xs font-mono text-neutral-500">
                SPEC #{techPackData.productionCode} · {garment.name}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Key Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Weave Structure</span>
              <span className="text-sm font-semibold text-neutral-900">{weaveInfo?.name}</span>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Fabric Weight</span>
              <span className="text-sm font-semibold text-neutral-900 font-mono">
                {spec.gsm} GSM ({spec.ozPerSqYard} oz)
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Thread Count</span>
              <span className="text-sm font-semibold text-neutral-900 font-mono">
                {spec.totalThreadCount} T.C. ({spec.epi}×{spec.ppi})
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 block">Fabric Yield</span>
              <span className="text-sm font-semibold text-neutral-900 font-mono">
                {garment.fabricConsumptionYards} yds
              </span>
            </div>
          </div>

          {/* Yarn Formula Specs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>01. Yarn Construction & Color Codes</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-800">Warp Yarn (Vertical)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">{yarn.warpColor}</span>
                    <div
                      className="w-4 h-4 rounded-full border border-neutral-300"
                      style={{ backgroundColor: yarn.warpColor }}
                    />
                  </div>
                </div>
                <div className="text-xs text-neutral-500 space-y-1">
                  <div>Fiber: <strong className="text-neutral-800 capitalize">{yarn.fiberType}</strong></div>
                  <div>Gauge: <strong className="text-neutral-800">Tier {yarn.threadGauge}</strong></div>
                  <div>Luster: <strong className="text-neutral-800">{Math.round(yarn.fiberLuster * 100)}% Sheen</strong></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-800">Weft Yarn (Horizontal)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">{yarn.weftColor}</span>
                    <div
                      className="w-4 h-4 rounded-full border border-neutral-300"
                      style={{ backgroundColor: yarn.weftColor }}
                    />
                  </div>
                </div>
                <div className="text-xs text-neutral-500 space-y-1">
                  <div>Fiber: <strong className="text-neutral-800 capitalize">{yarn.fiberType}</strong></div>
                  <div>Gauge: <strong className="text-neutral-800">Tier {yarn.threadGauge}</strong></div>
                  <div>Slub: <strong className="text-neutral-800">{Math.round(yarn.slubIntensity * 100)}% Artisanal Slub</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Pattern & CAD Layout Diagram Representation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-neutral-500" />
              <span>02. Cutting Layout & Panel Geometry</span>
            </h4>
            <div className="p-4 bg-neutral-900 text-neutral-100 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
              <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800 pb-2">
                <span>PATTERN PIECE</span>
                <span>GRAINLINE</span>
                <span>SEAM ALLOWANCE</span>
                <span>QTY</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Front Body Panels (Left/Right)</span>
                <span className="text-amber-400">Straight Grain (Warp)</span>
                <span>1.5 cm</span>
                <span>2</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Back Center Panel</span>
                <span className="text-amber-400">Straight Grain (Warp)</span>
                <span>1.5 cm</span>
                <span>1 (On Fold)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Tailored Sleeves (Upper/Under)</span>
                <span className="text-amber-400">Straight Grain (Warp)</span>
                <span>1.2 cm</span>
                <span>4</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Collar / Lapel Facing</span>
                <span className="text-emerald-400">True Bias (45° Cross)</span>
                <span>1.0 cm</span>
                <span>2</span>
              </div>
            </div>
          </div>

          {/* Care & Finishing */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              03. Care & Post-Weave Finishing
            </h4>
            <ul className="text-xs text-neutral-600 space-y-1 list-disc pl-4">
              {garment.careInstructions.map((ci, i) => (
                <li key={i}>{ci}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/80 flex items-center justify-between">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Specs' : 'Copy JSON Spec'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Tech Pack</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
