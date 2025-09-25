import React, { useState, useEffect } from 'react';
import { SUPPORTED_ALGORITHMS } from '../constants';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAlgorithm: string;
  setSelectedAlgorithm: (alg: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  setActiveTab,
  selectedAlgorithm,
  setSelectedAlgorithm
}) => {
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if the page is running in an iframe
    const checkIfInIframe = () => {
      try {
        return window.self !== window.top;
      } catch (e) {
        // If we can't access window.top due to cross-origin restrictions,
        // it means we're in an iframe
        return true;
      }
    };
    
    setIsInIframe(checkIfInIframe());
  }, []);

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="header-section">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          Hash Generation
        </button>
        <button 
          className={`tab ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('verify')}
        >
          Hash Verification
        </button>
      </div>
      {!isInIframe && (
        <div className="authgear-logo-section">
          <span className="powered-by-text">Presented by</span>
          <img 
            src="./authgear-logo.svg" 
            alt="Authgear Logo" 
            className="authgear-logo"
          />
        </div>
      )}
    </div>
  );
};

export default TabNavigation; 