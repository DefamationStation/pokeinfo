import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Remove StrictMode to prevent double rendering in development
// This reduces performance overhead but should be re-enabled before production
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);