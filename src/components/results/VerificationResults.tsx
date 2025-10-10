/**
 * Verification results display component
 */

import React from 'react';

interface VerificationResultsProps {
  isVerifying: boolean;
  verificationResult: any;
}

const VerificationResults: React.FC<VerificationResultsProps> = ({
  isVerifying,
  verificationResult
}) => {
  if (isVerifying) {
    return (
      <div className="results-loading">
        <h3>Verifying Password...</h3>
        <div className="loading-spinner"></div>
        <p>Please wait while we verify your password.</p>
      </div>
    );
  }

  if (!verificationResult) {
    return (
      <div className="results-placeholder">
        <h3>Verification Results</h3>
        <p>Enter an encoded password hash and candidate password to see the verification results here.</p>
      </div>
    );
  }

  return (
    <>
      <h3>Verification Result</h3>
      
      {/* Primary - Verification Status */}
      <div className={`result-item result-item-primary ${verificationResult.isValid ? 'verification-success' : 'verification-failure'}`}>
        <div className="verification-status-content">
          <div className="verification-icon">
            {verificationResult.isValid ? (
              <span className="success-icon">✓</span>
            ) : (
              <span className="failure-icon">✗</span>
            )}
          </div>
          <div className="verification-details">
            <div className="verification-title">
              {verificationResult.isValid ? 'Password Verified' : 'Verification Failed'}
            </div>
            <div className="verification-message">
              {verificationResult.message}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary - Algorithm */}
      <div className="result-item result-item-secondary">
        <label className="result-label-secondary">Algorithm Detected</label>
        <div className="result-content result-content-secondary">
          <code className="result-code-secondary">{verificationResult.algorithm.toUpperCase()}</code>
        </div>
      </div>
    </>
  );
};

export default VerificationResults;
