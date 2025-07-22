import React from 'react';

interface CaptureIdFrontProps {
  onContinue: () => void;
}

export const CaptureIdFront: React.FC<CaptureIdFrontProps> = ({ onContinue }) => {
  return (
    <div className="full-screen">
      {/* Main Content */}
      <main className="flex flex-col flex-grow items-center justify-center p-6">
        <div className="flex justify-center py-6">
            <img
              className="h-12"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        <h1 className="text-xl font-semibold mb-6">Capture your Front side of ID</h1>
        <img
          src="src/images/card-scan-icon-greencard.jpg"
          alt="Capture your Front side of ID"
          className="mb-6"
          style={{ width: 160, height: 160 }}
        />
    
      </main>
          <div className="footer">
                <button
          onClick={onContinue}
          className="bg-blue-700 text-white font-semibold py-3 px-8 rounded hover:bg-blue-800 transition"
        >
          Continue
        </button>
        
          <p className="mt-8 text-xs text-gray-400">Powered by <img src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit" className="inline h-4 ml-1" /></p>
        </div>
    </div>
  );
};
