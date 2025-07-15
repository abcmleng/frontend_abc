import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ThankYouProps {
  onNewTransaction: () => void;
}

export const ThankYou: React.FC<ThankYouProps> = ({ onNewTransaction }) => {
  return (
    <div className="relative h-screen flex flex-col justify-between bg-white text-center px-4">
      {/* Header with logo */}
      <div className="pt-8 flex justify-center">
        <img
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMERIT Logo"
          className="h-10"
        />
      </div>

      {/* Center Message */}
      <div className="flex-grow flex flex-col items-center justify-top mt-[30px]">
        <h1 className="text-3xl font-semibold text-black mb-2">Thank you!</h1>
        <p className="text-xl text-gray-600 mb-6">Your information has been uploaded.</p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center text-xs text-gray-400">
        <span className="flex items-center gap-1">
          Powered by
          <img
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMERIT"
            className="h-4"
          />
        </span>
      </div>
    </div>
  );
};
