import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';

interface MRZScannerProps {
  onScan: (mrzData: string) => void;
  onNext: () => void;
  verificationId: string;
  onError?: (errorMessage: string) => void;
}

export const MRZScanner: React.FC<MRZScannerProps> = ({ onScan, onNext, verificationId, onError }) => {
  const {
    videoRef,
    isStreaming,
    isLoading,
    error,
    startCamera,
    stopCamera
  } = useCamera();

  const [scannedData, setScannedData] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<CaptureError | null>(null);

  useEffect(() => {
    startCamera('environment');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleScan = async () => {
    setIsScanning(true);

    if (!videoRef.current) {
      const msg = 'Camera not available';
      handleFailure('camera', msg);
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      const msg = 'Canvas context not available';
      handleFailure('processing', msg);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        const msg = 'Failed to capture image';
        handleFailure('processing', msg);
        return;
      }

      setUploadError(null);
      setOcrStatus(null);
      setScannedData(null);
      setCaptureError(null);

      try {
        const res = await kycApiService.processMRZDocument(blob, verificationId);
        if (res.success && res.data?.status === 'success') {
          const parsed = JSON.stringify(res.data.parsed_data, null, 2);
          setScannedData(parsed);
          setOcrStatus('SUCCESSFUL');
          onScan(parsed);
          stopCamera();
          onNext();
        } else {
          const msg = res?.message || 'MRZ scan failed.';
          handleFailure('processing', msg);
        }
      } catch (err: any) {
        const msg = err?.message || 'Network error';
        handleFailure('network', msg);
      } finally {
        setIsScanning(false);
      }
    }, 'image/jpeg');
  };

  const handleFailure = (type: CaptureError['type'], message: string) => {
    setUploadError(message);
    setCaptureError({
      type,
      message,
      tips: ['Try again with better lighting.', 'Ensure MRZ lines are clearly visible.']
    });
    onError?.(message);
    setIsScanning(false);
  };

  const handleRetry = () => {
    setScannedData(null);
    setOcrStatus(null);
    setIsScanning(false);
    setUploadError(null);
    setCaptureError(null);
    startCamera('environment');
  };

  if (captureError) {
    return (
      <ErrorPage error={captureError} onRetry={handleRetry} onBack={handleRetry} />
    );
  }

  return (
    <div className="relative h-screen flex flex-col bg-white">
      <div className="flex-shrink-0 bg-white px-4 py-3 border-gray-200 text-center">
        <h1 className="text-black text-base font-semibold mt-2">Capture MRZ</h1>
      </div>

      <div className="flex-1 flex flex-col justify-between p-3">
        <div className="w-full max-w-md mx-auto flex flex-col flex-grow">
          <div className="relative flex-grow bg-black rounded-xl overflow-hidden aspect-[4/3] mb-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
              <div className="w-80 h-20 border-2 border-white/80 rounded-md flex items-center justify-center">
                <p className="text-xs text-white">MRZ Capture Zone</p>
              </div>
            </div>
          </div>

          {/* Capture Button */}
          <div className="flex justify-center mt-5 mb-4">
            <button
              onClick={handleScan}
              disabled={!isStreaming || isScanning}
              className="w-16 h-16 rounded-full bg-white border border-gray-700 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition"
            >
              <Camera className="w-8 h-8 text-gray-800" />
            </button>
          </div>

          {ocrStatus === 'SUCCESSFUL' && (
            <div className="bg-green-100 border border-green-300 text-green-800 px-3 py-2 rounded-lg text-sm text-center">
              MRZ Scan: SUCCESSFUL
            </div>
          )}

          {uploadError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm text-center">
              {uploadError}
            </div>
          )}
        </div>
      </div>

      {(isScanning || isLoading) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-3"></div>
          <p className="text-white text-sm">{isScanning ? 'capturing...' : 'Loading camera...'}</p>
        </div>
      )}
    </div>
  );
};
