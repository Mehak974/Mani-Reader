'use client';

import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useEffect, useState, useRef } from 'react';

function useFadeIn(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const internalLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/disclaimer', label: 'Legal Disclaimer' },
];

export default function DMCAContent() {
  return (
    <>
      <Navbar />
      <div className="dm-page">
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="dm-hero">
          <div className="dm-hero-bg-glow dm-hero-bg-glow--l" />
          <div className="dm-hero-bg-glow dm-hero-bg-glow--r" />
          <div className="dm-hero-grid-lines" />

          <div className="dm-hero-inner">
            <nav aria-label="Breadcrumb" className="dm-bc">
              <ol><li><Link href="/">Home</Link></li><li>›</li><li aria-current="page">DMCA</li></ol>
            </nav>

            <div className="dm-badge">
              <span className="dm-badge-dot" />
              Legal Policy
            </div>

            <h1 className="dm-h1">
              DMCA <span className="dm-gradient-text">Copyright Policy</span>
            </h1>
            <p className="dm-tagline">Intellectual Property Rights &amp; Takedown Notifications.</p>
            <p className="dm-desc">
              Mani Reader respects intellectual property rights and expects its users to do the same. If you believe your copyrighted work is infringed, please submit a claim below.
            </p>
          </div>
        </section>

        {/* ── CONTENT ───────────────────────────────────────────────── */}
        <section className="dm-section">
          <div className="dm-wrap">
            <FadeIn>
              <div className="dm-content-card">
                <h2>Copyright Infringement Notification (DMCA)</h2>
                <p>
                  Mani Reader acts as a high-performance index and online discovery directory for manga, manhwa, and manhua content. We do not host or upload any files on our servers.
                </p>
                <p>
                  In accordance with the Digital Millennium Copyright Act (DMCA), we respond promptly to notices of alleged infringement that are reported to our designated agent.
                </p>

                <h3>How to File a Takedown Notice</h3>
                <p>
                  To file a copyright infringement claim, please provide a written communication that includes the following details:
                </p>
                <ul className="dm-list">
                  <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
                  <li>Identification of the copyrighted work claimed to have been infringed.</li>
                  <li>Identification of the material that is claimed to be infringing, along with direct URLs where the material is located.</li>
                  <li>Information reasonably sufficient to permit us to contact you, such as your name, address, telephone number, and email.</li>
                  <li>A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.</li>
                  <li>A statement, under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the owner.</li>
                </ul>

                <div className="dm-agent-box">
                  <h4>Designated Agent Support</h4>
                  <p>Submit your copyright claim directly through our official communication form for the fastest response.</p>
                  <Link href="/contact?subject=Copyright Concern" className="dm-btn">
                    📩 Contact Copyright Agent
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── EXPLORE ──────────────────────────────────────────────── */}
        <section className="dm-section dm-section--dark">
          <div className="dm-wrap">
            <FadeIn>
              <h2 className="dm-h2 dm-h2--center">Explore Mani Reader</h2>
              <div className="dm-int-links">
                {internalLinks.map(l => (
                  <Link key={l.href} href={l.href} className="dm-int-link">{l.label}</Link>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .dm-page { min-height: 100vh; color: var(--text); font-family: var(--font-inter,'Inter',sans-serif); overflow-x: hidden; }
        .dm-wrap { max-width: 840px; margin: 0 auto; padding: 0 28px; }
        .dm-section { padding: 72px 0; position: relative; }
        .dm-section--dark { background: rgba(113,3,186,0.04); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }

        /* ── HERO ──────────────────────────────────────────────────── */
        .dm-hero { position: relative; padding: 120px 28px 60px; overflow: hidden; text-align: center; background: radial-gradient(ellipse 100% 90% at 50% -20%, rgba(113,3,186,0.18) 0%, transparent 65%); }
        .dm-hero-bg-glow { position: absolute; border-radius: 50%; filter: blur(130px); pointer-events: none; opacity: 0.7; }
        .dm-hero-bg-glow--l { width: 560px; height: 560px; background: rgba(113,3,186,0.22); top: -80px; left: -200px; }
        .dm-hero-bg-glow--r { width: 480px; height: 480px; background: rgba(52,152,219,0.15); bottom: 0; right: -150px; }
        .dm-hero-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(113,3,186,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(113,3,186,0.05) 1px, transparent 1px); background-size: 56px 56px; pointer-events: none; }

        .dm-hero-inner { position: relative; z-index: 2; max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; align-items: center; }
        .dm-bc ol { display: flex; gap: 8px; list-style: none; padding: 0; margin: 0 0 24px; font-size: 0.8rem; color: var(--text-3); }
        .dm-bc a { color: var(--accent); }
        .dm-bc a:hover { text-decoration: underline; }

        .dm-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.35); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
        .dm-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }

        .dm-h1 { font-size: clamp(2.4rem, 5vw, 3.5rem); font-weight: 900; letter-spacing: -2px; line-height: 1.1; margin: 0 0 16px; }
        .dm-tagline { font-size: 1.2rem; font-weight: 700; color: var(--text-2); margin: 0 0 12px; }
        .dm-desc { font-size: 0.95rem; color: var(--text-3); line-height: 1.7; margin: 0; }
        .dm-gradient-text { background: linear-gradient(135deg, var(--accent), #3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

        /* ── CONTENT CARD ──────────────────────────────────────────── */
        .dm-content-card { background: var(--surface-2); border: 1px solid var(--border); border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .dm-content-card h2 { font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 20px; }
        .dm-content-card h3 { font-size: 1.15rem; font-weight: 700; color: #fff; margin: 28px 0 12px; }
        .dm-content-card p { font-size: 0.95rem; color: var(--text-2); line-height: 1.75; margin-bottom: 16px; }
        
        .dm-list { padding-left: 20px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px; }
        .dm-list li { font-size: 0.92rem; color: var(--text-2); line-height: 1.65; }

        .dm-agent-box { margin-top: 36px; padding: 24px; background: rgba(113,3,186,0.06); border-radius: 12px; border: 1px solid rgba(113,3,186,0.2); }
        .dm-agent-box h4 { font-size: 1rem; font-weight: 800; color: var(--accent); margin: 0 0 8px; }
        .dm-agent-box p { font-size: 0.88rem; color: var(--text-3); margin-bottom: 16px; }
        
        .dm-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--accent); color: #fff; font-size: 0.88rem; font-weight: 700; border-radius: 8px; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; border: none; cursor: pointer; }
        .dm-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(113,3,186,0.4); }

        .dm-h2--center { text-align: center; font-size: 1.5rem; font-weight: 800; margin-bottom: 24px; }
        .dm-int-links { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .dm-int-link { padding: 8px 18px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 99px; font-size: 0.84rem; font-weight: 500; color: var(--text-2); text-decoration: none; transition: all 0.2s; }
        .dm-int-link:hover { border-color: var(--accent); color: var(--accent); background: rgba(113,3,186,0.08); transform: translateY(-1px); }

        @media (max-width: 640px) {
          .dm-hero { padding-top: 100px; }
          .dm-h1 { font-size: 2.1rem; }
          .dm-content-card { padding: 24px 20px; }
        }
      `}</style>
    </>
  );
}
