import React, { useEffect, useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import { CapturedImage } from '../types/kyc';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';
import { Camera } from 'lucide-react';

interface DocumentBackCaptureProps {
  onCapture: (image: CapturedImage) => void;
  onNext: () => void;
  verificationId: string;
  onError?: (errorMessage: string) => void;
}

export const DocumentBackCapture: React.FC<DocumentBackCaptureProps> = ({
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
  const [isUploading, setIsUploading] = useState(false);
  const [captureError, setCaptureError] = useState<CaptureError | null>(null);

  useEffect(() => {
    startCamera('environment');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    setIsCapturing(true);
    const result = await captureImage();
    if (result) {
      const image: CapturedImage = {
        blob: result.blob,
        url: result.url,
        timestamp: new Date(),
      };
      setCapturedImage(image);
      onCapture(image);
      await handleCheckQuality(image);
    }
    setIsCapturing(false);
  };

  const handleRetake = () => {
    if (capturedImage) URL.revokeObjectURL(capturedImage.url);
    setCapturedImage(null);
    setCaptureError(null);
    startCamera('environment');
  };

  const handleCheckQuality = async (image: CapturedImage) => {
    try {
      setIsUploading(true);
      const res = await kycApiService.processDocument({
        image: image.blob,
        type: 'document-back',
        verificationId,
      });

      if (res.message === 'CLEAR IMAGE') {
        const uuid =
          'ML_' +
          (crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15));
        await kycApiService.processOCRDocument(image.blob, uuid);
        stopCamera();
        onNext();
      } else {
        setCaptureError({
          type: 'validation',
          message: res.message || 'Document is not clear. Please retake.',
          tips: ['Ensure full visibility of the document.', 'Avoid glare or shadows.'],
        });
        onError?.(res.message || 'Document is not clear. Please retake.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Network error. Please try again.';
      setCaptureError({
        type: 'network',
        message: msg,
        tips: ['Check your internet connection.', 'Try again later.'],
      });
      onError?.(msg);
    } finally {
      setIsUploading(false);
    }
  };

  if (captureError) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-4">
            <div className="border-b border-gray-200 pb-2 mb-4 flex justify-center">
              <img
                className="h-6"
                src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
                alt="IDMerit"
              />
            </div>
            <ErrorPage
              error={captureError}
              onRetry={handleRetake}
              onBack={handleRetake}
            />
            <div className="border-t border-gray-200 pt-2 mt-4 flex justify-center items-center gap-2">
              <span className="text-xs text-gray-500">Powered by</span>
              <img
                className="h-4"
                src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
                alt="IDMerit"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex justify-center">
          <img
            className="h-6"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
        <h1 className="text-black text-center mt-2 text-base font-semibold">
          Document Back Side
        </h1>
      </div>

      {/* Camera Area */}
      <div className="flex-1 flex flex-col justify-between p-3 min-h-0">
        <div className="w-full max-w-md mx-auto flex flex-col flex-grow">
          <div className="relative flex-grow bg-black rounded-xl overflow-hidden aspect-[4/3] mb-3">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Overlay frame */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-60 h-40 border-2 border-white rounded-xl relative mb-4">
                    <img
                      src="src/images/camera-bg.png"
                      alt="Document Frame"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-white text-center text-sm px-2">
                    Position your document fully within the frame
                  </p>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage.url}
                alt="Captured Document"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Capture Button below video */}
          {!capturedImage && (
            <div className="flex justify-center mb-4">
              <button
                onClick={handleCapture}
                disabled={!isStreaming || isCapturing || isUploading}
                className="w-16 h-16 rounded-full bg-white border border-gray-700 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition"
              >
                <Camera className="w-8 h-8 text-gray-800" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-center items-center gap-2">
        <span className="text-xs text-gray-500">Powered by</span>
        <img
          className="h-4"
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
        />
      </div>

      {/* Processing overlay */}
      {(isCapturing || isUploading) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-sm">Processing...</p>
        </div>
      )}
    </div>
  );
};
