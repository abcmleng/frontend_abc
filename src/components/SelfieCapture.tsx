// src/components/SelfieCapture.tsx
import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { CapturedImage } from '../types/kyc';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';

interface SelfieCaptureProps {
  onCapture?: (image: CapturedImage) => void;
  onNext: () => void;
  verificationId: string;
  onError?: (error_code: string) => void;
}

export const SelfieCapture: React.FC<SelfieCaptureProps> = ({
  onCapture,
  onNext,
  verificationId,
  onError,
}) => {
  const {
    videoRef,
    isStreaming,
    isLoading,
    startCamera,
    stopCamera,
    captureImage,
  } = useCamera();

  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<CaptureError | null>(null);

  useEffect(() => {
    startCamera('user');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    setIsCapturing(true);
    const result = await captureImage();
    if (result) {
      const image: CapturedImage = { blob: result.blob, url: result.url, timestamp: new Date() };
      setCapturedImage(image);
      onCapture?.(image);
      await handleUpload(image);
    }
    setIsCapturing(false);
  };

  const handleUpload = async (image: CapturedImage) => {
    setUploadError(null);
    setCaptureError(null);
    try {
      const response = await kycApiService.processImage({
        image: image.blob,
        type: 'selfie',
        verificationId,
      });
      if (response && (response.live === 'REAL' || response.live === 'FAKE')) {
        stopCamera();
        onNext();
        return;
      }
      throw new Error('Unexpected response from server.');
    } catch (error: any) {
      console.error('[SelfieCapture] Upload failed:', error);
      const apiMessage = error?.response?.data?.errorMessage;
      const msg = apiMessage || error?.message || 'Network error. Please try again.';
      setUploadError(msg);
      setCaptureError({
        type: 'alert',
        message: msg,
        tips: ['Ensure proper lighting and face positioning.', 'Try again.'],
      });
      onError?.(msg);
    }
  };

  const handleRetake = () => {
    if (capturedImage) URL.revokeObjectURL(capturedImage.url);
    setCapturedImage(null);
    setUploadError(null);
    setCaptureError(null);
    startCamera('user');
  };

  if (captureError) {
    return (
      <ErrorPage error={captureError} onRetry={handleRetake} onBack={handleRetake} />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-between bg-black text-white relative overflow-hidden">
      {/* Instructions */}
      <div className="pt-6 text-center z-10">
        <h1 className="text-lg font-medium">Take a Selfie</h1>
      </div>

      {/* Video & overlay */}
      <div className="relative w-full flex-1 flex items-center justify-center">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {/* Oval CSS overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <div className="text-sm mb-2 text-white/80">Position your face fully within the frame</div>
              <div
                className="w-80 h-[400px] rounded-[40%/50%]"
                style={{
                  backgroundColor: 'transparent',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                  WebkitBoxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                }}
              />
            </div>
          </>
        ) : (
          <img
            src={capturedImage.url}
            alt="Captured selfie"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center pb-10 z-10">
        {uploadError && (
          <div className="text-red-400 text-xs mb-2 text-center px-4">
            {uploadError}
          </div>
        )}
        <button
          onClick={!capturedImage ? handleCapture : handleRetake}
          disabled={isCapturing || isLoading}
          className="rounded-full w-16 h-16 bg-white flex items-center justify-center"
        >
          <Camera className="text-black w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
