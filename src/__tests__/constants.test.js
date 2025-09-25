import { HASHING_ALGORITHMS, SUPPORTED_ALGORITHMS, PARAMETER_WARNINGS } from '../constants';

describe('Constants', () => {
  describe('HASHING_ALGORITHMS', () => {
    test('should have all required algorithms', () => {
      expect(HASHING_ALGORITHMS).toHaveProperty('ARGON2ID');
      expect(HASHING_ALGORITHMS).toHaveProperty('SCRYPT');
      expect(HASHING_ALGORITHMS).toHaveProperty('BCRYPT');
      expect(HASHING_ALGORITHMS).toHaveProperty('PBKDF2');
    });

    test('should have correct algorithm properties', () => {
      Object.values(HASHING_ALGORITHMS).forEach(algorithm => {
        expect(algorithm).toHaveProperty('value');
        expect(algorithm).toHaveProperty('label');
        expect(algorithm).toHaveProperty('description');
        expect(algorithm).toHaveProperty('parameters');
      });
    });

    test('should have correct parameter structure', () => {
      Object.values(HASHING_ALGORITHMS).forEach(algorithm => {
        Object.values(algorithm.parameters).forEach(param => {
          expect(param).toHaveProperty('label');
          expect(param).toHaveProperty('default');
          expect(param).toHaveProperty('min');
          expect(param).toHaveProperty('max');
          expect(param).toHaveProperty('step');
        });
      });
    });
  });

  describe('SUPPORTED_ALGORITHMS', () => {
    test('should be an array of algorithm objects', () => {
      expect(Array.isArray(SUPPORTED_ALGORITHMS)).toBe(true);
      expect(SUPPORTED_ALGORITHMS.length).toBe(4);
    });
  });

  describe('PARAMETER_WARNINGS', () => {
    test('should have warnings for all algorithms', () => {
      expect(PARAMETER_WARNINGS).toHaveProperty('argon2id');
      expect(PARAMETER_WARNINGS).toHaveProperty('scrypt');
      expect(PARAMETER_WARNINGS).toHaveProperty('bcrypt');
      expect(PARAMETER_WARNINGS).toHaveProperty('pbkdf2');
    });

    test('should have correct warning structure', () => {
      Object.values(PARAMETER_WARNINGS).forEach(algorithmWarnings => {
        Object.values(algorithmWarnings).forEach(warning => {
          expect(warning).toHaveProperty('threshold');
          expect(warning).toHaveProperty('message');
          expect(typeof warning.threshold).toBe('number');
          expect(typeof warning.message).toBe('string');
        });
      });
    });
  });
});
