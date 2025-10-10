/**
 * Supported formats display component
 */

import React from 'react';

interface SupportedFormatsProps {
  showSupportedFormats: boolean;
  onToggleSupportedFormats: () => void;
}

const SupportedFormats: React.FC<SupportedFormatsProps> = ({
  showSupportedFormats,
  onToggleSupportedFormats
}) => {
  return (
    <>
      {/* Supported Formats Info Toggle */}
      <div className="supported-formats-toggle">
        <button
          className={`toggle-btn ${showSupportedFormats ? 'expanded' : ''}`}
          onClick={onToggleSupportedFormats}
          type="button"
        >
          <span className="arrow">▶</span>
          Supported Password Hash Formats
        </button>
      </div>

      {/* Supported Formats - Hidden by Default */}
      {showSupportedFormats && (
        <div className="supported-formats-section">
          <div className="format-examples-compact">
            <div className="format-example-compact">
              <span className="format-name-compact">Argon2id</span>
              <code className="format-code-compact">$argon2id$v=19$m=19456,t=2,p=1$...</code>
            </div>
            <div className="format-example-compact">
              <span className="format-name-compact">scrypt</span>
              <code className="format-code-compact">$scrypt$N=131072,r=8,p=1$...</code>
            </div>
            <div className="format-example-compact">
              <span className="format-name-compact">bcrypt</span>
              <code className="format-code-compact">$2b$12$...</code>
            </div>
            <div className="format-example-compact">
              <span className="format-name-compact">PBKDF2</span>
              <code className="format-code-compact">$pbkdf2-sha256$600000$...</code>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportedFormats;
