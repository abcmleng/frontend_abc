import React from 'react';

interface VerifyPageProps {
  userId: string;
  onStart: () => void;
  flowSteps?: string[];
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ userId, onStart, flowSteps }) => {
  console.log('[VerifyPage] Received flowSteps:', flowSteps);

  // Determine steps to display based on flowSteps prop or default
  const stepsToDisplay = flowSteps && flowSteps.length > 0
    ? flowSteps.filter(step => {
        const lowerStep = step.toLowerCase();
        return ['selfie', 'selfiecapture', 'captureidfront', 'document-front', 'selfiepage'].includes(lowerStep);
      })
    : ['Take a Selfie', 'Scan your ID'];

  console.log('[VerifyPage] Filtered stepsToDisplay:', stepsToDisplay);

  // Determine order: if ID card capture step comes before selfie step, swap order
  let orderedSteps: string[] = [];

  if (flowSteps && flowSteps.length > 0) {
    const frontPageIdSteps = ['captureidfront', 'document-front'];
    const selfieSteps = ['selfiepage', 'selfiecapture'];

    // Find first occurrence of any front page ID step
    const frontPageIdIndex = flowSteps.findIndex(step => frontPageIdSteps.includes(step.toLowerCase()));
    // Find first occurrence of any selfie step
    const selfieIndex = flowSteps.findIndex(step => selfieSteps.includes(step.toLowerCase()));

    if (frontPageIdIndex !== -1 && selfieIndex !== -1) {
      if (frontPageIdIndex < selfieIndex) {
        orderedSteps = ['Scan your ID', 'Take a Selfie'];
      } else {
        orderedSteps = ['Take a Selfie', 'Scan your ID'];
      }
    } else {
      orderedSteps = ['Take a Selfie', 'Scan your ID'];
    }
  } else {
    orderedSteps = ['Take a Selfie', 'Scan your ID'];
  }

  return (
    <div className="full-screen">
      <div className="main-container">
    
          <img
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
            className="mx-auto mb-6"
            style={{ height: 40 }}
          />
          <div className='w-full mt-5 text-center'>
          <h1 className="text-2xl font-semibold mb-4">Verify your identity</h1>
          <p className="mb-6 text-gray-700">
            It will only take a few seconds
          </p>
          <ol className="mb-6 text-left text-gray-700 list-decimal list-inside space-y-1 text-center">
            {orderedSteps.length > 0 && orderedSteps.map((step, index) => {
              let displayText = '';
              const lowerStep = step.toLowerCase();
              if (['selfie', 'selfiepage', 'selfiecapture'].includes(lowerStep)) {
                displayText = 'Take a Selfie';
              } else if (['captureidfront', 'document-front'].includes(lowerStep)) {
                displayText = 'Scan your ID';
              } else {
                displayText = step;
              }
              return (
                <li key={index}>
                  <strong>{displayText}</strong>
                </li>
              );
            })}
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

