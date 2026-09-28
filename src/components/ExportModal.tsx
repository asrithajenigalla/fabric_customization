import React, { useState } from 'react';
import { GarmentId, PrintConfig, WeaveType, YarnConfig } from '../types';
import { generateFabricTextureCanvas } from '../engine/weaveEngine';
import { compositeFabricWithPrint } from '../engine/printEngine';
import { X, Download, Share2, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  garmentId: GarmentId;
  weaveType: WeaveType;
  yarn: YarnConfig;
  print?: PrintConfig;
  customPrintImage?: HTMLImageElement | null;
  renderedSnapshotUrl?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  garmentId,
  weaveType,
  yarn,
  print,
  customPrintImage,
  renderedSnapshotUrl,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [exportResolution, setExportResolution] = useState<1024 | 2048>(1024);

  if (!isOpen) return null;

  // Download Seamless Fabric Tile
  const handleDownloadTextureTile = (includeNormal: boolean = false) => {
    const baseCanvas = generateFabricTextureCanvas(weaveType, yarn, exportResolution, exportResolution, {
      showNormalMap: includeNormal,
    });
    const finalCanvas = includeNormal
      ? baseCanvas
      : compositeFabricWithPrint(baseCanvas, print, customPrintImage);

    const a = document.createElement('a');
    a.href = finalCanvas.toDataURL('image/png');
    a.download = `atelier-trama-seamless-${weaveType}-${includeNormal ? 'normal' : 'diffuse'}-${exportResolution}px.png`;
    a.click();
  };

  // Download 3D Snapshot
  const handleDownloadSnapshot = () => {
    if (!renderedSnapshotUrl) return;
    const a = document.createElement('a');
    a.href = renderedSnapshotUrl;
    a.download = `atelier-trama-${garmentId}-render.png`;
    a.click();
  };

  // Copy shareable link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-neutral-800" />
            <h3 className="text-base font-semibold text-neutral-900">Export Atelier Assets</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Option 1: 3D Garment Render */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-900 block">
                Garment 3D Studio Render
              </span>
              <p className="text-xs text-neutral-500">
                High-definition snapshot of the draped garment with active lighting.
              </p>
            </div>
            <button
              onClick={handleDownloadSnapshot}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0"
            >
              Export PNG
            </button>
          </div>

          {/* Option 2: Seamless Fabric Texture Tile for 3D/CAD */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-900 block">
                  Seamless Repeat Fabric Tile (PBR Map)
                </span>
                <p className="text-xs text-neutral-500">
                  Ready for CLO3D, Marvelous Designer, Blender, and Unreal Engine.
                </p>
              </div>

              {/* Resolution Toggle */}
              <div className="flex items-center gap-1 p-0.5 bg-neutral-200/70 rounded-md text-[11px] font-mono">
                <button
                  onClick={() => setExportResolution(1024)}
                  className={`px-2 py-0.5 rounded ${
                    exportResolution === 1024 ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600'
                  }`}
                >
                  1K
                </button>
                <button
                  onClick={() => setExportResolution(2048)}
                  className={`px-2 py-0.5 rounded ${
                    exportResolution === 2048 ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600'
                  }`}
                >
                  2K
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleDownloadTextureTile(false)}
                className="flex-1 py-2 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-medium rounded-lg transition-colors text-center"
              >
                Diffuse Color Map
              </button>
              <button
                onClick={() => handleDownloadTextureTile(true)}
                className="flex-1 py-2 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-medium rounded-lg transition-colors text-center"
              >
                Normal Relief Map
              </button>
            </div>
          </div>

          {/* Option 3: Shareable Studio URL */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-900 block">
                Shareable Design Studio URL
              </span>
              <p className="text-xs text-neutral-500">
                Direct link to share this customized silhouette and weave pattern with clients.
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-medium rounded-lg transition-colors shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
