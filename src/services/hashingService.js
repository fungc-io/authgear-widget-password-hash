import scrypt from 'scrypt-js';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

// Check if we're in development environment
const isDev = import.meta.env.DEV;

// Debug logging helper
const debugLog = (...args) => {
  if (isDev) {
    console.log(...args);
  }
};

const debugError = (...args) => {
  if (isDev) {
    console.error(...args);
  }
};

/**
 * Generate a random salt
 * @param {number} length - Salt length in bytes
 * @param {string} encoding - Output encoding ('hex' or 'base64')
 * @returns {string} Generated salt
 */
export function generateSalt(length = 16, encoding = 'hex') {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  if (encoding === 'hex') {
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else if (encoding === 'base64') {
    return btoa(String.fromCharCode(...array));
  }
  throw new Error('Unsupported encoding');
}

/**
 * Generate salt for specific algorithm
 * @param {string} algorithm - Algorithm name ('argon2id', 'scrypt', 'bcrypt', 'pbkdf2')
 * @param {Object} parameters - Algorithm parameters
 * @param {string} saltEncoding - Salt encoding for non-algorithm-specific salts
 * @returns {Promise<string>} Generated salt
 */
export async function generateAlgorithmSalt(algorithm, parameters = {}, saltEncoding = 'hex') {
  switch (algorithm) {
    case 'bcrypt': {
      const cost = parameters.cost || 10;
      const bcrypt = await import('bcryptjs');
      const fullSalt = await bcrypt.genSalt(cost);
      // Extract only the actual salt part (22 characters after $2a$10$)
      return fullSalt.substring(7, 29);
    }
    
    case 'pbkdf2': {
      const saltLength = parameters.saltLength || 16;
      const CryptoJS = await import('crypto-js');
      const saltWordArray = CryptoJS.lib.WordArray.random(saltLength);
      return saltWordArray.toString(CryptoJS.enc.Hex);
    }
    
    case 'argon2id':
    case 'scrypt':
    default: {
      const saltLength = parameters.saltLength || 16;
      return generateSalt(saltLength, saltEncoding);
    }
  }
}

/**
 * Convert salt from string to Uint8Array
 * @param {string} salt - Salt string
 * @param {string} encoding - Input encoding ('hex' or 'base64')
 * @returns {Uint8Array} Salt as Uint8Array
 */
export function saltToUint8Array(salt, encoding = 'hex') {
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
}

/**
 * Hash password using Argon2id with argon2-browser (vanilla JS)
 * @param {string} password - Plaintext password
 * @param {Object} options - Argon2id parameters
 * @returns {Promise<Object>} Hash result with salt, hash, and execution time
 */
export async function hashArgon2id(password, options = {}) {
  debugLog('🔵 [Argon2id] Starting with password:', password, 'options:', options);
  
  const {
    memory = 19,
    iterations = 2,
    parallelism = 1,
    saltLength = 16,
    keyLength = 32,
    saltEncoding = 'hex'
  } = options;

  const startTime = performance.now();
  
  try {
    // Check if argon2 is available globally
    if (typeof window === 'undefined' || !window.argon2) {
      debugError('❌ [Argon2id] argon2-browser library not loaded');
      throw new Error('argon2-browser library not loaded. Please ensure the script is included in your HTML.');
    }
    
    // Use provided salt or generate one if not provided
    const salt = options.salt || generateSalt(saltLength, saltEncoding);
    debugLog('🔵 [Argon2id] Using salt:', salt);
    
    // Use argon2-browser for real Argon2id computation
    // Add a small delay to allow React to render the loading state
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const result = await window.argon2.hash({
      pass: password,
      salt: salt,
      time: iterations,
      mem: memory * 1024, // Convert MiB to KiB (argon2-browser expects KiB)
      hashLen: keyLength,
      parallelism: parallelism,
      type: window.argon2.ArgonType.Argon2id
    });
    
    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);
    
    // Argon2id always uses the PHC string format (result.encoded)
    // This format includes all parameters and uses base64 encoding
    const finalResult = {
      algorithm: 'argon2id',
      salt,
      hash: result.encoded, // Use the standard PHC format
      encodedHash: result.encoded,
      executionTime,
      parameters: { memory, iterations, parallelism, saltLength, keyLength }
    };
    
    debugLog('✅ [Argon2id] Completed in', executionTime, 'ms. Hash:', result.encoded);
    
    return finalResult;
  } catch (error) {
    debugError('❌ [Argon2id] Error:', error.message);
    throw new Error(`Argon2id hashing failed: ${error.message}`);
  }
}

/**
 * Hash password using scrypt
 * @param {string} password - Plaintext password
 * @param {Object} options - scrypt parameters
 * @returns {Promise<Object>} Hash result with salt, hash, and execution time
 */
export async function hashScrypt(password, options = {}) {
  debugLog('🔵 [scrypt] Starting with password:', password, 'options:', options);
  
  const {
    N = 16384,
    r = 8,
    p = 1,
    saltLength = 16,
    keyLength = 32,
    saltEncoding = 'hex'
  } = options;

  const startTime = performance.now();
  
  try {
    // Use provided salt or generate one if not provided
    const salt = options.salt || generateSalt(saltLength, saltEncoding);
    const saltBytes = saltToUint8Array(salt, saltEncoding);
    
    // Normalize password according to scrypt-js documentation
    const normalizedPassword = password.normalize('NFKC');
    debugLog('🔵 [scrypt] Normalized password:', normalizedPassword);
    
    // Add a small delay to allow React to render the loading state
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Hash with scrypt using normalized password
    debugLog('🔵 [scrypt] Computing scrypt with parameters:', {
      N: N,
      r: r,
      p: p,
      keyLength: keyLength
    });
    const hash = await scrypt.scrypt(
      new TextEncoder().encode(normalizedPassword),
      saltBytes,
      N,
      r,
      p,
      keyLength
    );
    
    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);
    
    // Convert salt and hash to base64 for PHC format
    const saltBase64 = btoa(String.fromCharCode(...saltBytes));
    const hashBase64 = btoa(String.fromCharCode(...hash));
    
    // Calculate log2(N) for PHC format
    const logN = Math.log2(N);
    
    // Generate PHC string format: $scrypt$ln=<cost>,r=<blocksize>,p=<parallelism>$<salt>$<hash>
    const phcString = `$scrypt$ln=${logN},r=${r},p=${p}$${saltBase64}$${hashBase64}`;
    
    const result = {
      algorithm: 'scrypt',
      salt,
      hash: phcString, // Use PHC format as the main hash
      encodedHash: phcString,
      executionTime,
      parameters: { N, r, p, saltLength, keyLength }
    };
    
    debugLog('✅ [scrypt] Completed in', executionTime, 'ms. Hash:', phcString);
    
    return result;
  } catch (error) {
    debugError('❌ [scrypt] Error:', error.message);
    throw new Error(`scrypt hashing failed: ${error.message}`);
  }
}

/**
 * Hash password using bcrypt
 * @param {string} password - Plaintext password
 * @param {Object} options - bcrypt parameters
 * @returns {Promise<Object>} Hash result with salt, hash, and execution time
 */
export async function hashBcrypt(password, options = {}) {
  debugLog('🔵 [bcrypt] Starting with password:', password, 'options:', options);
  
  const { cost = 10, salt } = options;

  const startTime = performance.now();
  
  try {
    let bcryptSalt;
    
    if (salt) {
      debugLog('🔵 [bcrypt] Using provided salt:', salt);
      // If salt doesn't start with $2, reconstruct the full bcrypt salt format
      if (!salt.startsWith('$2')) {
        bcryptSalt = `$2a$${cost}$${salt}`;
      } else {
        bcryptSalt = salt;
      }
    } else {
      debugLog('🔵 [bcrypt] Generating new salt with cost:', cost);
      // Generate salt using async function
      bcryptSalt = await bcrypt.genSalt(cost);
      debugLog('🔵 [bcrypt] Generated bcrypt salt:', bcryptSalt);
    }
    
    // Hash with bcrypt using async function
    debugLog('🔵 [bcrypt] Hashing password with bcrypt...');
    const hash = await bcrypt.hash(password, bcryptSalt);
    
    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);
    
    // Extract only the actual salt part (22 characters after $2a$10$)
    const extractedSalt = hash.substring(7, 29);
    
    const result = {
      algorithm: 'bcrypt',
      salt: extractedSalt,
      hash: hash,
      encodedHash: hash,
      executionTime,
      parameters: { cost }
    };
    
    debugLog('✅ [bcrypt] Completed in', executionTime, 'ms. Hash:', hash);
    
    return result;
  } catch (error) {
    debugError('❌ [bcrypt] Error:', error.message);
    throw new Error(`bcrypt hashing failed: ${error.message}`);
  }
}

/**
 * Hash password using PBKDF2-HMAC-SHA256
 * @param {string} password - Plaintext password
 * @param {Object} options - PBKDF2 parameters
 * @returns {Promise<Object>} Hash result with salt, hash, and execution time
 */
export async function hashPBKDF2(password, options = {}) {
  debugLog('🔵 [PBKDF2] Starting with password:', password, 'options:', options);
  
  const {
    iterations = 600000,
    saltLength = 16,
    keyLength = 32,
    saltEncoding = 'hex',
    hashEncoding = 'hex'
  } = options;

  const startTime = performance.now();
  
  try {
    // Use provided salt or generate one using CryptoJS.lib.WordArray.random
    let salt;
    let saltWordArray;
    
    if (options.salt) {
      debugLog('🔵 [PBKDF2] Using provided salt:', options.salt);
      // Convert provided salt to WordArray
      if (saltEncoding === 'hex') {
        saltWordArray = CryptoJS.enc.Hex.parse(options.salt);
      } else if (saltEncoding === 'base64') {
        saltWordArray = CryptoJS.enc.Base64.parse(options.salt);
      } else {
        saltWordArray = CryptoJS.enc.Utf8.parse(options.salt);
      }
      salt = options.salt;
    } else {
      debugLog('🔵 [PBKDF2] Generating salt with CryptoJS.lib.WordArray.random');
      // Generate salt using CryptoJS.lib.WordArray.random (saltLength in bytes)
      saltWordArray = CryptoJS.lib.WordArray.random(saltLength);
      salt = saltWordArray.toString(CryptoJS.enc.Hex);
      debugLog('🔵 [PBKDF2] Generated salt:', salt);
    }
    
    // Add a small delay to allow React to render the loading state
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Use CryptoJS PBKDF2 according to documentation
    debugLog('🔵 [PBKDF2] Computing PBKDF2 with CryptoJS...');
    debugLog('🔵 [PBKDF2] Input parameters:', {
      password: password,
      saltWordArray: saltWordArray.toString(CryptoJS.enc.Hex),
      keySize: keyLength / 4,
      iterations: iterations
    });
    const hash = CryptoJS.PBKDF2(password, saltWordArray, {
      keySize: keyLength / 4, // CryptoJS uses words (4 bytes each)
      iterations: iterations
    });
    
    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);
    
    // Use CryptoJS result directly (always hex for PBKDF2)
    const hashString = hash.toString(CryptoJS.enc.Hex);
    
    // Create encoded hash format
    const saltBase64 = saltWordArray.toString(CryptoJS.enc.Base64);
    const hashBase64 = hash.toString(CryptoJS.enc.Base64);
    const encodedHash = `$pbkdf2-sha256$${iterations}$${saltBase64}$${hashBase64}`;
    
    const result = {
      algorithm: 'pbkdf2',
      salt,
      hash: hashString,
      encodedHash,
      executionTime,
      parameters: { iterations, saltLength, keyLength }
    };
    
    debugLog('✅ [PBKDF2] Completed in', executionTime, 'ms. Hash:', hashString);
    
    return result;
  } catch (error) {
    debugError('❌ [PBKDF2] Error:', error.message);
    throw new Error(`PBKDF2 hashing failed: ${error.message}`);
  }
}

/**
 * Verify password against hash
 * @param {string} password - Plaintext password to verify
 * @param {string} hash - Hash to verify against
 * @param {string} algorithm - Algorithm used ('argon2id', 'scrypt', 'bcrypt', 'pbkdf2')
 * @param {Object} options - Algorithm parameters
 * @returns {Promise<boolean>} True if password matches hash
 */
export async function verifyPassword(password, hash, algorithm, options = {}) {
  try {
    switch (algorithm) {
      case 'argon2id':
        debugLog('🔵 [Argon2id Verify] Verifying password against hash');
        
        // Check if argon2 is available globally
        if (typeof window === 'undefined' || !window.argon2) {
          debugError('❌ [Argon2id Verify] argon2-browser library not loaded');
          throw new Error('argon2-browser library not loaded. Please ensure the script is included in your HTML.');
        }
        
        // Add a small delay to allow React to render the loading state
        await new Promise(resolve => setTimeout(resolve, 10));
        
        try {
          await window.argon2.verify({
            pass: password,
            encoded: hash
          });
          
          debugLog('✅ [Argon2id Verify] Verification successful');
          return true;
          
        } catch (verifyError) {
          debugLog('🔵 [Argon2id Verify] Verification failed:', verifyError.message);
          
          // Check if it's a verification failure (wrong password) vs other error
          if (verifyError.message && verifyError.message.includes('verification')) {
            return false;
          } else {
            debugError('❌ [Argon2id Verify] Unexpected error:', verifyError);
            throw verifyError;
          }
        }
      
      case 'scrypt':
        debugLog('🔵 [scrypt Verify] Verifying password against hash');
        // Parse PHC format: $scrypt$ln=<cost>,r=<blocksize>,p=<parallelism>$<salt>$<hash>
        const scryptMatch = hash.match(/^\$scrypt\$ln=([\d.]+),r=(\d+),p=(\d+)\$([^$]+)\$([^$]+)$/);
        if (!scryptMatch) {
          debugError('❌ [scrypt Verify] Invalid PHC hash format');
          throw new Error('Invalid scrypt PHC hash format');
        }
        const [, logN, r, p, scryptSaltB64, scryptHashB64] = scryptMatch;
        const N = Math.pow(2, parseFloat(logN)); // Convert log2(N) back to N
        const saltBytes = new Uint8Array(atob(scryptSaltB64).split('').map(c => c.charCodeAt(0)));
        const expectedHash = new Uint8Array(atob(scryptHashB64).split('').map(c => c.charCodeAt(0)));
        
        // Normalize password according to scrypt-js documentation
        const normalizedPassword = password.normalize('NFKC');
        debugLog('🔵 [scrypt Verify] Normalized password:', normalizedPassword);
        
        // Add a small delay to allow React to render the loading state
        await new Promise(resolve => setTimeout(resolve, 10));
        
        debugLog('🔵 [scrypt Verify] Computing scrypt with parameters:', {
          N: N,
          r: parseInt(r),
          p: parseInt(p),
          keyLength: expectedHash.length
        });
        const computedHash = await scrypt.scrypt(
          new TextEncoder().encode(normalizedPassword),
          saltBytes,
          N,
          parseInt(r),
          parseInt(p),
          expectedHash.length
        );
        
        const result = computedHash.every((byte, i) => byte === expectedHash[i]);
        debugLog('✅ [scrypt Verify] Verification result:', result);
        return result;
      
      case 'bcrypt':
        debugLog('🔵 [bcrypt Verify] Verifying password against hash');
        const bcryptResult = await bcrypt.compare(password, hash);
        debugLog('✅ [bcrypt Verify] Verification result:', bcryptResult);
        return bcryptResult;
      
      case 'pbkdf2':
        debugLog('🔵 [PBKDF2 Verify] Verifying password against hash');
        // For PBKDF2, we need to parse the encoded hash
        const pbkdf2Match = hash.match(/^\$pbkdf2-sha256\$(\d+)\$([^$]+)\$([^$]+)$/);
        if (!pbkdf2Match) {
          debugError('❌ [PBKDF2 Verify] Invalid hash format');
          throw new Error('Invalid PBKDF2 hash format');
        }
        const [, pbkdf2Iterations, pbkdf2SaltB64, pbkdf2HashB64] = pbkdf2Match;
        const pbkdf2SaltBytes = new Uint8Array(atob(pbkdf2SaltB64).split('').map(c => c.charCodeAt(0)));
        const expectedPbkdf2Hash = atob(pbkdf2HashB64);
        
        // Add a small delay to allow React to render the loading state
        await new Promise(resolve => setTimeout(resolve, 10));
        
        debugLog('🔵 [PBKDF2 Verify] Computing PBKDF2 with CryptoJS...');
        const computedPbkdf2Hash = CryptoJS.PBKDF2(password, CryptoJS.lib.WordArray.create(pbkdf2SaltBytes), {
          keySize: expectedPbkdf2Hash.length / 4,
          iterations: parseInt(pbkdf2Iterations)
        });
        
        const pbkdf2Result = computedPbkdf2Hash.toString(CryptoJS.enc.Base64) === pbkdf2HashB64;
        debugLog('✅ [PBKDF2 Verify] Verification result:', pbkdf2Result);
        return pbkdf2Result;
      
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}
