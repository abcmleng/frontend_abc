import React, { useState, useEffect, Suspense, lazy } from 'react';
import metadata from '../helper/metadata.json';
import { KYCData, CapturedImage } from '../types/kyc';
import { kycApiService } from '../services/kycApi';
import { useFlowConfig } from '../hooks/useFlowConfig';

const MRZ_TYPES = ['TD1','TD2','TD3','TD1 F','TD2 F','TD2 B','TD3 B','TD3 F'];
const BARCODE_TYPES = ['PDF417','PDF417 B','PDF417 F','QR B','QR F','QR AADHAAR','ITF B','ITF F'];

// Dynamic imports for components
const componentImportMap: { [key: string]: React.LazyExoticComponent<React.FC<any>> } = {
  verify: lazy(() => import('./VerifyPage').then(module => ({ default: module.VerifyPage }))),
  selfiepage: lazy(() => import('./SelfiePage').then(module => ({ default: module.SelfiePage }))),
  selfiecapture: lazy(() => import('./SelfieCapture').then(module => ({ default: module.SelfieCapture }))),
  country_selection: lazy(() => import('./CountrySelection').then(module => ({ default: module.CountrySelection }))),
  document_type: lazy(() => import('./DocumentSelection').then(module => ({ default: module.DocumentSelection }))),
  captureidfront: lazy(() => import('./CaptureIdFront').then(module => ({ default: module.CaptureIdFront }))),
  'document-front': lazy(() => import('./DocumentFrontCapture').then(module => ({ default: module.DocumentFrontCapture }))),
  captureidback: lazy(() => import('./CaptureIdBack').then(module => ({ default: module.CaptureIdBack }))),
  'document-back': lazy(() => import('./DocumentBackCapture').then(module => ({ default: module.DocumentBackCapture }))),
  thankyou: lazy(() => import('./ThankYou').then(module => ({ default: module.ThankYou }))),
  mrzpage: lazy(() => import('./MRZPage').then(module => ({ default: module.MRZPage }))),
  barcodescanner: lazy(() => import('./BarcodeScanner').then(module => ({ default: module.BarcodeScanner }))),
};


export const KYCFlow: React.FC<{ userId: string }> = ({ userId }) => {
  const { flowConfig, loading: flowLoading, error: flowError } = useFlowConfig(userId);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [scannerType, setScannerType] = useState<'mrz' | 'barcode' | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const [kycData, setKycData] = useState<KYCData>({
    verificationId: `KYC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    processingStatus: {
      selfie: 'pending',
      documentFront: 'pending',
      documentBack: 'pending',
      mrz: 'pending',
    },
    apiResponses: {},
  });

  const [includeBackSide, setIncludeBackSide] = React.useState(true);
  const [filteredFlow, setFilteredFlow] = React.useState<string[]>([]);

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
          setScannerType('mrz');
        } else if (BARCODE_TYPES.includes(barcode)) {
          setScannerType('barcode');
        } else {
          setScannerType(null);
        }

        if (barcode.includes('B')) {
          setIncludeBackSide(true);
        } else {
          setIncludeBackSide(false);
        }
      } else {
        setScannerType(null);
        setIncludeBackSide(true);
      }
    }
  }, [currentStep, selectedCountryCode, selectedDocumentType, flowConfig]);

  useEffect(() => {
    if (flowConfig.length > 0) {
      let filteredFlowConfig = flowConfig;

      if (!includeBackSide) {
        filteredFlowConfig = flowConfig.filter(
          (step) => !['document-back', 'captureidback'].includes(step.toLowerCase())
        );
      }

      setFilteredFlow(filteredFlowConfig);
      setCurrentStep(0);
    }
  }, [includeBackSide, flowConfig]);

  useEffect(() => {
    if (filteredFlow.length > 0) {
      setCurrentStep(0);
    }
  }, [filteredFlow]);

  const handleSelfieCapture = (image: CapturedImage) => {
    setKycData((prev) => ({
      ...prev,
      selfie: image,
      processingStatus: {
        ...prev.processingStatus!,
        selfie: 'processing',
      },
    }));
  };

  const handleDocumentFrontCapture = (image: CapturedImage) => {
    setKycData((prev) => ({
      ...prev,
      documentFront: image,
      processingStatus: {
        ...prev.processingStatus!,
        documentFront: 'processing',
      },
    }));
  };

  const handleDocumentBackCapture = (image: CapturedImage) => {
    setKycData((prev) => ({
      ...prev,
      documentBack: image,
      processingStatus: {
        ...prev.processingStatus!,
        documentBack: 'processing',
      },
    }));
  };

  const handleMRZScan = async (mrzData: string) => {
    setKycData((prev) => ({
      ...prev,
      mrzData,
      processingStatus: {
        ...prev.processingStatus!,
        mrz: 'processing',
      },
    }));

    const selfieProcessed = !!kycData.selfie;
    const documentFrontProcessed = !!kycData.documentFront;
    const documentBackProcessed = !!kycData.documentBack;
    const mrzProcessed = scannerType === 'mrz' || scannerType === 'barcode';

    try {
      const response = await kycApiService.submitVerification({
        verificationId: kycData.verificationId,
        selfieProcessed,
        documentFrontProcessed,
        documentBackProcessed,
        mrzProcessed,
      });
      console.log('[submitVerification] Response:', response);
    } catch (error: any) {
      console.error('[submitVerification] Error:', error);
    }

    nextStep();
  };

  const nextStep = () => {
    setCurrentStep((prev) => {
      if (filteredFlow.length === 0) return prev;

      let next = prev + 1;

      // Skip document-back if document type is 'pp' and current step is document-front
      if (
        filteredFlow[prev].toLowerCase() === 'document-front' &&
        selectedDocumentType?.toLowerCase() === 'pp'
      ) {
        next = prev + 2;
      }

      next = Math.min(next, filteredFlow.length - 1);
      return next;
    });
  };

  const restartFlow = () => {
    if (kycData.selfie) URL.revokeObjectURL(kycData.selfie.url);
    if (kycData.documentFront) URL.revokeObjectURL(kycData.documentFront.url);
    if (kycData.documentBack) URL.revokeObjectURL(kycData.documentBack.url);

    setCurrentStep(0);
    setSelectedCountryCode(null);
    setSelectedDocumentType(null);
    setScannerType(null);
    setKycData({
      verificationId: `KYC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      processingStatus: {
        selfie: 'pending',
        documentFront: 'pending',
        documentBack: 'pending',
        mrz: 'pending',
      },
      apiResponses: {},
    });
  };

  // Render only the current step component
  const renderCurrentStep = () => {
    if (flowLoading) {
      return <div>Loading flow configuration...</div>;
    }
    if (flowError) {
      return <div>Error loading flow configuration: {flowError.message}</div>;
    }
    if (flowConfig.length === 0) {
      return <div>No flow configuration available.</div>;
    }

    const stepKey = flowConfig[currentStep];
    if (!stepKey) return <div>Invalid step</div>;

    if (stepKey.toLowerCase() === 'scanning') {
      if (!kycData || !kycData.verificationId) {
        return <div>Loading verification data...</div>;
      }

      const isMRZ = scannerType === 'mrz';

      if (isMRZ) {
        const MRZPageComponent = componentImportMap['mrzpage'];
        return (
          <Suspense fallback={<div>Loading MRZ Scanner...</div>}>
            <MRZPageComponent
              onScan={handleMRZScan}
              onNext={nextStep}
              verificationId={kycData.verificationId}
              key="mrz"
            />
          </Suspense>
        );
      } else {
        const BarcodeScannerComponent = componentImportMap['barcodescanner'];
        return (
          <Suspense fallback={<div>Loading Barcode Scanner...</div>}>
            <BarcodeScannerComponent
              onScan={handleMRZScan}
              onNext={nextStep}
              verificationId={kycData.verificationId}
              key="barcode"
            />
          </Suspense>
        );
      }
    }

    const normalizedStepKey = stepKey.toLowerCase();
    const StepComponent = componentImportMap[normalizedStepKey];
    if (!StepComponent) {
      return <div>Unsupported step: {stepKey}</div>;
    }
    
    return (
      <Suspense fallback={<div>Loading {stepKey}...</div>}>
        <StepComponent
          key={stepKey}
          selectedCountryCode={selectedCountryCode}
          selectedDocumentType={selectedDocumentType}
          onSelectCountryCode={setSelectedCountryCode}
          onSelectDocumentType={setSelectedDocumentType}
          onCapture={
            normalizedStepKey === 'selfie' || normalizedStepKey === 'selfiecapture'
              ? handleSelfieCapture
              : normalizedStepKey === 'document-front'
              ? handleDocumentFrontCapture
              : normalizedStepKey === 'document-back'
              ? handleDocumentBackCapture
              : undefined
          }
          onNext={nextStep}
          verificationId={kycData?.verificationId ?? ''}
          onError={setError}
        />
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentStep()}
    </div>
  );
};
