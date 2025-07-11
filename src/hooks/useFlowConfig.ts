// src/hooks/useFlowConfig.ts
import { useState, useEffect } from 'react';
import KycApi from '../services/apiflowConfigService';

interface FlowConfigResponse {
  user_id?: string;
  flow?: string[];
}

export function useFlowConfig(userId: string) {
  const [flowConfig, setFlowConfig] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadFlowConfig() {
      setLoading(true);
      setError(null);
      try {
        const response = await KycApi.fetchUserFlowConfig(userId);
        const data: FlowConfigResponse = response;
        if (data?.flow) {
          setFlowConfig(data.flow);
        } else {
          setFlowConfig([]);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadFlowConfig();
    }
  }, [userId]);

  return { flowConfig, loading, error };
}
