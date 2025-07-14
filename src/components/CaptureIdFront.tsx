import React from 'react';

interface CaptureIdFrontProps {
  onContinue: () => void;
}

export const CaptureIdFront: React.FC<CaptureIdFrontProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex mt-[10px] flex-col items-center bg-white border-b  px-4 py-3">
        <img
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
          className="h-10 mb-2"
        />
        {/* <p className="text-gray-500 text-xs">Powered by <img src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit" className="inline h-4 ml-1" /></p> */}
      </header>

      

      {/* Main Content */}
      <main className="flex flex-col flex-grow items-center justify-center p-6">
        <h1 className="text-xl font-semibold mb-6">Capture your Front side of ID</h1>
        <img
          src="src/images/card-scan-icon-greencard.jpg"
          alt="Capture your Front side of ID"
          className="mb-6"
          style={{ width: 160, height: 160 }}
        />
        <button
          onClick={onContinue}
          className="bg-blue-700 text-white font-semibold py-3 px-8 rounded hover:bg-blue-800 transition"
        >
          Continue
        </button>
        <p className="mt-8 text-xs text-gray-400">Powered by <img src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit" className="inline h-4 ml-1" /></p>
      </main>

    </div>
  );
};
