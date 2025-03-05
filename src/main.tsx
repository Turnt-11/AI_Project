// Polyfill to make wheel events passive by default
if (typeof window !== 'undefined') {
  // Supportspassive is used to detect if the browser supports passive event listeners
  let supportsPassive = false;
  try {
    // Test via a getter in the options object to see if the passive property is accessed
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    // Use a throw-away event listener to test for passive support
    window.addEventListener('testPassive', null as any, opts);
    window.removeEventListener('testPassive', null as any, opts);
  } catch (e) {
    // If it fails, passive is not supported
  }

  // If passive is supported, override addEventListener to make wheel events passive by default
  if (supportsPassive) {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'wheel' || type === 'mousewheel' || type === 'touchstart' || type === 'touchmove') {
        if (typeof options === 'object') {
          options = { ...options, passive: true };
        } else {
          options = { passive: true };
        }
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AudioProvider } from './context/AudioContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AudioProvider>
          <App />
        </AudioProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);