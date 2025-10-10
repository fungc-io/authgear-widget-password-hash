/**
 * Refactored HashVerification component using custom hooks and smaller components
 */

import React from 'react';
import { useHashVerification } from '../hooks/useHashVerification';
import PasswordInput from './forms/PasswordInput';
import VerificationResults from './results/VerificationResults';
import SupportedFormats from './results/SupportedFormats';
import ResultsPanel from './layout/ResultsPanel';

const HashVerification: React.FC = () => {
  const {
    encodedHash,
    candidatePassword,
    isVerifying,
    verificationResult,
    error,
    showSupportedFormats,
    handleEncodedHashChange,
    handleCandidatePasswordChange,
    handleVerify,
    setShowSupportedFormats
  } = useHashVerification();

  return (
    <div className="hash-verification">
      <div className="hash-verification-layout">
        {/* Left column - Input Form */}
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Encoded Password Hash</label>
            <PasswordInput
              value={encodedHash}
              onChange={handleEncodedHashChange}
              placeholder="Paste encoded password hash here (e.g., $argon2id$v=19$m=19456,t=2,p=1$...)"
              validationError={error}
              rows={4}
            />
            <small className="help-text">
              Supports Argon2id, scrypt, bcrypt, and PBKDF2 encoded password hashes
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Candidate Password</label>
            <PasswordInput
              value={candidatePassword}
              onChange={handleCandidatePasswordChange}
              placeholder="Enter password to verify..."
              rows={3}
            />
          </div>

          <button
            className="btn verify-btn"
            onClick={handleVerify}
            disabled={isVerifying || !encodedHash.trim() || !candidatePassword.trim()}
          >
            {isVerifying ? 'Verifying...' : 'Verify Password'}
          </button>

          <SupportedFormats
            showSupportedFormats={showSupportedFormats}
            onToggleSupportedFormats={() => setShowSupportedFormats(!showSupportedFormats)}
          />
        </div>

        {/* Right column - Results */}
        <ResultsPanel>
          <VerificationResults
            isVerifying={isVerifying}
            verificationResult={verificationResult}
          />
        </ResultsPanel>
      </div>
    </div>
  );
};

export default HashVerification;
