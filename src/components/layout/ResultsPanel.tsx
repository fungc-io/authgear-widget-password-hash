/**
 * Results panel container component
 */

import React from 'react';

interface ResultsPanelProps {
  children: React.ReactNode;
  className?: string;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ children, className = '' }) => {
  return (
    <div className={`results-section ${className}`}>
      {children}
    </div>
  );
};

export default ResultsPanel;
