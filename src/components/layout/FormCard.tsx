/**
 * Reusable form card wrapper component
 */

import React from 'react';

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
}

const FormCard: React.FC<FormCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`form-card ${className}`}>
      {children}
    </div>
  );
};

export default FormCard;
