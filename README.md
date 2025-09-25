# Authgear Password Hashing Mini Tool

A comprehensive React-based password hashing tool designed to be embedded in authgear.com via iframe. This widget provides password hashing capabilities with support for all major password hashing algorithms including Argon2id, scrypt, bcrypt, and PBKDF2.


## 🌐 Live Demo

**[Try the tool online at https://www.authgear.com/tools/password-hasher](https://www.authgear.com/tools/password-hasher)**

## Features

### Password Hashing Algorithms
- ✅ **Argon2id** - Memory-hard password hashing function
  - Parameters: memory (MiB), iterations, parallelism, salt length, key length
  - Default: memory = 19 MiB, iterations = 2, parallelism = 1
- ✅ **scrypt** - Memory-hard key derivation function
  - Parameters: N (CPU/Memory cost), r (Block size), p (Parallelization), salt length, key length
  - Default: N = 2^17, r = 8, p = 1
- ✅ **bcrypt** - Adaptive password hashing function
  - Parameters: cost factor
  - Default: cost = 12
- ✅ **PBKDF2-HMAC-SHA256** - Password-based key derivation function
  - Parameters: iterations, salt length, key length
  - Default: iterations = 600,000

### Hash Generation
- ✅ Input field for plaintext password
- ✅ Algorithm selector with parameter controls
- ✅ Salt management (auto-generate or custom input)
- ✅ Output encoding options (hex/base64)
- ✅ Real-time parameter validation with security warnings
- ✅ Execution time measurement
- ✅ Copy-to-clipboard functionality for all outputs

### Hash Verification
- ✅ Input field for encoded hash string
- ✅ Automatic algorithm detection from hash format
- ✅ Candidate password verification
- ✅ Clear match/mismatch results with visual indicators
- ✅ Support for all standard hash formats

### Safety Features
- ✅ Parameter validation with security warnings
- ✅ Tooltips explaining algorithm parameters
- ✅ Safe default parameters for all algorithms
- ✅ Educational disclaimers for learning purposes
- ✅ Unicode/plaintext support

## Development

To start the development server:

```bash
npm run dev
```

## Build

To build the project for production:

```bash
npm run build
```

## Preview

To preview the production build locally:

```bash
npm run preview
```

## Testing

The project includes comprehensive test coverage:

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Browser Support & Security

### Required Browser Features
The widget requires browsers with Web Crypto API support for secure password hashing operations:
- **Chrome 60+**
- **Firefox 60+**
- **Safari 12+**
- **Edge 79+**

### Security Features
- All cryptographic operations are performed client-side in your browser
- No passwords or hashes are sent to any server
- Uses WebAssembly libraries for performance-critical operations
- Requires a modern browser for proper security implementation

### Browser Compatibility Check
The application automatically checks for Web Crypto API support and will display a compatibility message if your browser doesn't support the required features.

## Security Considerations

- The widget runs entirely in the browser
- No passwords or hashes are sent to any server
- All cryptographic operations are performed client-side
- Suitable for debugging, development, and educational purposes
- **Not recommended for production use without additional security measures**

## Dependencies

- **React 18.2.0** - UI framework
- **argon2-browser 1.18.0** - Argon2id implementation
- **scrypt-js 3.0.1** - scrypt implementation
- **bcryptjs 2.4.3** - bcrypt implementation
- **crypto-js 4.2.0** - PBKDF2 implementation
- **TypeScript 5.8.3** - Type safety and development experience
- **Vite 7.0.5** - Fast build tool and development server

## Project Structure

```
src/
├── main.tsx                    # React entry point
├── index.css                   # Global styles
├── PasswordHasher.tsx          # Main widget component
├── constants.js                # Algorithm configurations and parameters
├── utils.js                    # Utility functions
├── components/                 # React components
│   ├── TabNavigation.tsx       # Tab navigation component
│   ├── HashGeneration.tsx      # Hash generation interface
│   ├── HashVerification.tsx    # Hash verification interface
│   ├── GenerateButton.tsx      # Generate button component
│   ├── JSONRenderer.tsx        # JSON syntax highlighting
│   └── BrowserCompatibility.tsx # Browser compatibility check
├── services/                   # Business logic services
│   └── hashingService.js       # Password hashing implementations
└── __tests__/                  # Test files
    └── services/               # Service tests

public/
└── index.html                # HTML template

iframe-example.html           # Example iframe integration
```

## Usage Examples

### Hash Generation

1. **Select Algorithm**: Choose from Argon2id, scrypt, bcrypt, or PBKDF2
2. **Enter Password**: Input the plaintext password to hash
3. **Adjust Parameters**: Modify algorithm-specific parameters (optional)
4. **Configure Salt**: Choose auto-generation or provide custom salt
5. **Generate**: Click "Generate Hash" to create the hash
6. **Copy Results**: Use copy buttons to copy salt, raw hash, or encoded hash

### Hash Verification

1. **Paste Hash**: Enter an encoded hash string (supports all formats)
2. **Enter Password**: Input the candidate password to verify
3. **Verify**: Click "Verify Password" to check if password matches hash
4. **View Result**: See clear match/mismatch indication with algorithm detection

## Algorithm Details

### Argon2id
- **Memory-hard function** resistant to ASIC attacks
- **Recommended for new applications**
- Parameters: memory (MiB), iterations, parallelism
- Default: 19 MiB memory, 2 iterations, 1 parallelism

### scrypt
- **Memory-hard key derivation function**
- **Good balance of security and performance**
- Parameters: N (CPU/memory cost), r (block size), p (parallelization)
- Default: N=131072, r=8, p=1

### bcrypt
- **Adaptive hashing function**
- **Widely supported and battle-tested**
- Parameters: cost factor (log2 rounds)
- Default: cost=12 (4096 rounds)

### PBKDF2-HMAC-SHA256
- **Password-based key derivation function**
- **NIST recommended standard**
- Parameters: iterations, salt length, key length
- Default: 600,000 iterations

## Recent Updates

### v1.0.0 - Initial Release
- ✨ **Complete password hashing tool**: Support for Argon2id, scrypt, bcrypt, PBKDF2
- ✨ **Hash generation**: Full parameter control with safety warnings
- ✨ **Hash verification**: Automatic algorithm detection and verification
- ✨ **Modern UI**: Clean, responsive interface matching Authgear design
- ✨ **Comprehensive testing**: Test coverage for all hashing algorithms
- ✨ **TypeScript support**: Full TypeScript implementation
- ✨ **WebAssembly integration**: High-performance cryptographic operations
- 🔒 **Client-side security**: All operations performed in browser