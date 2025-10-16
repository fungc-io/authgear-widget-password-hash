/**
 * Custom hook for hash generation
 */

import { useState, useCallback } from 'react';
import { hashArgon2id, hashScrypt, hashBcrypt, hashPBKDF2 } from '../services/hashingService';
import { validatePassword } from '../utils/validation';

interface UseHashGenerationProps {
  selectedAlgorithm: string;
  parameters: Record<string, number>;
  saltInput: string;
  saltEncoding: string;
  hashEncoding: string;
}

export const useHashGeneration = ({
  selectedAlgorithm,
  parameters,
  saltInput,
  saltEncoding,
  hashEncoding
}: UseHashGenerationProps) => {
  const [password, setPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    password: '',
    salt: ''
  });
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  // Handle password change
  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setResult(null); // Clear results when password changes
    if (hasAttemptedSubmit) {
      const validation = validatePassword(value);
      setValidationErrors(prev => ({
        ...prev,
        password: validation.message
      }));
    }
  }, [hasAttemptedSubmit]);

  // Handle salt change (from salt management hook)
  const handleSaltChange = useCallback((value: string) => {
    setResult(null); // Clear results when salt changes
    if (hasAttemptedSubmit) {
      setValidationErrors(prev => ({
        ...prev,
        salt: value.trim() ? '' : 'Please enter a salt or generate one'
      }));
    }
  }, [hasAttemptedSubmit]);

  // Validate form
  const validateForm = useCallback(() => {
    const passwordValidation = validatePassword(password);
    const saltValidation = { isValid: saltInput.trim() !== '', message: saltInput.trim() ? '' : 'Please enter a salt or generate one' };

    setValidationErrors({
      password: passwordValidation.message,
      salt: saltValidation.message
    });

    return passwordValidation.isValid && saltValidation.isValid;
  }, [password, saltInput]);

  // Generate hash
  const handleGenerate = useCallback(async () => {
    setHasAttemptedSubmit(true);
    
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      const options = {
        ...parameters,
        salt: saltInput,
        saltEncoding,
        ...(selectedAlgorithm !== 'argon2id' && { hashEncoding })
      };

      let hashResult;
      switch (selectedAlgorithm) {
        case 'argon2id':
          hashResult = await hashArgon2id(password, options);
          break;
        case 'scrypt':
          hashResult = await hashScrypt(password, options);
          break;
        case 'bcrypt':
          hashResult = await hashBcrypt(password, options);
          break;
        case 'pbkdf2':
          hashResult = await hashPBKDF2(password, options);
          break;
        default:
          throw new Error(`Unsupported algorithm: ${selectedAlgorithm}`);
      }

      setResult(hashResult);
    } catch (err) {
      setError(err.message || 'An error occurred during hash generation');
    } finally {
      setIsGenerating(false);
    }
  }, [password, parameters, saltInput, saltEncoding, hashEncoding, selectedAlgorithm, validateForm]);

  return {
    // State
    password,
    isGenerating,
    result,
    error,
    validationErrors,
    hasAttemptedSubmit,
    showAdditionalInfo,
    
    // Actions
    handlePasswordChange,
    handleSaltChange,
    handleGenerate,
    setShowAdditionalInfo,
    setResult
  };
};
