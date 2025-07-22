import React, { useState, useEffect, Suspense, lazy } from 'react';
import metadata from './helper/metadata.json';
import { CapturedImage } from './types/kyc';

import { useFlowConfig } from './hooks/useFlowConfig';

const MRZ_TYPES = ['TD1','TD2','TD3','TD1 F','TD2 F','TD2 B','TD3 B','TD3 F'];
const BARCODE_TYPES = ['PDF417','PDF417 B','PDF417 F','QR B','QR F','QR AADHAAR','ITF B','ITF F'];

// Dynamic imports for components
const componentImportMap: { [key: string]: React.LazyExoticComponent<React.FC<any>> } = {
  verify: lazy(() => import('./components/VerifyPage').then(module => ({ default: module.VerifyPage }))),
  selfiepage: lazy(() => import('./components/SelfiePage').then(module => ({ default: module.SelfiePage }))),
  selfiecapture: lazy(() => import('./components/SelfieCapture').then(module => ({ default: module.SelfieCapture }))),
  country_selection: lazy(() => import('./components/CountrySelection').then(module => ({ default: module.CountrySelection }))),
  document_type: lazy(() => import('./components/DocumentSelection').then(module => ({ default: module.DocumentSelection }))),
  captureidfront: lazy(() => import('./components/CaptureIdFront').then(module => ({ default: module.CaptureIdFront }))),
  'document-front': lazy(() => import('./components/DocumentFrontCapture').then(module => ({ default: module.DocumentFrontCapture }))),
  captureidback: lazy(() => import('./components/CaptureIdBack').then(module => ({ default: module.CaptureIdBack }))),
  'document-back': lazy(() => import('./components/DocumentBackCapture').then(module => ({ default: module.DocumentBackCapture }))),
  thankyou: lazy(() => import('./components/ThankYou').then(module => ({ default: module.ThankYou }))),
  mrzpage: lazy(() => import('./components/MRZPage').then(module => ({ default: module.MRZPage }))),
  barcodescanner: lazy(() => import('./components/BarcodeScanner').then(module => ({ default: module.BarcodeScanner }))),
  mrz: lazy(() => import('./components/MRZScanner').then(module => ({ default: module.MRZScanner }))),
  barcode: lazy(() => import('./components/BarcodeScanner').then(module => ({ default: module.BarcodeScanner }))),
  barcodepage: lazy(() => import('./components/BarcodePage').then(module => ({ default: module.BarcodePage }))),
};

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

function App() {
  const [userId] = React.useState(() => `KYC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const { flowConfig, loading, error } = useFlowConfig(userId);

  const [useMRZ, setUseMRZ] = useState(true);

  const [flow, setFlow] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<CapturedImage | null>(null);
  const [documentFrontImage, setDocumentFrontImage] = useState<CapturedImage | null>(null);
  const [documentBackImage, setDocumentBackImage] = useState<CapturedImage | null>(null);

  useEffect(() => {
    console.log('[App] selectedCountryCode:', selectedCountryCode);
  }, [selectedCountryCode]);

  useEffect(() => {
    console.log('[App] selectedDocumentType:', selectedDocumentType);
  }, [selectedDocumentType]);

  useEffect(() => {
    console.log('[App] useMRZ:', useMRZ);
  }, [useMRZ]);

  useEffect(() => {
    console.log('[App] flow:', flow);
  }, [flow]);

  useEffect(() => {
    if (selectedCountryCode && selectedDocumentType) {
      console.log('[App] selectedCountryCode:', selectedCountryCode, 'selectedDocumentType:', selectedDocumentType);
      const meta = (metadata as any[]).find(
        (item) =>
          item.country_code === selectedCountryCode &&
          (item.type.toLowerCase() === selectedDocumentType.toLowerCase() ||
           item.alternative_text.toLowerCase() === selectedDocumentType.toLowerCase())
      );
      console.log('[App] matched metadata:', meta);

      if (meta) {
        const barcode = meta.barcode.toUpperCase();
        console.log('[App] barcode type:', barcode);
        if (MRZ_TYPES.includes(barcode)) {
          setUseMRZ(true);
          console.log('[App] useMRZ set to true');
        } else if (BARCODE_TYPES.includes(barcode)) {
          setUseMRZ(false);
          console.log('[App] useMRZ set to false');
        } else {
          setUseMRZ(true);
          console.log('[App] useMRZ defaulted to true');
        }
      } else {
        setUseMRZ(true);
        console.log('[App] useMRZ defaulted to true (no metadata match)');
      }
    }
  }, [selectedCountryCode, selectedDocumentType]);

  const [includeBackSide, setIncludeBackSide] = useState(true);

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

        if (barcode.includes('B')) {
          setIncludeBackSide(true);
        } else {
          setIncludeBackSide(false);
        }
      } else {
        setUseMRZ(true);
        setIncludeBackSide(true);
      }
    }
  }, [selectedCountryCode, selectedDocumentType]);

  useEffect(() => {
    if (flowConfig.length > 0) {
      let initialSteps = flowConfig.filter(
        (step) => !['scanning', 'mrzpage', 'barcodepage', 'mrz', 'barcode', 'thankyou'].includes(step.toLowerCase())
      );

      if (!includeBackSide) {
        initialSteps = initialSteps.filter(
          (step) => !['document-back', 'captureidback'].includes(step.toLowerCase())
        );
      }

      const scanningSteps = useMRZ
        ? ['mrzpage', 'mrz', 'thankyou']
        : ['barcodepage', 'barcode', 'thankyou'];

      const newFlow = [...initialSteps, ...scanningSteps];

      setFlow(newFlow);

      setCurrentStepIndex((prevIndex) => {
        if (prevIndex >= initialSteps.length || prevIndex >= newFlow.length) {
          return 0;
        }
        return prevIndex;
      });
    }
  }, [flowConfig, useMRZ, includeBackSide]);

  useEffect(() => {
    console.log('[App] Current step index:', currentStepIndex, 'Current step:', flow[currentStepIndex]);
  }, [currentStepIndex, flow]);

  useEffect(() => {
    console.log('[App] Current step index:', currentStepIndex, 'Current step:', flow[currentStepIndex]);
  }, [currentStepIndex, flow]);

  const goToNextStep = () => {
    setCurrentStepIndex((prev) => {
      const next = prev + 1;
      console.log('[App] goToNextStep:', { prev, next, flowLength: flow.length });
      if (next < flow.length) {
        return next;
      }
      return prev;
    });
  };

  const handleRestart = () => {
    setSelectedCountryCode(null);
    setSelectedDocumentType(null);
    setSelfieImage(null);
    setDocumentFrontImage(null);
    setDocumentBackImage(null);
    setUseMRZ(true);
    setTimeout(() => setCurrentStepIndex(0), 0);
  };

  const currentStep = flow[currentStepIndex];

  const renderStep = () => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (error) {
      return <div>Error: {error.message}</div>;
    }
    if (flow.length === 0) {
      return <div>Loading flow...</div>;
    }
    if (!currentStep) {
      return <div>Invalid step</div>;
    }


    const normalizedStepKey = currentStep.toLowerCase();
    const StepComponent = componentImportMap[normalizedStepKey];
    if (!StepComponent) {
      return <div>Unsupported step: {currentStep}</div>;
    }

    if (normalizedStepKey === 'verify') {
      return (
        <Suspense fallback={<div>Loading {currentStep}...</div>}>
          <StepComponent
            userId={userId}
            onStart={goToNextStep}
          />
        </Suspense>
      );
    }

    const nextHandlerPropMap: { [key: string]: string } = {
      captureidfront: 'onContinue',
      captureidback: 'onContinue',
      verify: 'onStart',
      selfiepage: 'onNext',
      selfiecapture: 'onNext',
      country_selection: 'onNext',
      document_type: 'onNext',
      'document-front': 'onNext',
      'document-back': 'onNext',
      mrzpage: 'onNext',
      barcodescanner: 'onNext',
      mrz: 'onNext',
      barcode: 'onNext',
      barcodepage: 'onNext',
      thankyou: 'onNewTransaction',
    };

    const nextHandlerProp = nextHandlerPropMap[normalizedStepKey] || 'onNext';

    const props: any = {
      selectedCountryCode,
      selectedDocumentType,
      onSelectCountryCode: setSelectedCountryCode,
      onSelectDocumentType: setSelectedDocumentType,
      verificationId: userId,
    };

    if (nextHandlerProp === 'onNewTransaction') {
      props[nextHandlerProp] = handleRestart;
    } else {
      props[nextHandlerProp] = goToNextStep;
    }

    if (normalizedStepKey === 'selfie' || normalizedStepKey === 'selfiecapture') {
      props.onCapture = setSelfieImage;
    } else if (normalizedStepKey === 'document-front') {
      props.onCapture = setDocumentFrontImage;
    } else if (normalizedStepKey === 'document-back') {
      props.onCapture = setDocumentBackImage;
    }

    if (normalizedStepKey === 'mrz' || normalizedStepKey === 'barcode') {
      props.onScan = () => {};
      props.onError = () => {};
    }

    return (
      <Suspense fallback={<div>Loading {currentStep}...</div>}>
        <StepComponent {...props} />
      </Suspense>
    );
  };

  return (
    <div style={styles.appContainer}>
      <main style={styles.content}>
        <div style={styles.kycFlowWrapper}>
          {renderStep()}
        </div>
      </main>
    </div>
  );
}

export default App;
