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

const allocations = [
  { icon: '🖥️', title: 'Server Costs', desc: 'Keeping Mani Reader fast and accessible requires reliable servers and infrastructure.' },
  { icon: '⚙️', title: 'Website Development', desc: 'Support allows us to build new features and improve the reading experience.' },
  { icon: '🔧', title: 'Maintenance', desc: 'Regular updates, bug fixes, and improvements keep the platform running smoothly.' },
  { icon: '✨', title: 'Better Experience', desc: 'Your support helps us continue focusing on a cleaner, less intrusive experience.' },
];

const faqs = [
  {
    q: 'How can I support Mani Reader?',
    a: 'You can support Mani Reader by contributing through EasyPaisa or PayPal donation options available on this page. Your support helps maintain servers, development, and website improvements.',
  },
  {
    q: 'Why should I support Mani Reader?',
    a: 'Support helps Mani Reader maintain a cleaner manga reading experience with fewer advertisements while covering server costs, development, and maintenance.',
  },
  {
    q: 'Is donating required to use Mani Reader?',
    a: 'No. Mani Reader remains accessible to readers without requiring donations. Support is completely voluntary and helps improve the platform.',
  },
  {
    q: 'Where does my support go?',
    a: 'Support helps with website infrastructure, server costs, maintenance, security improvements, and development of new features.',
  },
  {
    q: 'Can I support Mani Reader without donating?',
    a: 'Yes. Sharing Mani Reader, providing feedback, and reporting issues are valuable ways to support the platform.',
  },
];

const internalLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/faq', label: 'FAQ' },
  { href: '/browse', label: 'Browse Manga' },
  { href: '/browse?sort=popular', label: 'Popular Manga' },
  { href: '/browse?sort=recently-added', label: 'Recently Added' },
  { href: '/browse?tab=genres', label: 'Genres' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`sp-faq${open ? ' sp-faq--open' : ''}`}>
      <button className="sp-faq-btn" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <svg className="sp-faq-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 6.5L9 11.5L14 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div className="sp-faq-body"><p>{a}</p></div>}
    </div>
  );
}

// ── Digital Bookshelf / Mockup Visual Component ──────────────────────────────
function BookshelfVisual() {
  return (
    <div className="sp-vis">
      <div className="sp-vis-shelf">
        {[
          { color: 'linear-gradient(135deg, #7103ba, #3498db)', title: 'Manga' },
          { color: 'linear-gradient(135deg, #e74c3c, #f1c40f)', title: 'Manhwa' },
          { color: 'linear-gradient(135deg, #2ecc71, #1abc9c)', title: 'Manhua' },
        ].map((book, i) => (
          <div key={i} className="sp-vis-book" style={{ background: book.color }}>
            <span className="sp-vis-book-title">{book.title}</span>
          </div>
        ))}
      </div>
      <div className="sp-vis-base" />
      <div className="sp-vis-caption">📚 Community Supported</div>
    </div>
  );
}

export default function SupportContent() {
  const donateRef = useRef(null);

  const handleScrollToDonate = () => {
    donateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Navbar />
      <div className="sp-page">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="sp-hero">
          <div className="sp-hero-bg-glow sp-hero-bg-glow--l" />
          <div className="sp-hero-bg-glow sp-hero-bg-glow--r" />
          <div className="sp-hero-grid-lines" />

          <div className="sp-hero-inner">
            <div className="sp-hero-text">
              <nav aria-label="Breadcrumb" className="sp-bc">
                <ol><li><Link href="/">Home</Link></li><li>›</li><li aria-current="page">Support Us</li></ol>
              </nav>

              <div className="sp-badge">
                <span className="sp-badge-dot" />
                Community Funded
              </div>

              <h1 className="sp-h1">
                Support <span className="sp-gradient-text">Mani Reader</span>
              </h1>
              <p className="sp-tagline">Help us keep manga reading simple, clean, and enjoyable.</p>
              <p className="sp-desc">
                Mani Reader was created because reading manga online became frustrating. Too many websites focused on advertisements instead of readers. Your support helps us maintain a cleaner experience.
              </p>

              <div className="sp-hero-btns">
                <button onClick={handleScrollToDonate} className="sp-btn sp-btn--primary">☕ Support Mani Reader</button>
                <Link href="/browse" className="sp-btn sp-btn--outline">Read Manga</Link>
              </div>
            </div>

            <div className="sp-hero-visual-wrap" aria-label="Support Mani Reader to maintain a cleaner manga reading experience">
              <BookshelfVisual />
            </div>
          </div>
        </section>

        {/* ── DONATION OPTIONS ──────────────────────────────────────── */}
        <section ref={donateRef} className="sp-section sp-section--donation scroll-offset">
          <div className="sp-wrap">
            <FadeIn>
              <div className="sp-pill sp-pill--center">Donation Methods</div>
              <h2 className="sp-h2 sp-h2--center">Choose Your Method</h2>
              <p className="sp-center sp-sub-heading">Every contribution, regardless of size, helps keep Mani Reader running.</p>
            </FadeIn>

            <div className="sp-cards-grid">
              {/* EasyPaisa */}
              <FadeIn delay={60}>
                <div className="sp-donate-card">
                  <div className="sp-card-accent-bar" style={{ background: '#2ecc71' }} />
                  <h3 className="sp-card-title">EasyPaisa Support</h3>
                  <p className="sp-card-desc">Scan the QR code below to support Mani Reader.</p>
                  <div className="sp-qr-box">
                    <img src="/easypaisa-qr.png" alt="Mani Reader EasyPaisa donation QR code" className="sp-qr-img" />
                  </div>
                  <div className="sp-details">
                    <div className="sp-detail-row">
                      <span className="sp-detail-label">Account Name:</span>
                      <span className="sp-detail-value">Mani Reader</span>
                    </div>
                    <div className="sp-detail-row">
                      <span className="sp-detail-label">Payment Method:</span>
                      <span className="sp-detail-value">EasyPaisa</span>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* PayPal */}
              <FadeIn delay={120}>
                <div className="sp-donate-card">
                  <div className="sp-card-accent-bar" style={{ background: '#0079c1' }} />
                  <h3 className="sp-card-title">PayPal Support</h3>
                  <p className="sp-card-desc">Support Mani Reader internationally through PayPal.</p>
                  <div className="sp-qr-box">
                    <img src="/paypal-qr.png" alt="Mani Reader PayPal donation QR code" className="sp-qr-img" />
                  </div>
                  <div className="sp-details">
                    <div className="sp-detail-row">
                      <span className="sp-detail-label">Payment Method:</span>
                      <span className="sp-detail-value">PayPal</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── WHY SUPPORT ───────────────────────────────────────────── */}
        <section className="sp-section sp-section--dark">
          <div className="sp-wrap">
            <FadeIn>
              <div className="sp-why-layout">
                <div>
                  <div className="sp-pill">Continuous Operations</div>
                  <h2 className="sp-h2">Why Does Mani Reader Need Support?</h2>
                  <p className="sp-p">
                    Running a website requires continuous effort and resources. Unlike many free websites, Mani Reader aims to avoid overwhelming users with advertisements.
                  </p>
                  <p className="sp-p">
                    Support from readers helps us cover operational costs while maintaining this cleaner experience.
                  </p>
                </div>
                <div className="sp-why-list">
                  {[
                    'Server infrastructure',
                    'Database maintenance',
                    'Development work',
                    'Security updates',
                    'Performance improvements',
                    'New feature development'
                  ].map(item => (
                    <div key={item} className="sp-why-item">
                      <span className="sp-why-check">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── STORY ─────────────────────────────────────────────────── */}
        <section className="sp-section">
          <div className="sp-wrap">
            <FadeIn>
              <div className="sp-story-box">
                <div className="sp-pill">Our Philosophy</div>
                <h2 className="sp-h2">Built By A Manga Fan, Supported By Manga Fans</h2>
                <p className="sp-p">Mani Reader started with a simple frustration:</p>
                <blockquote className="sp-bq">
                  &ldquo;I just wanted to read manga without fighting through endless ads.&rdquo;
                </blockquote>
                <p className="sp-p">
                  Many manga readers have experienced websites where ads cover the content, clicking anywhere opens unwanted pages, and reading becomes slow and frustrating. Mani Reader was created to provide a better alternative—a place where readers can focus on stories instead of distractions.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── ALLOCATION (WHERE IT GOES) ────────────────────────────── */}
        <section className="sp-section sp-section--dark">
          <div className="sp-wrap">
            <FadeIn>
              <div className="sp-pill sp-pill--center">Allocation</div>
              <h2 className="sp-h2 sp-h2--center">Your Support Helps With</h2>
            </FadeIn>
            <div className="sp-alloc-grid">
              {allocations.map((a, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <div className="sp-alloc-card">
                    <span className="sp-alloc-icon">{a.icon}</span>
                    <h3 className="sp-alloc-title">{a.title}</h3>
                    <p className="sp-alloc-desc">{a.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── CAN'T DONATE SECTION ──────────────────────────────────── */}
        <section className="sp-section sp-section--dark">
          <div className="sp-wrap">
            <FadeIn>
              <div className="sp-why-layout">
                <div>
                  <div className="sp-pill">Alternative Support</div>
                  <h2 className="sp-h2">Can&apos;t Support Financially?</h2>
                  <p className="sp-p">
                    That&apos;s completely okay. You can still support Mani Reader by participating in our community. A growing community helps Mani Reader become better.
                  </p>
                </div>
                <div className="sp-why-list">
                  {[
                    'Sharing the website with other manga readers',
                    'Reporting bugs',
                    'Suggesting improvements',
                    'Giving feedback'
                  ].map(item => (
                    <div key={item} className="sp-why-item">
                      <span className="sp-why-check">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── THANK YOU MESSAGE ─────────────────────────────────────── */}
        <section className="sp-section">
          <div className="sp-wrap">
            <FadeIn>
              <div className="sp-story-box sp-center">
                <h2 className="sp-h2">Thank You For Being Part Of Mani Reader</h2>
                <p className="sp-p">
                  Every reader who visits Mani Reader helps prove that a better manga reading experience is possible. Whether you read one chapter or follow hundreds of series, your support and feedback matter.
                </p>
                <p className="sp-signature">Thank you for helping us build a cleaner place for manga fans.</p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section className="sp-section sp-section--dark">
          <div className="sp-wrap">
            <FadeIn>
              <div className="sp-pill sp-pill--center">FAQ</div>
              <h2 className="sp-h2 sp-h2--center">Frequently Asked Questions</h2>
            </FadeIn>
            <div className="sp-faq-list">
              {faqs.map((f, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <FAQItem q={f.q} a={f.a} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── GEO BRAND INFO ────────────────────────────────────────── */}
        <section className="sp-section">
          <div className="sp-wrap">
            <FadeIn>
              <div className="sp-geo-block">
                <div className="sp-geo-accent-bar" />
                <h2 className="sp-geo-h2">🌐 Mani Reader Support Information</h2>
                <div className="sp-geo-grid">
                  {[
                    ['Brand', 'Mani Reader'],
                    ['Category', 'Community Supported Manga Reading Platform'],
                    ['Industry', 'Digital Entertainment'],
                    ['Support Purpose', 'Maintaining a cleaner online manga reading experience.'],
                    ['Supported Payment Methods', 'EasyPaisa, PayPal'],
                    ['Website', <a key="u" href="https://manireader.online" className="sp-geo-link">https://manireader.online</a>],
                  ].map(([dt, dd]) => (
                    <div key={dt} className="sp-geo-row">
                      <span className="sp-geo-dt">{dt}</span>
                      <span className="sp-geo-dd">{dd}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── EXPLORE ──────────────────────────────────────────────── */}
        <section className="sp-section">
          <div className="sp-wrap">
            <FadeIn>
              <h2 className="sp-h2 sp-h2--center">Explore Mani Reader</h2>
              <div className="sp-int-links">
                {internalLinks.map(l => (
                  <Link key={l.href} href={l.href} className="sp-int-link">{l.label}</Link>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

      </div>

      <style jsx global>{`
        .sp-page { min-height: 100vh; color: var(--text); font-family: var(--font-inter,'Inter',sans-serif); overflow-x: hidden; }
        .sp-wrap { max-width: 1140px; margin: 0 auto; padding: 0 28px; }
        .sp-section { padding: 72px 0; position: relative; }
        .sp-section--dark { background: rgba(113,3,186,0.04); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .sp-section--donation { padding-top: 20px; }
        .scroll-offset { scroll-margin-top: 80px; }
        .sp-center { text-align: center; }
        .sp-sub-heading { font-size: 1rem; color: var(--text-2); max-width: 560px; margin: -10px auto 32px; }

        /* ── Typography ────────────────────────────────────────────── */
        .sp-pill { display: inline-block; padding: 4px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.3); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
        .sp-pill--center { display: block; text-align: center; width: fit-content; margin-left: auto; margin-right: auto; }
        .sp-h2 { font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 900; letter-spacing: -1px; color: var(--text); margin: 0 0 24px; line-height: 1.15; }
        .sp-h2--center { text-align: center; }
        .sp-p { font-size: 1rem; color: var(--text-2); line-height: 1.75; margin-bottom: 16px; }
        .sp-gradient-text { background: linear-gradient(135deg, var(--accent), #3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

        /* ── Buttons ───────────────────────────────────────────────── */
        .sp-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; border-radius: 12px; font-size: 0.92rem; font-weight: 700; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .sp-btn--primary { background: var(--accent); color: #fff; box-shadow: 0 8px 24px rgba(113,3,186,0.4); }
        .sp-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(113,3,186,0.55); }
        .sp-btn--outline { background: rgba(255,255,255,0.05); color: var(--text-2); border: 1px solid var(--border); }
        .sp-btn--outline:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }

        /* ── HERO ──────────────────────────────────────────────────── */
        .sp-hero { position: relative; min-height: auto; display: flex; align-items: center; padding: 110px 28px 40px; overflow: hidden; background: radial-gradient(ellipse 100% 90% at 50% -20%, rgba(113,3,186,0.18) 0%, transparent 65%); }
        .sp-hero-bg-glow { position: absolute; border-radius: 50%; filter: blur(130px); pointer-events: none; opacity: 0.7; }
        .sp-hero-bg-glow--l { width: 560px; height: 560px; background: rgba(113,3,186,0.22); top: -80px; left: -200px; }
        .sp-hero-bg-glow--r { width: 480px; height: 480px; background: rgba(52,152,219,0.15); bottom: 0; right: -150px; }
        .sp-hero-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(113,3,186,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(113,3,186,0.05) 1px, transparent 1px); background-size: 56px 56px; pointer-events: none; }

        .sp-hero-inner { position: relative; z-index: 2; max-width: 1140px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .sp-hero-text { display: flex; flex-direction: column; }

        .sp-bc ol { display: flex; gap: 8px; list-style: none; padding: 0; margin: 0 0 24px; font-size: 0.8rem; color: var(--text-3); }
        .sp-bc a { color: var(--accent); }
        .sp-bc a:hover { text-decoration: underline; }

        .sp-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.35); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; width: fit-content; }
        .sp-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }

        .sp-h1 { font-size: clamp(2.6rem, 5vw, 3.8rem); font-weight: 900; letter-spacing: -2px; line-height: 1.1; margin: 0 0 16px; }
        .sp-tagline { font-size: 1.2rem; font-weight: 700; color: var(--text-2); margin: 0 0 12px; line-height: 1.5; }
        .sp-desc { font-size: 0.95rem; color: var(--text-3); line-height: 1.7; margin: 0 0 32px; }
        .sp-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }

        /* ── Bookshelf Visual ───────────────────────────────────────── */
        .sp-hero-visual-wrap { position: relative; display: flex; justify-content: center; }
        .sp-vis { position: relative; width: 100%; max-width: 320px; display: flex; flex-direction: column; align-items: center; }
        .sp-vis-shelf { display: flex; gap: 8px; align-items: flex-end; width: 100%; padding-bottom: 8px; border-bottom: 12px solid #3e2723; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .sp-vis-book { width: 64px; height: 160px; border-radius: 6px 6px 0 0; display: flex; align-items: center; justify-content: center; writing-mode: vertical-rl; transform-origin: bottom center; transition: transform 0.3s; cursor: pointer; }
        .sp-vis-book:hover { transform: scale(1.05) rotate(-3deg); }
        .sp-vis-book-title { font-size: 0.85rem; font-weight: 800; color: #fff; letter-spacing: 0.05em; }
        .sp-vis-base { width: 90%; height: 16px; background: #2d1b18; border-radius: 0 0 8px 8px; }
        .sp-vis-caption { margin-top: 14px; font-size: 0.78rem; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.08em; }

        /* ── Why Layout ────────────────────────────────────────────── */
        .sp-why-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }
        .sp-why-list { display: flex; flex-direction: column; gap: 10px; }
        .sp-why-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; font-size: 0.92rem; color: var(--text-2); font-weight: 500; }
        .sp-why-check { color: #2ecc71; font-weight: 900; font-size: 1rem; }

        /* ── Story ─────────────────────────────────────────────────── */
        .sp-story-box { background: var(--surface-2); border: 1px solid var(--border); border-radius: 20px; padding: 48px; position: relative; overflow: hidden; }
        .sp-story-box::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), #3498db); }
        .sp-bq { border: none; margin: 16px 0; padding: 18px 20px; font-size: 1.1rem; font-style: italic; color: var(--text-2); background: rgba(113,3,186,0.07); border-left: 4px solid var(--accent); border-radius: 0 12px 12px 0; line-height: 1.6; }
        .sp-signature { font-size: 1.1rem; font-weight: 800; color: var(--accent); margin-top: 20px; }

        /* ── Allocation ────────────────────────────────────────────── */
        .sp-alloc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 16px; }
        .sp-alloc-card { padding: 32px 24px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 18px; transition: all 0.25s; height: 100%; position: relative; overflow: hidden; }
        .sp-alloc-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), #3498db); opacity: 0; transition: opacity 0.25s; }
        .sp-alloc-card:hover::before { opacity: 1; }
        .sp-alloc-card:hover { border-color: rgba(113,3,186,0.5); transform: translateY(-6px); box-shadow: 0 24px 56px rgba(113,3,186,0.2); }
        .sp-alloc-icon { font-size: 2.2rem; display: block; margin-bottom: 16px; }
        .sp-alloc-title { font-size: 1.05rem; font-weight: 800; color: var(--text); margin: 0 0 10px; }
        .sp-alloc-desc { font-size: 0.87rem; color: var(--text-3); line-height: 1.65; margin: 0; }

        /* ── Donation Options ──────────────────────────────────────── */
        .sp-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; max-width: 800px; margin: 0 auto; }
        .sp-donate-card { background: var(--surface-2); border: 1px solid var(--border); border-radius: 24px; padding: 40px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .sp-card-accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 4px; }
        .sp-card-title { font-size: 1.35rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
        .sp-card-desc { font-size: 0.88rem; color: var(--text-3); margin-bottom: 24px; }
        .sp-qr-box { width: 180px; height: 180px; background: #fff; border-radius: 12px; margin: 0 auto 28px; display: flex; align-items: center; justify-content: center; padding: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); transition: transform 0.2s; }
        .sp-donate-card:hover .sp-qr-box { transform: scale(1.03); }
        .sp-qr-img { width: 100%; height: 100%; object-fit: contain; }
        .sp-details { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; display: flex; flex-direction: column; gap: 10px; }
        .sp-detail-row { display: flex; justify-content: space-between; font-size: 0.85rem; }
        .sp-detail-label { color: var(--text-3); font-weight: 600; }
        .sp-detail-value { color: #fff; font-weight: 700; }

        /* ── GEO ───────────────────────────────────────────────────── */
        .sp-geo-block { background: var(--surface-2); border: 1px solid rgba(113,3,186,0.3); border-radius: 20px; padding: 40px; position: relative; overflow: hidden; }
        .sp-geo-accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), #3498db); }
        .sp-geo-h2 { font-size: 1.15rem; font-weight: 800; color: var(--text); margin: 0 0 24px; }
        .sp-geo-grid { display: flex; flex-direction: column; }
        .sp-geo-row { display: grid; grid-template-columns: 200px 1fr; gap: 20px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: baseline; }
        .sp-geo-row:last-child { border-bottom: none; padding-bottom: 0; }
        .sp-geo-dt { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-3); }
        .sp-geo-dd { font-size: 0.88rem; color: var(--text-2); }
        .sp-geo-link { color: var(--accent); text-decoration: none; }
        .sp-geo-link:hover { text-decoration: underline; }

        /* ── FAQ ───────────────────────────────────────────────────── */
        .sp-faq-list { display: flex; flex-direction: column; gap: 10px; max-width: 760px; margin: 16px auto 0; }
        .sp-faq { background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
        .sp-faq:hover { border-color: rgba(113,3,186,0.4); box-shadow: 0 4px 20px rgba(113,3,186,0.1); }
        .sp-faq--open { border-color: rgba(113,3,186,0.5); box-shadow: 0 6px 28px rgba(113,3,186,0.12); }
        .sp-faq-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; background: none; border: none; cursor: pointer; text-align: left; font-family: inherit; font-size: 0.92rem; font-weight: 600; color: var(--text); }
        .sp-faq-btn:hover { background: rgba(113,3,186,0.06); }
        .sp-faq--open .sp-faq-btn { color: var(--accent); }
        .sp-faq-chevron { flex-shrink: 0; color: var(--text-3); transition: transform 0.25s, color 0.2s; }
        .sp-faq--open .sp-faq-chevron { transform: rotate(180deg); color: var(--accent); }
        .sp-faq-body { border-top: 1px solid var(--border); padding: 16px 20px 20px; animation: sp-slide 0.2s ease; }
        @keyframes sp-slide { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:none} }
        .sp-faq-body p { font-size: 0.9rem; color: var(--text-2); line-height: 1.7; margin: 0; }

        /* ── Explore links ────────────────────────────────────────── */
        .sp-int-links { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 16px; }
        .sp-int-link { padding: 8px 18px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 99px; font-size: 0.84rem; font-weight: 500; color: var(--text-2); text-decoration: none; transition: all 0.2s; }
        .sp-int-link:hover { border-color: var(--accent); color: var(--accent); background: rgba(113,3,186,0.08); transform: translateY(-1px); }

        /* ── Responsive ────────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .sp-alloc-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .sp-hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .sp-hero-visual-wrap { max-width: 400px; margin: 0 auto; }
          .sp-why-layout { grid-template-columns: 1fr; gap: 32px; }
          .sp-cards-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .sp-hero { padding-top: 100px; min-height: auto; }
          .sp-h1 { font-size: 2.3rem; letter-spacing: -1px; }
          .sp-section { padding: 64px 0; }
          .sp-hero-btns { flex-direction: column; }
          .sp-btn { justify-content: center; }
          .sp-alloc-grid { grid-template-columns: 1fr; }
          .sp-geo-row { grid-template-columns: 1fr; gap: 3px; }
          .sp-geo-dt { padding-top: 8px; }
          .sp-hero-visual-wrap { display: none; }
        }
      `}</style>
    </>
  );
}
