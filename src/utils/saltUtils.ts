/**
 * Salt utility functions
 */

/**
 * Calculate salt byte length based on encoding
 */
export const calculateSaltByteLength = (salt: string, encoding: string, algorithm?: string): number => {
  if (!salt) return 0;
  
  // Bcrypt salts are always 22 characters representing 16 bytes in base64
  if (algorithm === 'bcrypt') {
    return salt.length === 22 ? 16 : 0;
  }
  
  try {
    if (encoding === 'hex') {
      // Hex: 2 characters per byte
      return Math.ceil(salt.length / 2);
    } else if (encoding === 'base64') {
      // Base64: decode to get actual byte length
      const binaryString = atob(salt);
      return binaryString.length;
    }
  } catch (error) {
    // If decoding fails, fall back to approximation
    if (encoding === 'base64') {
      // Base64: approximately 4 characters per 3 bytes
      return Math.floor(salt.length * 3 / 4);
    }
  }
  
  return 0;
};

/**
 * Generate a random salt
 */
export const generateSalt = (length = 16, encoding = 'hex'): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  if (encoding === 'hex') {
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else if (encoding === 'base64') {
    return btoa(String.fromCharCode(...array));
  }
  throw new Error('Unsupported encoding');
};

/**
 * Convert salt from string to Uint8Array
 */
export const saltToUint8Array = (salt: string, encoding = 'hex'): Uint8Array => {
  if (encoding === 'hex') {
    const bytes = [];
    for (let i = 0; i < salt.length; i += 2) {
      bytes.push(parseInt(salt.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
  } else if (encoding === 'base64') {
    const binaryString = atob(salt);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  throw new Error('Unsupported encoding');
};

/**
 * Check if bcrypt salt needs regeneration based on cost factor
 */
export const shouldRegenerateBcryptSalt = (currentSalt: string, newCost: number): boolean => {
  if (!currentSalt || currentSalt.length !== 22) {
    return true; // Not a valid bcrypt salt (should be 22 characters)
  }
  
  // For extracted salt, we can't determine the cost from the salt alone
  // So we always regenerate when cost changes
  return true;
};

/**
 * Get fallback salt for algorithm
 */
export const getFallbackSalt = (algorithm: string): string => {
  const fallbackSalts = {
    bcrypt: 'N9qo8uLOickgx2ZMRZoMye', // 22-character salt without $2a$10$ prefix
    pbkdf2: '778e2617f07e1a6288f448d9b6cad1ce',
    argon2id: '778e2617f07e1a6288f448d9b6cad1ce',
    scrypt: '778e2617f07e1a6288f448d9b6cad1ce'
  };
  return fallbackSalts[algorithm] || '778e2617f07e1a6288f448d9b6cad1ce';
};
