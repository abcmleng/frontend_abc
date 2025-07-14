import React, { useEffect, useState } from 'react';
import { Scan } from 'lucide-react';
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
  const { videoRef, isStreaming, isLoading, error, startCamera, stopCamera } = useCamera();

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

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      const msg = 'Canvas context not available';
      handleFailure('processing', msg);
      return;
    }

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        const msg = 'Failed to capture image';
        handleFailure('processing', msg);
        return;
      }

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
    return <ErrorPage error={captureError} onRetry={handleRetry} onBack={handleRetry} />;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex justify-center border-b border-gray-200 py-3">
        <img className="h-6" src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit Logo" />
      </div>

      <div className="flex-1 flex flex-col justify-between items-center px-4 py-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-4">
            <Scan className="mx-auto text-blue-600 mb-1" size={32} />
            <h1 className="text-lg font-semibold text-gray-900">Scan MRZ Code</h1>
            <p className="text-sm text-gray-500">Align the MRZ at the bottom of the frame</p>
          </div>

          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[4/3] mb-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-center pb-4">
              <div className="w-64 h-12 border-2 border-white/80 rounded-md flex items-center justify-center">
                <p className="text-xs text-white">MRZ Scan Zone</p>
              </div>
            </div>

            {(isLoading || isScanning) && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mb-2 mx-auto"></div>
                  <p className="text-sm">{isScanning ? 'Scanning...' : 'Loading camera...'}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleScan}
            disabled={!isStreaming || isScanning}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Scanning...
              </>
            ) : (
              <>
                <Scan size={18} />
                Capture MRZ
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 border-t border-gray-200 py-3 text-xs text-gray-500">
        <span>Powered by</span>
        <img className="h-4" src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit Logo" />
      </div>
    </div>
  );
};
