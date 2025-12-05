import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'
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

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container missing')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
