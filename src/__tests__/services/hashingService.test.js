import { generateSalt, saltToUint8Array, hashArgon2id, hashScrypt, hashBcrypt, hashPBKDF2, verifyPassword } from '../services/hashingService';

describe('Hashing Service', () => {
  describe('generateSalt', () => {
    test('should generate hex salt of correct length', () => {
      const salt = generateSalt(16, 'hex');
      expect(salt).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(/^[0-9a-f]+$/i.test(salt)).toBe(true);
    });

    test('should generate base64 salt of correct length', () => {
      const salt = generateSalt(16, 'base64');
      expect(salt.length).toBeGreaterThan(20); // Base64 encoding
      expect(() => atob(salt)).not.toThrow(); // Should be valid base64
    });
  });

  describe('saltToUint8Array', () => {
    test('should convert hex salt to Uint8Array', () => {
      const hexSalt = '0123456789abcdef';
      const uint8Array = saltToUint8Array(hexSalt, 'hex');
      expect(uint8Array).toBeInstanceOf(Uint8Array);
      expect(uint8Array.length).toBe(8);
    });

    test('should convert base64 salt to Uint8Array', () => {
      const base64Salt = btoa('test salt');
      const uint8Array = saltToUint8Array(base64Salt, 'base64');
      expect(uint8Array).toBeInstanceOf(Uint8Array);
      expect(uint8Array.length).toBeGreaterThan(0);
    });
  });

  describe('hashBcrypt', () => {
    test('should generate bcrypt hash', async () => {
      const password = 'testpassword';
      const result = await hashBcrypt(password, { cost: 4 }); // Low cost for testing
      
      expect(result).toHaveProperty('algorithm', 'bcrypt');
      expect(result).toHaveProperty('salt');
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('encodedHash');
      expect(result).toHaveProperty('executionTime');
      expect(result.hash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('hashPBKDF2', () => {
    test('should generate PBKDF2 hash', async () => {
      const password = 'testpassword';
      const result = await hashPBKDF2(password, { 
        iterations: 1000, // Low iterations for testing
        saltLength: 16,
        keyLength: 32,
        saltEncoding: 'hex',
        hashEncoding: 'hex'
      });
      
      expect(result).toHaveProperty('algorithm', 'pbkdf2');
      expect(result).toHaveProperty('salt');
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('encodedHash');
      expect(result).toHaveProperty('executionTime');
      expect(result.hash).toHaveLength(64); // 32 bytes = 64 hex chars
    });
  });

  describe('verifyPassword', () => {
    test('should verify bcrypt password correctly', async () => {
      const password = 'testpassword';
      const hashResult = await hashBcrypt(password, { cost: 4 });
      
      const isValid = await verifyPassword(password, hashResult.encodedHash, 'bcrypt');
      expect(isValid).toBe(true);
      
      const isInvalid = await verifyPassword('wrongpassword', hashResult.encodedHash, 'bcrypt');
      expect(isInvalid).toBe(false);
    });

    test('should verify PBKDF2 password correctly', async () => {
      const password = 'testpassword';
      const hashResult = await hashPBKDF2(password, { 
        iterations: 1000,
        saltLength: 16,
        keyLength: 32
      });
      
      const isValid = await verifyPassword(password, hashResult.encodedHash, 'pbkdf2');
      expect(isValid).toBe(true);
      
      const isInvalid = await verifyPassword('wrongpassword', hashResult.encodedHash, 'pbkdf2');
      expect(isInvalid).toBe(false);
    });
  });
});
