'use client';
import Navbar from '../../components/Navbar';

export default function PrivacyPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container section" style={{ maxWidth: 800 }}>
        <h1 className="form-title" style={{ fontSize: '2.5rem', marginBottom: 32 }}>Privacy Policy</h1>

        <div className="description-line" style={{ lineHeight: 1.8, color: 'var(--text-2)' }}>
          <p>Last updated: April 27, 2026</p>

          <h2 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account or contact us. This includes your email address and username.</p>

          <h2 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}>2. How We Use Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, including personalizing your reading experience and sending you technical notices or updates.</p>

          <h2 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}>3. Data Protection</h2>
          <p>We implement industry-standard security measures to protect your personal information. Your passwords are encrypted (hashed) and are never stored in plain text.</p>

          <h2 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}>4. Cookies</h2>
          <p>We use cookies to keep you logged in and remember your preferences. You can disable cookies in your browser settings, but some features may not function correctly.</p>

          <h2 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}>5. Third-Party Links</h2>
          <p>Our site may contain links to third-party websites or ad networks. We are not responsible for the privacy practices of these external sites.</p>
        </div>
      </div>
    </div>
  );
}
