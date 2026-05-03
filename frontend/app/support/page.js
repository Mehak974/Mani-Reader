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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: 600, margin: '0 auto' }}>
          {/* Patreon Card */}
          <div style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: 32, 
            padding: 48, 
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            textAlign: 'center'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ width: 80, height: 80, borderRadius: 24, background: '#f96854', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
              <span className="material-icons" style={{ fontSize: '3rem', color: '#fff' }}>loyalty</span>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>Become a Patron</h3>
            <p style={{ color: 'var(--text-3)', marginBottom: 32, lineHeight: 1.6, fontSize: '1.1rem' }}>
              Join our inner circle for exclusive perks, early access to features, and a special gemstone badge on your profile.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--accent)', fontWeight: 700, gap: 8, fontSize: '1.1rem' }}>
              Coming Soon <span className="material-icons" style={{ fontSize: '1.4rem' }}>schedule</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 80, padding: 48, borderRadius: 32, background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(108, 99, 255, 0.1) 100%)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Other Ways to Help</h3>
          <p style={{ color: 'var(--text-3)', marginBottom: 0 }}>
            Not able to support financially? You can still help by sharing Mani Reader with your friends or providing feedback on our <a href="/contact" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Contact Page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
