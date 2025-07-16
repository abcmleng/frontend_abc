import React from 'react';

interface VerifyPageProps {
  userId: string;
  onStart: () => void;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ userId, onStart }) => {
  return (
    <div className="full-screen">
      <div className="main-container">
        <div className="w-full mt-5 text-center">
          <img
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
            className="mx-auto mb-6"
            style={{ height: 40 }}
          />
          <h1 className="text-2xl font-semibold mb-4">Verify your identity</h1>
          <p className="mb-6 text-gray-700">
            It will only take a few seconds
          </p>
          <ol className="mb-6 text-left text-gray-700 list-decimal list-inside space-y-1 text-center">
            <li><strong>Take a Selfie</strong></li>

            <li><strong>Scan your ID</strong></li>
          </ol>
          <p className="mb-6 text-gray-500">
            Camera and GPS Permission required.
          </p>
        </div>
      </div>
      <div className="footer">
          <button
            onClick={onStart}
            className="bg-blue-700 text-white font-semibold py-3 px-6 rounded hover:bg-blue-800 transition"
          >
            Let's Verify
          </button>
          <p className="mt-8 text-xs text-gray-400">Powered by <img src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit" className="inline h-4 ml-1" /></p>
        </div>
    </div>
  );
};

