'use client';
import React from 'react';

/**
 * Premium Google AdSense Display Ad Component (Responsive)
 */
export default function EffectiveCpmAd() {
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
    <div style={{ margin: '16px auto', textAlign: 'center', minHeight: '90px', width: '100%', overflow: 'hidden' }}>
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-4938022536946038"
           data-ad-slot="9876543210" /* Replace with your AdSense slot ID if desired */
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}