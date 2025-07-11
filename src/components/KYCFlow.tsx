
import React, { useState, useEffect } from 'react';
import { SelfieCapture } from './SelfieCapture';
import { DocumentFrontCapture } from './DocumentFrontCapture';
import { DocumentBackCapture } from './DocumentBackCapture';
import { MRZScanner } from './MRZScanner';
import { BarcodeScanner } from './BarcodeScanner';
import { ThankYou } from './ThankYou';
import { CountrySelection } from './CountrySelection';
import { DocumentSelection } from './DocumentSelection';
import metadata from '../helper/metadata.json';
import { KYCData, CapturedImage, ProcessingStatus } from '../types/kyc';
import { kycApiService } from '../services/kycApi';
import { useFlowConfig } from '../hooks/useFlowConfig';

interface MetadataItem {
  id: number;
  barcode: string;
  country: string;
  country_code: string;
  date_format: string;
  type: string;
  alternative_text: string;
  is_live: number;
  engine_language: number;
  is_country_european: number;
  version: number;
  tenant_name: string;
  server_key: string;
}

// Barcode and MRZ classification
const MRZ_TYPES = ['TD1','TD2','TD3','TD1 F','TD2 F','TD2 B','TD3 B','TD3 F'];
const BARCODE_TYPES = ['PDF417','PDF417 B','PDF417 F','QR B','QR F','QR AADHAAR','ITF B','ITF F'];

const COMPONENT_MAP: { [key: string]: React.FC<any> } = {
  selfie: SelfieCapture,
  country_selection: CountrySelection,
  document_type: DocumentSelection,
  'document-front': DocumentFrontCapture,
  'document-back': DocumentBackCapture,
  Scanning: () => null, // Will handle scanning separately
  complete: ThankYou,
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

  useEffect(() => {
    if (flowConfig.length > 0) {
      setCurrentStep(0);
    }
  }, [flowConfig]);

  useEffect(() => {
    if (flowConfig.length === 0) return;
    const currentStepKey = flowConfig[currentStep];
    console.log('Current Step:', currentStep, 'Step Key:', currentStepKey);
    console.log('Flow Config:', flowConfig);
    if (currentStepKey === 'document-front') {
      if (selectedCountryCode && selectedDocumentType) {
        const meta = (metadata as MetadataItem[]).find(
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
        } else {
          setScannerType(null);
        }
      }
    }
  }, [currentStep, selectedCountryCode, selectedDocumentType, flowConfig]);

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
      if (flowConfig.length === 0) return prev;

      let next = prev + 1;

      // Skip document-back if document type is 'pp' and current step is document-front
      if (
        flowConfig[prev] === 'document-front' &&
        selectedDocumentType?.toLowerCase() === 'pp'
      ) {
        next = prev + 2;
      }

      next = Math.min(next, flowConfig.length - 1);
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

    const currentStepKey = flowConfig[currentStep];

    if (currentStepKey === 'Scanning') {
      if (!kycData || !kycData.verificationId) {
        return <div>Loading verification data...</div>;
      }
      if (scannerType === 'mrz') {
        return (
          <div>
            <MRZScanner
              onScan={handleMRZScan}
              onNext={nextStep}
              verificationId={kycData.verificationId}
            />
          </div>
        );
      } else if (scannerType === 'barcode') {
        return (
          <div>
            <BarcodeScanner
              onScan={handleMRZScan}
              onNext={nextStep}
              verificationId={kycData.verificationId}
            />
          </div>
        );
      } else {
        return <div>Unsupported barcode type for scanning.</div>;
      }
    }

    const StepComponent = COMPONENT_MAP[currentStepKey];
    if (!StepComponent) {
      return <div>Unsupported step: {currentStepKey}</div>;
    }

    if (currentStepKey === 'complete') {
      if (!kycData || !kycData.verificationId) {
        return <div>Loading verification data...</div>;
      }
      return (
        <ThankYou
          kycData={kycData}
          onRestart={restartFlow}
          scannerType={scannerType}
        />
      );
    }

    return (
      <StepComponent
        selectedCountryCode={selectedCountryCode}
        selectedDocumentType={selectedDocumentType}
        onSelectCountryCode={setSelectedCountryCode}
        onSelectDocumentType={setSelectedDocumentType}
        onCapture={
          currentStepKey === 'selfie'
            ? handleSelfieCapture
            : currentStepKey === 'document-front'
            ? handleDocumentFrontCapture
            : currentStepKey === 'document-back'
            ? handleDocumentBackCapture
            : undefined
        }
        onNext={nextStep}
        verificationId={kycData?.verificationId ?? ''}
        onError={setError}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentStep()}
    </div>
  );
};
