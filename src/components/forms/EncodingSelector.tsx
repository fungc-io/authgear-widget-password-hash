/**
 * Encoding selector component
 */

import React from 'react';
import { HASH_ENCODING_OPTIONS } from '../../constants';
import { supportsOutputEncoding } from '../../utils/algorithmUtils';

interface EncodingSelectorProps {
  selectedAlgorithm: string;
  hashEncoding: string;
  onHashEncodingChange: (encoding: string) => void;
}

const EncodingSelector: React.FC<EncodingSelectorProps> = ({
  selectedAlgorithm,
  hashEncoding,
  onHashEncodingChange
}) => {
  const showOutputEncoding = supportsOutputEncoding(selectedAlgorithm);

  if (!showOutputEncoding) {
    return null;
  }

  const handleHashEncodingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onHashEncodingChange(e.target.value);
  };

  return (
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
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default EncodingSelector;
