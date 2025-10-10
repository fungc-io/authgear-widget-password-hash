/**
 * Password input component with validation
 */

import React from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  validationError?: string;
  rows?: number;
  disabled?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Enter password...",
  validationError,
  rows = 1,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const inputProps = {
    className: `password-input ${validationError ? 'error' : ''}`,
    value,
    onChange: handleChange,
    placeholder,
    disabled
  };

  return (
    <div className="password-config-card">
      {rows === 1 ? (
        <input type="text" {...inputProps} />
      ) : (
        <textarea rows={rows} {...inputProps} />
      )}
      {validationError && (
        <div className="password-validation-error">
          ⚠️ {validationError}
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
