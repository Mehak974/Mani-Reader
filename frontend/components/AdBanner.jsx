'use client';
import React from 'react';

/**
 * Premium Google AdSense Banner Component (468x60 / Responsive)
 */
export default function AdBanner() {
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="ad-container-wrapper" style={{ margin: '16px auto', display: 'flex', justifyContent: 'center', width: '100%', overflow: 'hidden', minHeight: '60px' }}>
      <ins className="adsbygoogle"
           style={{ display: 'inline-block', width: '468px', height: '60px' }}
           data-ad-client="ca-pub-4938022536946038"
           data-ad-slot="1234567890" /* Replace with your AdSense slot ID if desired */></ins>
    </div>
  );
}
