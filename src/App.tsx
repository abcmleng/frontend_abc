import React, { useState } from 'react';
import { KYCFlow } from './components/KYCFlow';
import { VerifyPage } from './components/VerifyPage';
import { SelfiePage } from './components/SelfiePage';
import { CaptureIdFront } from './components/CaptureIdFront';
import { CaptureIdBack } from './components/CaptureIdBack';

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    position: 'fixed' as const,
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kycFlowWrapper: {
    width: '100%',
    height: '100%',
  },
};

enum AppStep {
  Verify,
  Selfie,
  CaptureIdFront,
  CaptureIdBack,
  KYCFlow,
}

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.Verify);
  const userId = 'test-user';

  const handleStart = () => setStep(AppStep.Selfie);
  const handleSelfieComplete = () => setStep(AppStep.CaptureIdFront);
  const handleCaptureIdFrontComplete = () => setStep(AppStep.CaptureIdBack);
  const handleCaptureIdBackComplete = () => setStep(AppStep.KYCFlow);

  return (
    <div style={styles.appContainer}>
      <main style={styles.content}>
        <div style={styles.kycFlowWrapper}>
          {step === AppStep.Verify && <VerifyPage userId={userId} onStart={handleStart} />}
          {step === AppStep.Selfie && <SelfiePage onNext={handleSelfieComplete} />}
          {step === AppStep.CaptureIdFront && <CaptureIdFront onContinue={handleCaptureIdFrontComplete} />}
          {step === AppStep.CaptureIdBack && <CaptureIdBack onContinue={handleCaptureIdBackComplete} />}
          {step === AppStep.KYCFlow && <KYCFlow userId={userId} />}
        </div>
      </main>
    </div>
  );
}

export default App;
