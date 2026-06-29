'use client';

import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useState, useEffect, useRef } from 'react';

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

const contactOptions = [
  { icon: '💬', title: 'General Support', desc: 'Questions about Mani Reader, features, navigation, or website usage.' },
  { icon: '💡', title: 'Feedback & Suggestions', desc: 'Share ideas that can help improve the Mani Reader experience.' },
  { icon: '⚙️', title: 'Technical Support', desc: 'Report problems related to loading, reading, accounts, or website functionality.' },
  { icon: '©', title: 'Copyright Requests', desc: 'Contact us regarding copyright-related questions or content concerns.' },
];

const faqs = [
  {
    q: 'How can I contact Mani Reader?',
    a: 'You can contact Mani Reader through the contact form on this page for support questions, feedback, suggestions, technical issues, and other website-related concerns.',
  },
  {
    q: 'How long does Mani Reader take to respond?',
    a: 'Response times may vary depending on message volume and the type of request. Technical issues and important concerns are reviewed as soon as possible.',
  },
  {
    q: 'Can I report a website issue?',
    a: 'Yes. Users can report technical issues such as broken pages, loading problems, or reading difficulties through the Mani Reader contact form.',
  },
  {
    q: 'How can I request copyright-related action?',
    a: 'Copyright owners can contact Mani Reader through official communication channels regarding content concerns or removal requests.',
  },
];

const internalLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/faq', label: 'FAQ' },
  { href: '/support', label: 'Support' },
  { href: '/browse', label: 'Browse Manga' },
  { href: '/browse?sort=popular', label: 'Popular Manga' },
  { href: '/browse?sort=recently-added', label: 'Recently Added' },
  { href: '/browse?tab=genres', label: 'Genres' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/dmca', label: 'DMCA Policy' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`co-faq${open ? ' co-faq--open' : ''}`}>
      <button className="co-faq-btn" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <svg className="co-faq-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 6.5L9 11.5L14 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div className="co-faq-body"><p>{a}</p></div>}
    </div>
  );
}

// ── Speech Bubbles Visual Component ───────────────────────────────────────────
function SpeechBubbleVisual() {
  return (
    <div className="co-vis">
      <div className="co-vis-bubble co-vis-bubble--left">
        <div className="co-vis-bubble-text">Any suggestions for the reader?</div>
        <div className="co-vis-bubble-arrow" />
      </div>
      <div className="co-vis-bubble co-vis-bubble--right">
        <div className="co-vis-bubble-text">Yes! Love the dark mode and minimal ads. Keep it up! ✨</div>
        <div className="co-vis-bubble-arrow" />
      </div>
      <div className="co-vis-bubble co-vis-bubble--left co-vis-bubble--sub">
        <div className="co-vis-bubble-text">Awesome, thank you for supporting a clean experience! ☕</div>
        <div className="co-vis-bubble-arrow" />
      </div>
      <div className="co-vis-bg-circle" />
    </div>
  );
}

export default function ContactContent() {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Question', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <div className="co-page">

        {/* ─────────────────── HERO ─────────────────────────────────── */}
        <section className="co-hero">
          <div className="co-hero-bg-glow co-hero-bg-glow--l" />
          <div className="co-hero-bg-glow co-hero-bg-glow--r" />
          <div className="co-hero-grid-lines" />

          <div className="co-hero-inner">
            <div className="co-hero-text">
              <nav aria-label="Breadcrumb" className="co-bc">
                <ol><li><Link href="/">Home</Link></li><li>›</li><li aria-current="page">Contact</li></ol>
              </nav>

              <div className="co-badge">
                <span className="co-badge-dot" />
                Support Center
              </div>

              <h1 className="co-h1">
                Contact <span className="co-gradient-text">Mani Reader</span>
              </h1>
              <p className="co-tagline">Have a question, suggestion, or issue? We would like to hear from you.</p>
              <p className="co-desc">
                Whether you need help with the website, want to share feedback, report an issue, or contact us regarding content concerns, you can reach the Mani Reader team here.
              </p>

              <div className="co-hero-btns">
                <button onClick={handleScrollToForm} className="co-btn co-btn--primary">Send Message</button>
                <Link href="/support" className="co-btn co-btn--outline">☕ Support Us</Link>
              </div>
            </div>

            <div className="co-hero-visual-wrap" aria-label="Mani Reader contact page illustration for manga reader support">
              <SpeechBubbleVisual />
            </div>
          </div>
        </section>

        {/* ─────────────────── OPTIONS ──────────────────────────────── */}
        <section className="co-section co-section--dark">
          <div className="co-wrap">
            <FadeIn>
              <div className="co-pill co-pill--center">How Can We Help?</div>
              <h2 className="co-h2 co-h2--center">Contact Options</h2>
            </FadeIn>
            <div className="co-opts-grid">
              {contactOptions.map((opt, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <div className="co-opt-card">
                    <span className="co-opt-icon">{opt.icon}</span>
                    <h3 className="co-opt-title">{opt.title}</h3>
                    <p className="co-opt-desc">{opt.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────── CONTACT FORM ─────────────────────────── */}
        <section ref={formRef} className="co-section scroll-offset">
          <div className="co-wrap co-form-wrap">
            <FadeIn>
              <div className="co-form-box">
                <h2 className="co-h2 co-center">Send Us A Message</h2>
                {submitted ? (
                  <div className="co-success">
                    <div className="co-success-icon">✓</div>
                    <h3 className="co-success-title">Message Sent Successfully</h3>
                    <p className="co-success-desc">
                      Thank you for contacting Mani Reader. Your message has been received. We will review it and respond if necessary.
                    </p>
                    <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: 'General Question', message: '' }); }} className="co-btn co-btn--outline">
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="co-form" onSubmit={handleSubmit}>
                    <div className="co-form-row">
                      <div className="co-form-group">
                        <label htmlFor="co-name">Name</label>
                        <input
                          id="co-name"
                          type="text"
                          placeholder="Your name"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="co-form-group">
                        <label htmlFor="co-email">Email</label>
                        <input
                          id="co-email"
                          type="email"
                          placeholder="your@email.com"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="co-form-group">
                      <label htmlFor="co-subject">Subject</label>
                      <div className="co-select-wrap">
                        <select
                          id="co-subject"
                          required
                          value={formData.subject}
                          onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        >
                          <option value="General Question">General Question</option>
                          <option value="Technical Issue">Technical Issue</option>
                          <option value="Feedback">Feedback</option>
                          <option value="Suggestion">Suggestion</option>
                          <option value="Copyright Concern">Copyright Concern</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="co-form-group">
                      <label htmlFor="co-message">Message</label>
                      <textarea
                        id="co-message"
                        rows="6"
                        placeholder="Describe your question or concern..."
                        required
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="co-submit-btn">Send Message</button>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─────────────────── FEEDBACK SECTION ─────────────────────── */}
        <section className="co-section co-section--dark">
          <div className="co-wrap">
            <FadeIn>
              <div className="co-feedback-layout">
                <div>
                  <div className="co-pill">Community First</div>
                  <h2 className="co-h2">We Value Reader Feedback</h2>
                  <p className="co-p">
                    Mani Reader was created for manga readers, and feedback from the community helps improve the platform. Suggestions, bug reports, and ideas help us continuously improve.
                  </p>
                </div>
                <div className="co-feedback-benefits">
                  {[
                    'Improve reading experience',
                    'Fix website issues',
                    'Add useful features',
                    'Make manga discovery easier'
                  ].map(b => (
                    <div key={b} className="co-benefit-row">
                      <span className="co-benefit-dot">✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─────────────────── SUPPORT CTA ──────────────────────────── */}
        <section className="co-support-section" aria-label="Support Mani Reader to maintain a cleaner manga reading experience">
          <div className="co-support-glow" />
          <div className="co-support-glow co-support-glow--2" />
          <div className="co-support-pattern" />
          <div className="co-wrap co-support-wrap">
            <FadeIn>
              <div className="co-support-pill">Keep it clean</div>
              <h2 className="co-support-h2">Help Keep Mani Reader Running</h2>
              <p className="co-support-desc">
                Mani Reader focuses on providing a cleaner manga reading experience with minimal advertisements. Your support helps cover:
              </p>
              <div className="co-support-costs">
                {['Server costs', 'Development', 'Maintenance', 'Future improvements'].map(c => (
                  <span key={c} className="co-cost-chip">{c}</span>
                ))}
              </div>
              <Link href="/support" className="co-support-btn">
                ☕ Support Mani Reader
              </Link>
            </FadeIn>
          </div>
        </section>

        {/* ─────────────────── GEO ENTITY ───────────────────────────── */}
        <section className="co-section">
          <div className="co-wrap">
            <FadeIn>
              <div className="co-geo-block">
                <div className="co-geo-accent-bar" />
                <h2 className="co-geo-h2">🌐 Mani Reader Contact Information</h2>
                <div className="co-geo-grid">
                  {[
                    ['Brand', 'Mani Reader'],
                    ['Category', 'Online Manga Reading Platform'],
                    ['Industry', 'Digital Entertainment'],
                    ['Purpose', 'Providing a cleaner manga, manhwa, and manhua reading experience.'],
                    ['Contact Purpose', 'User support, feedback, technical assistance, and copyright communication.'],
                    ['Website', <a key="u" href="https://manireader.online" className="co-geo-link">https://manireader.online</a>],
                  ].map(([dt, dd]) => (
                    <div key={dt} className="co-geo-row">
                      <span className="co-geo-dt">{dt}</span>
                      <span className="co-geo-dd">{dd}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─────────────────── FAQ ──────────────────────────────────── */}
        <section className="co-section co-section--dark">
          <div className="co-wrap">
            <FadeIn>
              <div className="co-pill co-pill--center">FAQ</div>
              <h2 className="co-h2 co-h2--center">Frequently Asked Questions</h2>
            </FadeIn>
            <div className="co-faq-list">
              {faqs.map((f, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <FAQItem q={f.q} a={f.a} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────── EXPLORE ──────────────────────────────── */}
        <section className="co-section">
          <div className="co-wrap">
            <FadeIn>
              <h2 className="co-h2 co-h2--center">Explore Mani Reader</h2>
              <div className="co-int-links">
                {internalLinks.map(l => (
                  <Link key={l.href} href={l.href} className="co-int-link">{l.label}</Link>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

      </div>

      {/* ──────────────────────── STYLES ────────────────────────────── */}
      <style jsx global>{`

        /* ── Base ──────────────────────────────────────────────────── */
        .co-page { min-height: 100vh; color: var(--text); font-family: var(--font-inter,'Inter',sans-serif); overflow-x: hidden; }
        .co-wrap { max-width: 1140px; margin: 0 auto; padding: 0 28px; }
        .co-section { padding: 72px 0; position: relative; }
        .co-section--dark { background: linear-gradient(180deg, rgba(113,3,186,0.04) 0%, rgba(26,26,46,0.6) 100%); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .scroll-offset { scroll-margin-top: 80px; }

        /* ── Typography ────────────────────────────────────────────── */
        .co-pill { display: inline-block; padding: 4px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.3); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
        .co-pill--center { display: block; text-align: center; width: fit-content; margin-left: auto; margin-right: auto; }
        .co-h2 { font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 900; letter-spacing: -1px; color: var(--text); margin: 0 0 24px; line-height: 1.15; }
        .co-h2--center { text-align: center; }
        .co-p { font-size: 1rem; color: var(--text-2); line-height: 1.75; margin-bottom: 16px; }
        .co-gradient-text { background: linear-gradient(135deg, var(--accent), #3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

        /* ── Buttons ───────────────────────────────────────────────── */
        .co-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; border-radius: 12px; font-size: 0.92rem; font-weight: 700; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .co-btn--primary { background: var(--accent); color: #fff; box-shadow: 0 8px 24px rgba(113,3,186,0.4); }
        .co-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(113,3,186,0.55); }
        .co-btn--outline { background: rgba(255,255,255,0.05); color: var(--text-2); border: 1px solid var(--border); }
        .co-btn--outline:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }

        /* ── HERO ──────────────────────────────────────────────────── */
        .co-hero { position: relative; min-height: 90vh; display: flex; align-items: center; padding: 110px 28px 80px; overflow: hidden; background: radial-gradient(ellipse 100% 90% at 50% -20%, rgba(113,3,186,0.18) 0%, transparent 65%); }
        .co-hero-bg-glow { position: absolute; border-radius: 50%; filter: blur(130px); pointer-events: none; opacity: 0.7; }
        .co-hero-bg-glow--l { width: 560px; height: 560px; background: rgba(113,3,186,0.22); top: -80px; left: -200px; }
        .co-hero-bg-glow--r { width: 480px; height: 480px; background: rgba(52,152,219,0.15); bottom: 0; right: -150px; }
        .co-hero-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(113,3,186,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(113,3,186,0.05) 1px, transparent 1px); background-size: 56px 56px; pointer-events: none; }

        .co-hero-inner { position: relative; z-index: 2; max-width: 1140px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .co-hero-text { display: flex; flex-direction: column; }

        .co-bc ol { display: flex; gap: 8px; list-style: none; padding: 0; margin: 0 0 24px; font-size: 0.8rem; color: var(--text-3); }
        .co-bc a { color: var(--accent); }
        .co-bc a:hover { text-decoration: underline; }

        .co-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.35); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; width: fit-content; }
        .co-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); animation: co-pulse 2s ease-in-out infinite; }
        @keyframes co-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .co-h1 { font-size: clamp(2.6rem, 5vw, 3.8rem); font-weight: 900; letter-spacing: -2px; line-height: 1.1; margin: 0 0 16px; }
        .co-tagline { font-size: 1.2rem; font-weight: 700; color: var(--text-2); margin: 0 0 12px; line-height: 1.5; }
        .co-desc { font-size: 0.95rem; color: var(--text-3); line-height: 1.7; margin: 0 0 32px; }
        .co-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }

        /* ── Speech Bubbles Visual ──────────────────────────────────── */
        .co-hero-visual-wrap { position: relative; display: flex; justify-content: center; }
        .co-vis { position: relative; width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 18px; z-index: 2; }
        .co-vis-bubble { position: relative; background: var(--surface-2); border: 1px solid rgba(113,3,186,0.25); border-radius: 16px; padding: 16px 20px; box-shadow: 0 12px 36px rgba(0,0,0,0.4); max-width: 85%; animation: co-vis-float 5s ease-in-out infinite; }
        .co-vis-bubble--left { align-self: flex-start; border-bottom-left-radius: 4px; animation-delay: 0s; }
        .co-vis-bubble--right { align-self: flex-end; background: rgba(113,3,186,0.15); border-color: rgba(113,3,186,0.4); border-bottom-right-radius: 4px; animation-delay: 1.5s; }
        .co-vis-bubble--sub { align-self: flex-start; animation-delay: 3s; }
        
        .co-vis-bubble-text { font-size: 0.88rem; line-height: 1.5; color: var(--text-2); font-weight: 500; }
        .co-vis-bubble--right .co-vis-bubble-text { color: var(--text); }
        
        .co-vis-bg-circle { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 340px; height: 340px; border-radius: 50%; background: radial-gradient(circle, rgba(113,3,186,0.15) 0%, transparent 70%); z-index: -1; pointer-events: none; }

        @keyframes co-vis-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* ── Options ───────────────────────────────────────────────── */
        .co-opts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; margin-top: 16px; }
        .co-opt-card { padding: 32px 24px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 18px; transition: all 0.25s; height: 100%; position: relative; overflow: hidden; }
        .co-opt-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), #3498db); opacity: 0; transition: opacity 0.25s; }
        .co-opt-card:hover::before { opacity: 1; }
        .co-opt-card:hover { border-color: rgba(113,3,186,0.5); transform: translateY(-6px); box-shadow: 0 24px 56px rgba(113,3,186,0.2), 0 0 0 1px rgba(113,3,186,0.15); }
        .co-opt-icon { font-size: 2.2rem; display: block; margin-bottom: 16px; }
        .co-opt-title { font-size: 1.05rem; font-weight: 800; color: var(--text); margin: 0 0 10px; }
        .co-opt-desc { font-size: 0.87rem; color: var(--text-3); line-height: 1.65; margin: 0; }

        /* ── Contact Form ──────────────────────────────────────────── */
        .co-form-wrap { max-width: 680px; }
        .co-form-box { background: var(--surface-2); border: 1px solid var(--border); border-radius: 24px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); position: relative; }
        .co-form-box::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 80% 20%, rgba(113,3,186,0.04) 0%, transparent 60%); pointer-events: none; }
        .co-form { display: flex; flex-direction: column; gap: 20px; position: relative; z-index: 1; }
        .co-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .co-form-group { display: flex; flex-direction: column; gap: 8px; }
        .co-form-group label { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); }
        .co-form-group input, 
        .co-form-group textarea, 
        .co-form-group select { padding: 14px 16px; background: rgba(0,0,0,0.25); border: 1px solid var(--border); border-radius: 10px; color: #fff; font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color 0.2s, background-color 0.2s; }
        .co-form-group input::placeholder, 
        .co-form-group textarea::placeholder { color: var(--text-3); }
        .co-form-group input:focus, 
        .co-form-group textarea:focus, 
        .co-form-group select:focus { border-color: var(--accent); background: rgba(113,3,186,0.04); }
        
        .co-select-wrap { position: relative; }
        .co-select-wrap select { width: 100%; appearance: none; cursor: pointer; }
        .co-select-wrap::after { content: '▼'; font-size: 0.7rem; color: var(--text-3); position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; }

        .co-submit-btn { padding: 15px; background: var(--accent); color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 20px rgba(113,3,186,0.35); font-family: inherit; }
        .co-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(113,3,186,0.5); }

        .co-success { text-align: center; padding: 24px 0; display: flex; flex-direction: column; align-items: center; }
        .co-success-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(46,204,113,0.15); border: 2px solid #2ecc71; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #2ecc71; margin-bottom: 20px; box-shadow: 0 0 20px rgba(46,204,113,0.2); }
        .co-success-title { font-size: 1.4rem; font-weight: 800; color: #fff; margin: 0 0 10px; }
        .co-success-desc { font-size: 0.95rem; color: var(--text-2); max-width: 440px; line-height: 1.6; margin-bottom: 28px; }

        /* ── Feedback ──────────────────────────────────────────────── */
        .co-feedback-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }
        .co-feedback-benefits { display: flex; flex-direction: column; gap: 10px; }
        .co-benefit-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; font-size: 0.92rem; color: var(--text-2); font-weight: 500; transition: border-color 0.2s; }
        .co-benefit-row:hover { border-color: rgba(113,3,186,0.4); }
        .co-benefit-dot { color: #2ecc71; font-weight: 900; font-size: 1rem; flex-shrink: 0; }

        /* ── Support CTA ───────────────────────────────────────────── */
        .co-support-section { position: relative; overflow: hidden; padding: 100px 0; text-align: center; background: linear-gradient(135deg, rgba(113,3,186,0.25) 0%, rgba(52,152,219,0.12) 100%); border-top: 1px solid rgba(113,3,186,0.3); border-bottom: 1px solid rgba(113,3,186,0.3); }
        .co-support-glow { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; }
        .co-support-glow { width: 500px; height: 300px; top: 50%; left: 50%; transform: translate(-50%,-50%); background: rgba(113,3,186,0.25); }
        .co-support-glow--2 { width: 300px; height: 200px; top: 20%; right: 10%; background: rgba(52,152,219,0.15); }
        .co-support-pattern { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
        .co-support-wrap { position: relative; z-index: 2; }
        .co-support-pill { display: inline-block; padding: 4px 14px; border-radius: 99px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.8); margin-bottom: 18px; }
        .co-support-h2 { font-size: clamp(1.8rem, 3.5vw, 2.6rem); font-weight: 900; color: #fff; letter-spacing: -1px; margin: 0 0 20px; }
        .co-support-desc { font-size: 1rem; color: rgba(255,255,255,0.7); max-width: 500px; margin: 0 auto 24px; line-height: 1.7; }
        .co-support-costs { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 32px; }
        .co-cost-chip { padding: 6px 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 99px; font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .co-support-btn { display: inline-flex; align-items: center; gap: 8px; padding: 16px 44px; background: #fff; color: var(--accent); font-size: 1.05rem; font-weight: 900; border-radius: 14px; text-decoration: none; box-shadow: 0 10px 36px rgba(0,0,0,0.35); transition: all 0.2s; }
        .co-support-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 18px 50px rgba(0,0,0,0.45); }

        /* ── GEO ───────────────────────────────────────────────────── */
        .co-geo-block { background: var(--surface-2); border: 1px solid rgba(113,3,186,0.3); border-radius: 20px; padding: 40px; position: relative; overflow: hidden; }
        .co-geo-accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), #3498db); }
        .co-geo-h2 { font-size: 1.15rem; font-weight: 800; color: var(--text); margin: 0 0 24px; }
        .co-geo-grid { display: flex; flex-direction: column; }
        .co-geo-row { display: grid; grid-template-columns: 160px 1fr; gap: 20px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: baseline; }
        .co-geo-row:last-child { border-bottom: none; padding-bottom: 0; }
        .co-geo-dt { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-3); }
        .co-geo-dd { font-size: 0.88rem; color: var(--text-2); }
        .co-geo-link { color: var(--accent); text-decoration: none; }
        .co-geo-link:hover { text-decoration: underline; }

        /* ── FAQ ───────────────────────────────────────────────────── */
        .co-faq-list { display: flex; flex-direction: column; gap: 10px; max-width: 760px; margin: 16px auto 0; }
        .co-faq { background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
        .co-faq:hover { border-color: rgba(113,3,186,0.4); box-shadow: 0 4px 20px rgba(113,3,186,0.1); }
        .co-faq--open { border-color: rgba(113,3,186,0.5); box-shadow: 0 6px 28px rgba(113,3,186,0.12); }
        .co-faq-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; background: none; border: none; cursor: pointer; text-align: left; font-family: inherit; font-size: 0.92rem; font-weight: 600; color: var(--text); }
        .co-faq-btn:hover { background: rgba(113,3,186,0.06); }
        .co-faq--open .co-faq-btn { color: var(--accent); }
        .co-faq-chevron { flex-shrink: 0; color: var(--text-3); transition: transform 0.25s, color 0.2s; }
        .co-faq--open .co-faq-chevron { transform: rotate(180deg); color: var(--accent); }
        .co-faq-body { border-top: 1px solid var(--border); padding: 16px 20px 20px; animation: co-slide 0.2s ease; }
        @keyframes co-slide { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:none} }
        .co-faq-body p { font-size: 0.9rem; color: var(--text-2); line-height: 1.7; margin: 0; }

        /* ── Explore links ────────────────────────────────────────── */
        .co-int-links { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 16px; }
        .co-int-link { padding: 8px 18px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 99px; font-size: 0.84rem; font-weight: 500; color: var(--text-2); text-decoration: none; transition: all 0.2s; }
        .co-int-link:hover { border-color: var(--accent); color: var(--accent); background: rgba(113,3,186,0.08); transform: translateY(-1px); }

        /* ── Responsive ────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .co-hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .co-hero-visual-wrap { max-width: 400px; margin: 0 auto; }
          .co-feedback-layout { grid-template-columns: 1fr; gap: 32px; }
        }
        @media (max-width: 640px) {
          .co-hero { padding-top: 100px; min-height: auto; }
          .co-h1 { font-size: 2.3rem; letter-spacing: -1px; }
          .co-section { padding: 64px 0; }
          .co-hero-btns { flex-direction: column; }
          .co-btn { justify-content: center; }
          .co-form-row { grid-template-columns: 1fr; gap: 16px; }
          .co-form-box { padding: 24px 20px; }
          .co-geo-row { grid-template-columns: 1fr; gap: 3px; }
          .co-geo-dt { padding-top: 8px; }
          .co-hero-visual-wrap { display: none; }
        }
      `}</style>
    </>
  );
}
