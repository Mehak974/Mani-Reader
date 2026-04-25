'use client';
import { useState, useEffect } from 'react';

export default function AdBanner() {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ads/random')
      .then(res => res.json())
      .then(data => setAd(data))
      .catch(err => console.error('Ad fetch failed:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!ad) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetch('/api/ads/track-impression', { method: 'POST' }).catch(() => {});
        observer.disconnect(); // Track only once per mount
      }
    }, { threshold: 0.5 }); // 50% visibility

    const el = document.getElementById(`ad-banner-${ad.id}`);
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [ad]);

  if (loading || !ad) return <div style={{ height: 90, background: 'var(--surface)', margin: '20px 0', borderRadius: 12, border: '1px dashed var(--border)' }} />;

  return (
    <div style={{ 
      margin: '24px 0', 
      display: 'flex', 
      justifyContent: 'center', 
      userSelect: 'none', 
      pointerEvents: 'none' 
    }}>
      <div 
        id={`ad-banner-${ad.id}`}
        style={{
        position: 'relative',
        width: '100%',
        maxWidth: '728px',
        height: '90px',
        background: 'var(--surface)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <img 
          src={ad.image} 
          alt={ad.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} 
        />
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'rgba(0,0,0,0.4)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Sponsor
        </div>
      </div>
    </div>
  );
}
