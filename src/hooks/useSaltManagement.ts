/**
 * Custom hook for salt management
 */

import { useState, useCallback, useEffect } from 'react';
import { generateAlgorithmSalt } from '../services/hashingService';
import { calculateSaltByteLength, getFallbackSalt, shouldRegenerateBcryptSalt } from '../utils/saltUtils';
import { validateSalt } from '../utils/validation';

interface UseSaltManagementProps {
  selectedAlgorithm: string;
  parameters: Record<string, number>;
  saltEncoding: string;
}

export const useSaltManagement = ({ selectedAlgorithm, parameters, saltEncoding }: UseSaltManagementProps) => {
  const [saltInput, setSaltInput] = useState('');
  const [validationError, setValidationError] = useState('');

  // Calculate salt byte length
  const saltByteLength = calculateSaltByteLength(saltInput, saltEncoding);

  // Generate initial salt on component mount
  useEffect(() => {
    const generateInitialSalt = async () => {
      try {
        const initialSalt = await generateAlgorithmSalt(selectedAlgorithm, parameters, saltEncoding);
        setSaltInput(initialSalt);
      } catch (error) {
        console.error('Error generating initial salt:', error);
        // Fallback to default salt based on algorithm
        setSaltInput(getFallbackSalt(selectedAlgorithm));
      }
    };
    
    generateInitialSalt();
  }, [selectedAlgorithm, saltEncoding]); // Removed parameters to prevent infinite loop

  // Regenerate bcrypt salt when cost factor changes
  useEffect(() => {
    if (selectedAlgorithm === 'bcrypt' && saltInput && parameters.cost) {
      const needsRegeneration = shouldRegenerateBcryptSalt(saltInput, parameters.cost);
      if (needsRegeneration) {
        const regenerateBcryptSalt = async () => {
          try {
            const newSalt = await generateAlgorithmSalt(selectedAlgorithm, parameters, saltEncoding);
            setSaltInput(newSalt);
          } catch (error) {
            console.error('Error regenerating bcrypt salt:', error);
          }
        };
        regenerateBcryptSalt();
      }
    }
  }, [selectedAlgorithm, parameters.cost, saltInput, saltEncoding]);

  // Handle salt input change
  const handleSaltChange = useCallback((value: string) => {
    setSaltInput(value);
    // Clear validation error when user types
    if (validationError) {
      setValidationError('');
    }
  }, [validationError]);

  // Generate new salt
  const handleGenerateSalt = useCallback(async () => {
    try {
      const newSalt = await generateAlgorithmSalt(selectedAlgorithm, parameters, saltEncoding);
      setSaltInput(newSalt);
      setValidationError('');
    } catch (error) {
      console.error('Error generating salt:', error);
    }
  }, [selectedAlgorithm, parameters, saltEncoding]);

  // Validate salt
  const validateSaltInput = useCallback((hasAttemptedSubmit: boolean) => {
    if (hasAttemptedSubmit) {
      const validation = validateSalt(saltInput);
      setValidationError(validation.message);
      return validation.isValid;
    }
    return true;
  }, [saltInput]);

  return {
    saltInput,
    saltByteLength,
    validationError,
    handleSaltChange,
    handleGenerateSalt,
    validateSaltInput
  };
};
