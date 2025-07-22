// src/hooks/useFlowConfig.ts
import { useState, useEffect, useRef } from 'react';
import KycApi from '../services/apiflowConfigService';

interface FlowConfigResponse {
  user_id?: string;
  flow?: string[];
}

export function useFlowConfig(userId: string) {
  const [flowConfig, setFlowConfig] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }
    hasFetched.current = true;

    async function loadFlowConfig() {
      console.log('[useFlowConfig] Fetching flow config for user:', userId);
      setLoading(true);
      setError(null);

      try {
        const response = await KycApi.fetchUserFlowConfig(userId);
        console.log('[useFlowConfig] Raw API response:', response);

        const data = response as FlowConfigResponse;

        if (data && Array.isArray(data.flow)) {
          console.log('[useFlowConfig] Flow config loaded:', data.flow);
          setFlowConfig(data.flow);
        } else {
          throw new Error('Flow config is invalid or missing `flow` key');
        }
      } catch (err) {
        console.error('[useFlowConfig] Error fetching flow config:', err);
        setError(err as Error);
        setFlowConfig([]);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadFlowConfig();
    } else {
      console.warn('[useFlowConfig] No userId provided');
    }
  }, [userId]);

  return { flowConfig, loading, error };
}
