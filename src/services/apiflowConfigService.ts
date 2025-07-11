// src/services/apiflowConfigService.ts
import axios from 'axios';

class KycApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
    console.log('[KYC API] Base URL:', this.baseUrl);
  }

  public async fetchUserFlowConfig(userId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/user-flow-config`, {
        params: { user_id: userId },
      });
      console.log('[KYC API] Flow config response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[KYC API] Failed to fetch user flow config:', error);
      throw error;
    }
  }
}

export default new KycApi();
