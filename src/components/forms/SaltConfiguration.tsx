/**
 * Salt configuration component
 */

import React from 'react';
import { SALT_ENCODING_OPTIONS } from '../../constants';
import { supportsSaltFormat } from '../../utils/algorithmUtils';

interface SaltConfigurationProps {
  saltInput: string;
  saltEncoding: string;
  saltByteLength: number;
  validationError: string;
  selectedAlgorithm: string;
  onSaltChange: (value: string) => void;
  onSaltEncodingChange: (encoding: string) => void;
  onGenerateSalt: () => void;
}

const SaltConfiguration: React.FC<SaltConfigurationProps> = ({
  saltInput,
  saltEncoding,
  saltByteLength,
  validationError,
  selectedAlgorithm,
  onSaltChange,
  onSaltEncodingChange,
  onGenerateSalt
}) => {
  const handleSaltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSaltChange(e.target.value);
  };

  const handleSaltEncodingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSaltEncodingChange(e.target.value);
  };

  const showSaltFormat = supportsSaltFormat(selectedAlgorithm);

  return (
    <div className="salt-config-card">
      {/* Salt Value Input - Primary Display */}
      <div className="salt-value-section">
        <label className="salt-value-label">Salt Value</label>
        <div className="salt-value-container">
          <input
            type="text"
            className={`salt-value-input ${validationError ? 'error' : ''}`}
            value={saltInput}
            onChange={handleSaltChange}
            placeholder="Enter salt value or generate one..."
          />
          <div className="salt-value-info">
            <span className="salt-length-display">
              {saltInput ? `${saltByteLength} bytes` : '0 bytes'}
            </span>
          </div>
        </div>
        {validationError && (
          <div className="salt-validation-error">
            ⚠️ {validationError}
          </div>
        )}
      </div>

      {/* Salt Generation Controls - Compact Inline Row */}
      <div className="salt-controls-inline">
        <div className="salt-control-item">
          <label className="salt-control-label-inline">Length (bytes)</label>
          <input
            type="number"
            className="salt-length-input-inline"
            value={16}
            min={8}
            max={64}
            step={1}
            disabled
          />
        </div>

        {showSaltFormat && (
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
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="salt-control-item">
          <button
            type="button"
            className="salt-generate-btn-inline"
            onClick={onGenerateSalt}
          >
            Generate New Salt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaltConfiguration;
