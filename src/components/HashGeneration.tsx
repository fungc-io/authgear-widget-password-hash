import React, { useState, useCallback, useMemo } from 'react';
import { HASHING_ALGORITHMS, PARAMETER_WARNINGS, SALT_ENCODING_OPTIONS, HASH_ENCODING_OPTIONS } from '../constants';
import { hashArgon2id, hashScrypt, hashBcrypt, hashPBKDF2, generateSalt, generateAlgorithmSalt } from '../services/hashingService';
import { useClipboard } from '../utils';

interface HashGenerationProps {
  selectedAlgorithm: string;
  setSelectedAlgorithm: (alg: string) => void;
}

const HashGeneration: React.FC<HashGenerationProps> = ({ selectedAlgorithm, setSelectedAlgorithm }) => {
  const [password, setPassword] = useState('');
  const [parameters, setParameters] = useState({});
  const [saltInput, setSaltInput] = useState('');
  const [saltEncoding, setSaltEncoding] = useState('hex');
  const [hashEncoding, setHashEncoding] = useState('hex');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    password: '',
    salt: ''
  });
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  // Calculate salt byte length based on encoding
  const calculateSaltByteLength = (salt: string, encoding: string): number => {
    if (!salt) return 0;
    
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

  const [copiedSalt, copySalt] = useClipboard();
  const [copiedHash, copyHash] = useClipboard();
  const [copiedEncodedHash, copyEncodedHash] = useClipboard();

  // Get current algorithm configuration
  const algorithmConfig = useMemo(() => {
    return Object.values(HASHING_ALGORITHMS).find(alg => alg.value === selectedAlgorithm);
  }, [selectedAlgorithm]);

  // Initialize parameters when algorithm changes
  React.useEffect(() => {
    if (algorithmConfig) {
      const initialParams = {};
      Object.keys(algorithmConfig.parameters).forEach(key => {
        initialParams[key] = algorithmConfig.parameters[key].default;
      });
      setParameters(initialParams);
    }
  }, [algorithmConfig]);

  // Generate initial salt on component mount
  React.useEffect(() => {
    const generateInitialSalt = async () => {
      try {
        const initialSalt = await generateAlgorithmSalt(selectedAlgorithm, parameters, saltEncoding);
        setSaltInput(initialSalt);
      } catch (error) {
        console.error('Error generating initial salt:', error);
        // Fallback to default salt based on algorithm
        const fallbackSalts = {
          bcrypt: '$2a$10$N9qo8uLOickgx2ZMRZoMye',
          pbkdf2: '778e2617f07e1a6288f448d9b6cad1ce',
          argon2id: '778e2617f07e1a6288f448d9b6cad1ce',
          scrypt: '778e2617f07e1a6288f448d9b6cad1ce'
        };
        setSaltInput(fallbackSalts[selectedAlgorithm] || '778e2617f07e1a6288f448d9b6cad1ce');
      }
    };
    
    generateInitialSalt();
  }, [selectedAlgorithm, saltEncoding]); // Removed parameters to prevent infinite loop

  // Check for parameter warnings
  const warnings = useMemo(() => {
    if (!algorithmConfig) return [];
    const algorithmWarnings = PARAMETER_WARNINGS[selectedAlgorithm];
    if (!algorithmWarnings) return [];

    return Object.keys(algorithmWarnings).map(paramKey => {
      const warning = algorithmWarnings[paramKey];
      const currentValue = parameters[paramKey];
      if (currentValue < warning.threshold) {
        return warning.message;
      }
      return null;
    }).filter(Boolean);
  }, [selectedAlgorithm, parameters]);

  const handleParameterChange = useCallback((paramKey, value) => {
    setParameters(prev => ({
      ...prev,
      [paramKey]: value
    }));
    setResult(null); // Clear results when parameters change
  }, []);

  const validateField = useCallback((field, value) => {
    if (field === 'password') {
      return value.trim() ? '' : 'Please enter a plaintext password';
    }
    if (field === 'salt') {
      return value.trim() ? '' : 'Please enter a salt or generate one';
    }
    return '';
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const value = e.target.value;
    setPassword(value);
    setResult(null); // Clear results when password changes
    if (hasAttemptedSubmit) {
      setValidationErrors(prev => ({
        ...prev,
        password: validateField('password', value)
      }));
    }
  }, [validateField, hasAttemptedSubmit]);

  const handleSaltChange = useCallback((e) => {
    const value = e.target.value;
    setSaltInput(value);
    setResult(null); // Clear results when salt changes
    if (hasAttemptedSubmit) {
      setValidationErrors(prev => ({
        ...prev,
        salt: validateField('salt', value)
      }));
    }
  }, [validateField, hasAttemptedSubmit]);

  const handleGenerateSalt = useCallback(async () => {
    try {
      const newSalt = await generateAlgorithmSalt(selectedAlgorithm, parameters, saltEncoding);
      setSaltInput(newSalt);
      setResult(null); // Clear results when salt is regenerated
      if (hasAttemptedSubmit) {
        setValidationErrors(prev => ({
          ...prev,
          salt: validateField('salt', newSalt)
        }));
      }
    } catch (error) {
      console.error('Error generating salt:', error);
    }
  }, [selectedAlgorithm, parameters, saltEncoding, validateField, hasAttemptedSubmit]);

  const handleAlgorithmChange = useCallback((e) => {
    setSelectedAlgorithm(e.target.value);
    setResult(null); // Clear results when algorithm changes
  }, []);

  const handleSaltEncodingChange = useCallback((e) => {
    setSaltEncoding(e.target.value);
    setResult(null); // Clear results when salt encoding changes
  }, []);

  const handleHashEncodingChange = useCallback((e) => {
    setHashEncoding(e.target.value);
    setResult(null); // Clear results when hash encoding changes
  }, []);

  const handleGenerate = useCallback(async () => {
    // Mark that user has attempted to submit
    setHasAttemptedSubmit(true);
    
    // Validate all fields
    const passwordError = validateField('password', password);
    const saltError = validateField('salt', saltInput);
    
    if (passwordError || saltError) {
      setValidationErrors({
        password: passwordError,
        salt: saltError
      });
      setError('Please fix the validation errors above');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      let hashResult;
      const options = {
        ...parameters,
        saltEncoding,
        hashEncoding,
        salt: saltInput
      };

      switch (selectedAlgorithm) {
        case 'argon2id':
          hashResult = await hashArgon2id(password, options);
          break;
        case 'scrypt':
          hashResult = await hashScrypt(password, options);
          break;
        case 'bcrypt':
          hashResult = await hashBcrypt(password, options);
          break;
        case 'pbkdf2':
          hashResult = await hashPBKDF2(password, options);
          break;
        default:
          throw new Error('Unsupported algorithm');
      }

      setResult(hashResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }, [password, parameters, saltEncoding, hashEncoding, saltInput, selectedAlgorithm, validateField]);

  return (
    <div className="hash-generation">
      <div className="hash-generation-layout">
        {/* Left side - Input Form */}
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Plaintext Password</label>
            <div className="password-config-card">
              <input
                type="text"
                className={`password-input ${validationErrors.password ? 'error' : ''}`}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter password to hash..."
              />
              {validationErrors.password && (
                <div className="password-validation-error">
                  ⚠️ {validationErrors.password}
                </div>
              )}
            </div>
          </div>

          {/* Algorithm Configuration */}
          <div className="form-group">
            <label className="form-label">Algorithm Configuration</label>
            <div className="algorithm-config-card">
              {/* Algorithm Selection */}
              <div className="algorithm-selection">
                <label className="algorithm-label">Algorithm</label>
                <select
                  className="algorithm-select"
                  value={selectedAlgorithm}
                  onChange={handleAlgorithmChange}
                >
                  {Object.values(HASHING_ALGORITHMS).map(alg => (
                    <option key={alg.value} value={alg.value}>
                      {alg.label} - {alg.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Algorithm Parameters */}
              {algorithmConfig && (
                <div className="algorithm-parameters">
                  <label className="parameters-label">Parameters</label>
                  <div className="parameters-grid">
                    {Object.keys(algorithmConfig.parameters).map(paramKey => {
                      // Skip saltLength as it will be moved to Salt Configuration section
                      if (paramKey === 'saltLength') return null;
                      
                      const param = algorithmConfig.parameters[paramKey];
                      const getParameterDescription = (key) => {
                        const descriptions = {
                          memory: 'Memory usage in MiB. Higher = more secure but slower.',
                          iterations: 'Number of iterations. Higher = more secure but slower.',
                          parallelism: 'Number of parallel threads. Usually 4 for optimal performance.',
                          saltLength: 'Salt length in bytes. 16 bytes (128-bit) is recommended.',
                          keyLength: 'Hash output length in bytes. 32 bytes (256-bit) is recommended.',
                          N: 'CPU/Memory cost factor. Must be power of 2.',
                          r: 'Block size parameter. Higher = more memory usage.',
                          p: 'Parallelization parameter. Usually 1.',
                          cost: 'Cost factor (2^cost rounds). Higher = more secure but slower.'
                        };
                        return descriptions[key] || '';
                      };
                      
                      return (
                        <div key={paramKey} className="parameter-group">
                          <label className="parameter-label tooltip-label">
                            {param.label}
                            <div className="tooltip">
                              {getParameterDescription(paramKey)}
                            </div>
                          </label>
                          <input
                            type="number"
                            className="parameter-input"
                            value={parameters[paramKey] || param.default}
                            onChange={(e) => handleParameterChange(paramKey, parseInt(e.target.value))}
                            min={param.min}
                            max={param.max}
                            step={param.step}
                          />
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                  {warnings.length > 0 && (
                    <div className="parameter-warnings">
                      {warnings.map((warning, index) => (
                        <div key={index} className="warning-message">
                          ⚠️ {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Salt Configuration */}
          <div className="form-group">
            <label className="form-label">Salt Configuration</label>
            <div className="salt-config-card">
              {/* Salt Value Input - Primary Display */}
              <div className="salt-value-section">
                <label className="salt-value-label">Salt Value</label>
                <div className="salt-value-container">
                  <input
                    type="text"
                    className={`salt-value-input ${validationErrors.salt ? 'error' : ''}`}
                    value={saltInput}
                    onChange={handleSaltChange}
                    placeholder="Enter salt value or generate one..."
                  />
                  <div className="salt-value-info">
                    <span className="salt-length-display">
                      {saltInput ? `${calculateSaltByteLength(saltInput, saltEncoding)} bytes` : '0 bytes'}
                    </span>
                  </div>
                </div>
                {validationErrors.salt && (
                  <div className="salt-validation-error">
                    ⚠️ {validationErrors.salt}
                  </div>
                )}
              </div>

              {/* Salt Generation Controls - Compact Inline Row */}
              {algorithmConfig && (algorithmConfig.parameters.saltLength || selectedAlgorithm === 'bcrypt') && (
                <div className="salt-controls-inline">
                  {selectedAlgorithm !== 'bcrypt' && (
                    <div className="salt-control-item">
                      <label className="salt-control-label-inline">Length (bytes)</label>
                      <input
                        type="number"
                        className="salt-length-input-inline"
                        value={parameters.saltLength || algorithmConfig.parameters.saltLength.default}
                        onChange={(e) => handleParameterChange('saltLength', parseInt(e.target.value))}
                        min={algorithmConfig.parameters.saltLength.min}
                        max={algorithmConfig.parameters.saltLength.max}
                        step={algorithmConfig.parameters.saltLength.step}
                        title="Salt length in bytes. 16 bytes (128-bit) is recommended."
                      />
                    </div>
                  )}
                  
                  {selectedAlgorithm !== 'argon2id' && selectedAlgorithm !== 'bcrypt' && (
                    <div className="salt-control-item">
                      <label className="salt-control-label-inline">Format</label>
                      <div className="salt-format-radio-group-inline">
                        {SALT_ENCODING_OPTIONS.map(option => (
                          <label key={option.value} className="salt-format-radio-option-inline">
                            <input
                              type="radio"
                              name="saltEncoding"
                              value={option.value}
                              checked={saltEncoding === option.value}
                              onChange={handleSaltEncodingChange}
                              className="salt-format-radio-input"
                            />
                            <span className="salt-format-radio-label">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    className="salt-generate-btn-inline"
                    onClick={handleGenerateSalt}
                    type="button"
                  >
                    Generate New Salt
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Output Encoding - Hide for bcrypt and PBKDF2 */}
          {selectedAlgorithm !== 'bcrypt' && selectedAlgorithm !== 'pbkdf2' && (
            <div className="form-group">
              <label className="form-label">Output Encoding</label>
              <div className="encoding-radio-group">
                {HASH_ENCODING_OPTIONS.map(option => (
                  <label key={option.value} className="encoding-radio-option">
                    <input
                      type="radio"
                      name="hashEncoding"
                      value={option.value}
                      checked={hashEncoding === option.value}
                      onChange={handleHashEncodingChange}
                      className="encoding-radio-input"
                    />
                    <span className="encoding-radio-label">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Password Hash'}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {/* Right side - Results */}
        <div className="results-section">
          {isGenerating ? (
            <div className="results-loading">
              <h3>Generating Password Hash...</h3>
              <div className="loading-spinner"></div>
              <p>Please wait while we generate your password hash.</p>
            </div>
          ) : result ? (
            <>
              <h3>Password Hash Results</h3>
              
              {/* Primary - Encoded Hash */}
              <div className="result-item result-item-primary">
                <div className="result-header">
                  <label className="result-label-primary">Encoded Hash</label>
                  <button
                    className="copy-btn copy-btn-primary"
                    onClick={() => copyEncodedHash(result.encodedHash)}
                    disabled={copiedEncodedHash}
                  >
                    {copiedEncodedHash ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="result-content result-content-primary">
                  <code className="result-code-primary">{result.encodedHash}</code>
                </div>
              </div>

              {/* Secondary - Algorithm */}
              <div className="result-item result-item-secondary">
                <label className="result-label-secondary">Algorithm</label>
                <div className="result-content result-content-secondary">
                  <code className="result-code-secondary">{algorithmConfig?.label || selectedAlgorithm}</code>
                </div>
              </div>

              {/* Execution Time */}
              <div className="result-item result-item-tertiary">
                <label className="result-label-tertiary">Execution Time</label>
                <div className="result-content result-content-tertiary">
                  <code className="result-code-tertiary">{result.executionTime}ms</code>
                  {selectedAlgorithm === 'argon2id' && (
                    <div className="execution-time-hint">
                      💡 Try adjusting the parameters to make the time around 500ms
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info Toggle */}
              <div className="additional-info-toggle">
                <button
                  className={`toggle-btn ${showAdditionalInfo ? 'expanded' : ''}`}
                  onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                  type="button"
                >
                  <span className="arrow">▶</span>
                  Additional Info
                </button>
              </div>

              {/* Additional Info - Hidden by Default */}
              {showAdditionalInfo && (
                <div className="additional-info-section">
                  <div className="result-item result-item-tertiary">
                    <div className="result-header">
                      <label className="result-label-tertiary">Salt ({saltEncoding.toUpperCase()})</label>
                      <button
                        className="copy-btn copy-btn-tertiary"
                        onClick={() => copySalt(result.salt)}
                        disabled={copiedSalt}
                      >
                        {copiedSalt ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="result-content result-content-tertiary">
                      <code className="result-code-tertiary">{result.salt}</code>
                    </div>
                  </div>

                  {selectedAlgorithm !== 'bcrypt' && (
                    <div className="result-item result-item-tertiary">
                      <div className="result-header">
                        <label className="result-label-tertiary">Raw Hash ({hashEncoding.toUpperCase()})</label>
                        <button
                          className="copy-btn copy-btn-tertiary"
                          onClick={() => copyHash(result.hash)}
                          disabled={copiedHash}
                        >
                          {copiedHash ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="result-content result-content-tertiary">
                        <code className="result-code-tertiary">{result.hash}</code>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="results-placeholder">
              <h3>Password Hash Results</h3>
              <p>Enter a password and click "Generate Password Hash" to see the results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HashGeneration;
