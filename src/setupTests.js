import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'text-encoding';

// Mock TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.crypto for tests
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      generateKey: jest.fn(),
      exportKey: jest.fn(),
      importKey: jest.fn(),
      sign: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5])), // Mock signature
      verify: jest.fn(),
    },
    getRandomValues: jest.fn().mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
  writable: true,
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
}); 