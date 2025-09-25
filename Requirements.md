# Product Requirement – Password Hashing Mini Tool

## Goal
A small developer tool to **learn and test password hashing**.  
Users can:

- Enter a plaintext string.  
- Choose a hashing algorithm.  
- Adjust parameters (with safe defaults).  
- Add or auto-generate a salt.  
- Generate the hash and see the result.  
- Verify if a plaintext matches a given encoded hash.  

## Supported Algorithms & Defaults
- **Argon2id**  
  - Parameters: memory (MiB), iterations, parallelism, salt length, key length.  
  - Default: memory = 19 MiB, iterations = 2, parallelism = 1.  

- **scrypt**  
  - Parameters: N, r, p, salt length, key length.  
  - Default: N = 2^17, r = 8, p = 1.  

- **bcrypt**  
  - Parameters: cost.  
  - Default: cost = 12.  
  - Note: max input length = 72 bytes.  

- **PBKDF2-HMAC-SHA256**  
  - Parameters: iterations, salt length, key length.  
  - Default: iterations = 600,000.  

## Features

### 1. Hash Generation
- Input field for plaintext.  
- Option to provide salt (hex/base64) or auto-generate.  
- Algorithm selector + parameter inputs.  
- On compute:  
  - Show salt (hex/base64).  
  - Show raw hash (hex/base64).  
  - Show encoded hash string (standard format if available).  
  - Show execution time in ms.  
- Copy-to-clipboard button.

### 2. Verification
- Input field for encoded hash string.  
- Tool parses algorithm, salt, parameters.  
- User enters candidate plaintext.  
- Click **Verify** → show Match / Mismatch.  

### 3. Presets & Guidance
- Recommended defaults preloaded.  
- Tooltips explaining parameters.  
- Warnings for unsafe settings (too few iterations, too small salt, etc).  
- Small disclaimers: “For learning only, not production use.”

## Nonfunctional
- All hashing runs locally (WebAssembly/JS libs).  
- Responsive, developer-focused UI (monospace font for outputs).  
- Cancel/timeout for heavy runs.  
- Unicode/plaintext support.  
- Clear error messages for invalid inputs.  
