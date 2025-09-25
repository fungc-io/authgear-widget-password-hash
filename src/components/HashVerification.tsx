import React, { useState, useCallback } from 'react';
import { verifyPassword } from '../services/hashingService';

const HashVerification: React.FC = () => {
  const [encodedHash, setEncodedHash] = useState('');
  const [candidatePassword, setCandidatePassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  // Parse algorithm from encoded hash
  const parseAlgorithm = useCallback((hash) => {
    if (hash.startsWith('$argon2id$')) return 'argon2id';
    if (hash.startsWith('$scrypt$')) return 'scrypt';
    if (hash.startsWith('$2b$') || hash.startsWith('$2a$') || hash.startsWith('$2y$')) return 'bcrypt';
    if (hash.startsWith('$pbkdf2-sha256$')) return 'pbkdf2';
    return null;
  }, []);

  const handleVerify = useCallback(async () => {
    if (!encodedHash.trim()) {
      setError('Please enter an encoded hash');
      return;
    }

    if (!candidatePassword.trim()) {
      setError('Please enter a candidate password');
      return;
    }

    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    try {
      const algorithm = parseAlgorithm(encodedHash);
      if (!algorithm) {
        throw new Error('Unable to determine algorithm from hash format');
      }

      const isValid = await verifyPassword(candidatePassword, encodedHash, algorithm);
      setVerificationResult({
        isValid,
        algorithm,
        message: isValid ? 'Password matches hash' : 'Password does not match hash'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  }, [encodedHash, candidatePassword, parseAlgorithm]);

  return (
    <div className="hash-verification">
      <div className="hash-verification-layout">
        {/* Left column - Input Form */}
        <div className="input-section">
          <div className="form-group">
            <label className="form-label">Encoded Hash</label>
            <textarea
              className="form-input"
              value={encodedHash}
              onChange={(e) => setEncodedHash(e.target.value)}
              placeholder="Paste encoded hash here (e.g., $argon2id$v=19$m=19456,t=2,p=1$...)"
              rows={4}
            />
            <small className="help-text">
              Supports Argon2id, scrypt, bcrypt, and PBKDF2 encoded hashes
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Candidate Password</label>
            <textarea
              className="form-input"
              value={candidatePassword}
              onChange={(e) => setCandidatePassword(e.target.value)}
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

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {/* Middle column - Results */}
        <div className="results-section">
          {isVerifying ? (
            <div className="results-loading">
              <h3>Verifying Password...</h3>
              <div className="loading-spinner"></div>
              <p>Please wait while we verify your password.</p>
            </div>
          ) : verificationResult ? (
            <>
              <h3>Verification Result</h3>
              
              <div className={`verification-status ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
                <div className="status-indicator">
                  {verificationResult.isValid ? (
                    <>
                      <span className="status-icon">✅</span>
                      <span className="status-text">MATCH</span>
                    </>
                  ) : (
                    <>
                      <span className="status-icon">❌</span>
                      <span className="status-text">NO MATCH</span>
                    </>
                  )}
                </div>
                <div className="status-message">
                  {verificationResult.message}
                </div>
              </div>

              <div className="verification-details">
                <div className="detail-item">
                  <label>Algorithm Detected:</label>
                  <span className="algorithm-name">{verificationResult.algorithm.toUpperCase()}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="results-placeholder">
              <h3>Verification Results</h3>
              <p>Enter an encoded hash and candidate password to see the verification results here.</p>
            </div>
          )}
        </div>

        {/* Right column - Supported Formats */}
        <div className="formats-section">
          <h4>Supported Hash Formats</h4>
          <div className="format-examples">
            <div className="format-card">
              <div className="format-header">
                <span className="format-icon">🔐</span>
                <span className="format-name">Argon2id</span>
              </div>
              <div className="format-code">
                <code>$argon2id$v=19$m=19456,t=2,p=1$...</code>
              </div>
            </div>
            
            <div className="format-card">
              <div className="format-header">
                <span className="format-icon">🛡️</span>
                <span className="format-name">scrypt</span>
              </div>
              <div className="format-code">
                <code>$scrypt$N=131072,r=8,p=1$...</code>
              </div>
            </div>
            
            <div className="format-card">
              <div className="format-header">
                <span className="format-icon">🔑</span>
                <span className="format-name">bcrypt</span>
              </div>
              <div className="format-code">
                <code>$2b$12$...</code>
              </div>
            </div>
            
            <div className="format-card">
              <div className="format-header">
                <span className="format-icon">⚡</span>
                <span className="format-name">PBKDF2</span>
              </div>
              <div className="format-code">
                <code>$pbkdf2-sha256$600000$...</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashVerification;
