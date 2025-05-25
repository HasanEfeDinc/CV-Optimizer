import React, { Suspense } from 'react'; // Import Suspense
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n'; // Import the i18n configuration

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap App with Suspense for loading translations */}
    <Suspense fallback="Loading..."> 
      <App />
    </Suspense>
  </React.StrictMode>
);
