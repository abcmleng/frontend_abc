import React from 'react';

interface SelfiePageProps {
  onNext: () => void;
}

export const SelfiePage: React.FC<SelfiePageProps> = ({ onNext }) => {
  return (
      <div className="full-screen">
        <div className="main-container">
          <img
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
            className=" mt-5 mx-auto mb-6"
            style={{ height: 40 }}
          />
          <h1 className="text-2xl font-semibold mb-4">Take a Selfie</h1>
          <img
            src="src/images/face_selfie.jpg"
            alt="Take a Selfie"
            className="mx-auto mb-6"
            style={{ width: 120, height: 120 }}
          />
          <p className="mb-6 text-gray-700">
            You have to allow Camera Permission.
          </p>

  
      </div>
      <div className="footer">
          <button
          onClick={onNext}
          className="bg-blue-700 text-white font-semibold py-3 px-6 rounded hover:bg-blue-800 transition"
        >
          Take a Selfie
        </button>
          <p className="mt-8 text-xs text-gray-400">Powered by <img src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit" className="inline h-4 ml-1" /></p>
        </div>
    </div>
  );
};
