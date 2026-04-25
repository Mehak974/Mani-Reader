'use client';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../lib/auth';

export default function NotFound() {
  return (
    <AuthProvider>
      <div className="page-wrapper" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <div style={{ 
              fontSize: '120px', 
              fontWeight: 900, 
              color: 'var(--accent)', 
              lineHeight: 1,
              marginBottom: '20px',
              textShadow: '0 10px 30px var(--accent-glow)'
            }}>
              404
            </div>
            
            <h1 style={{ 
              fontSize: '2rem', 
              color: '#fff', 
              marginBottom: '16px',
              fontFamily: '"Outfit", sans-serif'
            }}>
              Lost in the Sanctuary?
            </h1>
            
            <p style={{ 
              color: 'var(--text-2)', 
              marginBottom: '40px',
              fontSize: '1.1rem'
            }}>
              The gem you are looking for has been moved, hidden, or never existed in this realm.
            </p>
            
            <a href="/" className="btn btn-primary" style={{ 
              padding: '14px 32px', 
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="material-icons">home</span>
              Return to Home
            </a>
          </div>
        </main>
        
        <style jsx>{`
          .btn-primary {
            background: var(--accent);
            color: #fff;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            box-shadow: 0 4px 15px var(--accent-glow);
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
          }
        `}</style>
      </div>
    </AuthProvider>
  );
}
