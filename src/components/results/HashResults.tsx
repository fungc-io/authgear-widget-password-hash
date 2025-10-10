/**
 * Hash results display component
 */

import React from 'react';
import { useClipboard } from '../../utils';
import { showsExecutionTimeHint } from '../../utils/algorithmUtils';

interface HashResultsProps {
  result: any;
  selectedAlgorithm: string;
  saltEncoding: string;
  hashEncoding: string;
  showAdditionalInfo: boolean;
  onToggleAdditionalInfo: () => void;
}

const HashResults: React.FC<HashResultsProps> = ({
  result,
  selectedAlgorithm,
  saltEncoding,
  hashEncoding,
  showAdditionalInfo,
  onToggleAdditionalInfo
}) => {
  const [copiedSalt, copySalt] = useClipboard();
  const [copiedHash, copyHash] = useClipboard();
  const [copiedEncodedHash, copyEncodedHash] = useClipboard();

  if (!result) {
    return (
      <div className="results-placeholder">
        <h3>Password Hash Results</h3>
        <p>Enter a password and click "Generate Password Hash" to see the results here.</p>
      </div>
    );
  }

  return (
    <>
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
          <code className="result-code-secondary">{result.algorithm.toUpperCase()}</code>
        </div>
      </div>
      
      {/* Execution Time */}
      <div className="result-item result-item-tertiary">
        <label className="result-label-tertiary">Execution Time</label>
        <div className="result-content result-content-tertiary">
          <code className="result-code-tertiary">{result.executionTime}ms</code>
          {showsExecutionTimeHint(selectedAlgorithm) && (
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
          onClick={onToggleAdditionalInfo}
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
  );
};

export default HashResults;
