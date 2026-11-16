import React, { useState, useEffect } from 'react';
import { X, Smartphone, Wifi, Copy, Check, Share2 } from 'lucide-react';
import { api } from '../api/api';

export default function MobileQrModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [wifiUrl, setWifiUrl] = useState('http://192.168.1.4:5050');
  const [qrImageSrc, setQrImageSrc] = useState('/api/qr');

  useEffect(() => {
    if (isOpen) {
      // If we are already running on a non-localhost address, prefer current origin
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setWifiUrl(window.location.origin);
      } else {
        // Fetch current dynamic Wi-Fi IP from server
        api.getNetworkInfo()
          .then((info) => {
            if (info?.wifi_url) {
              setWifiUrl(info.wifi_url);
            }
          })
          .catch(() => {
            // Keep fallback
          });
      }
      setQrImageSrc(`/api/qr?t=${Date.now()}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(wifiUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ever Coffee House Digital Menu',
          text: 'Browse our fresh coffee, drinks, and snacks menu at Ever Coffee House!',
          url: wifiUrl
        });
      } catch (err) {
        // Ignored or cancelled by user
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border-t sm:border border-[#E8DFC8] space-y-4 max-h-[92vh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden -mt-1 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[#D7CCC8]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#8D6E63] hover:text-[#2C1810] hover:bg-[#FAF6F0] active:scale-95 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#4E342E] border border-[#E8DFC8] shadow-xs mb-1">
            <Smartphone className="w-6 h-6 text-[#5D4037]" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C1810]">
            Open Menu on Mobile
          </h3>
          <p className="text-xs text-[#8D6E63] flex items-center justify-center gap-1.5 font-medium">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connect your phone to the same Wi-Fi</span>
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8DFC8]">
          <div className="bg-white p-3 rounded-xl shadow-xs border border-[#E8DFC8]/60 max-w-[220px]">
            <img
              src={qrImageSrc}
              alt="QR Code for Mobile Wi-Fi Access"
              className="w-full aspect-square object-contain"
              loading="lazy"
            />
          </div>
          <p className="text-[11px] text-[#8D6E63] mt-2 font-medium">
            Scan with your smartphone camera
          </p>
        </div>

        {/* Direct Link & Copy */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5D4037]">
            Or open this URL in your phone's browser:
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#F5F0EB] border border-[#D7CCC8]">
            <input
              type="text"
              readOnly
              value={wifiUrl}
              className="flex-1 min-h-[40px] px-2 bg-transparent text-xs sm:text-sm font-mono font-semibold text-[#2C1810] focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 min-h-[42px] px-3.5 rounded-lg text-xs font-semibold bg-[#4E342E] text-white hover:bg-[#3E2723] active:scale-95 transition-all shrink-0 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons: Native Share & Close */}
        <div className="flex gap-2 pt-1">
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px] py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#FAF6F0] text-[#3E2723] hover:bg-[#EFEBE9] border border-[#D7CCC8] active:scale-[0.98] transition-all"
            >
              <Share2 className="w-4 h-4 text-[#5D4037]" />
              <span>Share Link</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 min-h-[48px] py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#3E2723] text-white hover:bg-[#2C1810] active:scale-[0.98] transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
