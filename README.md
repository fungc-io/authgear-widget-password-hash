# Authgear Password Hash Widget

A React-based password hashing tool for generating and verifying password hashes using Argon2id, scrypt, bcrypt, and PBKDF2 algorithms.

## 🌐 Live Demo

**[Try it online](https://www.authgear.com/auth-tools)**

## Features

- **Hash Generation**: Support for Argon2id, scrypt, bcrypt, PBKDF2
- **Hash Verification**: Automatic algorithm detection and verification
- **Parameter Control**: Adjustable algorithm parameters with security warnings
- **Salt Management**: Auto-generation or custom salt input
- **Copy to Clipboard**: Easy copying of hashes and salts
- **Modern UI**: Clean, responsive interface

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## Security

- All operations performed client-side in browser
- No passwords or hashes sent to servers
- Requires modern browser with Web Crypto API support

## Architecture

Refactored into modular components:
- **Hooks**: Custom hooks for state management
- **Components**: Reusable form and results components  
- **Utils**: Validation and algorithm utilities
- **Services**: Hashing implementations

Built with React, TypeScript, and Vite.