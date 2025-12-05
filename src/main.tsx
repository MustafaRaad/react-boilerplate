import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'
import { Workbox } from 'workbox-window'
import App from '@/app/App'
import './assets/styles/globals.css'

// Web Vitals monitoring
function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Web Vitals]', metric.name, metric.value);
  }
  
  // In production, send to your analytics service
  // Example: analytics.track('Web Vitals', metric);
}

// Track Core Web Vitals
onCLS(sendToAnalytics); // Cumulative Layout Shift
onINP(sendToAnalytics); // Interaction to Next Paint (replaces FID)
onFCP(sendToAnalytics); // First Contentful Paint
onLCP(sendToAnalytics); // Largest Contentful Paint
onTTFB(sendToAnalytics); // Time to First Byte

// Register Service Worker for PWA
let workbox: Workbox | null = null;

if ('serviceWorker' in navigator) {
  workbox = new Workbox('/sw.js', { scope: '/' });

  // Listen for waiting event
  workbox.addEventListener('waiting', () => {
    console.log('New service worker waiting to activate');
  });

  // Listen for activated event
  workbox.addEventListener('activated', (event) => {
    console.log('Service worker activated', event.isUpdate ? '(update)' : '(first time)');
  });

  // Listen for controlling event
  workbox.addEventListener('controlling', () => {
    console.log('Service worker is now controlling the page');
  });

  // Register the service worker
  workbox.register()
    .then(() => {
      console.log('Service worker registered successfully');
    })
    .catch((error) => {
      console.error('Service worker registration failed:', error);
    });
}

// Export workbox instance for use in components
export { workbox };

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container missing')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
