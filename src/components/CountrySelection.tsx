import React from 'react';
import metadata from '../helper/metadata.json';

interface CountrySelectionProps {
  selectedCountryCode: string | null;
  onSelectCountryCode: (countryCode: string) => void;
  onNext: () => void;
}

export const CountrySelection: React.FC<CountrySelectionProps> = ({
  selectedCountryCode,
  onSelectCountryCode,
  onNext,
}) => {
  // Extract unique countries with country_code and country name
  const countries = Array.from(
    new Map(
      (metadata as { country: string; country_code: string }[]).map((item) => [
        item.country_code,
        item.country,
      ])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onSelectCountryCode(value);
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
            ID Issuer Country
          </h1>

          {/* Dropdown */}
          <div>
            <select
              className="w-full px-3 py-3 border border-gray-300 rounded-md text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 bg-white text-base appearance-none"
              value={selectedCountryCode || ''}
              onChange={handleChange}
            >
              <option value="" disabled>
                -- Choose Country --
              </option>
              {countries.map(([code, name]) => (
                <option key={code} value={code} className="py-2">
                  {name}
                </option>
              ))}
            </select>
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
