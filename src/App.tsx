import React, { useState, useEffect } from 'react';
import metadata from './helper/metadata.json';
import { CapturedImage } from './types/kyc';

// Import your components
import { VerifyPage } from './components/VerifyPage';
import { SelfiePage } from './components/SelfiePage';
import { SelfieCapture } from './components/SelfieCapture';
import { CountrySelection } from './components/CountrySelection';
import { DocumentSelection } from './components/DocumentSelection';
import { DocumentFrontCapture } from './components/DocumentFrontCapture';
import { DocumentBackCapture } from './components/DocumentBackCapture';
import { MRZScanner } from './components/MRZScanner';
import { BarcodeScanner } from './components/BarcodeScanner';
import { ThankYou } from './components/ThankYou';
import { CaptureIdFront } from './components/CaptureIdFront';
import { CaptureIdBack } from './components/CaptureIdBack';
import { MRZPage } from './components/MRZPage';
import { BarcodePage } from './components/BarcodePage';

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

// Enum for all possible steps
enum AppStep {
  Verify,
  SelfiePage,
  SelfieCapture,
  CountrySelection,
  DocumentTypeSelection,
  CaptureIdFront,
  DocumentFrontCapture,
  CaptureIdBack,
  DocumentBackCapture,
  MRZPage,
  MRZ,
  Barcode,
  ThankYou,
}

function App() {
  const userId = 'test-user';

  // Simulated condition for choosing MRZ or Barcode
  const [useMRZ, setUseMRZ] = useState(true);

  const [flow, setFlow] = useState<AppStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // State for selections and captured images
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<CapturedImage | null>(null);
  const [documentFrontImage, setDocumentFrontImage] = useState<CapturedImage | null>(null);
  const [documentBackImage, setDocumentBackImage] = useState<CapturedImage | null>(null);

  // Barcode and MRZ classification
  const MRZ_TYPES = ['TD1','TD2','TD3','TD1 F','TD2 F','TD2 B','TD3 B','TD3 F'];
  const BARCODE_TYPES = ['PDF417','PDF417 B','PDF417 F','QR B','QR F','QR AADHAAR','ITF B','ITF F'];

  // Effect to update useMRZ based on selected country and document type
  useEffect(() => {
    if (selectedCountryCode && selectedDocumentType) {
      const meta = (metadata as any[]).find(
        (item) =>
          item.country_code === selectedCountryCode &&
          (item.type.toLowerCase() === selectedDocumentType.toLowerCase() ||
           item.alternative_text.toLowerCase() === selectedDocumentType.toLowerCase())
      );

      if (meta) {
        const barcode = meta.barcode.toUpperCase();
        if (MRZ_TYPES.includes(barcode)) {
          setUseMRZ(true);
        } else if (BARCODE_TYPES.includes(barcode)) {
          setUseMRZ(false);
        } else {
          setUseMRZ(true);
        }
      } else {
        setUseMRZ(true);
      }
    }
  }, [selectedCountryCode, selectedDocumentType]);

  const [kycData, setKycData] = useState({
    verificationId: userId,
    selfie: selfieImage ?? undefined,
    documentFront: documentFrontImage ?? undefined,
    documentBack: documentBackImage ?? undefined,
    mrzData: '',
  });

  useEffect(() => {
    const initialFlow: AppStep[] = [
      AppStep.Verify,
      AppStep.SelfiePage,
      AppStep.SelfieCapture,
      AppStep.CountrySelection,
      AppStep.DocumentTypeSelection,
      AppStep.CaptureIdFront,
      AppStep.DocumentFrontCapture,
      AppStep.CaptureIdBack,
      AppStep.DocumentBackCapture,
      AppStep.MRZPage,
      useMRZ ? AppStep.MRZ : AppStep.Barcode,
      AppStep.ThankYou,
    ];
    setFlow(initialFlow);
  }, [useMRZ]);

  useEffect(() => {
    setKycData({
      verificationId: userId,
      selfie: selfieImage ?? undefined,
      documentFront: documentFrontImage ?? undefined,
      documentBack: documentBackImage ?? undefined,
      mrzData: '',
    });
  }, [selfieImage, documentFrontImage, documentBackImage]);

  const goToNextStep = () => {
    if (currentStepIndex < flow.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    // Reset user input state
    setSelectedCountryCode(null);
    setSelectedDocumentType(null);
    setSelfieImage(null);
    setDocumentFrontImage(null);
    setDocumentBackImage(null);

    // Reset scanner type
    setUseMRZ(true);

    // Reset current step after a tiny delay to allow useMRZ-based flow to rebuild
    setTimeout(() => {
      setCurrentStepIndex(0);
    }, 0);
  };

  const currentStep = flow[currentStepIndex];

  return (
    <div style={styles.appContainer}>
      <main style={styles.content}>
        <div style={styles.kycFlowWrapper}>
          {currentStep === AppStep.Verify && (
            <VerifyPage userId={userId} onStart={goToNextStep} />
          )}
          {currentStep === AppStep.SelfiePage && (
            <SelfiePage onNext={goToNextStep} />
          )}
          {currentStep === AppStep.SelfieCapture && (
            <SelfieCapture
              onCapture={setSelfieImage}
              onNext={goToNextStep}
              verificationId={userId}
            />
          )}
          {currentStep === AppStep.CountrySelection && (
            <CountrySelection
              selectedCountryCode={selectedCountryCode}
              onSelectCountryCode={setSelectedCountryCode}
              onNext={goToNextStep}
            />
          )}
          {currentStep === AppStep.DocumentTypeSelection && (
            <DocumentSelection
              selectedCountryCode={selectedCountryCode}
              selectedDocumentType={selectedDocumentType}
              onSelectDocumentType={setSelectedDocumentType}
              onNext={goToNextStep}
            />
          )}
          {currentStep === AppStep.CaptureIdFront && (
            <CaptureIdFront onContinue={goToNextStep} />
          )}
          {currentStep === AppStep.DocumentFrontCapture && (
            <DocumentFrontCapture
              onCapture={setDocumentFrontImage}
              onNext={goToNextStep}
              verificationId={userId}
            />
          )}
          {currentStep === AppStep.CaptureIdBack && (
            <CaptureIdBack onContinue={goToNextStep} />
          )}
          {currentStep === AppStep.DocumentBackCapture && (
            <DocumentBackCapture
              onCapture={setDocumentBackImage}
              onNext={goToNextStep}
              verificationId={userId}
            />
          )}
         {currentStep === AppStep.MRZPage && (
          useMRZ ? <MRZPage onNext={goToNextStep} /> : 
          <BarcodePage onNext={goToNextStep} />
        )}

          {currentStep === AppStep.MRZ && (
            <MRZScanner
              onScan={() => {}}
              onNext={goToNextStep}
              verificationId={userId}
              onError={() => {}}
            />
          )}
          {currentStep === AppStep.Barcode && (
            <BarcodeScanner
              onScan={() => {}}
              onNext={goToNextStep}
              verificationId={userId}
            />
          )}
          {currentStep === AppStep.ThankYou && (
            <ThankYou
              kycData={kycData}
              onRestart={handleRestart}
              scannerType={useMRZ ? 'mrz' : 'barcode'}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;