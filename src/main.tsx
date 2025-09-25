import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PasswordHasher from './PasswordHasher';
import BrowserCompatibility from './components/BrowserCompatibility';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  (
    <BrowserCompatibility>
      <PasswordHasher />
    </BrowserCompatibility>
  ) as React.ReactElement
); 