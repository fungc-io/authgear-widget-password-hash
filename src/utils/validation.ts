/**
 * Validation utilities for form fields
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Validate password field
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || !password.trim()) {
    return {
      isValid: false,
      message: 'Please enter a plaintext password'
    };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate salt field
 */
export const validateSalt = (salt: string): ValidationResult => {
  if (!salt || !salt.trim()) {
    return {
      isValid: false,
      message: 'Please enter a salt or generate one'
    };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate encoded hash field
 */
export const validateEncodedHash = (hash: string): ValidationResult => {
  if (!hash || !hash.trim()) {
    return {
      isValid: false,
      message: 'Please enter an encoded password hash'
    };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate candidate password field
 */
export const validateCandidatePassword = (password: string): ValidationResult => {
  if (!password || !password.trim()) {
    return {
      isValid: false,
      message: 'Please enter a candidate password'
    };
  }
  return { isValid: true, message: '' };
};

/**
 * Generic field validator
 */
export const validateField = (field: string, value: string): string => {
  switch (field) {
    case 'password':
      return validatePassword(value).message;
    case 'salt':
      return validateSalt(value).message;
    case 'encodedHash':
      return validateEncodedHash(value).message;
    case 'candidatePassword':
      return validateCandidatePassword(value).message;
    default:
      return '';
  }
};
