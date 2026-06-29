'use client';

import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useState } from 'react';

export default function PrivacyContent() {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 'collect',
      icon: 'contact_page',
      title: 'Information We Collect',
      content: 'While using Our Service, We may ask You to provide Us with certain personally identifiable information (PII) that can be used to contact or identify You. This includes your email address, username, and Usage Data—which is collected automatically and includes your Device IP address, browser version, and page visit duration.'
    },
    {
      id: 'use',
      icon: 'insights',
      title: 'Why We Collect Data',
      content: 'We use Your Personal Data to provide and maintain our Service, manage Your Account, and keep you informed about security updates. It also helps us identify usage trends and evaluate the effectiveness of our platform to build a better sanctuary for you.'
    },
    {
      id: 'ads',
      icon: 'ad_units',
      title: 'Advertising & Partners',
      content: 'Mani Reader displays ads to support our free availability. Our third-party partners may collect Advertising Identifiers (AAID), Device Info, and Approximate Location to serve region-appropriate, relevant advertisements.'
    },
    {
      id: 'protect',
      icon: 'verified_user',
      title: 'Data Protection & Rights',
      content: 'Residents of the EEA (GDPR) or California (CCPA) have specific rights, including the Right to Access, Erasure, and to Opt-Out of the sale of personal information. We respect "Do Not Track" signals and never knowingly collect data from children under 13.'
    },
    {
      id: 'cookies',
      icon: 'cookie',
      title: 'Secure Cookies',
      content: 'We use both Session and Persistent Cookies. Necessary cookies authenticate users and prevent fraud, while Functionality cookies remember your login details and preferences to provide a seamless, personalized experience.'
    }
  ];

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg)', color: '#fff' }}>
      <Navbar />
      <div className="hero-grid-lines" style={{ opacity: 0.1 }} />

      <div className="container" style={{ paddingTop: '30px', paddingBottom: '100px', position: 'relative', zIndex: 2 }}>
        {/* ✨ Animated Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="floating-icon" style={{ fontSize: '4rem', color: 'var(--accent)', marginBottom: '20px' }}>
            <span className="material-icons" style={{ fontSize: 'inherit' }}>security</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>
            Your <span style={{ color: 'var(--accent)' }}>Privacy</span> Matters
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-2)', maxWidth: '600px', margin: '0 auto' }}>
            At Mani Reader, we believe in complete transparency. Your data is your own, and your sanctuary is protected.
          </p>
          <p style={{ marginTop: '12px' }}>Questions about your privacy? <Link href="/contact" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>Contact Us</Link></p>
        </div>

        {/* 🛡️ Trust Badges Row */}
        <div className="trust-badges">
          <div className="badge">
            <span className="material-icons">vps</span>
            <span>256-bit SSL</span>
          </div>
          <div className="badge">
            <span className="material-icons">lock</span>
            <span>Zero Data Selling</span>
          </div>
          <div className="badge">
            <span className="material-icons">shutter_speed</span>
            <span>Privacy Focused</span>
          </div>
        </div>

        {/* 🃏 Interactive Cards Grid */}
        <div className="privacy-grid">
          {sections.map((s, index) => (
            <div 
              key={s.id} 
              className={`privacy-card ${activeSection === s.id ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
            >
              <div className="card-icon">
                <span className="material-icons">{s.icon}</span>
              </div>
              <h3 className="card-title">{s.title}</h3>
              <p className="card-text">{s.content}</p>
              <div className="card-footer">
                <span>{activeSection === s.id ? 'Click to close' : 'Click to learn more'}</span>
                <span className="material-icons">{activeSection === s.id ? 'expand_less' : 'expand_more'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 📄 Supplementary Info */}
        <div className="supplementary-info">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--accent)' }}>Legal Interpretations & Definitions</h2>
          <div style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '16px' }}>
              <strong>Interpretation:</strong> Words with initial letters capitalized have meanings defined under specific conditions. These definitions hold the same meaning regardless of whether they appear in singular or plural.
            </p>
            <p>
              <strong>Definitions:</strong> For this policy, "Account" means a unique account created for You; "Company" refers to the Mani Reader Team; "Personal Data" is any information relating to an identified individual; and "Service" refers to the Website.
            </p>
          </div>
          
          <hr style={{ border: 'none', height: '1px', background: 'var(--border)', margin: '32px 0' }} />

          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--accent)' }}>5. Third-Party Links & Ads</h2>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: '24px' }}>
            Our site may contain links to third-party websites or ad networks. We use third-party advertising mediation and network services to serve advertisements within the Application. These third-party services may collect data (like your Google Advertising ID) in accordance with their own privacy policies.
          </p>
          <div className="last-updated">
            <span className="material-icons" style={{ color: 'var(--accent)' }}>info</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Last updated: May 08, 2026</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .privacy-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .privacy-grid { grid-template-columns: 1fr; }
        }
        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 40px;
          flex-wrap: wrap;
          animation: fadeIn 1s ease-out;
        }
        .badge {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-3);
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge .material-icons {
          color: var(--accent);
          font-size: 1.2rem;
        }
        .privacy-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .privacy-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent);
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px var(--accent-glow);
        }
        .privacy-card.active {
          background: rgba(113, 3, 186, 0.05);
          border-color: var(--accent);
          box-shadow: 0 0 30px var(--accent-glow);
        }
        .card-icon {
          width: 50px;
          height: 50px;
          background: var(--accent);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          color: #fff;
          box-shadow: 0 8px 16px var(--accent-glow);
          transition: transform 0.3s ease;
        }
        .privacy-card:hover .card-icon {
          transform: scale(1.1) rotate(5deg);
        }
        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .card-text {
          color: var(--text-2);
          line-height: 1.6;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.4s ease;
        }
        .privacy-card.active .card-text {
          max-height: 200px;
          opacity: 1;
          margin-top: 16px;
        }
        .card-footer {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .privacy-card.active .card-footer {
          color: var(--accent);
        }
        .supplementary-info {
          margin-top: 60px; 
          padding: 40px; 
          background: rgba(255,255,255,0.02); 
          border-radius: 24px; 
          border: 1px solid var(--border);
          backdrop-filter: blur(10px);
          animation: fadeIn 1s ease-out 0.5s both;
        }
        .last-updated {
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 16px; 
          background: rgba(113, 3, 186, 0.1); 
          border-radius: 12px; 
          border: 1px solid var(--accent);
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
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
