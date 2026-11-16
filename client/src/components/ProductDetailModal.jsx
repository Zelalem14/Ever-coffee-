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
        className="relative w-full max-w-md bg-white dark:bg-[#1F1009] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-[#E8DFC8] dark:border-[#3A2012] max-h-[90vh] flex flex-col pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-[#FAF6F0] dark:bg-[#120804]">
          <div className="w-12 h-1.5 rounded-full bg-[#D7CCC8] dark:bg-[#3A2012]" />
        </div>

        {/* Close Button with >=44px touch target */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/90 dark:bg-[#2A170D]/90 hover:bg-white text-[#5D4037] dark:text-[#FAF4ED] border border-[#E8DFC8] dark:border-[#3A2012] shadow-sm transition-colors active:scale-95"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto">
          
          {/* Item Picture */}
          {selectedProduct.image_url && (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF6F0] dark:bg-[#2A170D] shrink-0">
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D6E63] dark:text-[#D69E76] bg-[#EFEBE9] dark:bg-[#2A170D] px-2.5 py-1 rounded-md inline-block">
                {selectedProduct.category_name}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C1810] dark:text-[#FAF4ED] leading-tight">
                {selectedProduct.name}
              </h2>
            </div>

            {selectedProduct.description && (
              <p className="text-sm text-[#5D4037] dark:text-[#D69E76] leading-relaxed font-light">
                {selectedProduct.description}
              </p>
            )}

            {selectedProduct.description_am && (
              <p className="text-sm text-[#795548] dark:text-[#A89080] leading-relaxed font-normal bg-[#FAF6F0] dark:bg-[#2A170D] px-3 py-2 rounded-xl border border-[#E8DFC8] dark:border-[#3A2012]">
                {selectedProduct.description_am}
              </p>
            )}

            {/* Price & Availability Row */}
            <div className="pt-3 border-t border-[#F5EBE1] dark:border-[#3A2012] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#A1887F] dark:text-[#8D6E63] uppercase tracking-wider block font-semibold">
                  Price in Birr
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-2xl sm:text-3xl font-black text-[#2C1810] dark:text-[#D4AF37]">
                    {selectedProduct.price_etb}
                  </span>
                  <span className="text-xs font-bold text-[#8D6E63] dark:text-[#A89080]">
                    ETB
                  </span>
                </div>
              </div>

              <div>
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="w-full min-h-[48px] py-3 rounded-2xl font-bold text-sm text-white bg-[#3E2723] dark:bg-[#D4AF37] dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-[0.98] transition-all shadow-xs"
            >
              Back to Menu
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
