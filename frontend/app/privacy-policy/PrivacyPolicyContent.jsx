'use client';

import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useEffect, useState, useRef } from 'react';

/* ── Scroll-driven fade-in ──────────────────────────────────────── */
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

/* ── Accordion ──────────────────────────────────────────────────── */
function PolicyAccordion({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`pp-acc${open ? ' pp-acc--open' : ''}`}>
      <button className="pp-acc-btn" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="pp-acc-title-row">
          <span className="pp-acc-icon">{icon}</span>
          <span>{title}</span>
        </span>
        <svg className="pp-acc-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M4 6.5L9 11.5L14 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div className="pp-acc-body">{children}</div>}
    </div>
  );
}

/* ── FAQ Item ────────────────────────────────────────────────────── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`pp-faq${open ? ' pp-faq--open' : ''}`}>
      <button className="pp-faq-btn" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <svg className="pp-faq-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M4 6.5L9 11.5L14 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="pp-faq-body">
          <p>{a}</p>
        </div>
      )}
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────────── */
const faqs = [
  {
    q: 'Does Mani Reader collect personal information?',
    a: 'Mani Reader may collect information voluntarily provided by users, such as contact details and support messages, along with basic technical information needed to operate and improve the website.',
  },
  {
    q: 'Does Mani Reader sell user data?',
    a: 'No. Mani Reader does not sell personal user information to third parties.',
  },
  {
    q: 'Does Mani Reader use cookies?',
    a: 'Yes. Mani Reader may use cookies for website functionality, user preferences, analytics, and improving the overall user experience.',
  },
  {
    q: 'Does Mani Reader store payment information?',
    a: 'No. Payment providers handle all payment processing. Mani Reader does not store sensitive payment information such as card numbers or banking credentials.',
  },
  {
    q: 'How can I contact Mani Reader about privacy?',
    a: 'You can contact Mani Reader through the official contact page for any privacy-related questions or concerns.',
  },
];

const internalLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/support', label: 'Support Us' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/faq', label: 'FAQ' },
];

/* ── Component ──────────────────────────────────────────────────── */
export default function PrivacyPolicyContent() {
  return (
    <>
      <Navbar />
      <div className="pp-page">

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="pp-hero">
          <div className="pp-hero-glow pp-hero-glow--l" />
          <div className="pp-hero-glow pp-hero-glow--r" />
          <div className="pp-hero-grid" />

          <div className="pp-hero-inner">
            <nav aria-label="Breadcrumb" className="pp-bc">
              <ol>
                <li><Link href="/">Home</Link></li>
                <li>›</li>
                <li aria-current="page">Privacy Policy</li>
              </ol>
            </nav>

            <div className="pp-badge">
              <span className="pp-badge-dot" />
              Privacy & Data
            </div>

            <h1 className="pp-h1">
              Your <span className="pp-gradient-text">Privacy</span> Matters
            </h1>
            <p className="pp-tagline">How We Protect Your Information</p>
            <p className="pp-desc">
              Welcome to the Mani Reader Privacy Policy. This page explains how Mani Reader collects, uses, protects, and manages information when you access and use our website. We are committed to providing a transparent and safe browsing experience.
            </p>

            {/* Trust badges */}
            <div className="pp-trust-row">
              {[
                { icon: '🔒', label: 'Zero Data Selling' },
                { icon: '🛡️', label: 'Privacy Focused' },
                { icon: '🍪', label: 'Cookie Transparent' },
              ].map(b => (
                <div key={b.label} className="pp-trust-badge">
                  <span className="pp-trust-icon">{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── POLICY SECTIONS ────────────────────────────────────── */}
        <section className="pp-section">
          <div className="pp-wrap pp-narrow">
            <FadeIn>
              <div className="pp-pill pp-pill--center">Privacy Policy</div>
              <h2 className="pp-h2 pp-h2--center">Detailed Privacy Information</h2>
            </FadeIn>

            <div className="pp-accs">

              <FadeIn delay={0}>
                <PolicyAccordion icon="🌐" title="1. About Mani Reader" defaultOpen>
                  <p>Mani Reader is an online manga reading platform focused on providing a cleaner and more convenient experience for manga readers.</p>
                  <p>The platform allows users to:</p>
                  <ul className="pp-list">
                    <li>Discover manga titles</li>
                    <li>Browse categories and genres</li>
                    <li>Search manga</li>
                    <li>Access reading features</li>
                    <li>Explore manga information</li>
                  </ul>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={60}>
                <PolicyAccordion icon="📋" title="2. Information We Collect">
                  <p><strong>Information Provided By Users</strong></p>
                  <p>Depending on available features, Mani Reader may collect information users voluntarily provide, such as:</p>
                  <ul className="pp-list">
                    <li>Name and email address</li>
                    <li>Account information</li>
                    <li>Messages submitted through contact forms</li>
                    <li>Feedback or support requests</li>
                  </ul>
                  <p>Users are not required to provide unnecessary personal information.</p>

                  <div className="pp-divider" />

                  <p><strong>Automatically Collected Information</strong></p>
                  <p>When users visit Mani Reader, some technical information may be collected automatically, including:</p>
                  <ul className="pp-list">
                    <li>IP address and browser type</li>
                    <li>Device information and operating system</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>General usage patterns</li>
                  </ul>
                  <p>This information helps improve website performance, security, user experience, and platform reliability.</p>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={100}>
                <PolicyAccordion icon="⚙️" title="3. How We Use Information">
                  <div className="pp-use-grid">
                    {[
                      { icon: '📈', title: 'Website Improvement', desc: 'Improve performance, fix technical issues, develop new features, and improve navigation.' },
                      { icon: '💬', title: 'User Support', desc: 'Respond to questions, handle support requests, address technical issues, and process feedback.' },
                      { icon: '🔐', title: 'Security', desc: 'Detect suspicious activity, prevent abuse, and protect website users from harmful interactions.' },
                    ].map(u => (
                      <div key={u.title} className="pp-use-card">
                        <span className="pp-use-icon">{u.icon}</span>
                        <div>
                          <p className="pp-use-title">{u.title}</p>
                          <p className="pp-use-desc">{u.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={140}>
                <PolicyAccordion icon="🍪" title="4. Cookies Policy">
                  <p>Cookies are small files stored on a user's device that help websites remember information and improve browsing experiences.</p>
                  <p><strong>How Mani Reader Uses Cookies</strong></p>
                  <ul className="pp-list">
                    <li>Website functionality and core features</li>
                    <li>Remembering user preferences</li>
                    <li>Analytics and performance improvements</li>
                  </ul>
                  <div className="pp-info-box">
                    <span className="pp-info-icon">ℹ️</span>
                    <span>Users can control or disable cookies through their browser settings. Disabling cookies may affect some website features.</span>
                  </div>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={180}>
                <PolicyAccordion icon="📊" title="5. Analytics">
                  <p>Mani Reader may use analytics services to understand how users interact with the website. Analytics may collect information such as:</p>
                  <ul className="pp-list">
                    <li>Visitor numbers and popular pages</li>
                    <li>Device types and browser information</li>
                    <li>General traffic patterns</li>
                  </ul>
                  <p>This information helps improve the platform for all users.</p>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={220}>
                <PolicyAccordion icon="🔌" title="6. Third-Party Services">
                  <p>Mani Reader may use third-party services for:</p>
                  <ul className="pp-list">
                    <li>Website infrastructure and hosting</li>
                    <li>Analytics services</li>
                    <li>Payment and support options</li>
                    <li>Content-related information sources</li>
                  </ul>
                  <p>These services have their own privacy policies. Mani Reader is not responsible for the privacy practices of external websites or services.</p>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={260}>
                <PolicyAccordion icon="💳" title="7. Payment Information">
                  <p>If users choose to support Mani Reader through payment services such as EasyPaisa or PayPal, payment processing is handled entirely by third-party providers.</p>
                  <div className="pp-info-box pp-info-box--green">
                    <span className="pp-info-icon">✅</span>
                    <span><strong>Mani Reader does not directly store</strong> sensitive payment information such as card numbers, banking credentials, or payment passwords.</span>
                  </div>
                  <p>Users should review the privacy policies of their chosen payment providers.</p>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={300}>
                <PolicyAccordion icon="🛡️" title="8. Data Protection">
                  <p>Mani Reader takes reasonable measures to protect user information from:</p>
                  <ul className="pp-list">
                    <li>Unauthorized access and misuse</li>
                    <li>Data loss or unnecessary exposure</li>
                  </ul>
                  <div className="pp-info-box">
                    <span className="pp-info-icon">⚠️</span>
                    <span>No online service can guarantee complete security. We encourage users to use strong passwords and safe browsing practices.</span>
                  </div>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={340}>
                <PolicyAccordion icon="👤" title="9. Your Privacy Rights">
                  <p>Users may have rights regarding their information, including:</p>
                  <ul className="pp-list">
                    <li>Requesting information about stored data</li>
                    <li>Requesting corrections to inaccurate data</li>
                    <li>Requesting deletion where applicable</li>
                    <li>Contacting Mani Reader about privacy concerns</li>
                  </ul>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={380}>
                <PolicyAccordion icon="👶" title="10. Children's Privacy">
                  <p>Mani Reader does not knowingly collect personal information from children without appropriate permission.</p>
                  <p>Users should follow applicable age requirements and local regulations when accessing online content.</p>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={420}>
                <PolicyAccordion icon="🔗" title="11. External Links">
                  <p>Mani Reader may contain links to external websites. These websites operate independently and may have different privacy policies, data practices, and terms of service.</p>
                  <p>Users should review third-party privacy policies before providing personal information to external services.</p>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={460}>
                <PolicyAccordion icon="🗂️" title="12. Data Retention">
                  <p>Mani Reader retains information only for as long as necessary for:</p>
                  <ul className="pp-list">
                    <li>Providing services and maintaining security</li>
                    <li>Improving the platform</li>
                    <li>Meeting legal requirements</li>
                  </ul>
                </PolicyAccordion>
              </FadeIn>

              <FadeIn delay={500}>
                <PolicyAccordion icon="🔄" title="13. Changes To This Privacy Policy">
                  <p>Mani Reader may update this Privacy Policy when website features change, legal requirements change, or privacy practices are updated.</p>
                  <p>Users are encouraged to review this page periodically to stay informed.</p>
                  <div className="pp-updated">
                    <span className="pp-updated-dot" />
                    Last reviewed: June 2026
                  </div>
                </PolicyAccordion>
              </FadeIn>

            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section className="pp-section pp-section--dark">
          <div className="pp-wrap pp-narrow">
            <FadeIn>
              <div className="pp-pill pp-pill--center">FAQ</div>
              <h2 className="pp-h2 pp-h2--center">Frequently Asked Questions</h2>
            </FadeIn>
            <div className="pp-faq-list">
              {faqs.map((f, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <FAQItem q={f.q} a={f.a} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── GEO BRAND BLOCK ───────────────────────────────────── */}
        <section className="pp-section">
          <div className="pp-wrap pp-narrow">
            <FadeIn>
              <div className="pp-geo-block">
                <div className="pp-geo-accent-bar" />
                <h2 className="pp-geo-h2">🌐 Mani Reader Privacy Information</h2>
                <div className="pp-geo-rows">
                  {[
                    ['Brand', 'Mani Reader'],
                    ['Category', 'Online Manga Reading Platform'],
                    ['Industry', 'Digital Entertainment'],
                    ['Data Purpose', 'Improving website functionality, security, and user experience.'],
                    ['Information Types', 'Account information, support messages, technical data, usage data.'],
                    ['Privacy Focus', 'Transparent data practices and responsible handling of user information.'],
                    ['Website', <a key="u" href="https://manireader.online" className="pp-geo-link">https://manireader.online</a>],
                  ].map(([dt, dd]) => (
                    <div key={dt} className="pp-geo-row">
                      <span className="pp-geo-dt">{dt}</span>
                      <span className="pp-geo-dd">{dd}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── CONTACT CTA ───────────────────────────────────────── */}
        <section className="pp-section pp-section--dark">
          <div className="pp-wrap">
            <FadeIn>
              <div className="pp-cta-block">
                <div className="pp-cta-icon">🔐</div>
                <h2 className="pp-cta-h2">Privacy Questions?</h2>
                <p className="pp-cta-p">
                  If you have questions about this Privacy Policy or how Mani Reader handles your information, our team is happy to help.
                </p>
                <Link href="/contact" className="pp-btn pp-btn--primary">Contact Us</Link>
                <p className="pp-cta-note">
                  Mani Reader provides a cleaner manga reading experience while respecting user privacy through transparent and responsible data practices.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── INTERNAL LINKS ────────────────────────────────────── */}
        <section className="pp-section">
          <div className="pp-wrap">
            <FadeIn>
              <h2 className="pp-h2 pp-h2--center" style={{ fontSize: '1.2rem' }}>Explore Mani Reader</h2>
              <div className="pp-int-links">
                {internalLinks.map(l => (
                  <Link key={l.href} href={l.href} className="pp-int-link">{l.label}</Link>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

      </div>

      <style jsx global>{`
        /* ── Base ──────────────────────────────────────────────── */
        .pp-page { min-height: 100vh; color: var(--text); font-family: var(--font-inter,'Inter',sans-serif); overflow-x: hidden; }
        .pp-wrap { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
        .pp-narrow { max-width: 820px; }
        .pp-section { padding: 72px 0; position: relative; }
        .pp-section--dark { background: rgba(113,3,186,0.04); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }

        /* ── HERO ──────────────────────────────────────────────── */
        .pp-hero { position: relative; padding: 120px 28px 60px; overflow: hidden; text-align: center; background: radial-gradient(ellipse 100% 90% at 50% -20%, rgba(113,3,186,0.18) 0%, transparent 65%); }
        .pp-hero-glow { position: absolute; border-radius: 50%; filter: blur(130px); pointer-events: none; opacity: 0.7; }
        .pp-hero-glow--l { width: 560px; height: 560px; background: rgba(113,3,186,0.22); top: -80px; left: -200px; }
        .pp-hero-glow--r { width: 480px; height: 480px; background: rgba(52,152,219,0.15); bottom: 0; right: -150px; }
        .pp-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(113,3,186,0.05) 1px,transparent 1px), linear-gradient(90deg,rgba(113,3,186,0.05) 1px,transparent 1px); background-size: 56px 56px; pointer-events: none; }

        .pp-hero-inner { position: relative; z-index: 2; max-width: 760px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; align-items: center; }

        .pp-bc ol { display: flex; gap: 8px; list-style: none; padding: 0; margin: 0 0 24px; font-size: 0.8rem; color: var(--text-3); }
        .pp-bc a { color: var(--accent); }
        .pp-bc a:hover { text-decoration: underline; }

        .pp-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.35); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
        .pp-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); animation: ppPulse 2s infinite; }
        @keyframes ppPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .pp-h1 { font-size: clamp(2.4rem, 5vw, 3.5rem); font-weight: 900; letter-spacing: -2px; line-height: 1.1; margin: 0 0 16px; }
        .pp-tagline { font-size: 1.2rem; font-weight: 700; color: var(--text-2); margin: 0 0 12px; }
        .pp-desc { font-size: 0.95rem; color: var(--text-3); line-height: 1.7; margin: 0 0 28px; max-width: 640px; }
        .pp-gradient-text { background: linear-gradient(135deg,var(--accent),#3498db); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }

        .pp-trust-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
        .pp-trust-badge { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 99px; font-size: 0.78rem; font-weight: 700; color: var(--text-2); }
        .pp-trust-icon { font-size: 1rem; }

        /* ── Pills & Typography ────────────────────────────────── */
        .pp-pill { display: inline-block; padding: 4px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.3); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
        .pp-pill--center { display: block; text-align: center; width: fit-content; margin-left: auto; margin-right: auto; }
        .pp-h2 { font-size: clamp(1.8rem,3.5vw,2.5rem); font-weight: 900; letter-spacing: -1px; color: var(--text); margin: 0 0 32px; line-height: 1.15; }
        .pp-h2--center { text-align: center; }

        /* ── ACCORDIONS ────────────────────────────────────────── */
        .pp-accs { display: flex; flex-direction: column; gap: 14px; }
        .pp-acc { background: var(--surface-2); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: border-color 0.25s, box-shadow 0.25s; }
        .pp-acc:hover { border-color: rgba(113,3,186,0.3); }
        .pp-acc--open { border-color: rgba(113,3,186,0.4); box-shadow: 0 12px 36px rgba(0,0,0,0.3); }

        .pp-acc-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 22px; background: none; border: none; cursor: pointer; font-family: inherit; transition: background 0.2s; }
        .pp-acc-btn:hover { background: rgba(113,3,186,0.04); }
        .pp-acc--open .pp-acc-btn { border-bottom: 1px solid var(--border); }

        .pp-acc-title-row { display: flex; align-items: center; gap: 10px; font-size: 1rem; font-weight: 800; color: #fff; }
        .pp-acc--open .pp-acc-title-row { color: var(--accent); }
        .pp-acc-icon { font-size: 1.15rem; }
        .pp-acc-chevron { color: var(--text-3); flex-shrink: 0; transition: transform 0.25s, color 0.2s; }
        .pp-acc--open .pp-acc-chevron { transform: rotate(180deg); color: var(--accent); }

        .pp-acc-body { padding: 22px; animation: ppSlide 0.2s ease; }
        .pp-acc-body p { font-size: 0.93rem; color: var(--text-2); line-height: 1.75; margin: 0 0 14px; }
        .pp-acc-body p:last-child { margin-bottom: 0; }
        .pp-acc-body strong { color: var(--text); }
        .pp-list { padding-left: 18px; margin: 0 0 14px; display: flex; flex-direction: column; gap: 5px; }
        .pp-list li { font-size: 0.9rem; color: var(--text-2); line-height: 1.6; }
        .pp-divider { height: 1px; background: var(--border); margin: 16px 0; }

        .pp-info-box { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; background: rgba(113,3,186,0.08); border: 1px solid rgba(113,3,186,0.2); border-radius: 10px; margin-top: 12px; font-size: 0.88rem; color: var(--text-2); line-height: 1.6; }
        .pp-info-box--green { background: rgba(34,197,94,0.07); border-color: rgba(34,197,94,0.2); }
        .pp-info-icon { flex-shrink: 0; font-size: 1rem; }

        .pp-use-grid { display: flex; flex-direction: column; gap: 12px; }
        .pp-use-card { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; }
        .pp-use-icon { font-size: 1.4rem; flex-shrink: 0; }
        .pp-use-title { font-size: 0.9rem; font-weight: 800; color: var(--text); margin: 0 0 4px; }
        .pp-use-desc { font-size: 0.85rem; color: var(--text-2); margin: 0; line-height: 1.55; }

        .pp-updated { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 0.8rem; color: var(--text-3); }
        .pp-updated-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }

        @keyframes ppSlide { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:none} }

        /* ── FAQ ───────────────────────────────────────────────── */
        .pp-faq-list { display: flex; flex-direction: column; gap: 10px; }
        .pp-faq { background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
        .pp-faq:hover { border-color: rgba(113,3,186,0.4); }
        .pp-faq--open { border-color: rgba(113,3,186,0.5); box-shadow: 0 4px 20px rgba(113,3,186,0.1); }
        .pp-faq-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; background: none; border: none; cursor: pointer; text-align: left; font-family: inherit; font-size: 0.92rem; font-weight: 600; color: var(--text); }
        .pp-faq-btn:hover { background: rgba(113,3,186,0.06); }
        .pp-faq--open .pp-faq-btn { color: var(--accent); }
        .pp-faq-chevron { flex-shrink: 0; color: var(--text-3); transition: transform 0.25s, color 0.2s; }
        .pp-faq--open .pp-faq-chevron { transform: rotate(180deg); color: var(--accent); }
        .pp-faq-body { border-top: 1px solid var(--border); padding: 16px 20px 20px; animation: ppSlide 0.2s ease; }
        .pp-faq-body p { font-size: 0.9rem; color: var(--text-2); line-height: 1.7; margin: 0; }

        /* ── GEO ───────────────────────────────────────────────── */
        .pp-geo-block { background: var(--surface-2); border: 1px solid rgba(113,3,186,0.3); border-radius: 20px; padding: 40px; position: relative; overflow: hidden; }
        .pp-geo-accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg,var(--accent),#3498db); }
        .pp-geo-h2 { font-size: 1.1rem; font-weight: 800; color: var(--text); margin: 0 0 22px; }
        .pp-geo-rows { display: flex; flex-direction: column; }
        .pp-geo-row { display: grid; grid-template-columns: 200px 1fr; gap: 20px; padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: baseline; }
        .pp-geo-row:last-child { border-bottom: none; padding-bottom: 0; }
        .pp-geo-dt { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-3); }
        .pp-geo-dd { font-size: 0.88rem; color: var(--text-2); }
        .pp-geo-link { color: var(--accent); text-decoration: none; }
        .pp-geo-link:hover { text-decoration: underline; }

        /* ── CTA ───────────────────────────────────────────────── */
        .pp-cta-block { text-align: center; max-width: 600px; margin: 0 auto; }
        .pp-cta-icon { font-size: 3rem; margin-bottom: 16px; }
        .pp-cta-h2 { font-size: clamp(1.8rem,3vw,2.4rem); font-weight: 900; color: var(--text); margin: 0 0 12px; letter-spacing: -1px; }
        .pp-cta-p { font-size: 0.95rem; color: var(--text-2); line-height: 1.7; margin: 0 0 28px; }
        .pp-cta-note { font-size: 0.8rem; color: var(--text-3); margin-top: 24px; line-height: 1.6; font-style: italic; }
        .pp-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 12px; font-size: 0.92rem; font-weight: 700; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .pp-btn--primary { background: var(--accent); color: #fff; box-shadow: 0 8px 24px rgba(113,3,186,0.4); }
        .pp-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(113,3,186,0.55); }

        /* ── Internal Links ────────────────────────────────────── */
        .pp-int-links { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 16px; }
        .pp-int-link { padding: 8px 18px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 99px; font-size: 0.84rem; font-weight: 500; color: var(--text-2); text-decoration: none; transition: all 0.2s; }
        .pp-int-link:hover { border-color: var(--accent); color: var(--accent); background: rgba(113,3,186,0.08); transform: translateY(-1px); }

        /* ── Responsive ────────────────────────────────────────── */
        @media (max-width: 768px) {
          .pp-geo-row { grid-template-columns: 1fr; gap: 3px; }
          .pp-geo-dt { padding-top: 8px; }
          .pp-acc-btn { padding: 15px 18px; }
          .pp-acc-body { padding: 18px; }
          .pp-trust-row { gap: 10px; }
        }
        @media (max-width: 640px) {
          .pp-hero { padding-top: 100px; }
          .pp-h1 { font-size: 2.1rem; letter-spacing: -1px; }
        }
      `}</style>
    </>
  );
}
