/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CartItem,
  GarmentId,
  LightingPreset,
  PrintConfig,
  WeaveType,
  YarnConfig,
  ZoneConfig,
  ZoneId,
} from './types';
import { GARMENTS } from './data/garments';
import { DESIGNER_PRESETS, LIGHTING_PRESETS } from './data/presets';
import { GarmentCanvas3D } from './components/GarmentCanvas3D';
import { MacroWeaveViewer } from './components/MacroWeaveViewer';
import { CustomizerSidebar } from './components/CustomizerSidebar';
import { TechPackModal } from './components/TechPackModal';
import { OrderDrawer } from './components/OrderDrawer';
import { CartDrawer } from './components/CartDrawer';
import { ExportModal } from './components/ExportModal';
import { LookbookModal } from './components/LookbookModal';
import {
  ShoppingBag,
  Download,
  FileText,
  BookOpen,
  Eye,
  Box,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // State for Garment Selection
  const [selectedGarmentId, setSelectedGarmentId] = useState<GarmentId>('blazer');

  // State for Weave & Yarn
  const [weaveType, setWeaveType] = useState<WeaveType>('houndstooth');
  const [yarn, setYarn] = useState<YarnConfig>({
    warpColor: '#1c1b1a', // Charcoal
    weftColor: '#e7e3dc', // Unbleached silk bone
    threadGauge: 3,
    slubIntensity: 0.15,
    fiberLuster: 0.45,
    fiberType: 'wool',
  });

  // State for Print & Surface Ornament
  const [print, setPrint] = useState<PrintConfig | undefined>(undefined);
  const [customPrintImage, setCustomPrintImage] = useState<HTMLImageElement | null>(null);

  // Multi-Zone custom contrast
  const [contrastZones, setContrastZones] = useState<Record<ZoneId, Partial<ZoneConfig>>>({} as Record<ZoneId, Partial<ZoneConfig>>);
  const [activeZoneId, setActiveZoneId] = useState<ZoneId>('body');

  // Lighting & Environment
  const [lightingId, setLightingId] = useState<string>('atelier_daylight');

  // Active Viewport: 3D Garment vs Macro Weave Loupe
  const [viewportMode, setViewportMode] = useState<'3d_garment' | 'macro_loupe'>('3d_garment');

  // Modals & Drawers
  const [isTechPackOpen, setIsTechPackOpen] = useState<boolean>(false);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isLookbookOpen, setIsLookbookOpen] = useState<boolean>(false);

  // Cart commissions state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastRenderedSnapshot, setLastRenderedSnapshot] = useState<string>('');

  const currentGarment = GARMENTS.find((g) => g.id === selectedGarmentId) || GARMENTS[0];

  // Apply a designer preset
  const handleApplyPreset = (presetId: string) => {
    const preset = DESIGNER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedGarmentId(preset.garmentId);
    setWeaveType(preset.weaveType);
    setYarn({ ...preset.yarn });
    setPrint(preset.print ? { ...preset.print } : undefined);
    setContrastZones({ ...(preset.contrastZones as Record<ZoneId, Partial<ZoneConfig>> || {}) });
    setLightingId(preset.lightingId);
    setViewportMode('3d_garment');
  };

  const handleUpdateZone = (zoneId: ZoneId, updates: Partial<ZoneConfig> | null) => {
    setContrastZones((prev) => {
      const next = { ...prev };
      if (!updates) {
        delete next[zoneId];
      } else {
        next[zoneId] = { ...next[zoneId], ...updates };
      }
      return next;
    });
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FBFBFA] text-[#191918]">
      {/* ================= ZONE 1: TOP BAR CONTRACT ================= */}
      <header className="h-16 px-6 border-b border-neutral-200/90 flex items-center justify-between bg-white/95 backdrop-blur-md shrink-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="text-xl font-serif-display font-medium tracking-wider text-neutral-900 hover:text-neutral-700 transition-colors uppercase"
        >
          ATELIER TRAMA
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-600">
          <button
            onClick={() => setViewportMode('3d_garment')}
            className={`transition-colors pb-0.5 ${
              viewportMode === '3d_garment'
                ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900 border-b-2 border-transparent'
            }`}
          >
            3D Garment Studio
          </button>

          <button
            onClick={() => setViewportMode('macro_loupe')}
            className={`transition-colors pb-0.5 ${
              viewportMode === 'macro_loupe'
                ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900 border-b-2 border-transparent'
            }`}
          >
            Macro Thread Loupe
          </button>

          <button
            onClick={() => setIsTechPackOpen(true)}
            className="hover:text-neutral-900 transition-colors border-b-2 border-transparent pb-0.5"
          >
            Technical Spec Sheet
          </button>

          <button
            onClick={() => setIsLookbookOpen(true)}
            className="hover:text-neutral-900 transition-colors border-b-2 border-transparent pb-0.5"
          >
            Atelier Archive Lookbook
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExportOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CAD / 3D</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Commissions</span>
            {cartItems.length > 0 && (
              <span className="ml-1 w-4 h-4 bg-amber-500 text-neutral-900 text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ================= SECONDARY SUB-NAV: SILHOUETTES SELECTOR ================= */}
      <div className="h-12 px-6 border-b border-neutral-200/70 bg-neutral-50/70 flex items-center justify-between overflow-x-auto shrink-0 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-mono uppercase text-neutral-400 mr-2 hidden lg:inline">
            Garment Silhouette:
          </span>
          {GARMENTS.map((g) => {
            const isSelected = selectedGarmentId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGarmentId(g.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>

        {/* Viewport switch for mobile viewports */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={() => setViewportMode('3d_garment')}
            className={`p-1.5 rounded ${viewportMode === '3d_garment' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
            title="3D View"
          >
            <Box className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewportMode('macro_loupe')}
            className={`p-1.5 rounded ${viewportMode === 'macro_loupe' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
            title="Macro Loupe"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= MAIN SPLIT STUDIO WORKSPACE ================= */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left / Center: Dynamic Canvas & 3D Garment Viewport */}
        <div className="flex-1 h-1/2 lg:h-full relative overflow-hidden flex flex-col">
          {viewportMode === '3d_garment' ? (
            <GarmentCanvas3D
              garmentId={selectedGarmentId}
              weaveType={weaveType}
              yarn={yarn}
              print={print}
              contrastZones={contrastZones}
              activeZoneId={activeZoneId}
              onSelectZone={setActiveZoneId}
              lightingId={lightingId}
              onLightingChange={setLightingId}
              customPrintImage={customPrintImage}
              onExportRender={(dataUrl) => {
                setLastRenderedSnapshot(dataUrl);
                setIsExportOpen(true);
              }}
            />
          ) : (
            <MacroWeaveViewer
              weaveType={weaveType}
              yarn={yarn}
              onUpdateYarn={(updates) => setYarn((prev) => ({ ...prev, ...updates }))}
            />
          )}

          {/* Quiet Bottom Atelier Status Pill */}
          <div className="h-10 px-5 border-t border-neutral-200/70 bg-white/90 backdrop-blur-xs flex items-center justify-between text-xs text-neutral-600 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-neutral-900">{currentGarment.name}</span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="capitalize">{yarn.fiberType} {weaveType.replace('_', ' ')}</span>
              <span aria-hidden="true" className="text-neutral-300 hidden sm:inline">·</span>
              <span className="font-mono text-[11px] text-neutral-500 hidden sm:inline">
                {yarn.warpColor} Warp / {yarn.weftColor} Weft
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                From ${currentGarment.basePrice} USD
              </span>
              <button
                onClick={() => setIsOrderDrawerOpen(true)}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-semibold rounded-md shadow-xs transition-colors"
              >
                Order Custom Commission
              </button>
            </div>
          </div>
        </div>

        {/* Right: Customization Parameter Control Center */}
        <div className="w-full lg:w-[440px] xl:w-[480px] h-1/2 lg:h-full shrink-0 flex flex-col z-10">
          <CustomizerSidebar
            garmentId={selectedGarmentId}
            onSelectGarment={setSelectedGarmentId}
            weaveType={weaveType}
            onSelectWeave={setWeaveType}
            yarn={yarn}
            onUpdateYarn={(updates) => setYarn((prev) => ({ ...prev, ...updates }))}
            print={print}
            onUpdatePrint={setPrint}
            contrastZones={contrastZones}
            onUpdateZone={handleUpdateZone}
            activeZoneId={activeZoneId}
            onSelectZone={setActiveZoneId}
            onApplyPreset={handleApplyPreset}
            onUploadCustomPrint={setCustomPrintImage}
          />
        </div>
      </main>

      {/* ================= MODALS & DRAWERS ================= */}
      <TechPackModal
        isOpen={isTechPackOpen}
        onClose={() => setIsTechPackOpen(false)}
        garmentId={selectedGarmentId}
        weaveType={weaveType}
        yarn={yarn}
        print={print}
        contrastZones={contrastZones}
      />

      <OrderDrawer
        isOpen={isOrderDrawerOpen}
        onClose={() => setIsOrderDrawerOpen(false)}
        garmentId={selectedGarmentId}
        weaveType={weaveType}
        yarn={yarn}
        print={print}
        contrastZones={contrastZones}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        garmentId={selectedGarmentId}
        weaveType={weaveType}
        yarn={yarn}
        print={print}
        customPrintImage={customPrintImage}
        renderedSnapshotUrl={lastRenderedSnapshot}
      />

      <LookbookModal
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
        onSelectPreset={handleApplyPreset}
      />
    </div>
  );
}
