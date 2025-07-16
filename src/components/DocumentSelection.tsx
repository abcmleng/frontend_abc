import React from 'react';
import metadata from '../helper/metadata.json';

interface DocumentSelectionProps {
  selectedCountryCode: string | null;
  selectedDocumentType: string | null;
  onSelectDocumentType: (docType: string) => void;
  onNext: () => void;
}

const typeLabelMap: Record<string, string> = {
  PP: 'Passport',
  DL: 'Driving License',
  NI: 'National ID',
  AADHAAR: 'Aadhaar',
};

export const DocumentSelection: React.FC<DocumentSelectionProps> = ({
  selectedCountryCode,
  selectedDocumentType,
  onSelectDocumentType,
  onNext,
}) => {
  // Filter document types based on selected country code from metadata
  const documentTypes = React.useMemo(() => {
    if (!selectedCountryCode) return [];

    const docs = (metadata as { country_code: string; type: string; alternative_text: string }[])
      .filter((item) => item.country_code === selectedCountryCode)
      .map((item) => {
        const type = item.type || item.alternative_text || '';
        const label = typeLabelMap[type.toUpperCase()] || item.alternative_text || type;
        return {
          label,
          value: type,
        };
      });

    // Remove duplicates by value
    const uniqueDocs = Array.from(new Map(docs.map(doc => [doc.value.toLowerCase(), doc])).values());

    return uniqueDocs;
  }, [selectedCountryCode]);

  const handleDocumentSelect = (docType: string) => {
    onSelectDocumentType(docType);
  };

  return (
    <div className="full-screen">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center p-3 min-h-0 overflow-hidden">
        <div className="w-full max-w-md mx-auto flex flex-col justify-between h-full">
          {/* Logo */}
          <div className="flex justify-center py-6">
            <img
              className="h-12"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>

          {/* Title */}
          <h1 className="text-center text-xl font-normal text-gray-900 mb-6">
            Select ID card type
          </h1>

          {/* Document Options */}
          <div className="space-y-4">
            {documentTypes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No document types available for the selected country.</p>
              </div>
            ) : (
              documentTypes.map((docType) => (
                <button
                  key={docType.value}
                  onClick={() => handleDocumentSelect(docType.value)}
                  className={`w-full p-4 rounded-md text-left font-medium transition border-2
                    ${
                      selectedDocumentType === docType.value
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {docType.label}
                </button>
              ))
            )}
          </div>
  
        </div>
      </div>
      <div className="footer">

          {/* Continue Button */}
          <div className="mt-10">
            <button
              onClick={onNext}
              disabled={!selectedCountryCode}
              className={`px-4 py-3 font-semibold rounded-md transition ${
                selectedCountryCode
                  ? 'bg-blue-800 text-white hover:bg-blue-900'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              Continue
            </button>

          </div>
           <p className="mt-8 text-xs text-gray-400">Powered by <img src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit" className="inline h-4 ml-1" /></p>
        </div>
    </div>
  );
};
