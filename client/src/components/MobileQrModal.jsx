import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Wifi, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Camera, 
  QrCode, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../api/api';
import { useMenu } from '../context/MenuContext';
import QrScanner from './QrScanner';

export default function MobileQrModal({ isOpen, onClose }) {
  const { settings } = useMenu();

  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'scan'
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [clientQrDataUrl, setClientQrDataUrl] = useState('');
  const [scannedUrl, setScannedUrl] = useState('');

  // Determine the best base URL (public origin on web, or Wi-Fi IP on local network)
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setBaseUrl(window.location.origin);
    } else {
      api.getNetworkInfo()
        .then((info) => {
          if (info?.wifi_url) {
            setBaseUrl(info.wifi_url);
          } else {
            setBaseUrl(window.location.origin);
          }
        })
        .catch(() => {
          setBaseUrl(window.location.origin);
        });
    }
  }, [isOpen]);

  // Compute final QR code target URL (points directly to Ever Coffee House digital menu)
  const currentTargetUrl = useMemo(() => {
    return baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5050');
  }, [baseUrl]);

  // Generate high-resolution QR code preview on the client
  useEffect(() => {
    if (!isOpen || !currentTargetUrl) return;

    let isMounted = true;
    QRCode.toDataURL(currentTargetUrl, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#2C1810',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        if (isMounted) setClientQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Client QR generation fallback to server endpoint:', err);
        if (isMounted) {
          setClientQrDataUrl(`/api/qr?url=${encodeURIComponent(currentTargetUrl)}&t=${Date.now()}`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentTargetUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentTargetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    const title = settings?.coffee_house_name || 'Ever Coffee House Digital Menu';
    const text = 'Browse fresh roasted coffee, refreshing drinks, and delicious snacks at Ever Coffee House!';

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: currentTargetUrl
        });
      } catch (err) {
        // cancelled by user
      }
    } else {
      handleCopy();
    }
  };

  // High-resolution 1024x1024 PNG image download for clear printing & display
  const handleDownload = async () => {
    try {
      setDownloading(true);
      const filename = 'ever-coffee-house-menu-qr.png';

      // Generate ultra high-definition 1024x1024 PNG for crystal-clear printing and scanning
      const highResDataUrl = await QRCode.toDataURL(currentTargetUrl, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#2C1810',
          light: '#FFFFFF'
        }
      });

      const a = document.createElement('a');
      a.href = highResDataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Direct download error, using server endpoint fallback:', err);
      // Server-assisted download fallback
      const serverUrl = `/api/qr?url=${encodeURIComponent(currentTargetUrl)}&download=1&width=1024&filename=ever-coffee-house-menu-qr`;
      const a = document.createElement('a');
      a.href = serverUrl;
      a.download = 'ever-coffee-house-menu-qr.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  // Handle scanned result from in-app camera or uploaded file
  const handleScanSuccess = (decodedText) => {
    setScannedUrl(decodedText);
  };

  const handleOpenScannedUrl = () => {
    if (!scannedUrl) return;
    try {
      if (scannedUrl.startsWith('http://') || scannedUrl.startsWith('https://')) {
        window.location.href = scannedUrl;
      } else {
        window.location.href = `https://${scannedUrl}`;
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#1F1009] rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border-t sm:border border-[#E8DFC8] dark:border-[#3A2012] space-y-4 max-h-[92vh] overflow-y-auto pb-safe transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden -mt-1 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[#D7CCC8] dark:bg-[#3A2012]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-[#FAF4ED] hover:bg-zinc-100 dark:hover:bg-[#2A170D] active:scale-95 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 dark:bg-[#2A170D] text-[#4E342E] dark:text-[#D4AF37] border border-amber-200 dark:border-[#3A2012] shadow-xs mb-1">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-zinc-900 dark:text-[#FAF4ED]">
            Menu QR Code
          </h3>
          <p className="text-xs text-zinc-500 dark:text-[#A89080] flex items-center justify-center gap-1.5 font-medium">
            <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ever Coffee House Digital Menu</span>
          </p>
        </div>

        {/* Tab Switcher: View/Download QR vs Scan with Camera */}
        <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-[#120804] border border-zinc-200 dark:border-[#3A2012]">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`flex-1 flex items-center justify-center gap-2 min-h-[40px] rounded-lg text-xs font-bold transition-all ${
              activeTab === 'generate'
                ? 'bg-white dark:bg-[#2A170D] text-zinc-900 dark:text-[#FAF4ED] shadow-xs'
                : 'text-zinc-600 dark:text-[#A89080] hover:text-zinc-900 dark:hover:text-[#FAF4ED]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>View / Download</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`flex-1 flex items-center justify-center gap-2 min-h-[40px] rounded-lg text-xs font-bold transition-all ${
              activeTab === 'scan'
                ? 'bg-white dark:bg-[#2A170D] text-zinc-900 dark:text-[#FAF4ED] shadow-xs'
                : 'text-zinc-600 dark:text-[#A89080] hover:text-zinc-900 dark:hover:text-[#FAF4ED]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scan with Camera</span>
          </button>
        </div>

        {/* ================= TAB 1: VIEW & DOWNLOAD MENU QR CODE ================= */}
        {activeTab === 'generate' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* High-Resolution QR Display */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-5 bg-zinc-50 dark:bg-[#120804] rounded-2xl border border-zinc-200 dark:border-[#3A2012]">
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-zinc-200/80 max-w-[220px]">
                {clientQrDataUrl ? (
                  <img
                    src={clientQrDataUrl}
                    alt="Ever Coffee House Menu QR Code"
                    className="w-full aspect-square object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-zinc-400">
                    Generating QR code...
                  </div>
                )}
              </div>

              <div className="text-center mt-3 space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-[#FAF4ED]">
                  {settings?.coffee_house_name || 'Ever Coffee House'} Digital Menu
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-[#A89080]">
                  Scan with any smartphone camera (iPhone & Android)
                </p>
              </div>
            </div>

            {/* URL Display with Copy Button */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-[#D69E76]">
                Menu Website Link:
              </label>
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-50 dark:bg-[#120804] border border-zinc-200 dark:border-[#3A2012]">
                <input
                  type="text"
                  readOnly
                  value={currentTargetUrl}
                  className="flex-1 min-h-[38px] px-2.5 bg-transparent text-xs font-mono font-medium text-zinc-900 dark:text-[#FAF4ED] focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-lg text-xs font-semibold bg-[#4E342E] dark:bg-[#D4AF37] text-white dark:text-[#120804] hover:bg-[#3E2723] active:scale-95 transition-all shrink-0 shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-950" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons: High-Res PNG Download & Share */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              
              {/* Download High-Resolution PNG Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 min-h-[46px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 transition-all shadow-xs disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Preparing PNG...' : 'Download Menu QR (PNG)'}</span>
              </button>

              {/* Native Mobile Share Button */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 min-h-[46px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-100 dark:bg-[#2A170D] text-zinc-800 dark:text-[#FAF4ED] hover:bg-zinc-200 dark:hover:bg-[#3A2012] border border-zinc-200 dark:border-[#3A2012] active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              )}

            </div>

          </div>
        )}

        {/* ================= TAB 2: IN-APP CAMERA QR SCANNER ================= */}
        {activeTab === 'scan' && (
          <div className="space-y-4 animate-fadeIn">
            
            <QrScanner 
              onScan={handleScanSuccess} 
              onClose={onClose} 
            />

            {/* Scanned Result Banner */}
            {scannedUrl && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#120804] border border-zinc-200 dark:border-[#3A2012] space-y-3 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                    Scanned Content:
                  </span>
                  <p className="text-xs font-mono font-medium text-zinc-900 dark:text-[#FAF4ED] break-all p-2 bg-white dark:bg-[#1F1009] rounded-lg border border-zinc-200 dark:border-[#3A2012]">
                    {scannedUrl}
                  </p>
                </div>

                {(scannedUrl.startsWith('http://') || scannedUrl.startsWith('https://')) && (
                  <button
                    type="button"
                    onClick={handleOpenScannedUrl}
                    className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#3E2723] dark:bg-[#D4AF37] dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 transition-all shadow-xs"
                  >
                    <span>Open Scanned Link</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* Done / Close Button */}
        <div className="pt-2 border-t border-zinc-100 dark:border-[#3A2012]">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-100 dark:bg-[#2A170D] text-zinc-700 dark:text-[#FAF4ED] hover:bg-zinc-200 dark:hover:bg-[#3A2012] active:scale-95 transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}