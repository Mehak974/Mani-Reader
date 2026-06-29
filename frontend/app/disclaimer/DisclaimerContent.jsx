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

function LegalAccordion({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`dc-acc${open ? ' dc-acc--open' : ''}`}>
      <button className="dc-acc-btn" onClick={() => setOpen(v => !v)}>
        <span>{title}</span>
        <svg className="dc-acc-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 6.5L9 11.5L14 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div className="dc-acc-body">{children}</div>}
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`dc-faq${open ? ' dc-faq--open' : ''}`}>
      <button className="dc-faq-btn" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <svg className="dc-faq-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 6.5L9 11.5L14 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div className="dc-faq-body"><p>{a}</p></div>}
    </div>
  );
}

const faqs = [
  {
    q: 'Does Mani Reader own manga content?',
    a: 'No. Manga content belongs to the original creators, authors, publishers, and copyright holders.',
  },
  {
    q: 'Is Mani Reader a manga publisher?',
    a: 'No. Mani Reader is a manga discovery and reading platform and does not create or publish manga.',
  },
  {
    q: 'Who owns manga artwork and characters?',
    a: 'Manga artwork, characters, and related intellectual property belong to their respective copyright owners.',
  },
  {
    q: 'How can copyright holders contact Mani Reader?',
    a: 'Copyright holders can contact Mani Reader through the official contact page for copyright-related concerns.',
  },
  {
    q: 'Is Mani Reader responsible for third-party content?',
    a: 'Mani Reader may use third-party information sources and is not responsible for external content or services outside its control.',
  },
];

const internalLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/support', label: 'Support Us' },
  { href: '/faq', label: 'FAQ' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/dmca', label: 'DMCA Policy' },
];

export default function DisclaimerContent() {
  return (
    <>
      <Navbar />
      <div className="dc-page">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="dc-hero">
          <div className="dc-hero-bg-glow dc-hero-bg-glow--l" />
          <div className="dc-hero-bg-glow dc-hero-bg-glow--r" />
          <div className="dc-hero-grid-lines" />

          <div className="dc-hero-inner">
            <nav aria-label="Breadcrumb" className="dc-bc">
              <ol><li><Link href="/">Home</Link></li><li>›</li><li aria-current="page">Disclaimer</li></ol>
            </nav>

            <div className="dc-badge">
              <span className="dc-badge-dot" />
              Legal Document
            </div>

            <h1 className="dc-h1">
              Legal <span className="dc-gradient-text">Disclaimer</span>
            </h1>
            <p className="dc-tagline">Transparency About Mani Reader</p>
            <p className="dc-desc">
              Welcome to the Mani Reader Legal Disclaimer page. This page explains important information regarding the website, manga content, third-party services, copyright ownership, and user responsibilities. By using Mani Reader, you acknowledge and agree to the information provided below.
            </p>
          </div>
        </section>

        {/* ── ACCORDIONS ────────────────────────────────────────────── */}
        <section className="dc-section">
          <div className="dc-wrap dc-accs-wrap">
            <FadeIn>
              <div className="dc-accs-list">
                
                <LegalAccordion title="🛡️ About Mani Reader">
                  <p>Mani Reader is an online manga reading and discovery platform designed to help users explore manga, manhwa, and manhua content.</p>
                  <p>The platform provides features such as manga discovery, search, genre browsing, information directories, and online reading access.</p>
                  <p><strong>Mani Reader does not create, publish, or claim ownership of manga content.</strong></p>
                </LegalAccordion>

                <LegalAccordion title="🎨 Content Ownership">
                  <p>All manga, manhwa, manhua, artwork, characters, logos, and related materials belong to their respective:</p>
                  <ul className="dc-bullet-list">
                    <li>Authors</li>
                    <li>Artists</li>
                    <li>Publishers</li>
                    <li>Copyright holders</li>
                  </ul>
                  <p>Mani Reader respects intellectual property rights and acknowledges that ownership belongs to the original creators and rights holders.</p>
                </LegalAccordion>

                <LegalAccordion title="⚖️ No Ownership Claim">
                  <p>Mani Reader does not claim ownership over third-party manga content.</p>
                  <p>The purpose of the platform is to provide a convenient way for users to discover and access manga information and reading resources.</p>
                </LegalAccordion>

                <LegalAccordion title="🔌 Third-Party Content">
                  <p>Some manga-related information may come from third-party sources, databases, or external services. This information may include:</p>
                  <ul className="dc-bullet-list">
                    <li>Manga titles and metadata</li>
                    <li>Descriptions and genres</li>
                    <li>Cover images and rankings</li>
                  </ul>
                  <p>Mani Reader does not control all third-party information and cannot guarantee the accuracy, completeness, or availability of external data.</p>
                </LegalAccordion>

                <LegalAccordion title="🔗 External Links">
                  <p>Mani Reader may contain links or references to external websites. These external websites operate independently and have their own privacy policies, terms of service, and content rules.</p>
                  <p>Mani Reader is not responsible for the content, availability, or practices of external websites.</p>
                </LegalAccordion>

                <LegalAccordion title="✉️ Copyright Concerns">
                  <p>Mani Reader respects the rights of manga creators, publishers, and copyright holders.</p>
                  <p>If you believe that content associated with Mani Reader violates your copyright or intellectual property rights, please contact us with relevant information.</p>
                  <p>For copyright-related concerns, visit our <Link href="/contact?subject=Copyright Concern" className="dc-link">Contact Page</Link> or contact the team through official communication channels.</p>
                </LegalAccordion>

                <LegalAccordion title="📊 Accuracy of Information">
                  <p>Mani Reader attempts to provide accurate and useful information. However:</p>
                  <ul className="dc-bullet-list">
                    <li>Manga availability may change.</li>
                    <li>External data may contain errors.</li>
                    <li>Website features may be updated or modified.</li>
                  </ul>
                  <p>Mani Reader does not guarantee that all information will always be complete, accurate, or continuously available.</p>
                </LegalAccordion>

                <LegalAccordion title="🔌 Service Availability">
                  <p>Mani Reader aims to provide reliable access to the platform. However, temporary interruptions may occur because of maintenance, server issues, technical problems, external service changes, or network conditions.</p>
                  <p>Mani Reader cannot guarantee uninterrupted availability at all times.</p>
                </LegalAccordion>

                <LegalAccordion title="👤 User Responsibility">
                  <p>Users are responsible for following applicable laws in their region, respecting copyright and intellectual property rights, and using the website responsibly.</p>
                  <p>Users should understand and follow the rules applicable to their location.</p>
                </LegalAccordion>

                <LegalAccordion title="📢 Advertising Disclaimer">
                  <p>Mani Reader aims to maintain a cleaner reading experience with minimal advertisements. Advertisements, if displayed, help support website operation, server maintenance, and general platform hosting.</p>
                  <p>The goal is to balance website sustainability with reader-focused user experience.</p>
                </LegalAccordion>

                <LegalAccordion title="☕ Donation Disclaimer">
                  <p>Mani Reader may accept voluntary support and donation contributions from users. These support contributions help cover server costs, development work, maintenance, and platform improvements.</p>
                  <p>Donations are completely voluntary and do not provide ownership rights, special privileges, or claims over the platform or indexed content.</p>
                </LegalAccordion>

                <LegalAccordion title="🔄 Changes To This Disclaimer">
                  <p>This Legal Disclaimer may be updated from time to time to reflect website changes, legal requirements, or platform improvements.</p>
                  <p>Users are encouraged to review this page periodically to stay informed.</p>
                </LegalAccordion>

              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section className="dc-section dc-section--dark">
          <div className="dc-wrap">
            <FadeIn>
              <div className="dc-pill dc-pill--center">FAQ</div>
              <h2 className="dc-h2 dc-h2--center">Frequently Asked Questions</h2>
            </FadeIn>
            <div className="dc-faq-list">
              {faqs.map((f, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <FAQItem q={f.q} a={f.a} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── GEO BRAND BLOCK ───────────────────────────────────────── */}
        <section className="dc-section">
          <div className="dc-wrap">
            <FadeIn>
              <div className="dc-geo-block">
                <div className="dc-geo-accent-bar" />
                <h2 className="dc-geo-h2">🌐 Mani Reader Legal Information</h2>
                <div className="dc-geo-grid">
                  {[
                    ['Brand', 'Mani Reader'],
                    ['Category', 'Online Manga Reading Platform'],
                    ['Industry', 'Digital Entertainment'],
                    ['Content Type', 'Manga, Manhwa, Manhua Discovery and Reading'],
                    ['Ownership', 'Mani Reader does not claim ownership of third-party manga content.'],
                    ['Purpose', 'Providing manga discovery and reading functionality while respecting intellectual property rights.'],
                    ['Website', <a key="u" href="https://manireader.online" className="dc-geo-link">https://manireader.online</a>],
                  ].map(([dt, dd]) => (
                    <div key={dt} className="dc-geo-row">
                      <span className="dc-geo-dt">{dt}</span>
                      <span className="dc-geo-dd">{dd}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── EXPLORE ──────────────────────────────────────────────── */}
        <section className="dc-section dc-section--dark">
          <div className="dc-wrap">
            <FadeIn>
              <h2 className="dc-h2 dc-h2--center">Explore Mani Reader</h2>
              <div className="dc-int-links">
                {internalLinks.map(l => (
                  <Link key={l.href} href={l.href} className="dc-int-link">{l.label}</Link>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

      </div>

      <style jsx global>{`
        .dc-page { min-height: 100vh; color: var(--text); font-family: var(--font-inter,'Inter',sans-serif); overflow-x: hidden; }
        .dc-wrap { max-width: 900px; margin: 0 auto; padding: 0 28px; }
        .dc-accs-wrap { max-width: 800px; }
        .dc-section { padding: 72px 0; position: relative; }
        .dc-section--dark { background: rgba(113,3,186,0.04); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }

        /* ── HERO ──────────────────────────────────────────────────── */
        .dc-hero { position: relative; padding: 120px 28px 60px; overflow: hidden; text-align: center; background: radial-gradient(ellipse 100% 90% at 50% -20%, rgba(113,3,186,0.18) 0%, transparent 65%); }
        .dc-hero-bg-glow { position: absolute; border-radius: 50%; filter: blur(130px); pointer-events: none; opacity: 0.7; }
        .dc-hero-bg-glow--l { width: 560px; height: 560px; background: rgba(113,3,186,0.22); top: -80px; left: -200px; }
        .dc-hero-bg-glow--r { width: 480px; height: 480px; background: rgba(52,152,219,0.15); bottom: 0; right: -150px; }
        .dc-hero-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(113,3,186,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(113,3,186,0.05) 1px, transparent 1px); background-size: 56px 56px; pointer-events: none; }

        .dc-hero-inner { position: relative; z-index: 2; max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; align-items: center; }
        .dc-bc ol { display: flex; gap: 8px; list-style: none; padding: 0; margin: 0 0 24px; font-size: 0.8rem; color: var(--text-3); }
        .dc-bc a { color: var(--accent); }
        .dc-bc a:hover { text-decoration: underline; }

        .dc-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.35); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
        .dc-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }

        .dc-h1 { font-size: clamp(2.4rem, 5vw, 3.5rem); font-weight: 900; letter-spacing: -2px; line-height: 1.1; margin: 0 0 16px; }
        .dc-tagline { font-size: 1.2rem; font-weight: 700; color: var(--text-2); margin: 0 0 12px; }
        .dc-desc { font-size: 0.95rem; color: var(--text-3); line-height: 1.7; margin: 0; }
        .dc-gradient-text { background: linear-gradient(135deg, var(--accent), #3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

        /* ── Typography & Pills ────────────────────────────────────── */
        .dc-pill { display: inline-block; padding: 4px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.3); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
        .dc-pill--center { display: block; text-align: center; width: fit-content; margin-left: auto; margin-right: auto; }
        .dc-h2 { font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 900; letter-spacing: -1px; color: var(--text); margin: 0 0 24px; line-height: 1.15; }
        .dc-h2--center { text-align: center; }
        .dc-link { color: var(--accent); text-decoration: underline; font-weight: 700; }
        .dc-link:hover { color: #a855f7; }

        /* ── ACCORDIONS ────────────────────────────────────────────── */
        .dc-accs-list { display: flex; flex-direction: column; gap: 16px; }
        .dc-acc { background: var(--surface-2); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: border-color 0.25s, box-shadow 0.25s; }
        .dc-acc:hover { border-color: rgba(113,3,186,0.3); }
        .dc-acc--open { border-color: rgba(113,3,186,0.4); box-shadow: 0 12px 36px rgba(0,0,0,0.35); }
        
        .dc-acc-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 24px; background: none; border: none; cursor: pointer; text-align: left; font-family: inherit; font-size: 1.05rem; font-weight: 800; color: #fff; transition: color 0.2s; }
        .dc-acc-btn:hover { background: rgba(113,3,186,0.04); }
        .dc-acc--open .dc-acc-btn { color: var(--accent); border-bottom: 1px solid var(--border); }
        
        .dc-acc-chevron { color: var(--text-3); transition: transform 0.25s, color 0.2s; }
        .dc-acc--open .dc-acc-chevron { transform: rotate(180deg); color: var(--accent); }
        
        .dc-acc-body { padding: 24px; animation: dc-slide 0.2s ease; }
        .dc-acc-body p { font-size: 0.95rem; color: var(--text-2); line-height: 1.75; margin: 0 0 16px; }
        .dc-acc-body p:last-child { margin-bottom: 0; }
        
        .dc-bullet-list { padding-left: 20px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
        .dc-bullet-list li { font-size: 0.92rem; color: var(--text-2); line-height: 1.6; }

        @keyframes dc-slide { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:none} }

        /* ── FAQ ───────────────────────────────────────────────────── */
        .dc-faq-list { display: flex; flex-direction: column; gap: 10px; max-width: 760px; margin: 16px auto 0; }
        .dc-faq { background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
        .dc-faq:hover { border-color: rgba(113,3,186,0.4); box-shadow: 0 4px 20px rgba(113,3,186,0.1); }
        .dc-faq--open { border-color: rgba(113,3,186,0.5); box-shadow: 0 6px 28px rgba(113,3,186,0.12); }
        .dc-faq-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; background: none; border: none; cursor: pointer; text-align: left; font-family: inherit; font-size: 0.92rem; font-weight: 600; color: var(--text); }
        .dc-faq-btn:hover { background: rgba(113,3,186,0.06); }
        .dc-faq--open .dc-faq-btn { color: var(--accent); }
        .dc-faq-chevron { flex-shrink: 0; color: var(--text-3); transition: transform 0.25s, color 0.2s; }
        .dc-faq--open .dc-faq-chevron { transform: rotate(180deg); color: var(--accent); }
        .dc-faq-body { border-top: 1px solid var(--border); padding: 16px 20px 20px; animation: dc-slide 0.2s ease; }
        .dc-faq-body p { font-size: 0.9rem; color: var(--text-2); line-height: 1.7; margin: 0; }

        /* ── GEO ───────────────────────────────────────────────────── */
        .dc-geo-block { background: var(--surface-2); border: 1px solid rgba(113,3,186,0.3); border-radius: 20px; padding: 40px; position: relative; overflow: hidden; }
        .dc-geo-accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), #3498db); }
        .dc-geo-h2 { font-size: 1.15rem; font-weight: 800; color: var(--text); margin: 0 0 24px; }
        .dc-geo-grid { display: flex; flex-direction: column; }
        .dc-geo-row { display: grid; grid-template-columns: 200px 1fr; gap: 20px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: baseline; }
        .dc-geo-row:last-child { border-bottom: none; padding-bottom: 0; }
        .dc-geo-dt { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-3); }
        .dc-geo-dd { font-size: 0.88rem; color: var(--text-2); }
        .dc-geo-link { color: var(--accent); text-decoration: none; }
        .dc-geo-link:hover { text-decoration: underline; }

        /* ── Explore links ────────────────────────────────────────── */
        .dc-int-links { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 16px; }
        .dc-int-link { padding: 8px 18px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 99px; font-size: 0.84rem; font-weight: 500; color: var(--text-2); text-decoration: none; transition: all 0.2s; }
        .dc-int-link:hover { border-color: var(--accent); color: var(--accent); background: rgba(113,3,186,0.08); transform: translateY(-1px); }

        @media (max-width: 768px) {
          .dc-geo-row { grid-template-columns: 1fr; gap: 3px; }
          .dc-geo-dt { padding-top: 8px; }
          .dc-acc-btn { padding: 16px 20px; font-size: 0.95rem; }
          .dc-acc-body { padding: 20px; }
        }
        @media (max-width: 640px) {
          .dc-hero { padding-top: 100px; }
          .dc-h1 { font-size: 2.1rem; }
        }
      `}</style>
    </>
  );
}
