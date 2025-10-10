/**
 * Custom hook for hash verification
 */

import { useState, useCallback } from 'react';
import { verifyPassword } from '../services/hashingService';
import { parseAlgorithmFromHash } from '../utils/algorithmUtils';
import { validateEncodedHash, validateCandidatePassword } from '../utils/validation';

export const useHashVerification = () => {
  const [encodedHash, setEncodedHash] = useState('');
  const [candidatePassword, setCandidatePassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showSupportedFormats, setShowSupportedFormats] = useState(false);

  // Parse algorithm from encoded hash
  const parseAlgorithm = useCallback((hash: string) => {
    return parseAlgorithmFromHash(hash);
  }, []);

  // Handle encoded hash change
  const handleEncodedHashChange = useCallback((value: string) => {
    setEncodedHash(value);
    setError('');
    setVerificationResult(null);
  }, []);

  // Handle candidate password change
  const handleCandidatePasswordChange = useCallback((value: string) => {
    setCandidatePassword(value);
    setError('');
    setVerificationResult(null);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const hashValidation = validateEncodedHash(encodedHash);
    const passwordValidation = validateCandidatePassword(candidatePassword);

    if (!hashValidation.isValid) {
      setError(hashValidation.message);
      return false;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return false;
    }

    return true;
  }, [encodedHash, candidatePassword]);

  // Verify password
  const handleVerify = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    try {
      const algorithm = parseAlgorithm(encodedHash);
      if (!algorithm) {
        throw new Error('Unable to determine algorithm from hash format');
      }

      const isValid = await verifyPassword(candidatePassword, encodedHash, algorithm);
      setVerificationResult({
        isValid,
        algorithm,
        message: isValid ? 'Password matches password hash' : 'Password does not match password hash'
      });
    } catch (err) {
      // Only show as error if it's not a verification failure
      if (err.message.includes('verification') || err.message.includes('does not match')) {
        // Treat verification failure as a normal result
        setVerificationResult({
          isValid: false,
          algorithm: parseAlgorithm(encodedHash) || 'unknown',
          message: 'Password does not match password hash'
        });
      } else {
        // Show other errors (like algorithm detection issues)
        setError(err.message);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [encodedHash, candidatePassword, parseAlgorithm, validateForm]);

  return {
    // State
    encodedHash,
    candidatePassword,
    isVerifying,
    verificationResult,
    error,
    showSupportedFormats,
    
    // Actions
    handleEncodedHashChange,
    handleCandidatePasswordChange,
    handleVerify,
    setShowSupportedFormats
  };
};
