import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CartItem } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearCart,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);
  const [orderNumber, setOrderNumber] = useState<string>('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      const generatedOrder = `ATR-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(generatedOrder);
      setIsCheckingOut(false);
      setOrderConfirmed(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }, 1200);
  };

  const handleFinish = () => {
    onClearCart();
    setOrderConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-semibold text-neutral-900">
              Atelier Commissions ({items.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {orderConfirmed ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-900">
              Commission Placed Successfully
            </h4>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
              Your bespoke commission <strong className="font-mono text-neutral-800">{orderNumber}</strong> has been transmitted to our master weavers and pattern cutters.
            </p>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-left w-full text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-neutral-500">
                <span>ESTIMATED LOOM TIME:</span>
                <span className="text-neutral-900">5-7 DAYS</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>STATUS:</span>
                <span className="text-emerald-700 font-semibold">PREPARING WARP BEAMS</span>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors mt-4"
            >
              Return to Studio
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-sm font-medium text-neutral-600">Your commission bag is empty</p>
                <p className="text-xs text-neutral-400">
                  Customize a garment or request a physical swatch sample kit to begin.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/50 space-y-2 relative"
                >
                  <div className="flex justify-between items-start pr-6">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-900">{item.garmentName}</h4>
                      <span className="text-[11px] text-neutral-500 font-medium block">
                        {item.fabricTitle} {item.size ? `· Size ${item.size}` : ''}{' '}
                        {item.yards ? `· ${item.yards} Yards` : ''}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-neutral-900">
                      ${item.unitPrice}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 font-mono">{item.specSummary}</p>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer with Subtotal & Checkout */}
        {!orderConfirmed && items.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50/80 space-y-3">
            <div className="flex justify-between text-xs text-neutral-600">
              <span>Bespoke Subtotal</span>
              <span className="font-mono font-semibold text-neutral-900 text-sm tabular-nums">
                ${subtotal} USD
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>Estimated Express Delivery</span>
              <span className="text-emerald-700 font-medium">Complimentary</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-75 text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {isCheckingOut ? (
                <span>Transmitting Commission...</span>
              ) : (
                <>
                  <span>Proceed to Commission Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
