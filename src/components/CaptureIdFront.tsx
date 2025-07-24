import React from 'react';

interface CaptureIdFrontProps {
  onContinue: () => void;
  selectedCountryCode?: string | null;
  selectedDocumentType?: string | null;
}

export const CaptureIdFront: React.FC<CaptureIdFrontProps> = ({
  onContinue,
  selectedCountryCode,
  selectedDocumentType,
}) => {
  // Default image
let imageSrc = "src/images/card-scan-icon-aadhaar-1.png";

if (selectedCountryCode && selectedDocumentType) {
  const docType = selectedDocumentType.toLowerCase();

  // USA  
  if (selectedCountryCode === 'USA') {
    if (docType === 'pp') {
      imageSrc = "src/images/card-scan-icon-passport.png";
    } else if (docType === 'dl') {
      imageSrc = "src/images/card-scan-icon-ni.png";
    } else if (docType === 'ni') {
      imageSrc = "src/images/card-scan-icon-aadhaar-1.png";
    }

  // ARG
  } else if (selectedCountryCode === 'ARG') {
    if (docType === 'pp') {
      imageSrc = "src/images/card-scan-icon-passport.png";
    } else if (docType === 'ni') {
      imageSrc = "src/images/card-scan-icon-ni-argentina.jpg";
    }

  // CAN
  } else if (selectedCountryCode === 'CAN' && docType === 'dl') {
    imageSrc = "src/images/card-scan-icon-aadhaar-1.png";

  // AUS  
  } else if (selectedCountryCode === 'AUS' && docType === 'pp') {
    imageSrc = "src/images/card-scan-icon-passport.png";

  // ALB  
  } else if (selectedCountryCode === 'ALB' && docType === 'ni') {
    imageSrc = "src/images/card-scan-icon-aadhaar-1.png";

  // IND
  } else if (selectedCountryCode === 'IND' && docType === 'aadhaar') {
    imageSrc = "src/images/card-scan-icon-aadhaar.png";

  // THA
  } else if (selectedCountryCode === 'THA' && docType === 'ni') {
    imageSrc = "src/images/card-scan-icon-aadhaar-1.png";

    } else if (selectedCountryCode === 'THA' && docType === 'pp') {
    imageSrc = "src/images/card-scan-icon-passport.png";

  // POL
  } else if (selectedCountryCode === 'POL' && docType === 'pp') {
    imageSrc = "src/images/card-scan-icon-passport.png";

  // GEO
  } else if (selectedCountryCode === 'GEO' && docType === 'pp') {
    imageSrc = "src/images/card-scan-icon-passport.png";

  // CHN
  } else if (selectedCountryCode === 'CHN' && docType === 'ni') {
    imageSrc =  "src/images/card-scan-icon-aadhaar-1.png";

  // BEN
  } else if (selectedCountryCode === 'BEN' && docType === 'ni') {
    imageSrc =  "src/images/card-scan-icon-aadhaar-1.png";

  // ROU
  } else if (selectedCountryCode === 'ROU' && docType === 'ni') {
    imageSrc =  "src/images/card-scan-icon-aadhaar-1.png";

  // HRV
  } else if (selectedCountryCode === 'HRV' && docType === 'dl') {
    imageSrc = "src/images/card-scan-icon-aadhaar-1.png";

  // MKD
  } else if (selectedCountryCode === 'MKD' && docType === 'ni') {
    imageSrc =  "src/images/card-scan-icon-aadhaar-1.png";
  }
}



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
          src={imageSrc}
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
