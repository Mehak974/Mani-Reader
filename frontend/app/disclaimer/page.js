'use client';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function DisclaimerPage() {
  return (
    <div className="page-wrapper" style={{ background: 'var(--bg)', color: '#fff' }}>
      <Navbar />
      <div className="hero-grid-lines" style={{ opacity: 0.1 }} />

      <div className="container" style={{ paddingTop: '30px', paddingBottom: '100px', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="floating-icon" style={{ fontSize: '4rem', color: 'var(--accent)', marginBottom: '20px' }}>
            <span className="material-icons" style={{ fontSize: 'inherit' }}>gavel</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>
            Legal <span style={{ color: 'var(--accent)' }}>Disclaimer</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-2)', maxWidth: '600px', margin: '0 auto' }}>
            Official statements regarding content, liability, and DMCA.
          </p>
        </div>

        <div className="disclaimer-content">
          <div className="disclaimer-block">
            <h3>1. Introduction & Commitment</h3>
            <p>At Mani Reader, we respect the intellectual property of others and are committed to following the law. Our platform is not intended to support digital piracy or infringe on any copyright laws. We take our commitment to respecting the rights of copyright owners very seriously.</p>
          </div>

          <div className="disclaimer-block">
            <h3>2. Content & No Commercial Benefit</h3>
            <p>The content made available on our site is either provided by the users or gathered from publicly available sources. We do not control the content and have no commercial benefit from it. We act solely as a high-performance indexing service for the community.</p>
          </div>

          <div className="disclaimer-block" id="dmca" style={{ borderColor: 'var(--accent)', background: 'rgba(113, 3, 186, 0.05)' }}>
            <h3 style={{ color: 'var(--accent)' }}>3. DMCA (Digital Millennium Copyright Act)</h3>
            <p>In accordance with the DMCA of 1998, if you believe that any material on our platform constitutes copyright infringement, please provide our designated agent with:</p>
            <ul style={{ color: 'var(--text-2)', marginTop: '16px', lineHeight: 1.8 }}>
              <li>A physical or electronic signature of the person authorized to act on behalf of the owner.</li>
              <li>Identification of the copyrighted work and the infringing material (with URLs).</li>
              <li>Your contact information (name, address, telephone, email).</li>
              <li>A statement of "good faith belief" that use is not authorized.</li>
              <li>A statement under penalty of perjury that the information is accurate.</li>
            </ul>
            <div style={{ marginTop: '24px', padding: '16px', borderLeft: '3px solid var(--accent)', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)' }}>Designated Agent</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                <Link href="/contact" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Contact Us</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .disclaimer-content {
          max-width: 800px;
          margin: 0 auto;
        }
        .disclaimer-block {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 32px;
          animation: fadeInUp 0.8s ease-out;
        }
        .disclaimer-block h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .disclaimer-block p {
          color: var(--text-2);
          line-height: 1.8;
        }
        .floating-icon {
          animation: float 3s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
