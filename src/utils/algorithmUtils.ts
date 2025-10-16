/**
 * Algorithm utility functions
 */

import { HASHING_ALGORITHMS, PARAMETER_WARNINGS } from '../constants';

/**
 * Parse algorithm from encoded hash
 */
export const parseAlgorithmFromHash = (hash: string): string | null => {
  if (hash.startsWith('$argon2id$')) return 'argon2id';
  if (hash.startsWith('$scrypt$')) return 'scrypt';
  if (hash.startsWith('$2b$') || hash.startsWith('$2a$') || hash.startsWith('$2y$')) return 'bcrypt';
  if (hash.startsWith('$pbkdf2-sha256$')) return 'pbkdf2';
  return null;
};

/**
 * Get algorithm configuration
 */
export const getAlgorithmConfig = (algorithm: string) => {
  return Object.values(HASHING_ALGORITHMS).find(alg => alg.value === algorithm);
};

/**
 * Get parameter warnings for algorithm
 */
export const getParameterWarnings = (algorithm: string, parameters: Record<string, number>): string[] => {
  const algorithmWarnings = PARAMETER_WARNINGS[algorithm];
  if (!algorithmWarnings) return [];

  return Object.keys(algorithmWarnings).map(paramKey => {
    const warning = algorithmWarnings[paramKey];
    const currentValue = parameters[paramKey];
    if (currentValue < warning.threshold) {
      return warning.message;
    }
    return null;
  }).filter(Boolean);
};

/**
 * Get parameter description
 */
export const getParameterDescription = (paramKey: string): string => {
  const descriptions = {
    memory: 'Memory usage in MiB. Higher = more secure but slower.',
    iterations: 'Number of iterations. Higher = more secure but slower.',
    parallelism: 'Number of parallel threads. Usually 4 for optimal performance.',
    saltLength: 'Salt length in bytes. 16 bytes (128-bit) is recommended.',
    keyLength: 'Hash output length in bytes. 32 bytes (256-bit) is recommended.',
    N: 'CPU/Memory cost factor. Must be power of 2.',
    r: 'Block size parameter. Higher = more memory usage.',
    p: 'Parallelization parameter. Usually 1.',
    cost: 'Cost factor (2^cost rounds). Higher = more secure but slower.'
  };
  return descriptions[paramKey] || '';
};

/**
 * Check if algorithm supports salt format selection
 */
export const supportsSaltFormat = (algorithm: string): boolean => {
  return !['argon2id', 'bcrypt'].includes(algorithm);
};

/**
 * Check if algorithm supports output encoding selection
 */
export const supportsOutputEncoding = (algorithm: string): boolean => {
  return !['bcrypt', 'pbkdf2', 'argon2id'].includes(algorithm);
};

/**
 * Check if algorithm shows execution time hint
 */
export const showsExecutionTimeHint = (algorithm: string): boolean => {
  return algorithm === 'argon2id';
};
