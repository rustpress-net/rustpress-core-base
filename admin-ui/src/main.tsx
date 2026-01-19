import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Hide preloader after React mounts
const hidePreloader = () => {
  const preloader = document.getElementById('rustpress-preloader');
  if (preloader) {
    // Add fade-out class for smooth transition
    preloader.classList.add('fade-out');
    // Remove from DOM after animation
    setTimeout(() => {
      preloader.remove();
    }, 500);
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/admin">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// Hide preloader once everything is loaded
if (document.readyState === 'complete') {
  hidePreloader();
} else {
  window.addEventListener('load', hidePreloader);
}
