'use client';
import Navbar from '../../components/Navbar';

export default function TermsPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container section" style={{ maxWidth: 800 }}>
        <h1 className="form-title" style={{ fontSize: '2.5rem', marginBottom: 32 }}>Terms of Service</h1>
        
        <div className="description-line" style={{ lineHeight: 1.8, color: 'var(--text-2)' }}>
          <p>Last updated: April 27, 2026</p>
          
          <h2 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}>1. Acceptance of Terms</h2>
          <p>By accessing or using Mani Reader, you agree to be bound by these Terms of Service. If you do not agree, please do not use the site.</p>
          
          <h2 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}>2. Content Ownership</h2>
          <p>Mani Reader is a platform that allows users to discover manga. We do not host the manga files on our servers; they are proxied from third-party sources. All manga content belongs to their respective owners.</p>
          
          <h2 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}>3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must be at least 13 years old to use this service.</p>
          
          <h2 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}>4. Prohibited Conduct</h2>
          <p>You agree not to use Mani Reader for any illegal purposes or to attempt to disrupt the service through malicious scripts or bots.</p>
          
          <h2 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}>5. Disclaimer</h2>
          <p>Mani Reader is provided "as is" without warranty of any kind. We are not liable for any damages resulting from the use of our service.</p>
        </div>
      </div>
    </div>
  );
}
