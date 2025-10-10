// Password hashing algorithm configurations
export const HASHING_ALGORITHMS = {
  ARGON2ID: {
    value: 'argon2id',
    label: 'Argon2id',
    description: 'Memory-hard password hashing function',
    parameters: {
      memory: { label: 'Memory (MiB)', default: 19, min: 1, max: 2048, step: 1 },
      iterations: { label: 'Iterations', default: 2, min: 1, max: 10, step: 1 },
      parallelism: { label: 'Parallelism', default: 1, min: 1, max: 16, step: 1 },
      saltLength: { label: 'Salt Length (bytes)', default: 16, min: 8, max: 64, step: 1 },
      keyLength: { label: 'Hash Length (bytes)', default: 32, min: 16, max: 64, step: 1 }
    }
  },
  SCRYPT: {
    value: 'scrypt',
    label: 'scrypt',
    description: 'Memory-hard key derivation function',
    parameters: {
      N: { label: 'N (CPU/Memory cost)', default: 131072, min: 1024, max: 1048576, step: 1024 }, // 2^17
      r: { label: 'r (Block size)', default: 8, min: 1, max: 32, step: 1 },
      p: { label: 'p (Parallelization)', default: 1, min: 1, max: 16, step: 1 },
      saltLength: { label: 'Salt Length (bytes)', default: 16, min: 8, max: 64, step: 1 },
      keyLength: { label: 'Key Length (bytes)', default: 32, min: 16, max: 64, step: 1 }
    }
  },
  BCRYPT: {
    value: 'bcrypt',
    label: 'bcrypt',
    description: 'Adaptive password hashing function',
    parameters: {
      cost: { label: 'Cost Factor', default: 12, min: 4, max: 20, step: 1 }
    }
  },
  PBKDF2: {
    value: 'pbkdf2',
    label: 'PBKDF2-HMAC-SHA256',
    description: 'Password-based key derivation function',
    parameters: {
      iterations: { label: 'Iterations', default: 600000, min: 1000, max: 10000000, step: 1000 },
      saltLength: { label: 'Salt Length (bytes)', default: 16, min: 8, max: 64, step: 1 },
      keyLength: { label: 'Key Length (bytes)', default: 32, min: 16, max: 64, step: 1 }
    }
  }
};

// Supported algorithms array for UI
export const SUPPORTED_ALGORITHMS = Object.values(HASHING_ALGORITHMS);

// Parameter validation warnings
export const PARAMETER_WARNINGS = {
  argon2id: {
    memory: { threshold: 19, message: 'Memory below 19 MiB may be insecure' },
    iterations: { threshold: 2, message: 'Iterations below 2 may be insecure' },
    parallelism: { threshold: 1, message: 'Parallelism below 1 is invalid' }
  },
  scrypt: {
    N: { threshold: 65536, message: 'N below 65536 may be insecure' },
    r: { threshold: 8, message: 'r below 8 may be insecure' }
  },
  bcrypt: {
    cost: { threshold: 10, message: 'Cost factor below 10 may be insecure' }
  },
  pbkdf2: {
    iterations: { threshold: 100000, message: 'Iterations below 100,000 may be insecure' }
  }
};

// Salt encoding options
export const SALT_ENCODING_OPTIONS = [
  { value: 'hex', label: 'Hex' },
  { value: 'base64', label: 'Base64' }
];

// Hash output encoding options
export const HASH_ENCODING_OPTIONS = [
  { value: 'hex', label: 'Hex' },
  { value: 'base64', label: 'Base64' }
];