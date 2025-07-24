import React from 'react';

interface CaptureIdBackProps {
  onContinue: () => void;
  selectedCountryCode?: string | null;
  selectedDocumentType?: string | null;
}

export const CaptureIdBack: React.FC<CaptureIdBackProps> = ({ onContinue, selectedCountryCode, selectedDocumentType }) => {
let imageSrc = "src/images/card-scan-icon-can-pr.png";

if (selectedCountryCode && selectedDocumentType) {
  const docType = selectedDocumentType.toLowerCase();

  // USA  
  if (selectedCountryCode === 'USA') {
    if (docType === 'pp') {
      imageSrc = "src/images/card-scan-icon-greencard-back.jpg";
    } else if (docType === 'dl') {
      imageSrc = "src/images/card-scan-icon-can-pr.png";
    } else if (docType === 'ni') {
      imageSrc = "src/images/card-scan-icon-can-pr.png";
    }

  // ARG
  } else if (selectedCountryCode === 'ARG') {
    if (docType === 'pp') {
      imageSrc = "src/images/card-scan-icon-ni-argentina-back.jpg";
    } else if (docType === 'ni') {
      imageSrc = "src/images/card-scan-icon-ni-argentina-back.jpg";
    }

  // CAN
  } else if (selectedCountryCode === 'CAN' && docType === 'dl') {
    imageSrc = "src/images/card-scan-icon-can-pr.png";

  // AUS  
  } else if (selectedCountryCode === 'AUS' && docType === 'pp') {
    imageSrc = "src/images/card-scan-icon-greencard-back.jpg";

  // ALB  
  } else if (selectedCountryCode === 'ALB' && docType === 'ni') {
    imageSrc = "src/images/card-scan-icon-can-pr.png";

  // IND
  } else if (selectedCountryCode === 'IND' && docType === 'aadhaar') {
    imageSrc = "src/images/card-scan-icon-aadhaar-back.png";
  }
}

  return (
    <div className="full-screen">
      {/* Main Content */}
      <main className="flex flex-col flex-grow items-center justify-center p-6">
        <img
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
          className="h-10 mb-2"
        />
        <h1 className="text-xl font-semibold mb-6">Capture your Back side of ID</h1>
        <img
          src={imageSrc}
          alt="Capture your Back side of ID"
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
