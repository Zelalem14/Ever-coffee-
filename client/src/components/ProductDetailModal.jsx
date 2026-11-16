import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

export default function ProductDetailModal() {
  const { selectedProduct, setSelectedProduct } = useMenu();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedProduct]);

  if (!selectedProduct) return null;

  const isAvailable = selectedProduct.is_available === 1;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={() => setSelectedProduct(null)}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-[#E8DFC8] max-h-[90vh] flex flex-col pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-[#D7CCC8]" />
        </div>

        {/* Close Button with >=44px touch target */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#5D4037] border border-[#E8DFC8] shadow-sm transition-colors active:scale-95"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto">
          
          {/* Item Picture */}
          {selectedProduct.image_url && (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF6F0] shrink-0">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className={`w-full h-full object-cover object-center ${
                  !isAvailable ? 'opacity-50 grayscale' : ''
                }`}
              />
            </div>
          )}

          {/* Details */}
          <div className="p-5 sm:p-6 space-y-4">
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D6E63] bg-[#EFEBE9] px-2.5 py-1 rounded-md inline-block">
                {selectedProduct.category_name}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C1810] leading-tight">
                {selectedProduct.name}
              </h2>
            </div>

            {selectedProduct.description && (
              <p className="text-sm text-[#5D4037] leading-relaxed font-light">
                {selectedProduct.description}
              </p>
            )}

            {selectedProduct.description_am && (
              <p className="text-sm text-[#795548] leading-relaxed font-normal bg-[#FAF6F0] px-3 py-2 rounded-xl border border-[#E8DFC8]">
                {selectedProduct.description_am}
              </p>
            )}

            {/* Price & Availability Row */}
            <div className="pt-3 border-t border-[#F5EBE1] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#A1887F] uppercase tracking-wider block font-semibold">
                  Price in Birr
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-2xl sm:text-3xl font-black text-[#2C1810]">
                    {selectedProduct.price_etb}
                  </span>
                  <span className="text-xs font-bold text-[#8D6E63]">
                    ETB
                  </span>
                </div>
              </div>

              <div>
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="w-full min-h-[48px] py-3 rounded-2xl font-bold text-sm text-white bg-[#3E2723] hover:bg-[#2C1810] active:scale-[0.98] transition-all shadow-xs"
            >
              Back to Menu
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
