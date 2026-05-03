'use client';
import Navbar from '../../components/Navbar';

export default function SupportPage() {
  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: 900, paddingTop: 100, paddingBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '12px 24px', 
            borderRadius: 40, 
            background: 'rgba(168, 85, 247, 0.1)', 
            border: '1px solid rgba(168, 85, 247, 0.2)',
            color: 'var(--accent)',
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: 24,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Support Mani Reader
          </div>
          <h1 style={{ 
            fontSize: '4.5rem', 
            fontWeight: 900, 
            marginBottom: 24, 
            background: 'linear-gradient(135deg, #fff 0%, var(--text-3) 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1
          }}>
            Help Us Shine <br/> Even Brighter
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '1.25rem', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
            Mani Reader is built by fans, for fans. Your support helps us cover server costs, 
            develop new features, and keep the gemstone-themed experience polished and ad-free.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32, margin: '0 auto' }}>
          {/* Goal Progress Card */}
          <div style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: 32, 
            padding: 40,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Next Goal</h3>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent)' }}>3%</span>
            </div>
            <div style={{ height: 14, background: 'var(--surface-2)', borderRadius: 7, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ width: '3%', height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }} />
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: '1rem', lineHeight: 1.6 }}>
              Goal: <b>$1,500</b> for the <b>Manga Posting System</b>. 
              Once reached, we will add support for users to upload and share their own manga.
            </p>
          </div>

          {/* PayPal Card */}
          <div style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: 32, 
            padding: 40,
            textAlign: 'center'
          }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: '#0070ba', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span className="material-icons" style={{ fontSize: '2.5rem', color: '#fff' }}>payments</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>One-time Support</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: 24, fontSize: '0.95rem' }}>
              Buy us a coffee for a smooth, ad-free experience.
            </p>
            <a 
              href="https://paypal.me/yourlink" 
              target="_blank" 
              className="btn jewel-btn" 
              style={{ width: '100%', padding: '12px', borderRadius: 14 }}
            >
              Support via PayPal
            </a>
          </div>
        </div>

        {/* Community Section */}
        <div style={{ marginTop: 60, textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 32 }}>Join the Community</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            <a href="https://discord.gg/XScjzUBtF" target="_blank" style={{ 
              display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px', borderRadius: 16, 
              background: '#5865F2', color: '#fff', textDecoration: 'none', fontWeight: 700 
            }}>
              <span className="material-icons">forum</span> Discord
            </a>
            <a href="https://reddit.com/r/manireader" target="_blank" style={{ 
              display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px', borderRadius: 16, 
              background: '#FF4500', color: '#fff', textDecoration: 'none', fontWeight: 700 
            }}>
              <span className="material-icons">reddit</span> Reddit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
