/**
 * Refactored HashGeneration component using custom hooks and smaller components
 */

import React, { useState } from 'react';
import { useHashGeneration } from '../hooks/useHashGeneration';
import { useSaltManagement } from '../hooks/useSaltManagement';
import { useAlgorithmConfig } from '../hooks/useAlgorithmConfig';
import PasswordInput from './forms/PasswordInput';
import AlgorithmSelector from './forms/AlgorithmSelector';
import SaltConfiguration from './forms/SaltConfiguration';
import EncodingSelector from './forms/EncodingSelector';
import HashResults from './results/HashResults';
import ResultsPanel from './layout/ResultsPanel';

interface HashGenerationProps {
  selectedAlgorithm: string;
  setSelectedAlgorithm: (alg: string) => void;
}

const HashGeneration: React.FC<HashGenerationProps> = ({ selectedAlgorithm, setSelectedAlgorithm }) => {
  const [saltEncoding, setSaltEncoding] = useState('hex');
  const [hashEncoding, setHashEncoding] = useState('hex');

  // Custom hooks
  const { algorithmConfig, parameters, warnings, handleParameterChange } = useAlgorithmConfig(selectedAlgorithm);
  const { 
    saltInput, 
    saltByteLength, 
    validationError: saltValidationError, 
    handleSaltChange, 
    handleGenerateSalt,
    validateSaltInput 
  } = useSaltManagement({ selectedAlgorithm, parameters, saltEncoding });
  
  const {
    password,
    isGenerating,
    result,
    error,
    validationErrors,
    hasAttemptedSubmit,
    showAdditionalInfo,
    handlePasswordChange,
    handleSaltChange: handleSaltChangeFromHook,
    handleGenerate,
    setShowAdditionalInfo,
    setResult
  } = useHashGeneration({
    selectedAlgorithm,
    parameters,
    saltInput,
    saltEncoding,
    hashEncoding
  });

  // Handle salt change from both hooks
  const handleSaltChangeCombined = (value: string) => {
    handleSaltChange(value);
    handleSaltChangeFromHook(value);
  };

  // Handle algorithm change
  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
    setResult(null); // Clear results when algorithm changes
  };

  // Handle salt encoding change
  const handleSaltEncodingChange = (encoding: string) => {
    setSaltEncoding(encoding);
    setResult(null); // Clear results when encoding changes
  };

  // Handle hash encoding change
  const handleHashEncodingChange = (encoding: string) => {
    setHashEncoding(encoding);
    setResult(null); // Clear results when encoding changes
  };

  return (
    <div className="hash-generation">
      <div className="hash-generation-layout">
        {/* Left side - Input Form */}
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Plaintext Password</label>
            <PasswordInput
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter password to hash..."
              validationError={validationErrors.password}
            />
          </div>

          {/* Algorithm Configuration */}
          <div className="form-group">
            <label className="form-label">Algorithm Configuration</label>
            <AlgorithmSelector
              selectedAlgorithm={selectedAlgorithm}
              onAlgorithmChange={handleAlgorithmChange}
              parameters={parameters}
              onParameterChange={handleParameterChange}
              warnings={warnings}
            />
          </div>

          {/* Salt Configuration */}
          <div className="form-group">
            <label className="form-label">Salt Configuration</label>
            <SaltConfiguration
              saltInput={saltInput}
              saltEncoding={saltEncoding}
              saltByteLength={saltByteLength}
              validationError={validationErrors.salt}
              selectedAlgorithm={selectedAlgorithm}
              onSaltChange={handleSaltChangeCombined}
              onSaltEncodingChange={handleSaltEncodingChange}
              onGenerateSalt={handleGenerateSalt}
            />
          </div>

          {/* Output Encoding */}
          <EncodingSelector
            selectedAlgorithm={selectedAlgorithm}
            hashEncoding={hashEncoding}
            onHashEncodingChange={handleHashEncodingChange}
          />

          {/* Generate Button */}
          <button
            className="btn generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !password.trim() || !saltInput.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate Password Hash'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {/* Right side - Results */}
        <ResultsPanel>
          <HashResults
            result={result}
            selectedAlgorithm={selectedAlgorithm}
            saltEncoding={saltEncoding}
            hashEncoding={hashEncoding}
            showAdditionalInfo={showAdditionalInfo}
            onToggleAdditionalInfo={() => setShowAdditionalInfo(!showAdditionalInfo)}
          />
        </ResultsPanel>
      </div>
    </div>
  );
};

export default HashGeneration;
