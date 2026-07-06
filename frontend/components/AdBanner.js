'use client';
import React from 'react';

/**
 * Premium Google AdSense Banner Component
 * @param {string} slot - The AdSense slot ID (can be null for Auto Ads)
 * @param {string} format - The ad format (default: 'auto')
 * @param {string} responsive - Whether the ad is responsive (default: 'true')
 */
export default function AdBanner({ slot, format = 'auto', responsive = 'true', size = 'normal' }) {
  const publisherId = 'ca-pub-4938022536946038';
  const adRef = React.useRef(null);

  React.useEffect(() => {
    const initAd = () => {
      try {
        if (typeof window !== 'undefined') {
          // Check if there are any uninitialized adsbygoogle ins elements in the DOM
          const ads = document.querySelectorAll('ins.adsbygoogle');
          const uninitializedAds = Array.from(ads).filter(
            (el) => !el.hasAttribute('data-adsbygoogle-status')
          );

          if (uninitializedAds.length > 0) {
            // Mark the element as pushed so subsequent checks ignore it
            uninitializedAds[0].dataset.adPushed = 'true';
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        }
      } catch (e) {
        // console.error('AdSense error:', e);
      }
    };

    // Delay initialization slightly to let the DOM render completely
    const timer = setTimeout(initAd, 200);
    return () => clearTimeout(timer);
  }, []);

  const isSmall = size === 'small';

  return (
    <div className="ad-container" style={{
      margin: isSmall ? '8px auto' : '32px auto',
      textAlign: 'center',
      minHeight: isSmall ? '30px' : '100px',
      background: isSmall ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
      borderRadius: isSmall ? '0' : '16px',
      border: isSmall ? 'none' : '1px solid rgba(255, 255, 255, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      maxWidth: isSmall ? '468px' : '1200px',
      position: 'relative',
      padding: '0',
      pointerEvents: 'none' // ⚡ Make ads completely unclickable
    }}>
      <ins className="adsbygoogle"
        ref={adRef}
        style={{ display: 'inline-block', width: isSmall ? '320px' : '100%', height: isSmall ? '32px' : 'auto' }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={isSmall ? null : format}
        data-full-width-responsive={isSmall ? 'false' : responsive}></ins>

      <div style={{
        position: 'absolute',
        top: isSmall ? 2 : 6,
        right: isSmall ? 6 : 12,
        fontSize: isSmall ? '0.5rem' : '0.6rem',
        color: 'var(--text-3)',
        opacity: isSmall ? 0.2 : 0.4,
        textTransform: 'uppercase',
        pointerEvents: 'none',
        zIndex: 1
      }}>{isSmall ? 'AD' : 'Advertisement'}</div>
    </div>
  );
}
