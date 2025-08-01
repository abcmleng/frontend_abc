import React from 'react';

export interface CaptureError {
  type: 'camera' | 'processing' | 'network' | 'validation' | string;
  message: string;
  tips: string[];
}

interface ErrorPageProps {
  error: CaptureError;
  onRetry: () => void;
  onBack: () => void;
}

const getErrorIcon = (type: CaptureError['type']) => {
  switch (type) {
    case 'camera':
      return <span role="img" aria-label="camera" style={{ fontSize: '48px', color: '#dc2626' }}>📷</span>;
    case 'network':
      return <span role="img" aria-label="network" style={{ fontSize: '48px', color: '#dc2626' }}>📡</span>;
    default:
      return <span role="img" aria-label="alert" style={{ fontSize: '48px', color: '#dc2626' }}>⚠️</span>;
  }
};

const getErrorTitle = (type: CaptureError['type']) => {
  switch (type) {
    case 'camera':
      return 'Camera Access Required';
    case 'processing':
      return 'Processing Failed';
    case 'network':
      return 'Connection Error';
    case 'validation':
      return 'Validation Error';
    default:
      return 'Something Went Wrong';
  }
};

export const ErrorPage: React.FC<ErrorPageProps> = ({ error, onRetry }) => {
  console.log('[ErrorPage] Displaying error:', error);

  return (
    <div className="bg-white  p-6 text-center">
      <div className="logo-he">
          <img
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
            className="mx-auto mb-6"
            style={{ height: 40 }}
          /></div>
      <div className="flex justify-center mb-4">
        {getErrorIcon(error.type)}
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {getErrorTitle(error.type)}
      </h2>
      
      <p className="text-gray-600 mb-6">
        {error.message}
      </p>

      {error.tips.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for better results:</h3>
          <ul className="space-y-1">
            {error.tips.map((tip, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex space-x-3">
        
    
        <button
          onClick={onRetry}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          &#x21bb; {/* Unicode for refresh symbol */}
          <span>Try Again</span>
        </button>
      </div>
      <div className="footer">
          <p className="mt-8 text-xs text-gray-400">Powered by <img src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit" className="inline h-4 ml-1" /></p>
        </div>
      
    </div>
  );
};