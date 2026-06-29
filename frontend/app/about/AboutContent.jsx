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

const problems = [
  { icon: '❌', text: 'Excessive advertisements' },
  { icon: '❌', text: 'Intrusive popups & redirects' },
  { icon: '❌', text: 'Ads covering chapters' },
  { icon: '❌', text: 'Slow, cluttered interfaces' },
];
const solutions = [
  { icon: '✓', text: 'Cleaner reading interface' },
  { icon: '✓', text: 'Minimal advertisements' },
  { icon: '✓', text: 'Faster manga discovery' },
  { icon: '✓', text: 'Reader-first design' },
];
const features = [
  { emoji: '🔍', title: 'Manga Discovery', desc: 'Explore through categories, popularity, search, and recently added titles.' },
  { emoji: '🎭', title: 'Multiple Genres', desc: 'Action, fantasy, romance, comedy, horror, adventure, drama, and more.' },
  { emoji: '📱', title: 'Mobile Friendly', desc: 'Read comfortably on smartphones, tablets, and desktop browsers.' },
  { emoji: '🧹', title: 'Minimal Ads', desc: 'Far fewer interruptions than traditional ad-heavy manga websites.' },
];
const faqs = [
  { q: 'What is Mani Reader?', a: 'Mani Reader is an online manga reading platform where users can discover, browse, and read manga, manhwa, and manhua online.' },
  { q: 'Why was Mani Reader created?', a: 'Mani Reader was created by a manga fan who wanted a cleaner reading experience without excessive advertisements and distractions.' },
  { q: 'Is Mani Reader an ad-free manga website?', a: 'Mani Reader focuses on keeping advertisements minimal to provide a cleaner reading experience compared to traditional manga websites.' },
  { q: 'How can users support Mani Reader?', a: 'Users can support Mani Reader through the support option, helping maintain servers, improve features, and continue providing a better reading experience.' },
];
const internalLinks = [
  { href: '/browse', label: 'Browse Manga' },
  { href: '/browse?sort=popular', label: 'Popular Manga' },
  { href: '/browse?sort=recently-added', label: 'Recently Added' },
  { href: '/browse?tab=genres', label: 'Genres' },
  { href: '/faq', label: 'FAQ' },
  { href: '/support', label: 'Support' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`ab-faq${open ? ' ab-faq--open' : ''}`}>
      <button className="ab-faq-btn" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <svg className="ab-faq-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 6.5L9 11.5L14 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div className="ab-faq-body"><p>{a}</p></div>}
    </div>
  );
}

// ── Manga panel visual (hero right side) ───────────────────────────────────────
function MangaVisual() {
  return (
    <div className="ab-visual">
      {/* Main big panel - manga reader */}
      <div className="ab-vis-main">
        <div className="ab-vis-topbar">
          <div className="ab-vis-dot ab-vis-dot--r" />
          <div className="ab-vis-dot ab-vis-dot--y" />
          <div className="ab-vis-dot ab-vis-dot--g" />
          <span className="ab-vis-title">Mani Reader</span>
          <div className="ab-vis-badge">CLEAN</div>
        </div>
        <div className="ab-vis-body">
          {/* Manga page strips */}
          <div className="ab-vis-page">
            <div className="ab-vis-strip ab-vis-strip--tall" />
            <div className="ab-vis-strip ab-vis-strip--med" />
            <div className="ab-vis-strip ab-vis-strip--short" />
            <div className="ab-vis-strip ab-vis-strip--tall" />
          </div>
          <div className="ab-vis-sidebar">
            <div className="ab-vis-mini-title" />
            {['Ch. 1', 'Ch. 2', 'Ch. 3', 'Ch. 4', 'Ch. 5'].map(c => (
              <div key={c} className={`ab-vis-ch-row${c === 'Ch. 2' ? ' ab-vis-ch-row--active' : ''}`}>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
        {/* No ads badge */}
        <div className="ab-vis-no-ads">
          <span>🚫</span> No intrusive ads
        </div>
      </div>

      {/* Floating small card – genre tags */}
      <div className="ab-vis-float ab-vis-float--1">
        <div className="ab-vis-float-label">Genres</div>
        <div className="ab-vis-tags">
          {['Action', 'Fantasy', 'Romance', 'Horror'].map(g => (
            <span key={g} className="ab-vis-tag">{g}</span>
          ))}
        </div>
      </div>

      {/* Floating small card – currently reading */}
      <div className="ab-vis-float ab-vis-float--2">
        <div className="ab-vis-float-label">Reading Now</div>
        <div className="ab-vis-reading">
          <div className="ab-vis-thumb" />
          <div>
            <div className="ab-vis-name">Solo Leveling</div>
            <div className="ab-vis-prog-wrap">
              <div className="ab-vis-prog-bar" />
            </div>
            <div className="ab-vis-prog-label">Chapter 47</div>
          </div>
        </div>
      </div>

      {/* Clean experience badge */}
      <div className="ab-vis-float ab-vis-float--3">
        <span className="ab-vis-clean-icon">✨</span>
        <span className="ab-vis-clean-text">Clean &amp; Fast</span>
      </div>
    </div>
  );
}

export default function AboutContent() {
  return (
    <>
      <Navbar />
      <div className="ab-page">

        {/* ─────────────────── HERO ─────────────────────────────────── */}
        <section className="ab-hero">
          <div className="ab-hero-bg-glow ab-hero-bg-glow--l" />
          <div className="ab-hero-bg-glow ab-hero-bg-glow--r" />
          <div className="ab-hero-grid-lines" />

          <div className="ab-hero-inner">
            <div className="ab-hero-text">
              <nav aria-label="Breadcrumb" className="ab-bc">
                <ol><li><Link href="/">Home</Link></li><li>›</li><li aria-current="page">About</li></ol>
              </nav>

              <div className="ab-badge">
                <span className="ab-badge-dot" />
                Our Story
              </div>

              <h1 className="ab-h1">
                About <span className="ab-gradient-text">Mani Reader</span>
              </h1>
              <p className="ab-tagline">A cleaner way to read manga, manhwa, and manhua online.</p>
              <p className="ab-desc">
                Created by a manga fan who was tired of reading through a wall of ads just to reach the next chapter.
              </p>

              <div className="ab-hero-btns">
                <Link href="/browse" className="ab-btn ab-btn--primary">📖 Read Manga</Link>
                <Link href="/support" className="ab-btn ab-btn--outline">☕ Support Us</Link>
              </div>

              {/* Stats row */}
              <div className="ab-stats-row">
                {[['10K+', 'Manga Titles'], ['30+', 'Genres'], ['0', 'Forced Popups']].map(([v, l]) => (
                  <div key={l} className="ab-stat-chip">
                    <span className="ab-stat-num">{v}</span>
                    <span className="ab-stat-lbl">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ab-hero-visual-wrap">
              <MangaVisual />
            </div>
          </div>
        </section>

        {/* ─────────────────── WHY ──────────────────────────────────── */}
        <section className="ab-section ab-section--why">
          <div className="ab-section-bg-strip" />
          <div className="ab-wrap">
            <FadeIn>
              <div className="ab-why-layout">
                <div className="ab-why-left">
                  <div className="ab-pill">Origin Story</div>
                  <h2 className="ab-h2">Why Was Mani Reader Created?</h2>
                  <p className="ab-p">As a manga and manhwa fan, finding a comfortable place to read online was frustrating. Many manga websites focused more on advertisements than the actual reading experience.</p>
                  <p className="ab-p">Instead of enjoying the story, users often felt like they were visiting a website designed <em>around</em> advertisements.</p>
                  <div className="ab-origin-quote">
                    <div className="ab-oq-bar" />
                    <div>
                      <p className="ab-oq-main">&ldquo;Why does reading manga online feel like watching ads instead of enjoying a story?&rdquo;</p>
                      <p className="ab-oq-sub">— The thought that started Mani Reader</p>
                    </div>
                  </div>
                </div>
                <div className="ab-why-right">
                  <div className="ab-problem-card">
                    <div className="ab-problem-card-title">Readers had to deal with:</div>
                    {['Endless popups', 'Redirect pages', 'Ads covering chapters', 'Slow and cluttered interfaces'].map(p => (
                      <div key={p} className="ab-problem-row">
                        <span className="ab-problem-x">✕</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ab-solution-callout">
                    <div className="ab-solution-icon">💡</div>
                    <div>
                      <div className="ab-solution-head">The Goal</div>
                      <div className="ab-solution-text">Create a place where readers can focus on manga.</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─────────────────── COMPARISON ───────────────────────────── */}
        <section className="ab-section">
          <div className="ab-wrap">
            <FadeIn>
              <div className="ab-pill ab-pill--center">The Difference</div>
              <h2 className="ab-h2 ab-h2--center">A Better Reading Experience</h2>
            </FadeIn>
            <div className="ab-cmp-grid">
              <FadeIn delay={60}>
                <div className="ab-cmp-col ab-cmp-col--bad">
                  <div className="ab-cmp-head ab-cmp-head--bad">
                    <span className="ab-cmp-emoji">⚠️</span>
                    <span>Traditional Websites</span>
                  </div>
                  {problems.map((p, i) => (
                    <div key={i} className="ab-cmp-row ab-cmp-row--bad">
                      <span className="ab-cmp-icon">{p.icon}</span>
                      {p.text}
                    </div>
                  ))}
                </div>
              </FadeIn>

              <div className="ab-vs-pill">VS</div>

              <FadeIn delay={120}>
                <div className="ab-cmp-col ab-cmp-col--good">
                  <div className="ab-cmp-head ab-cmp-head--good">
                    <span className="ab-cmp-emoji">✨</span>
                    <span>Mani Reader</span>
                  </div>
                  {solutions.map((s, i) => (
                    <div key={i} className="ab-cmp-row ab-cmp-row--good">
                      <span className="ab-cmp-icon">{s.icon}</span>
                      {s.text}
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─────────────────── MISSION ──────────────────────────────── */}
        <section className="ab-section ab-section--dark">
          <div className="ab-section-bg-strip" />
          <div className="ab-wrap">
            <FadeIn>
              <div className="ab-mission-layout">
                <div>
                  <div className="ab-pill">Purpose</div>
                  <h2 className="ab-h2">Our Mission</h2>
                  <p className="ab-p">Mani Reader exists to make online manga reading simple again. Readers should spend their time enjoying stories, not fighting through unnecessary distractions.</p>
                  <div className="ab-checklist">
                    {['Better manga discovery', 'Comfortable reading experience', 'Mobile-friendly on all devices', 'Minimal interruptions'].map(item => (
                      <div key={item} className="ab-check-row">
                        <span className="ab-check-mark">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ab-mission-visual">
                  {[['10K+', 'Manga Titles', '📚'], ['30+', 'Genres Available', '🎭'], ['0', 'Forced Popups', '🚫']].map(([v, l, e]) => (
                    <div key={l} className="ab-mission-stat">
                      <span className="ab-mission-stat-emoji">{e}</span>
                      <span className="ab-mission-stat-val">{v}</span>
                      <span className="ab-mission-stat-lbl">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─────────────────── FEATURES ─────────────────────────────── */}
        <section className="ab-section">
          <div className="ab-wrap">
            <FadeIn>
              <div className="ab-pill ab-pill--center">What We Offer</div>
              <h2 className="ab-h2 ab-h2--center">Built For Manga Readers</h2>
            </FadeIn>
            <div className="ab-feat-grid">
              {features.map((f, i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div className="ab-feat-card">
                    <div className="ab-feat-icon-wrap">
                      <span className="ab-feat-icon">{f.emoji}</span>
                    </div>
                    <h3 className="ab-feat-title">{f.title}</h3>
                    <p className="ab-feat-desc">{f.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────── CREATOR ──────────────────────────────── */}
        <section className="ab-section ab-section--dark">
          <div className="ab-wrap">
            <FadeIn>
              <div className="ab-creator-layout">
                <div className="ab-creator-left-col">
                  <div className="ab-creator-avatar-wrap">
                    <div className="ab-creator-avatar">📖</div>
                    <div className="ab-creator-ring ab-creator-ring--1" />
                    <div className="ab-creator-ring ab-creator-ring--2" />
                  </div>
                  <div className="ab-creator-name-tag">A Manga Fan</div>
                  <div className="ab-creator-since">Est. 2024</div>
                </div>
                <div className="ab-creator-right-col">
                  <div className="ab-pill">Origin</div>
                  <h2 className="ab-h2">Created By A Manga Fan</h2>
                  <p className="ab-p">Mani Reader started from a personal frustration:</p>
                  <blockquote className="ab-bq">
                    &ldquo;Why does reading manga online feel like watching advertisements instead of enjoying a story?&rdquo;
                  </blockquote>
                  <p className="ab-p">The platform was created with a simple idea: <strong className="ab-strong">Readers deserve a better place to discover and read manga.</strong></p>
                  <p className="ab-p">Mani Reader continues to improve based on what manga readers actually need.</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─────────────────── SUPPORT CTA ──────────────────────────── */}
        <section className="ab-support-section">
          <div className="ab-support-glow" />
          <div className="ab-support-glow ab-support-glow--2" />
          <div className="ab-support-pattern" />
          <div className="ab-wrap ab-support-wrap">
            <FadeIn>
              <div className="ab-support-pill">Keep it clean</div>
              <h2 className="ab-support-h2">Help Keep Mani Reader Clean</h2>
              <p className="ab-support-desc">
                Mani Reader aims to maintain a cleaner reading experience with minimal advertisements. Running a website requires:
              </p>
              <div className="ab-support-costs">
                {['Servers', 'Development', 'Maintenance', 'New Features', 'Performance'].map(c => (
                  <span key={c} className="ab-cost-chip">{c}</span>
                ))}
              </div>
              <Link href="/support" className="ab-support-btn">
                ☕ Support Mani Reader
              </Link>
              <p className="ab-support-sub">Keep Mani Reader Ad-Light</p>
            </FadeIn>
          </div>
        </section>

        {/* ─────────────────── GEO ENTITY ───────────────────────────── */}
        <section className="ab-section">
          <div className="ab-wrap">
            <FadeIn>
              <div className="ab-geo-block">
                <div className="ab-geo-accent-bar" />
                <h2 className="ab-geo-h2">🌐 Mani Reader</h2>
                <div className="ab-geo-grid">
                  {[
                    ['Brand', 'Mani Reader'],
                    ['Category', 'Online Manga Reading Platform'],
                    ['Industry', 'Digital Entertainment'],
                    ['Focus', 'Manga, Manhwa, and Manhua'],
                    ['Purpose', 'Cleaner online manga reading with minimal ads'],
                    ['Website', <a key="u" href="https://manireader.online" className="ab-geo-link">manireader.online</a>],
                  ].map(([dt, dd]) => (
                    <div key={dt} className="ab-geo-row">
                      <span className="ab-geo-dt">{dt}</span>
                      <span className="ab-geo-dd">{dd}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─────────────────── FAQ ──────────────────────────────────── */}
        <section className="ab-section ab-section--dark">
          <div className="ab-wrap">
            <FadeIn>
              <div className="ab-pill ab-pill--center">Quick Answers</div>
              <h2 className="ab-h2 ab-h2--center">Frequently Asked Questions</h2>
            </FadeIn>
            <div className="ab-faq-list">
              {faqs.map((f, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <FAQItem q={f.q} a={f.a} />
                </FadeIn>
              ))}
            </div>
            <div className="ab-faq-more"><Link href="/faq" className="ab-btn ab-btn--outline">View Full FAQ →</Link></div>
          </div>
        </section>

        {/* ─────────────────── EXPLORE ──────────────────────────────── */}
        <section className="ab-section">
          <div className="ab-wrap">
            <FadeIn>
              <h2 className="ab-h2 ab-h2--center">Explore Mani Reader</h2>
              <div className="ab-int-links">
                {internalLinks.map(l => (
                  <Link key={l.href} href={l.href} className="ab-int-link">{l.label}</Link>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

      </div>

      {/* ──────────────────────── STYLES ────────────────────────────── */}
      <style jsx global>{`

        /* ── Base ──────────────────────────────────────────────────── */
        .ab-page { min-height: 100vh; color: var(--text); font-family: var(--font-inter,'Inter',sans-serif); overflow-x: hidden; }
        .ab-wrap { max-width: 1140px; margin: 0 auto; padding: 0 28px; }
        .ab-section { padding: 72px 0; position: relative; }
        .ab-section--dark { background: linear-gradient(160deg, rgba(20,15,40,0.9) 0%, rgba(26,26,46,0.8) 100%); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .ab-section--why { padding-top: 72px; padding-bottom: 72px; }
        .ab-section-bg-strip { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(52,152,219,0.07), transparent 70%); pointer-events: none; }

        /* ── Typography ────────────────────────────────────────────── */
        .ab-pill { display: inline-block; padding: 4px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.3); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
        .ab-pill--center { display: block; text-align: center; width: fit-content; margin-left: auto; margin-right: auto; }
        .ab-h2 { font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 900; letter-spacing: -1px; color: var(--text); margin: 0 0 24px; line-height: 1.15; }
        .ab-h2--center { text-align: center; }
        .ab-p { font-size: 1rem; color: var(--text-2); line-height: 1.75; margin-bottom: 16px; }
        .ab-strong { color: var(--accent); }
        .ab-gradient-text { background: linear-gradient(135deg, var(--accent), #3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

        /* ── Buttons ───────────────────────────────────────────────── */
        .ab-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; border-radius: 12px; font-size: 0.92rem; font-weight: 700; text-decoration: none; transition: all 0.2s; }
        .ab-btn--primary { background: var(--accent); color: #fff; box-shadow: 0 8px 24px rgba(113,3,186,0.4); }
        .ab-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(113,3,186,0.55); }
        .ab-btn--outline { background: rgba(255,255,255,0.05); color: var(--text-2); border: 1px solid var(--border); }
        .ab-btn--outline:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }

        /* ── HERO ──────────────────────────────────────────────────── */
        .ab-hero { position: relative; min-height: 100vh; display: flex; align-items: center; padding: 110px 28px 80px; overflow: hidden; background: radial-gradient(ellipse 100% 90% at 50% -20%, rgba(113,3,186,0.18) 0%, transparent 65%); }
        .ab-hero-bg-glow { position: absolute; border-radius: 50%; filter: blur(130px); pointer-events: none; opacity: 0.7; }
        .ab-hero-bg-glow--l { width: 560px; height: 560px; background: rgba(113,3,186,0.22); top: -80px; left: -200px; }
        .ab-hero-bg-glow--r { width: 480px; height: 480px; background: rgba(52,152,219,0.15); bottom: 0; right: -150px; }
        .ab-hero-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(113,3,186,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(113,3,186,0.05) 1px, transparent 1px); background-size: 56px 56px; pointer-events: none; }

        .ab-hero-inner { position: relative; z-index: 2; max-width: 1140px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .ab-hero-text { display: flex; flex-direction: column; }

        .ab-bc ol { display: flex; gap: 8px; list-style: none; padding: 0; margin: 0 0 24px; font-size: 0.8rem; color: var(--text-3); }
        .ab-bc a { color: var(--accent); }
        .ab-bc a:hover { text-decoration: underline; }

        .ab-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.35); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; width: fit-content; }
        .ab-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); animation: ab-pulse 2s ease-in-out infinite; }
        @keyframes ab-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .ab-h1 { font-size: clamp(2.6rem, 5vw, 3.8rem); font-weight: 900; letter-spacing: -2px; line-height: 1.1; margin: 0 0 16px; }
        .ab-tagline { font-size: 1.2rem; font-weight: 700; color: var(--text-2); margin: 0 0 12px; line-height: 1.5; }
        .ab-desc { font-size: 0.95rem; color: var(--text-3); line-height: 1.7; margin: 0 0 32px; }

        .ab-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 36px; }

        .ab-stats-row { display: flex; gap: 20px; flex-wrap: wrap; }
        .ab-stat-chip { display: flex; flex-direction: column; padding: 12px 20px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 12px; min-width: 90px; }
        .ab-stat-num { font-size: 1.5rem; font-weight: 900; background: linear-gradient(135deg,var(--accent),#3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
        .ab-stat-lbl { font-size: 0.7rem; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }

        /* ── Manga Visual ──────────────────────────────────────────── */
        .ab-hero-visual-wrap { position: relative; padding: 36px 32px 48px 16px; }
        .ab-visual { position: relative; width: 100%; }

        .ab-vis-main { background: var(--surface-2); border: 1px solid rgba(113,3,186,0.3); border-radius: 20px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(113,3,186,0.15); animation: ab-float 5s ease-in-out infinite; }
        @keyframes ab-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        .ab-vis-topbar { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(255,255,255,0.04); border-bottom: 1px solid var(--border); }
        .ab-vis-dot { width: 10px; height: 10px; border-radius: 50%; }
        .ab-vis-dot--r { background: #ff5f57; }
        .ab-vis-dot--y { background: #febc2e; }
        .ab-vis-dot--g { background: #28c840; }
        .ab-vis-title { font-size: 0.8rem; font-weight: 700; color: var(--text-2); margin-left: 8px; flex: 1; }
        .ab-vis-badge { font-size: 0.65rem; font-weight: 800; padding: 2px 8px; background: rgba(113,3,186,0.25); color: var(--accent); border-radius: 99px; border: 1px solid rgba(113,3,186,0.4); letter-spacing: 0.1em; }

        .ab-vis-body { display: grid; grid-template-columns: 1fr 140px; min-height: 260px; }
        .ab-vis-page { padding: 16px; display: flex; flex-direction: column; gap: 10px; background: rgba(0,0,0,0.2); }
        .ab-vis-strip { border-radius: 6px; background: linear-gradient(90deg, rgba(113,3,186,0.15), rgba(52,152,219,0.1)); border: 1px solid rgba(255,255,255,0.05); }
        .ab-vis-strip--tall { height: 60px; }
        .ab-vis-strip--med  { height: 45px; width: 85%; }
        .ab-vis-strip--short { height: 35px; width: 60%; }

        .ab-vis-sidebar { padding: 14px; border-left: 1px solid var(--border); background: rgba(26,26,46,0.8); }
        .ab-vis-mini-title { height: 8px; width: 80%; background: rgba(113,3,186,0.4); border-radius: 4px; margin-bottom: 14px; }
        .ab-vis-ch-row { padding: 6px 8px; border-radius: 6px; font-size: 0.72rem; color: var(--text-3); cursor: pointer; margin-bottom: 4px; transition: background 0.15s; }
        .ab-vis-ch-row--active { background: rgba(113,3,186,0.2); color: var(--accent); font-weight: 700; border: 1px solid rgba(113,3,186,0.3); }
        .ab-vis-ch-row span { display: block; }

        .ab-vis-no-ads { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: rgba(46,204,113,0.08); border-top: 1px solid rgba(46,204,113,0.2); font-size: 0.78rem; font-weight: 700; color: #2ecc71; }

        /* Floating cards */
        .ab-vis-float { position: absolute; background: var(--surface-2); border: 1px solid var(--border); border-radius: 14px; padding: 14px; box-shadow: 0 16px 48px rgba(0,0,0,0.5); backdrop-filter: blur(12px); }
        .ab-vis-float-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-3); margin-bottom: 8px; }

        .ab-vis-float--1 { bottom: -28px; left: -30px; min-width: 180px; animation: ab-float 5s ease-in-out 1.5s infinite; }
        .ab-vis-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .ab-vis-tag { font-size: 0.7rem; padding: 3px 9px; border-radius: 99px; background: rgba(113,3,186,0.15); color: var(--accent); border: 1px solid rgba(113,3,186,0.25); font-weight: 600; }

        .ab-vis-float--2 { top: -24px; right: -24px; min-width: 200px; animation: ab-float 5s ease-in-out 3s infinite; }
        .ab-vis-reading { display: flex; gap: 10px; align-items: center; }
        .ab-vis-thumb { width: 36px; height: 48px; border-radius: 6px; background: linear-gradient(135deg, rgba(113,3,186,0.5), rgba(52,152,219,0.4)); flex-shrink: 0; }
        .ab-vis-name { font-size: 0.8rem; font-weight: 700; color: var(--text); margin-bottom: 6px; }
        .ab-vis-prog-wrap { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 4px; }
        .ab-vis-prog-bar { height: 100%; width: 62%; background: linear-gradient(90deg, var(--accent), #3498db); border-radius: 2px; }
        .ab-vis-prog-label { font-size: 0.68rem; color: var(--text-3); }

        .ab-vis-float--3 { bottom: -16px; right: 16px; display: flex; align-items: center; gap: 8px; padding: 10px 16px; animation: ab-float 5s ease-in-out 0.8s infinite; }
        .ab-vis-clean-icon { font-size: 1.2rem; }
        .ab-vis-clean-text { font-size: 0.82rem; font-weight: 800; color: var(--text); }

        /* ── WHY ───────────────────────────────────────────────────── */
        .ab-why-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }

        .ab-origin-quote { display: flex; gap: 16px; margin-top: 28px; padding: 20px; background: rgba(113,3,186,0.07); border-radius: 12px; border: 1px solid rgba(113,3,186,0.2); }
        .ab-oq-bar { width: 4px; flex-shrink: 0; background: linear-gradient(180deg, var(--accent), #3498db); border-radius: 4px; }
        .ab-oq-main { font-size: 1.05rem; font-style: italic; color: var(--text); font-weight: 600; margin: 0 0 8px; line-height: 1.6; }
        .ab-oq-sub { font-size: 0.8rem; color: var(--text-3); margin: 0; }

        .ab-problem-card { background: rgba(255,77,109,0.06); border: 1px solid rgba(255,77,109,0.2); border-radius: 16px; padding: 24px; margin-bottom: 16px; }
        .ab-problem-card-title { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--red); margin-bottom: 14px; }
        .ab-problem-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: rgba(255,77,109,0.07); border-radius: 8px; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-2); border: 1px solid rgba(255,77,109,0.1); }
        .ab-problem-row:last-child { margin-bottom: 0; }
        .ab-problem-x { color: var(--red); font-weight: 900; font-size: 0.9rem; flex-shrink: 0; }

        .ab-solution-callout { display: flex; align-items: center; gap: 16px; padding: 18px 20px; background: rgba(113,3,186,0.1); border: 1px solid rgba(113,3,186,0.3); border-radius: 14px; }
        .ab-solution-icon { font-size: 1.8rem; }
        .ab-solution-head { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 4px; }
        .ab-solution-text { font-size: 0.95rem; font-weight: 700; color: var(--text); }

        /* ── COMPARISON ────────────────────────────────────────────── */
        .ab-section--comparison { background: linear-gradient(160deg, rgba(30,12,50,0.7) 0%, rgba(12,30,50,0.7) 100%); }
        .ab-cmp-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px; align-items: start; margin-top: 20px; }
        .ab-cmp-col { border-radius: 18px; padding: 28px; border: 1px solid var(--border); }
        .ab-cmp-col--bad { background: linear-gradient(160deg, rgba(255,77,109,0.08), rgba(255,77,109,0.03)); border-color: rgba(255,77,109,0.25); }
        .ab-cmp-col--good { background: linear-gradient(160deg, rgba(113,3,186,0.12), rgba(52,152,219,0.06)); border-color: rgba(113,3,186,0.3); }
        .ab-cmp-head { display: flex; align-items: center; gap: 10px; font-size: 1rem; font-weight: 800; color: var(--text); padding-bottom: 16px; margin-bottom: 14px; border-bottom: 1px solid var(--border); }
        .ab-cmp-emoji { font-size: 1.3rem; }
        .ab-cmp-row { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 9px; font-size: 0.9rem; color: var(--text-2); margin-bottom: 8px; font-weight: 500; }
        .ab-cmp-row--bad { background: rgba(255,77,109,0.07); border: 1px solid rgba(255,77,109,0.12); }
        .ab-cmp-row--good { background: rgba(46,204,113,0.07); border: 1px solid rgba(46,204,113,0.15); }
        .ab-cmp-icon { font-size: 1rem; flex-shrink: 0; width: 20px; text-align: center; }
        .ab-cmp-row--good .ab-cmp-icon { color: #2ecc71; font-weight: 900; }

        .ab-vs-pill { display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 900; color: var(--text-3); letter-spacing: 0.1em; padding: 0 4px; align-self: center; }

        /* ── MISSION ───────────────────────────────────────────────── */
        .ab-mission-layout { display: grid; grid-template-columns: 1fr 300px; gap: 56px; align-items: start; }
        .ab-checklist { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .ab-check-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; font-size: 0.92rem; color: var(--text-2); font-weight: 500; transition: border-color 0.2s; }
        .ab-check-row:hover { border-color: rgba(113,3,186,0.4); }
        .ab-check-mark { color: #2ecc71; font-weight: 900; font-size: 1rem; flex-shrink: 0; }
        .ab-mission-visual { display: flex; flex-direction: column; gap: 14px; }
        .ab-mission-stat { display: flex; flex-direction: column; align-items: center; padding: 24px 20px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 16px; text-align: center; transition: all 0.2s; }
        .ab-mission-stat:hover { border-color: var(--accent); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(113,3,186,0.15); }
        .ab-mission-stat-emoji { font-size: 1.8rem; margin-bottom: 8px; }
        .ab-mission-stat-val { font-size: 2.4rem; font-weight: 900; background: linear-gradient(135deg,var(--accent),#3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 4px; }
        .ab-mission-stat-lbl { font-size: 0.73rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); }

        /* ── FEATURES ──────────────────────────────────────────────── */
        .ab-feat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 16px; }
        .ab-feat-card { padding: 32px 24px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 18px; transition: all 0.25s; height: 100%; position: relative; overflow: hidden; }
        .ab-feat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), #3498db); opacity: 0; transition: opacity 0.25s; }
        .ab-feat-card:hover::before { opacity: 1; }
        .ab-feat-card:hover { border-color: rgba(113,3,186,0.5); transform: translateY(-6px); box-shadow: 0 24px 56px rgba(113,3,186,0.2), 0 0 0 1px rgba(113,3,186,0.15); }
        .ab-feat-icon-wrap { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, rgba(113,3,186,0.25), rgba(52,152,219,0.18)); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid rgba(113,3,186,0.3); box-shadow: 0 4px 16px rgba(113,3,186,0.2); }
        .ab-feat-icon { font-size: 1.8rem; }
        .ab-feat-title { font-size: 1.05rem; font-weight: 800; color: var(--text); margin: 0 0 10px; }
        .ab-feat-desc { font-size: 0.87rem; color: var(--text-3); line-height: 1.65; margin: 0; }

        /* ── CREATOR ───────────────────────────────────────────────── */
        .ab-creator-layout { display: grid; grid-template-columns: 220px 1fr; gap: 56px; align-items: start; }
        .ab-creator-left-col { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .ab-creator-avatar-wrap { position: relative; width: 130px; height: 130px; margin-bottom: 16px; }
        .ab-creator-avatar { width: 130px; height: 130px; border-radius: 50%; background: linear-gradient(135deg, rgba(113,3,186,0.3), rgba(52,152,219,0.25)); border: 2px solid rgba(113,3,186,0.4); display: flex; align-items: center; justify-content: center; font-size: 3.2rem; box-shadow: 0 12px 40px rgba(113,3,186,0.35); position: relative; z-index: 2; }
        .ab-creator-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(113,3,186,0.2); top: 50%; left: 50%; transform: translate(-50%,-50%); animation: ab-ring 3s ease-in-out infinite; }
        .ab-creator-ring--1 { width: 160px; height: 160px; animation-delay: 0s; }
        .ab-creator-ring--2 { width: 195px; height: 195px; animation-delay: 0.5s; opacity: 0.5; }
        @keyframes ab-ring { 0%,100%{opacity:0.4;transform:translate(-50%,-50%) scale(1)} 50%{opacity:0.15;transform:translate(-50%,-50%) scale(1.04)} }
        .ab-creator-name-tag { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); background: rgba(113,3,186,0.1); border: 1px solid rgba(113,3,186,0.25); padding: 4px 14px; border-radius: 99px; margin-bottom: 6px; }
        .ab-creator-since { font-size: 0.75rem; color: var(--text-3); }
        .ab-bq { border: none; margin: 16px 0; padding: 18px 20px; font-size: 1.05rem; font-style: italic; color: var(--text-2); background: rgba(113,3,186,0.07); border-left: 4px solid var(--accent); border-radius: 0 12px 12px 0; line-height: 1.6; }

        /* ── SUPPORT ───────────────────────────────────────────────── */
        .ab-support-section { position: relative; overflow: hidden; padding: 100px 0; text-align: center; background: linear-gradient(135deg, rgba(113,3,186,0.25) 0%, rgba(52,152,219,0.12) 100%); border-top: 1px solid rgba(113,3,186,0.3); border-bottom: 1px solid rgba(113,3,186,0.3); }
        .ab-support-glow { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; }
        .ab-support-glow { width: 500px; height: 300px; top: 50%; left: 50%; transform: translate(-50%,-50%); background: rgba(113,3,186,0.25); }
        .ab-support-glow--2 { width: 300px; height: 200px; top: 20%; right: 10%; background: rgba(52,152,219,0.15); }
        .ab-support-pattern { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
        .ab-support-wrap { position: relative; z-index: 2; }
        .ab-support-pill { display: inline-block; padding: 4px 14px; border-radius: 99px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.8); margin-bottom: 18px; }
        .ab-support-h2 { font-size: clamp(1.8rem, 3.5vw, 2.6rem); font-weight: 900; color: #fff; letter-spacing: -1px; margin: 0 0 20px; }
        .ab-support-desc { font-size: 1rem; color: rgba(255,255,255,0.7); max-width: 500px; margin: 0 auto 24px; line-height: 1.7; }
        .ab-support-costs { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 32px; }
        .ab-cost-chip { padding: 6px 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 99px; font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .ab-support-btn { display: inline-flex; align-items: center; gap: 8px; padding: 16px 44px; background: #fff; color: var(--accent); font-size: 1.05rem; font-weight: 900; border-radius: 14px; text-decoration: none; box-shadow: 0 10px 36px rgba(0,0,0,0.35); transition: all 0.2s; }
        .ab-support-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 18px 50px rgba(0,0,0,0.45); }
        .ab-support-sub { margin-top: 16px; font-size: 0.8rem; color: rgba(255,255,255,0.4); }

        /* ── GEO ───────────────────────────────────────────────────── */
        .ab-geo-block { background: var(--surface-2); border: 1px solid rgba(113,3,186,0.3); border-radius: 20px; padding: 40px; position: relative; overflow: hidden; }
        .ab-geo-accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), #3498db); }
        .ab-geo-h2 { font-size: 1.15rem; font-weight: 800; color: var(--text); margin: 0 0 24px; }
        .ab-geo-grid { display: flex; flex-direction: column; }
        .ab-geo-row { display: grid; grid-template-columns: 130px 1fr; gap: 20px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: baseline; }
        .ab-geo-row:last-child { border-bottom: none; padding-bottom: 0; }
        .ab-geo-dt { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-3); }
        .ab-geo-dd { font-size: 0.88rem; color: var(--text-2); }
        .ab-geo-link { color: var(--accent); text-decoration: none; }
        .ab-geo-link:hover { text-decoration: underline; }

        /* ── FAQ ───────────────────────────────────────────────────── */
        .ab-faq-list { display: flex; flex-direction: column; gap: 10px; max-width: 760px; margin: 16px auto 0; }
        .ab-faq { background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
        .ab-faq:hover { border-color: rgba(113,3,186,0.4); box-shadow: 0 4px 20px rgba(113,3,186,0.1); }
        .ab-faq--open { border-color: rgba(113,3,186,0.5); box-shadow: 0 6px 28px rgba(113,3,186,0.12); }
        .ab-faq-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; background: none; border: none; cursor: pointer; text-align: left; font-family: inherit; font-size: 0.92rem; font-weight: 600; color: var(--text); }
        .ab-faq-btn:hover { background: rgba(113,3,186,0.06); }
        .ab-faq--open .ab-faq-btn { color: var(--accent); }
        .ab-faq-chevron { flex-shrink: 0; color: var(--text-3); transition: transform 0.25s, color 0.2s; }
        .ab-faq--open .ab-faq-chevron { transform: rotate(180deg); color: var(--accent); }
        .ab-faq-body { border-top: 1px solid var(--border); padding: 16px 20px 20px; animation: ab-slide 0.2s ease; }
        @keyframes ab-slide { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:none} }
        .ab-faq-body p { font-size: 0.9rem; color: var(--text-2); line-height: 1.7; margin: 0; }
        .ab-faq-more { text-align: center; margin-top: 28px; }

        /* ── Internal links ────────────────────────────────────────── */
        .ab-int-links { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 16px; }
        .ab-int-link { padding: 8px 18px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 99px; font-size: 0.84rem; font-weight: 500; color: var(--text-2); text-decoration: none; transition: all 0.2s; }
        .ab-int-link:hover { border-color: var(--accent); color: var(--accent); background: rgba(113,3,186,0.08); transform: translateY(-1px); }

        /* ── Responsive ────────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .ab-feat-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 900px) {
          .ab-hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .ab-hero-visual-wrap { max-width: 500px; margin: 0 auto; }
          .ab-why-layout { grid-template-columns: 1fr; gap: 32px; }
          .ab-cmp-grid { grid-template-columns: 1fr; gap: 14px; }
          .ab-vs-pill { padding: 8px 0; }
          .ab-mission-layout { grid-template-columns: 1fr; gap: 32px; }
          .ab-mission-visual { flex-direction: row; }
          .ab-creator-layout { grid-template-columns: 1fr; gap: 32px; }
          .ab-creator-left-col { flex-direction: row; gap: 20px; text-align: left; }
        }
        @media (max-width: 640px) {
          .ab-hero { padding-top: 100px; min-height: auto; }
          .ab-h1 { font-size: 2.3rem; letter-spacing: -1px; }
          .ab-section { padding: 64px 0; }
          .ab-hero-btns { flex-direction: column; }
          .ab-btn { justify-content: center; }
          .ab-feat-grid { grid-template-columns: 1fr; }
          .ab-geo-row { grid-template-columns: 1fr; gap: 3px; }
          .ab-geo-dt { padding-top: 8px; }
          .ab-mission-visual { flex-direction: column; }
          .ab-vis-float--1, .ab-vis-float--2, .ab-vis-float--3 { display: none; }
        }
      `}</style>
    </>
  );
}
