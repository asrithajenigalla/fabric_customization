import React from 'react';
import { EDITORIAL_ASSETS, DESIGNER_PRESETS } from '../data/presets';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const LookbookModal: React.FC<LookbookModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider block">
              Atelier Trama Archive
            </span>
            <h3 className="text-xl font-serif-display font-medium text-neutral-900 tracking-tight">
              Bespoke Textile & Tailoring Lookbook
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Hero Atelier Banner */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-neutral-200/80 aspect-21/9 sm:aspect-16/7 bg-neutral-100">
            <img
              src={EDITORIAL_ASSETS.atelierMood}
              alt="Atelier Trama tailoring workshop and loom studio"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
              <span className="text-xs font-mono text-amber-300 uppercase tracking-widest block mb-1">
                The Loom & The Needle
              </span>
              <h4 className="text-2xl sm:text-3xl font-serif-display font-medium text-white max-w-xl">
                Bespoke cloth engineered from individual threads to architectural silhouettes.
              </h4>
            </div>
          </div>

          {/* Editorial Split Collection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-50/50 hover:shadow-md transition-all flex flex-col">
              <div className="aspect-3/4 overflow-hidden bg-neutral-100">
                <img
                  src={EDITORIAL_ASSETS.linenBlazer}
                  alt="Sartorial tailored oversized blazer in raw slub linen"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-xs font-mono text-neutral-500 uppercase block">Editorial 01</span>
                  <h5 className="text-base font-semibold text-neutral-900 mt-0.5">
                    Architectural Sartorial Tailoring
                  </h5>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Double-breasted canvassed blazers woven with high-twist wool and tactile slub linen.
                    Crease-resistant 2/2 twill and houndstooth micro-checks.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSelectPreset('milanese_houndstooth');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-amber-700 transition-colors pt-2 border-t border-neutral-200"
                >
                  <span>Load Milanese Houndstooth Spec</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-50/50 hover:shadow-md transition-all flex flex-col">
              <div className="aspect-3/4 overflow-hidden bg-neutral-100">
                <img
                  src={EDITORIAL_ASSETS.silkJacquard}
                  alt="Bespoke mulberry silk jacquard fabric macro drape"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-xs font-mono text-neutral-500 uppercase block">Editorial 02</span>
                  <h5 className="text-base font-semibold text-neutral-900 mt-0.5">
                    Mulberry Silk & Jacquard Brocade
                  </h5>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    5-end satin weaves and figured damask jacquards. Specular surface luster catches
                    natural daylight with fluid cascading drape.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSelectPreset('biophilic_silk_gown');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-amber-700 transition-colors pt-2 border-t border-neutral-200"
                >
                  <span>Load Biophilic Silk Gown Spec</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
