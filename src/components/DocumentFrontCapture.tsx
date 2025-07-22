import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { CapturedImage } from '../types/kyc';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';

interface DocumentFrontCaptureProps {
  onCapture: (image: CapturedImage) => void;
  onNext: () => void;
  verificationId: string;
  onError?: (errorMessage: string) => void;
  onResetError?: () => void;
}

export const DocumentFrontCapture: React.FC<DocumentFrontCaptureProps> = ({
  onCapture,
  onNext,
  verificationId,
  onError,
  onResetError,
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isClearImage, setIsClearImage] = useState(false);
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
    } else {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
    }
    setCapturedImage(null);
    setUploadError(null);
    setIsClearImage(false);
    setCaptureError(null);
    setIsCapturing(false);
    setIsUploading(false);
    startCamera('environment');
  };

  const handleCheckQuality = async (image: CapturedImage) => {
    if (!image) return;

    setIsUploading(true);
    setUploadError(null);
    setIsClearImage(false);
    setCaptureError(null);

    try {
      const response = await kycApiService.processDocument({
        image: image.blob,
        type: 'document-front',
        verificationId,
      });

      if (response.message === 'CLEAR IMAGE') {
        setIsClearImage(true);

        const uuid =
          'ML_' +
          (crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15));

        const ocrResponse = await kycApiService.processOCRDocument(
          image.blob,
          uuid
        );
        stopCamera();
        onCapture(image);
        onNext();
      } else if (response.message === 'FAKE') {
        setUploadError('Fake document detected. Please retake.');
        setCaptureError({
          type: 'validation',
          message: 'Fake document detected. Please retake.',
          tips: ['Ensure the document is genuine.', 'Try again with a real document.'],
        });
        if (onError) onError('Fake document detected. Please retake.');
      } else {
        setUploadError(response.message || 'Document is not clear. Please retake.');
        setCaptureError({
          type: 'validation',
          message: response.message || 'Document is not clear. Please retake.',
          tips: ['Ensure the document is fully visible.', 'Avoid glare or shadows.'],
        });
        if (onError) onError(response.message || 'Document is not clear. Please retake.');
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Network error. Please try again.';
      setUploadError(errorMessage);
      setCaptureError({
        type: 'network',
        message: errorMessage,
        tips: ['Check your internet connection.', 'Try again later.'],
      });
      if (onError) onError(errorMessage);
    } finally {
      setIsUploading(false);
      setIsCapturing(false);
    }
  };
  
  if (captureError) {
    return (
      <div className="full-screen">
        <div className="flex flex items-center justify-center p-3 min-h-0">
          <div className="w-full max-w-md bg-white p-4">
            <ErrorPage
              error={captureError}
              onRetry={() => {
                setCaptureError(null);
                if (onResetError) onResetError();
                handleRetake();
              }}
              onBack={() => {
                setCaptureError(null);
                if (onResetError) onResetError();
                handleRetake();
              }}
            />
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 relative h-screen flex flex-col bg-white">
        <h1 className="text-black text-center mt-2 text-base font-semibold">
          Document Front Side
        </h1>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between p-3 min-h-0 overflow-hidden">
        <div className="w-full max-w-md mx-auto flex flex-col flex-grow">
          {/* Camera Section */}
          <div className="relative flex-grow bg-white rounded-xl overflow-hidden aspect-[4/3] mb-3 border border-gray-300">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-80 h-52 border-2 border-white rounded-xl relative flex items-center justify-center mb-4">
                  <img
                    src="src/images/camera-bg.png"
                    alt="Document Icon"
                    className="absolute center"
                  />
                </div>
                <p className="text-white text-center text-sm px-2">
                  Position your document fully within the frame
                </p>
                </div>
                {isLoading && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-gray-700 border-t-transparent"></div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage.url}
                alt="Document front"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Capture Button */}
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


      {/* Loading Overlay after capture */}
      {(isCapturing || isUploading) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-sm">Processing...</p>
        </div>
      )}
    </div>
  );
};
