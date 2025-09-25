import scrypt from 'scrypt-js';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

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
  const {
    memory = 19,
    iterations = 2,
    parallelism = 1,
    saltLength = 16,
    keyLength = 32,
    saltEncoding = 'hex',
    hashEncoding = 'hex'
  } = options;

  const startTime = performance.now();
  
  try {
    // Check if argon2 is available globally
    if (typeof window === 'undefined' || !window.argon2) {
      throw new Error('argon2-browser library not loaded. Please ensure the script is included in your HTML.');
    }
    
    // Use provided salt or generate one if not provided
    const salt = options.salt || generateSalt(saltLength, saltEncoding);
    
    // Convert salt to bytes for argon2-browser (it expects UTF-8 string, not hex)
    let saltForArgon2;
    if (saltEncoding === 'hex') {
      // Convert hex string to actual bytes, then to string
      const saltBytes = saltToUint8Array(salt, 'hex');
      saltForArgon2 = String.fromCharCode(...saltBytes);
    } else if (saltEncoding === 'base64') {
      // Convert base64 to bytes, then to string
      const saltBytes = saltToUint8Array(salt, 'base64');
      saltForArgon2 = String.fromCharCode(...saltBytes);
    } else {
      saltForArgon2 = salt; // Use as-is if already a string
    }
    
    // Use argon2-browser for real Argon2id computation
    const result = await window.argon2.hash({
      pass: password,
      salt: saltForArgon2, // Use actual bytes as string
      time: iterations,
      mem: memory * 1024, // Convert MiB to KiB (argon2-browser expects KiB)
      hashLen: keyLength,
      parallelism: parallelism,
      type: window.argon2.ArgonType.Argon2id
    });
    
    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);
    
    // Convert hash to desired encoding
    let hashString;
    if (hashEncoding === 'hex') {
      hashString = result.hashHex;
    } else if (hashEncoding === 'base64') {
      // Convert hex to base64
      const hex = result.hashHex;
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      hashString = btoa(String.fromCharCode(...bytes));
    }
    
    // Use the encoded hash from argon2-browser
    const encodedHash = result.encoded;
    
    return {
      algorithm: 'argon2id',
      salt,
      hash: hashString,
      encodedHash,
      executionTime,
      parameters: { memory, iterations, parallelism, saltLength, keyLength }
    };
  } catch (error) {
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
  const {
    N = 131072,
    r = 8,
    p = 1,
    saltLength = 16,
    keyLength = 32,
    saltEncoding = 'hex',
    hashEncoding = 'hex'
  } = options;

  const startTime = performance.now();
  
  try {
    // Use provided salt or generate one if not provided
    const salt = options.salt || generateSalt(saltLength, saltEncoding);
    const saltBytes = saltToUint8Array(salt, saltEncoding);
    
    // Hash with scrypt
    const hash = await scrypt.scrypt(
      new TextEncoder().encode(password),
      saltBytes,
      N,
      r,
      p,
      keyLength
    );
    
    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);
    
    // Convert hash to desired encoding
    let hashString;
    if (hashEncoding === 'hex') {
      hashString = Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
    } else if (hashEncoding === 'base64') {
      hashString = btoa(String.fromCharCode(...hash));
    }
    
    return {
      algorithm: 'scrypt',
      salt,
      hash: hashString,
      encodedHash: `$scrypt$N=${N},r=${r},p=${p}$${btoa(String.fromCharCode(...saltBytes))}$${btoa(String.fromCharCode(...hash))}`,
      executionTime,
      parameters: { N, r, p, saltLength, keyLength }
    };
  } catch (error) {
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
  const { cost = 12, salt, saltEncoding = 'hex' } = options;

  const startTime = performance.now();
  
  try {
    let bcryptSalt;
    
    if (salt) {
      // Use provided salt - convert to bcrypt format
      const saltBytes = saltToUint8Array(salt, saltEncoding);
      
      // Ensure salt is exactly 16 bytes for bcrypt
      let finalSaltBytes;
      if (saltBytes.length === 16) {
        finalSaltBytes = saltBytes;
      } else if (saltBytes.length < 16) {
        // Pad with zeros if too short
        finalSaltBytes = new Uint8Array(16);
        finalSaltBytes.set(saltBytes);
      } else {
        // Truncate if too long
        finalSaltBytes = saltBytes.slice(0, 16);
      }
      
      // Convert bytes to base64 for bcrypt salt format
      const saltBase64 = btoa(String.fromCharCode(...finalSaltBytes));
      // Create bcrypt salt with cost factor
      bcryptSalt = `$2a$${cost}$${saltBase64}`;
    } else {
      // Generate salt if not provided
      bcryptSalt = bcrypt.genSaltSync(cost);
    }
    
    // Hash with bcrypt
    const hash = bcrypt.hashSync(password, bcryptSalt);
    
    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);
    
    // Extract salt from bcrypt hash (first 29 characters)
    const extractedSalt = hash.substring(0, 29);
    
    return {
      algorithm: 'bcrypt',
      salt: extractedSalt,
      hash: hash,
      encodedHash: hash,
      executionTime,
      parameters: { cost }
    };
  } catch (error) {
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
  const {
    iterations = 600000,
    saltLength = 16,
    keyLength = 32,
    saltEncoding = 'hex',
    hashEncoding = 'hex'
  } = options;

  const startTime = performance.now();
  
  try {
    // Use provided salt or generate one if not provided
    const salt = options.salt || generateSalt(saltLength, saltEncoding);
    const saltBytes = saltToUint8Array(salt, saltEncoding);
    
    // Make PBKDF2 computation asynchronous using requestIdleCallback or setTimeout
    const hash = await new Promise((resolve) => {
      // Use requestIdleCallback if available, otherwise setTimeout
      const runComputation = () => {
        const result = CryptoJS.PBKDF2(password, CryptoJS.lib.WordArray.create(saltBytes), {
          keySize: keyLength / 4, // CryptoJS uses words (4 bytes each)
          iterations: iterations
        });
        resolve(result);
      };
      
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(runComputation);
      } else {
        setTimeout(runComputation, 0);
      }
    });
    
    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);
    
    // Convert hash to desired encoding
    let hashString;
    if (hashEncoding === 'hex') {
      hashString = hash.toString(CryptoJS.enc.Hex);
    } else if (hashEncoding === 'base64') {
      hashString = hash.toString(CryptoJS.enc.Base64);
    }
    
    return {
      algorithm: 'pbkdf2',
      salt,
      hash: hashString,
      encodedHash: `$pbkdf2-sha256$${iterations}$${btoa(String.fromCharCode(...saltBytes))}$${btoa(String.fromCharCode(...hash.words.map(w => w >>> 24, w => (w >>> 16) & 0xff, w => (w >>> 8) & 0xff, w => w & 0xff).flat()))}`,
      executionTime,
      parameters: { iterations, saltLength, keyLength }
    };
  } catch (error) {
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
        // Check if argon2 is available globally
        if (typeof window === 'undefined' || !window.argon2) {
          throw new Error('argon2-browser library not loaded. Please ensure the script is included in your HTML.');
        }
        
        // Use argon2-browser for verification
        const verifyResult = await window.argon2.verify({
          pass: password,
          encoded: hash
        });
        
        return verifyResult;
      
      case 'scrypt':
        // For scrypt, we need to parse the encoded hash to extract parameters
        const scryptMatch = hash.match(/^\$scrypt\$N=(\d+),r=(\d+),p=(\d+)\$([^$]+)\$([^$]+)$/);
        if (!scryptMatch) {
          throw new Error('Invalid scrypt hash format');
        }
        const [, N, r, p, scryptSaltB64, scryptHashB64] = scryptMatch;
        const saltBytes = new Uint8Array(atob(scryptSaltB64).split('').map(c => c.charCodeAt(0)));
        const expectedHash = new Uint8Array(atob(scryptHashB64).split('').map(c => c.charCodeAt(0)));
        
        const computedHash = await scrypt.scrypt(
          new TextEncoder().encode(password),
          saltBytes,
          parseInt(N),
          parseInt(r),
          parseInt(p),
          expectedHash.length
        );
        
        return computedHash.every((byte, i) => byte === expectedHash[i]);
      
      case 'bcrypt':
        return bcrypt.compareSync(password, hash);
      
      case 'pbkdf2':
        // For PBKDF2, we need to parse the encoded hash
        const pbkdf2Match = hash.match(/^\$pbkdf2-sha256\$(\d+)\$([^$]+)\$([^$]+)$/);
        if (!pbkdf2Match) {
          throw new Error('Invalid PBKDF2 hash format');
        }
        const [, pbkdf2Iterations, pbkdf2SaltB64, pbkdf2HashB64] = pbkdf2Match;
        const pbkdf2SaltBytes = new Uint8Array(atob(pbkdf2SaltB64).split('').map(c => c.charCodeAt(0)));
        const expectedPbkdf2Hash = atob(pbkdf2HashB64);
        
        const computedPbkdf2Hash = CryptoJS.PBKDF2(password, CryptoJS.lib.WordArray.create(pbkdf2SaltBytes), {
          keySize: expectedPbkdf2Hash.length / 4,
          iterations: parseInt(pbkdf2Iterations)
        });
        
        return computedPbkdf2Hash.toString(CryptoJS.enc.Base64) === pbkdf2HashB64;
      
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}
