/**
 * Custom hook for algorithm configuration
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { HASHING_ALGORITHMS } from '../constants';
import { getAlgorithmConfig, getParameterWarnings } from '../utils/algorithmUtils';

export const useAlgorithmConfig = (selectedAlgorithm: string) => {
  const [parameters, setParameters] = useState<Record<string, number>>({});

  // Get current algorithm configuration
  const algorithmConfig = useMemo(() => {
    return getAlgorithmConfig(selectedAlgorithm);
  }, [selectedAlgorithm]);

  // Initialize parameters when algorithm changes
  useEffect(() => {
    if (algorithmConfig) {
      const initialParams: Record<string, number> = {};
      Object.keys(algorithmConfig.parameters).forEach(key => {
        initialParams[key] = algorithmConfig.parameters[key].default;
      });
      setParameters(initialParams);
    }
  }, [algorithmConfig]);

  // Handle parameter change
  const handleParameterChange = useCallback((paramKey: string, value: number) => {
    setParameters(prev => ({
      ...prev,
      [paramKey]: value
    }));
  }, []);

  // Get parameter warnings
  const warnings = useMemo(() => {
    return getParameterWarnings(selectedAlgorithm, parameters);
  }, [selectedAlgorithm, parameters]);

  return {
    algorithmConfig,
    parameters,
    warnings,
    handleParameterChange
  };
};
