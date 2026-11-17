import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, RefreshCw, AlertCircle, CheckCircle2, Upload, ExternalLink, Sparkles } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScanner({ onScan, onClose }) {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scannedResult, setScannedResult] = useState('');
  const [processingFile, setProcessingFile] = useState(false);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerId = 'coffee-qr-reader';

  // Initialize and check available cameras
  useEffect(() => {
    let mounted = true;

    async function initCameras() {
      try {
        setScannerError('');
        setPermissionDenied(false);

        // Check if getUserMedia is supported in current context
        if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            setScannerError('Mobile browser cameras require HTTPS or localhost. You can still scan by uploading a QR image file.');
          } else {
            setScannerError('Camera access is not supported by your browser. Please use the image upload option.');
          }
          return;
        }

        const devices = await Html5Qrcode.getCameras().catch((err) => {
          const errStr = (err?.message || err || '').toString().toLowerCase();
          if (errStr.includes('permission') || errStr.includes('denied') || errStr.includes('notallowed')) {
            if (mounted) setPermissionDenied(true);
          }
          return [];
        });

        if (!mounted) return;

        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/environment camera on mobile phones
          const backCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') || 
            d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      } catch (err) {
        if (mounted) {
          console.warn('Camera initialization notice:', err);
        }
      }
    }

    initCameras();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, []);

  const startScanner = async (cameraIdOrConfig = null) => {
    try {
      setScannerError('');
      setPermissionDenied(false);
      setScannedResult('');

      if (scannerRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      // Scanning configuration optimized for mobile and desktop
      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      const cameraParam = cameraIdOrConfig || selectedCameraId || { facingMode: 'environment' };

      await html5QrCode.start(
        cameraParam,
        config,
        (decodedText) => {
          // Success callback
          handleSuccessfulScan(decodedText);
        },
        () => {
          // Frame parse error (ignore frame misses while scanning)
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Failed to start QR camera:', err);
      const msg = (err?.message || err || '').toString();
      setIsScanning(false);

      if (msg.includes('NotAllowedError') || msg.includes('Permission') || msg.includes('denied')) {
        setPermissionDenied(true);
        setScannerError('Camera permission was denied. Please grant camera permission in your browser settings.');
      } else if (msg.includes('NotFoundError') || msg.includes('No camera')) {
        setScannerError('No camera found on this device. You can scan by uploading a QR image file below.');
      } else {
        setScannerError(msg || 'Unable to access camera. Please check browser permissions or upload an image.');
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        // ignore cleanup error
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleSuccessfulScan = (text) => {
    setScannedResult(text);
    stopScanner();
    if (onScan) {
      onScan(text);
    }
  };

  // Scan QR from image file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessingFile(true);
      setScannerError('');
      setScannedResult('');

      // Stop live camera if running
      await stopScanner();

      // Create scanner instance if not already created
      let html5QrCode = scannerRef.current;
      if (!html5QrCode) {
        html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;
      }

      const decodedText = await html5QrCode.scanFile(file, true);
      handleSuccessfulScan(decodedText);
    } catch (err) {
      console.warn('Failed to scan uploaded QR image:', err);
      setScannerError('No valid QR code could be found in this image. Please ensure the QR code is clearly visible and well-lit.');
    } finally {
      setProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Scanner Viewport */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-[#E8DFC8] dark:border-[#3A2012] min-h-[280px] flex flex-col items-center justify-center text-white">
        
        {/* html5-qrcode DOM anchor */}
        <div 
          id={containerId} 
          className="w-full max-w-[320px] aspect-square overflow-hidden rounded-xl"
        />

        {/* Overlay when NOT scanning or when permission error */}
        {!isScanning && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            {permissionDenied ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <CameraOff className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">
                    Camera Access Blocked
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    Camera permission was denied. Tap browser site settings to allow camera access, or upload a saved QR image.
                  </p>
                </div>
                <button
                  onClick={() => startScanner()}
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-[#4E342E] text-white hover:bg-[#3E2723] active:scale-95 transition-all shadow-xs"
                >
                  Request Permission Again
                </button>
              </>
            ) : scannedResult ? (
              <div className="space-y-3 max-w-xs animate-fadeIn">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                    QR Scanned Successfully
                  </span>
                  <p className="text-xs font-mono font-semibold text-white mt-2 p-2 bg-zinc-900 rounded-lg break-all border border-zinc-800">
                    {scannedResult}
                  </p>
                </div>
                <div className="flex gap-2 justify-center pt-1">
                  <button
                    onClick={() => startScanner()}
                    className="flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Scan Another</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#4E342E]/40 text-[#FFE082] flex items-center justify-center border border-[#8D6E63]/30">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-white">
                    Ready to Scan
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    Scan table QR codes or menu item codes with your camera
                  </p>
                </div>
                <button
                  onClick={() => startScanner()}
                  className="flex items-center gap-2 min-h-[46px] px-6 py-2.5 rounded-xl text-sm font-bold bg-[#D4AF37] text-[#120804] hover:bg-[#E9C053] active:scale-95 transition-all shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Live Camera</span>
                </button>
              </>
            )}
          </div>
        )}

      </div>

      {/* Error Notice */}
      {scannerError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{scannerError}</span>
        </div>
      )}

      {/* Camera Controls & File Upload Alternative */}
      <div className="space-y-2.5 pt-1">
        
        {/* If multiple cameras detected, allow switcher */}
        {cameras.length > 1 && (
          <div className="flex items-center justify-between gap-2 p-2 bg-zinc-50 dark:bg-[#2A170D] rounded-xl border border-zinc-200 dark:border-[#3A2012]">
            <span className="text-xs font-semibold text-zinc-600 dark:text-[#D69E76] pl-1">
              Camera:
            </span>
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                if (isScanning) {
                  startScanner(e.target.value);
                }
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-[#3A2012] bg-white dark:bg-[#120804] text-zinc-800 dark:text-[#FAF4ED] focus:outline-none"
            >
              {cameras.map((c, idx) => (
                <option key={c.id} value={c.id}>
                  {c.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Live Scan Control Button (when scanning) */}
        {isScanning && (
          <button
            onClick={stopScanner}
            className="w-full flex items-center justify-center gap-1.5 min-h-[44px] py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-[#FAF4ED] bg-zinc-100 dark:bg-[#2A170D] border border-zinc-200 dark:border-[#3A2012] hover:bg-zinc-200 active:scale-95 transition-all"
          >
            <CameraOff className="w-4 h-4" />
            <span>Stop Camera</span>
          </button>
        )}

        {/* Scan from Photo / Image File Alternative */}
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="qr-file-upload-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processingFile}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#4E342E] dark:text-[#D4AF37] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100/70 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{processingFile ? 'Analyzing QR image...' : 'Scan from Photo / Image File'}</span>
          </button>
          <p className="text-[11px] text-zinc-400 dark:text-[#8D6E63] mt-1">
            Works without a camera — upload screenshots or saved QR photos
          </p>
        </div>

      </div>

    </div>
  );
}