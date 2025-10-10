/**
 * Algorithm selector component with parameters
 */

import React from 'react';
import { HASHING_ALGORITHMS } from '../../constants';
import { getParameterDescription } from '../../utils/algorithmUtils';

interface AlgorithmSelectorProps {
  selectedAlgorithm: string;
  onAlgorithmChange: (algorithm: string) => void;
  parameters: Record<string, number>;
  onParameterChange: (paramKey: string, value: number) => void;
  warnings: string[];
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
  parameters,
  onParameterChange,
  warnings
}) => {
  const algorithmConfig = Object.values(HASHING_ALGORITHMS).find(alg => alg.value === selectedAlgorithm);

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onAlgorithmChange(e.target.value);
  };

  const handleParameterChange = (paramKey: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onParameterChange(paramKey, parseInt(e.target.value));
  };

  return (
    <div className="algorithm-config-card">
      {/* Algorithm Selection */}
      <div className="algorithm-selection">
        <label className="algorithm-label">Algorithm</label>
        <select
          className="algorithm-select"
          value={selectedAlgorithm}
          onChange={handleAlgorithmChange}
        >
          {Object.values(HASHING_ALGORITHMS).map(alg => (
            <option key={alg.value} value={alg.value}>
              {alg.label} - {alg.description}
            </option>
          ))}
        </select>
      </div>

      {/* Algorithm Parameters */}
      {algorithmConfig && (
        <div className="algorithm-parameters">
          <label className="parameters-label">Parameters</label>
          <div className="parameters-grid">
            {Object.keys(algorithmConfig.parameters).map(paramKey => {
              // Skip saltLength as it will be handled in SaltConfiguration
              if (paramKey === 'saltLength') return null;
              
              const param = algorithmConfig.parameters[paramKey];
              
              return (
                <div key={paramKey} className="parameter-group">
                  <label className="parameter-label tooltip-label">
                    {param.label}
                    <div className="tooltip">
                      {getParameterDescription(paramKey)}
                    </div>
                  </label>
                  <input
                    type="number"
                    className="parameter-input"
                    value={parameters[paramKey] || param.default}
                    onChange={handleParameterChange(paramKey)}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                  />
                </div>
              );
            }).filter(Boolean)}
          </div>
          {warnings.length > 0 && (
            <div className="parameter-warnings">
              {warnings.map((warning, index) => (
                <div key={index} className="warning-message">
                  ⚠️ {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlgorithmSelector;
