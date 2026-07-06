'use client';
import React from 'react';

/**
 * Auto-Reloading Native Effective CPM Ad Component
 */
export default function EffectiveCpmAd() {
  const containerRef = React.useRef(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Auto reload ad every 10 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous ad
    containerRef.current.innerHTML = '';
    
    // Create new inner container with the exact ID required by the script
    const adTarget = document.createElement('div');
    adTarget.id = 'container-479ed332b46a46628f69d5a88da45cb8';
    containerRef.current.appendChild(adTarget);

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://wraththreat.com/479ed332b46a46628f69d5a88da45cb8/invoke.js';
    containerRef.current.appendChild(script);

  }, [refreshKey]);

  return (
    <div style={{ margin: '16px auto', textAlign: 'center', minHeight: '85px' }} ref={containerRef} />
  );
}