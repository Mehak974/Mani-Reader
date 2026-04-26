'use client';
import { useEffect } from 'react';

/**
 * Premium Google AdSense Banner Component
 * @param {string} slot - The AdSense slot ID (can be null for Auto Ads)
 * @param {string} format - The ad format (default: 'auto')
 * @param {string} responsive - Whether the ad is responsive (default: 'true')
 */
export default function AdBanner({ slot, format = 'auto', responsive = 'true' }) {
  const publisherId = 'ca-pub-4938022536946038';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="ad-container" style={{ 
      margin: '32px auto', 
      textAlign: 'center', 
      minHeight: '100px',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      maxWidth: '1200px',
      position: 'relative'
    }}>
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%' }}
           data-ad-client={publisherId}
           data-ad-slot={slot}
           data-ad-format={format}
           data-full-width-responsive={responsive}></ins>
      
      <div style={{ 
        position: 'absolute', 
        top: 6, 
        right: 12, 
        fontSize: '0.6rem', 
        color: 'var(--text-3)', 
        opacity: 0.4,
        textTransform: 'uppercase',
        pointerEvents: 'none',
        zIndex: 1
      }}>Advertisement</div>
    </div>
  );
}
