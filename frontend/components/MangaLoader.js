'use client';
import React from 'react';

const LOADING_PHRASES = [
  "Summoning chapters...",
  "Opening the dungeon gate...",
  "Loading Mana reserves...",
  "Awakening the Hunter...",
  "Translating ancient runes...",
  "Turning page...",
  "Loading next panel...",
  "Rerolling gacha items..."
];

export default function MangaLoader({ size = 'medium', inline = false }) {
  const [phraseIdx, setPhraseIdx] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const dimensions = {
    small: { portal: '50px', font: '0.85rem' },
    medium: { portal: '80px', font: '1rem' },
    large: { portal: '120px', font: '1.2rem' }
  }[size];

  const loaderContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '24px',
      textAlign: 'center'
    }}>
      <style>{`
        @keyframes portal-rotate {
          0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
          100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px var(--accent), inset 0 0 15px var(--accent); }
          50% { box-shadow: 0 0 35px var(--accent), inset 0 0 25px var(--accent); }
        }
        @keyframes particle-float {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-40px) scale(0); opacity: 0; }
        }
      `}</style>

      {/* Runic Gate Portal */}
      <div style={{
        position: 'relative',
        width: dimensions.portal,
        height: dimensions.portal,
        borderRadius: '50%',
        border: '3px dashed var(--accent)',
        animation: 'portal-rotate 8s linear infinite, pulse-glow 2s ease-in-out infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(108, 99, 255, 0.1) 0%, rgba(0,0,0,0.4) 100%)'
      }}>
        {/* Inner core */}
        <div style={{
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          border: '2px dotted var(--accent-light, #8a84ff)',
          opacity: 0.7
        }} />
        
        {/* Floating portal particles */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '30%',
          width: '6px',
          height: '6px',
          background: 'var(--accent)',
          borderRadius: '50%',
          animation: 'particle-float 2s infinite',
          animationDelay: '0.2s'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '25%',
          width: '4px',
          height: '4px',
          background: 'var(--accent-light, #8a84ff)',
          borderRadius: '50%',
          animation: 'particle-float 1.5s infinite',
          animationDelay: '0.7s'
        }} />
      </div>

      {/* Comic Speech Bubble Theme Phrase */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          background: 'var(--bg-2)',
          border: '2px solid var(--border)',
          borderRadius: '12px',
          padding: '8px 16px',
          position: 'relative',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          maxWidth: '260px'
        }}>
          <p style={{
            margin: 0,
            fontSize: dimensions.font,
            fontWeight: 600,
            color: 'var(--text-1)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.5px'
          }}>
            {LOADING_PHRASES[phraseIdx]}
          </p>
          {/* Bubble tail */}
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '12px',
            height: '12px',
            background: 'var(--bg-2)',
            borderLeft: '2px solid var(--border)',
            borderTop: '2px solid var(--border)'
          }} />
        </div>
      </div>
    </div>
  );

  if (inline) {
    return loaderContent;
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '260px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {loaderContent}
    </div>
  );
}
