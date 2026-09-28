import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CartItem, GarmentId, PrintConfig, WeaveType, YarnConfig, ZoneConfig, ZoneId } from '../types';
import { GARMENTS } from '../data/garments';
import { WEAVE_ARCHETYPES } from '../data/presets';
import { X, ShoppingBag, Check, ShieldCheck, Truck, Sparkles } from 'lucide-react';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  garmentId: GarmentId;
  weaveType: WeaveType;
  yarn: YarnConfig;
  print?: PrintConfig;
  contrastZones: Record<ZoneId, Partial<ZoneConfig>>;
  onAddToCart: (item: CartItem) => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  garmentId,
  weaveType,
  yarn,
  print,
  contrastZones,
  onAddToCart,
}) => {
  const [orderType, setOrderType] = useState<'custom_garment' | 'swatch_kit' | 'fabric_bolt'>('custom_garment');
  const [selectedSize, setSelectedSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'Custom'>('M');
  const [yardage, setYardage] = useState<number>(3);
  const [customMeasurements, setCustomMeasurements] = useState({
    chest: '38',
    waist: '31',
    hip: '40',
    inseam: '32',
  });
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const garment = GARMENTS.find((g) => g.id === garmentId) || GARMENTS[0];
  const weaveInfo = WEAVE_ARCHETYPES.find((w) => w.id === weaveType);

  // Price Calculation Formula
  let unitPrice = garment.basePrice;
  if (orderType === 'swatch_kit') {
    unitPrice = 28;
  } else if (orderType === 'fabric_bolt') {
    const pricePerYard = yarn.fiberType === 'silk' ? 68 : yarn.fiberType === 'cashmere' ? 95 : 44;
    unitPrice = pricePerYard * yardage;
  } else {
    // Custom Garment additions
    if (yarn.fiberType === 'cashmere') unitPrice += 160;
    if (yarn.fiberType === 'silk') unitPrice += 110;
    if (yarn.fiberType === 'wool') unitPrice += 60;
    if (weaveType === 'jacquard_floral') unitPrice += 85;
    if (print) unitPrice += 45;
    if (Object.keys(contrastZones).length > 0) unitPrice += 50;
  }

  const handleConfirmOrder = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D97706', '#1E3A8A', '#2D4A3E', '#1C1B1A'],
    });

    const item: CartItem = {
      id: `ITEM-${Date.now()}`,
      garmentId,
      garmentName: garment.name,
      fabricTitle: `${yarn.fiberType.toUpperCase()} ${weaveInfo?.name}`,
      type: orderType,
      size: orderType === 'custom_garment' ? selectedSize : undefined,
      yards: orderType === 'fabric_bolt' ? yardage : undefined,
      unitPrice,
      quantity: 1,
      thumbnail: '',
      specSummary: `${yarn.warpColor} Warp / ${yarn.weftColor} Weft · ${weaveType}`,
    };

    onAddToCart(item);
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-neutral-200 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-semibold text-neutral-900">Bespoke Atelier Order</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Order Tier Selector */}
          <div>
            <span className="text-xs font-semibold text-neutral-800 block mb-2 uppercase tracking-wider">
              Commission Format
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setOrderType('custom_garment')}
                className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                  orderType === 'custom_garment'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Tailored Piece
              </button>
              <button
                onClick={() => setOrderType('swatch_kit')}
                className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                  orderType === 'swatch_kit'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Sample Swatches
              </button>
              <button
                onClick={() => setOrderType('fabric_bolt')}
                className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                  orderType === 'fabric_bolt'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Fabric Bolt
              </button>
            </div>
          </div>

          {/* Garment Preview Summary */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
            <div className="flex justify-between items-baseline">
              <h4 className="text-sm font-semibold text-neutral-900">{garment.name}</h4>
              <span className="text-sm font-mono font-bold text-neutral-900 tabular-nums">
                ${unitPrice} USD
              </span>
            </div>
            <p className="text-xs text-neutral-500">{garment.description}</p>
            <div className="pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-600 flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                style={{ backgroundColor: yarn.warpColor }}
              />
              <span>
                {yarn.fiberType.toUpperCase()} {weaveInfo?.name}
              </span>
              <span aria-hidden="true">·</span>
              <span>{print ? `Print: ${print.name}` : 'Solid Weave'}</span>
            </div>
          </div>

          {/* Sizing options if custom garment */}
          {orderType === 'custom_garment' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Select Sizing
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">Bespoke Fitting</span>
              </div>

              <div className="grid grid-cols-6 gap-1.5 text-xs font-medium">
                {(['XS', 'S', 'M', 'L', 'XL', 'Custom'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2 rounded-lg border text-center transition-all ${
                      selectedSize === sz
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {selectedSize === 'Custom' && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Chest / Bust (in)</label>
                    <input
                      type="number"
                      value={customMeasurements.chest}
                      onChange={(e) => setCustomMeasurements({ ...customMeasurements, chest: e.target.value })}
                      className="w-full p-1.5 rounded border border-neutral-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Natural Waist (in)</label>
                    <input
                      type="number"
                      value={customMeasurements.waist}
                      onChange={(e) => setCustomMeasurements({ ...customMeasurements, waist: e.target.value })}
                      className="w-full p-1.5 rounded border border-neutral-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Low Hip (in)</label>
                    <input
                      type="number"
                      value={customMeasurements.hip}
                      onChange={(e) => setCustomMeasurements({ ...customMeasurements, hip: e.target.value })}
                      className="w-full p-1.5 rounded border border-neutral-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Inseam (in)</label>
                    <input
                      type="number"
                      value={customMeasurements.inseam}
                      onChange={(e) => setCustomMeasurements({ ...customMeasurements, inseam: e.target.value })}
                      className="w-full p-1.5 rounded border border-neutral-300 text-xs bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Yardage options if fabric bolt */}
          {orderType === 'fabric_bolt' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider block">
                Continuous Yardage (Width: 58 inches / 148 cm)
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={yardage}
                  onChange={(e) => setYardage(parseInt(e.target.value))}
                  className="flex-1 accent-neutral-900 cursor-pointer"
                />
                <span className="font-mono text-sm font-semibold min-w-[50px] text-right">
                  {yardage} yds
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Woven on modern computerized looms with precision selvage.
              </p>
            </div>
          )}

          {/* Swatch Kit Details */}
          {orderType === 'swatch_kit' && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs space-y-2 text-amber-900">
              <div className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Atelier Physical Swatch Presentation</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Includes three 10cm × 10cm hand-cut swatch cards mounted with Pantone TCX yarn references,
                thread counts, and drape feeler cards. Shipped via express courier within 48 hours.
              </p>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="pt-2 border-t border-neutral-200 space-y-2 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-700 shrink-0" />
              <span>Worldwide carbon-neutral insured shipping included</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0" />
              <span>Made-to-order sustainable craft · Zero deadstock</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/80">
          <button
            onClick={handleConfirmOrder}
            disabled={orderSuccess}
            className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              orderSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {orderSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Order Added to Commission List!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {orderType === 'swatch_kit'
                    ? 'Order Swatch Kit · $28'
                    : orderType === 'fabric_bolt'
                    ? `Order ${yardage} Yards · $${unitPrice}`
                    : `Commission Garment · $${unitPrice}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
