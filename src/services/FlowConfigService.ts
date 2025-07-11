import { fetchUserFlowConfig as realFetchUserFlowConfig } from './flowConfigService';

export async function fetchUserFlowConfig(userId: string) {
  console.log('Mock fetchUserFlowConfig called for userId:', userId);
  const mockResponse = {
    user_id: userId,
    flow: [ 'country_selection', 'document_type', 'selfie','document-front', 'document-back', 'Scanning', 'complete'],
  };
  console.log('Mock response:', mockResponse);
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockResponse), 500);
  });
}
