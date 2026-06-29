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

const genres = [
  { name: 'Action', emoji: '⚔️', query: 'action', desc: 'Battles, martial arts, adventure, fighting, and hero journeys.' },
  { name: 'Fantasy', emoji: '✨', query: 'fantasy', desc: 'Magic, alternative worlds, supernatural abilities, and adventures.' },
  { name: 'Romance', emoji: '💖', query: 'romance', desc: 'Love stories, relationships, emotional drama, and school life.' },
  { name: 'Comedy', emoji: '😂', query: 'comedy', desc: 'Humor, funny situations, slice of life, and lighthearted fun.' },
  { name: 'Horror', emoji: '👻', query: 'horror', desc: 'Spooky mysteries, ghosts, psychological terror, and supernatural thrills.' },
  { name: 'Adventure', emoji: '🗺️', query: 'adventure', desc: 'Exploration, journeys, discovery, and questing across unique worlds.' },
  { name: 'Drama', emoji: '🎭', query: 'drama', desc: 'Character-driven stories, emotional conflicts, and heavy life paths.' },
  { name: 'Mystery', emoji: '🔍', query: 'mystery', desc: 'Solving puzzles, crime files, detective cases, and hidden truths.' },
  { name: 'Supernatural', emoji: '🔮', query: 'supernatural', desc: 'Gods, demons, superpowers, spirits, and anomalous elements.' },
  { name: 'Sports', emoji: '⚽', query: 'sports', desc: 'Team play, athletic competition, training, and matching challenges.' },
  { name: 'Historical', emoji: '⏳', query: 'historical', desc: 'Past eras, ancient dynasties, swordplay, and period dramas.' },
  { name: 'Sci-Fi', emoji: '🚀', query: 'sci-fi', desc: 'Futuristic tech, space travel, cyborgs, and speculative science.' },
];

export default function GenresContent() {
  return (
    <>
      <Navbar />
      <div className="gr-page">
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="gr-hero">
          <div className="gr-hero-bg-glow gr-hero-bg-glow--l" />
          <div className="gr-hero-bg-glow gr-hero-bg-glow--r" />
          <div className="gr-hero-grid-lines" />

          <div className="gr-hero-inner">
            <nav aria-label="Breadcrumb" className="gr-bc">
              <ol><li><Link href="/">Home</Link></li><li>›</li><li aria-current="page">Genres</li></ol>
            </nav>

            <div className="gr-badge">
              <span className="gr-badge-dot" />
              Manga Categories
            </div>

            <h1 className="gr-h1">
              Manga <span className="gr-gradient-text">Genres Directory</span>
            </h1>
            <p className="gr-tagline">Explore manga, manhwa, and manhua by theme and style.</p>
            <p className="gr-desc">
              Browse through our organized genres. Find stories featuring high-stakes battles, romantic encounters, dark mysteries, magical worlds, or comedic misunderstandings.
            </p>
          </div>
        </section>

        {/* ── GRID ──────────────────────────────────────────────────── */}
        <section className="gr-section">
          <div className="gr-wrap">
            <div className="gr-grid">
              {genres.map((g, i) => (
                <FadeIn key={g.name} delay={i * 50}>
                  <Link href={`/browse?include=${g.query}`} className="gr-card">
                    <span className="gr-card-emoji">{g.emoji}</span>
                    <h3 className="gr-card-title">{g.name}</h3>
                    <p className="gr-card-desc">{g.desc}</p>
                    <span className="gr-card-action">View Genre →</span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .gr-page { min-height: 100vh; color: var(--text); font-family: var(--font-inter,'Inter',sans-serif); overflow-x: hidden; }
        .gr-wrap { max-width: 1140px; margin: 0 auto; padding: 0 28px; }
        .gr-section { padding: 72px 0; position: relative; }

        /* ── HERO ──────────────────────────────────────────────────── */
        .gr-hero { position: relative; padding: 120px 28px 60px; overflow: hidden; text-align: center; background: radial-gradient(ellipse 100% 90% at 50% -20%, rgba(113,3,186,0.18) 0%, transparent 65%); }
        .gr-hero-bg-glow { position: absolute; border-radius: 50%; filter: blur(130px); pointer-events: none; opacity: 0.7; }
        .gr-hero-bg-glow--l { width: 560px; height: 560px; background: rgba(113,3,186,0.22); top: -80px; left: -200px; }
        .gr-hero-bg-glow--r { width: 480px; height: 480px; background: rgba(52,152,219,0.15); bottom: 0; right: -150px; }
        .gr-hero-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(113,3,186,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(113,3,186,0.05) 1px, transparent 1px); background-size: 56px 56px; pointer-events: none; }

        .gr-hero-inner { position: relative; z-index: 2; max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; align-items: center; }
        .gr-bc ol { display: flex; gap: 8px; list-style: none; padding: 0; margin: 0 0 24px; font-size: 0.8rem; color: var(--text-3); }
        .gr-bc a { color: var(--accent); }
        .gr-bc a:hover { text-decoration: underline; }

        .gr-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 99px; background: rgba(113,3,186,0.12); border: 1px solid rgba(113,3,186,0.35); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
        .gr-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }

        .gr-h1 { font-size: clamp(2.4rem, 5vw, 3.5rem); font-weight: 900; letter-spacing: -2px; line-height: 1.1; margin: 0 0 16px; }
        .gr-tagline { font-size: 1.2rem; font-weight: 700; color: var(--text-2); margin: 0 0 12px; }
        .gr-desc { font-size: 0.95rem; color: var(--text-3); line-height: 1.7; margin: 0; }
        .gr-gradient-text { background: linear-gradient(135deg, var(--accent), #3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

        /* ── GRID ──────────────────────────────────────────────────── */
        .gr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        
        .gr-card { background: var(--surface-2); border: 1px solid var(--border); border-radius: 18px; padding: 32px 24px; transition: all 0.25s; text-decoration: none; display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .gr-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), #3498db); opacity: 0; transition: opacity 0.25s; }
        .gr-card:hover::before { opacity: 1; }
        .gr-card:hover { border-color: rgba(113,3,186,0.5); transform: translateY(-6px); box-shadow: 0 24px 56px rgba(113,3,186,0.2); }
        
        .gr-card-emoji { font-size: 2.2rem; display: block; margin-bottom: 16px; }
        .gr-card-title { font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
        .gr-card-desc { font-size: 0.88rem; color: var(--text-3); line-height: 1.6; margin-bottom: 20px; flex: 1; }
        
        .gr-card-action { font-size: 0.82rem; font-weight: 700; color: var(--accent); transition: color 0.2s; }
        .gr-card:hover .gr-card-action { color: #a855f7; }

        @media (max-width: 640px) {
          .gr-hero { padding-top: 100px; }
          .gr-h1 { font-size: 2.1rem; }
        }
      `}</style>
    </>
  );
}
