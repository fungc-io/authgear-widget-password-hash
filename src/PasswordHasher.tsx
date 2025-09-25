import React, { useState, useCallback } from 'react';
import type { JSX } from 'react';
import { SUPPORTED_ALGORITHMS } from './constants';
import TabNavigation from './components/TabNavigation';
import HashGeneration from './components/HashGeneration';
import HashVerification from './components/HashVerification';

function PasswordHasher() {
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('argon2id');

  return (
    <div className="password-hasher">
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedAlgorithm={selectedAlgorithm}
        setSelectedAlgorithm={setSelectedAlgorithm}
      />

      <div className="tab-content">
        <div style={{ display: activeTab === 'generate' ? 'block' : 'none' }}>
          <HashGeneration
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
          />
        </div>
        <div style={{ display: activeTab === 'verify' ? 'block' : 'none' }}>
          <HashVerification />
        </div>
      </div>
    </div>
  );
}

export default PasswordHasher;
