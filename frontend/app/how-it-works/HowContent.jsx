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

const steps = [
  {
    step: '01',
    title: 'Smart Indexing',
    desc: 'Mani Reader scans open manga libraries to index metadata including titles, genres, descriptions, and cover art. No chapter image files are stored on our servers.',
  },
  {
    step: '02',
    title: 'Turbo-Sync Updates',
    desc: 'When you select a series, our engine fetches the latest chapter lists from source directories in real time. You always see updates the moment they are online.',
  },
  {
    step: '03',
    title: 'Ad-Filtering Reader',
    desc: 'Our optimized browser reader filters out aggressive ad scripts, popups, and redirects, delivering a fast, light, and readable viewport focused entirely on the manga page.',
  },
];

export default function HowContent() {
  return (
    <>
      <Navbar />
      <div className="hw-page">
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="hw-hero">
          <div className="hw-hero-bg-glow hw-hero-bg-glow--l" />
          <div className="hw-hero-bg-glow hw-hero-bg-glow--r" />
          <div className="hw-hero-grid-lines" />

          <div className="hw-hero-inner">
            <nav aria-label="Breadcrumb" className="hw-bc">
              <ol><li><Link href="/">Home</Link></li><li>›</li><li aria-current="page">How It Works</li></ol>
            </nav>

            <div className="hw-badge">
              <span className="hw-badge-dot" />
              Technology Overview
            </div>

            <h1 className="hw-h1">
              How <span className="hw-gradient-text">Mani Reader Works</span>
            </h1>
            <p className="hw-tagline">Providing a fast, clean, and optimized manga discovery experience.</p>
            <p className="hw-desc">
              Mani Reader operates as a clean index directory. We combine high-performance metadata caching with real-time source syncing to make manga reading smooth and distraction-free.
            </p>
          </div>
        </section>

        {/* ── STEPS ─────────────────────────────────────────────────── */}
        <section className="hw-section">
          <div className="hw-wrap">
            <div className="hw-steps-grid">
              {steps.map((s, i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div className="hw-step-card">
                    <span className="hw-step-number">{s.step}</span>
                    <h3 className="hw-step-title">{s.title}</h3>
                    <p className="hw-step-desc">{s.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── ADVANTAGE ─────────────────────────────────────────────── */}
        <section className="hw-section hw-section--dark">
          <div className="hw-wrap">
            <FadeIn>
              <div className="hw-tech-layout">
                <div>
                  <div className="hw-pill">Optimization</div>
                  <h2 className="hw-h2">Why Mani Reader is Faster</h2>
                  <p className="hw-p">
                    Traditional manga sites load dozens of hidden ads, trackers, and popup scripts that slow down page rendering and drain your device battery.
                  </p>
                  <p className="hw-p">
                    Our platform processes chapter indexes on the fly, fetching content links dynamically and rendering only clean, optimized images.
                  </p>
                </div>
                <div className="hw-features-list">
                  {['Zero forced redirect pages', 'Ad-medial browser filtering', 'Optimized mobile images', 'Instant chapter loading'].map(f => (
                    <div key={f} className="hw-feature-row">
                      <span className="hw-feature-check">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── EXPLORE ──────────────────────────────────────────────── */}
        <section className="hw-section">
          <div className="hw-wrap">
            <FadeIn>
              <h2 className="hw-h2 hw-h2--center">Explore Mani Reader</h2>
              <div className="hw-int-links">
                {internalLinks.map(l => (
                  <Link key={l.href} href={l.href} className="hw-int-link">{l.label}</Link>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .hw-page { min-height: 100vh; color: var(--text); font-family: var(--font-inter,'Inter',sans-serif); overflow-x: hidden; }
        .hw-wrap { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
        .hw-section { padding: 72px 0; position: relative; }
        .hw-section--dark { background: rgba(113,3,186,0.04); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }

        /* ── HERO ──────────────────────────────────────────────────── */
        .hw-hero { position: relative; padding: 120px 28px 60px; overflow: hidden; text-align: center; background: radial-gradient(ellipse 100% 90% at 50% -20%, rgba(113,3,186,0.18) 0%, transparent 65%); }
        .hw-hero-bg-glow { position: absolute; border-radius: 50%; filter: blur(130px); pointer-events: none; opacity: 0.7; }
        .hw-hero-bg-glow--l { width: 560px; height: 560px; background: rgba(113,3,186,0.22); top: -80px; left: -200px; }
        .hw-hero-bg-glow--r { width: 480px; height: 480px; background: rgba(52,152,219,0.15); bottom: 0; right: -150px; }
        .hw-hero-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(113,3,186,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(113,3,186,0.05) 1px, transparent 1px); background-size: 56px 56px; pointer-events: none; }

        .hw-hero-inner { position: relative; z-index: 2; max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; align-items: center; }
        .hw-bc ol { display: flex; gap: 8px; list-style: none; padding: 0; margin: 0 0 24px; font-size: 0.8rem; color: var(--text-3); }
        .hw-bc a { color: var(--accent); }
        .hw-bc a:hover { text-decoration: underline; }

        .hw-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.35); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
        .hw-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }

        .hw-h1 { font-size: clamp(2.4rem, 5vw, 3.5rem); font-weight: 900; letter-spacing: -2px; line-height: 1.1; margin: 0 0 16px; }
        .hw-tagline { font-size: 1.2rem; font-weight: 700; color: var(--text-2); margin: 0 0 12px; }
        .hw-desc { font-size: 0.95rem; color: var(--text-3); line-height: 1.7; margin: 0; }
        .hw-gradient-text { background: linear-gradient(135deg, var(--accent), #3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

        /* ── STEPS ─────────────────────────────────────────────────── */
        .hw-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .hw-step-card { background: var(--surface-2); border: 1px solid var(--border); border-radius: 18px; padding: 32px 24px; transition: all 0.25s; height: 100%; position: relative; overflow: hidden; }
        .hw-step-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), #3498db); opacity: 0; transition: opacity 0.25s; }
        .hw-step-card:hover::before { opacity: 1; }
        .hw-step-card:hover { border-color: rgba(113,3,186,0.5); transform: translateY(-6px); box-shadow: 0 24px 56px rgba(113,3,186,0.2); }
        .hw-step-number { font-size: 2.2rem; font-weight: 900; background: linear-gradient(135deg, var(--accent), #3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; display: block; margin-bottom: 12px; }
        .hw-step-title { font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
        .hw-step-desc { font-size: 0.88rem; color: var(--text-3); line-height: 1.6; }

        /* ── ADVANTAGE ─────────────────────────────────────────────── */
        .hw-tech-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }
        .hw-pill { display: inline-block; padding: 4px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.3); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
        .hw-h2 { font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 900; letter-spacing: -1px; color: var(--text); margin: 0 0 24px; line-height: 1.15; }
        .hw-p { font-size: 1rem; color: var(--text-2); line-height: 1.75; margin-bottom: 16px; }
        
        .hw-features-list { display: flex; flex-direction: column; gap: 10px; }
        .hw-feature-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; font-size: 0.92rem; color: var(--text-2); font-weight: 500; }
        .hw-feature-check { color: #2ecc71; font-weight: 900; font-size: 1rem; }

        .hw-h2--center { text-align: center; font-size: 1.5rem; font-weight: 800; margin-bottom: 24px; }
        .hw-int-links { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .hw-int-link { padding: 8px 18px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 99px; font-size: 0.84rem; font-weight: 500; color: var(--text-2); text-decoration: none; transition: all 0.2s; }
        .hw-int-link:hover { border-color: var(--accent); color: var(--accent); background: rgba(113,3,186,0.08); transform: translateY(-1px); }

        @media (max-width: 900px) {
          .hw-steps-grid { grid-template-columns: 1fr; }
          .hw-tech-layout { grid-template-columns: 1fr; gap: 32px; }
        }
        @media (max-width: 640px) {
          .hw-hero { padding-top: 100px; }
          .hw-h1 { font-size: 2.1rem; }
        }
      `}</style>
    </>
  );
}
