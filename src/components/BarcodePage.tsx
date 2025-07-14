// File: BarcodePage.tsx

import React from 'react';

interface BarcodePageProps {
  onNext: () => void;
}

export const BarcodePage: React.FC<BarcodePageProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="max-w-sm w-full text-center">
        <img
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
          className="mx-auto mb-6"
          style={{ height: 40 }}
        />
        <h1 className="text-2xl font-semibold mb-4">Scan Barcode</h1>
        <img
          src="src/images/card-scan-front-icon.png"
          alt="Scan Barcode"
          className="mx-auto mb-6"
          style={{ width: 120, height: 120 }}
        />
        <p className="mb-6 text-gray-700">
          You have to allow Camera Permission.
        </p>
        <button
          onClick={onNext}
          className="bg-blue-700 text-white font-semibold py-3 px-6 rounded hover:bg-blue-800 transition"
        >
          Scan Barcode
        </button>
        <p className="mt-8 text-xs text-gray-400">
          Powered by
          <img
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit"
            className="inline h-4 ml-1"
          />
        </p>
      </div>
    </div>
  );
};
