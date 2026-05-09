'use client';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance', content: 'By accessing Mani Reader, You agree to be bound by these Terms and our Privacy Policy. These Terms apply to all visitors and users who wish to access our Service.' },
    { title: '2. User Content', content: 'You are responsible for any Content you post. By sharing it, you grant us the license to use, modify, and distribute it through our Service. We reserve the right to remove infringing content.' },
    { title: '3. Prohibited Uses', content: 'You agree not to use the Service for any unlawful purpose, to exploit minors, or to deploy automated bots/spiders to scrape our platform without prior written consent.' },
    { title: '4. Account Security', content: 'Users must be 13+ years old. You are responsible for maintaining the confidentiality of your account and must notify us immediately of any security breaches.' },
    { title: '5. IP & Copyright', content: 'We respect intellectual property. It is our policy to respond to any claim that Content posted on Service infringes on the copyright of any person or entity.' },
    { title: '6. Error Feedback', content: 'Any feedback or suggestions you provide regarding improvements become the property of Mani Reader, granting us an irrevocable right to use and commercialize those ideas.' },
    { title: '7. Third-Party Links', content: 'We have no control over, and assume no responsibility for, the content or practices of any third-party websites or services linked from our sanctuary.' },
    { title: '8. Disclaimer of Warranty', content: 'The Service is provided "AS IS" and "AS AVAILABLE". We make no representations or warranties of any kind regarding the completeness, security, or reliability of our services.' },
    { title: '9. Limitation of Liability', content: 'Mani Reader and its team shall not be liable for any indirect, incidental, or consequential damages resulting from your use of or reliance on our Service.' },
    { title: '10. Termination', content: 'We may terminate or suspend your account immediately, without prior notice, for any reason, including a breach of these Terms of Service.' }
  ];

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg)', color: '#fff' }}>
      <Navbar />
      <div className="hero-grid-lines" style={{ opacity: 0.1 }} />

      <div className="container" style={{ paddingTop: '30px', paddingBottom: '100px', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="floating-icon" style={{ fontSize: '4rem', color: 'var(--accent)', marginBottom: '20px' }}>
            <span className="material-icons" style={{ fontSize: 'inherit' }}>description</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>
            Terms of <span style={{ color: 'var(--accent)' }}>Service</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-2)', maxWidth: '600px', margin: '0 auto' }}>
            Please read these terms carefully before using our sanctuary.
          </p>
        </div>

        <div className="terms-container">
          {sections.map((s, i) => (
            <div key={i} className="term-block" style={{ animationDelay: `${i * 0.1}s` }}>
              <h3>{s.title}</h3>
              <p>{s.content}</p>
            </div>
          ))}
          
          <div style={{ marginTop: '60px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.9rem' }}>
            <p>Last updated: May 08, 2026</p>
            <p style={{ marginTop: '12px' }}>Questions? <Link href="/contact" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>Contact Us</Link></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .terms-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .term-block {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 24px;
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .term-block h3 {
          color: var(--accent);
          font-size: 1.25rem;
          margin-bottom: 12px;
        }
        .term-block p {
          color: var(--text-2);
          line-height: 1.7;
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
