import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ThankYouProps {
  onNewTransaction: () => void;
}

export const ThankYou: React.FC<ThankYouProps> = ({ onNewTransaction }) => {
  return (
    <div className="full-screen">
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
        <div className="footer">
          <p className="mt-8 text-xs text-gray-400">Powered by <img src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit" className="inline h-4 ml-1" /></p>        </div>
    </div>
    
  );
};
