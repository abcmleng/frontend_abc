import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';

interface BarcodeScannerProps {
  onScan: (barcodeData: string) => void;
  onNext: () => void;
  verificationId: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onNext, verificationId }) => {
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
      const errorMsg = 'Camera not available';
      setUploadError(errorMsg);
      setCaptureError({
        type: 'camera',
        message: errorMsg,
        tips: ['Ensure your camera is connected and accessible.', 'Try refreshing the page.'],
      });
      setIsScanning(false);
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      const errorMsg = 'Failed to get canvas context';
      setUploadError(errorMsg);
      setCaptureError({
        type: 'processing',
        message: errorMsg,
        tips: ['Try restarting the application.', 'Ensure your browser supports canvas.'],
      });
      setIsScanning(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        const errorMsg = 'Failed to capture image';
        setUploadError(errorMsg);
        setCaptureError({
          type: 'processing',
          message: errorMsg,
          tips: ['Try again.', 'Ensure good lighting and camera focus.'],
        });
        setIsScanning(false);
        return;
      }

      setUploadError(null);
      setOcrStatus(null);
      setScannedData(null);
      setCaptureError(null);

      try {
        const response = await kycApiService.processBarcodeDocument(blob, verificationId);

        if (response.success && response.data?.status === 'success') {
          const barcodeData = JSON.stringify(response.data.parsed_data, null, 2);
          setScannedData(barcodeData);
          setOcrStatus('SUCCESSFUL');
          onScan(barcodeData);
          stopCamera();
          onNext();
        } else {
          const errorMsg = 'Barcode processing failed or status not successful.';
          setUploadError(errorMsg);
          setCaptureError({
            type: 'processing',
            message: errorMsg,
            tips: ['Ensure barcode is clearly visible.', 'Try again with better lighting or angle.'],
          });
          setOcrStatus(null);
        }
      } catch (error: any) {
        const errorMsg = error?.message || 'Network error. Please try again.';
        setUploadError(errorMsg);
        setCaptureError({
          type: 'network',
          message: errorMsg,
          tips: ['Check your internet connection.', 'Try again later.'],
        });
      } finally {
        setIsScanning(false);
      }
    }, 'image/jpeg');
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
      <div className="flex-shrink-0 bg-white px-4 py-3 border-b border-gray-200 text-center">
        <img
          className="h-6 mx-auto"
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
        />
        <h1 className="text-black text-base font-semibold mt-2">Capture Barcode</h1>
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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-60 h-16 border-2 border-white/70 rounded-lg flex items-center justify-center">
                <p className="text-white text-sm">Align Barcode in Frame</p>
              </div>
            </div>
          </div>

          {/* Capture Button */}
          <div className="flex justify-center mb-4">
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
              Barcode Scan: SUCCESSFUL
            </div>
          )}

          {uploadError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm text-center">
              {uploadError}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 text-center">
        <span className="text-xs text-gray-500">Powered by</span>
        <img
          className="h-4 inline-block ml-1"
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
        />
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