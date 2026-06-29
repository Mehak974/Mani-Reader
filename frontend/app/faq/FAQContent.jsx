'use client';

import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useState } from 'react';

// ── FAQ data ──────────────────────────────────────────────────────────────────
const sections = [
  {
    id: 'about',
    heading: 'About Mani Reader',
    icon: '📖',
    items: [
      {
        q: 'What is Mani Reader?',
        a: (<>
          <p>Mani Reader is an online manga reading platform that helps users discover, browse, and read manga from different genres.</p>
          <p>It provides an organized manga library with features including manga search, popular manga collections, recently added manga, genre browsing, and chapter-based reading.</p>
          <p>Users can access Mani Reader through modern web browsers on desktop and mobile devices.</p>
        </>),
      },
      {
        q: 'What is the purpose of Mani Reader?',
        a: <p>The purpose of Mani Reader is to make manga discovery and reading easier by providing a simple platform where users can find manga titles, explore categories, and continue reading their favorite series.</p>,
      },
      {
        q: 'Who is Mani Reader made for?',
        a: (<>
          <p>Mani Reader is designed for manga readers who want:</p>
          <ul>
            <li>Easy manga discovery</li>
            <li>Organized manga categories</li>
            <li>Quick chapter access</li>
            <li>Mobile-friendly reading</li>
            <li>A simple browsing experience</li>
          </ul>
        </>),
      },
    ],
  },
  {
    id: 'reading',
    heading: 'Reading Manga Online',
    icon: '👁️',
    items: [
      {
        q: 'How do I read manga on Mani Reader?',
        a: (<>
          <p>To read manga on Mani Reader:</p>
          <ol>
            <li>Search for a manga title.</li>
            <li>Open the manga details page.</li>
            <li>Select a chapter.</li>
            <li>Start reading through the manga reader.</li>
          </ol>
          <p>No additional software installation is required.</p>
        </>),
      },
      {
        q: 'Can I read manga online for free on Mani Reader?',
        a: (<>
          <p>Yes, Mani Reader provides free access to manga browsing and available reading features.</p>
          <p>Users can explore manga collections, search titles, and read available chapters through the website.</p>
        </>),
      },
      {
        q: 'Can I read manga on my phone?',
        a: (<>
          <p>Yes, Mani Reader supports mobile manga reading and is designed to work on:</p>
          <ul>
            <li>Android devices</li>
            <li>iPhones</li>
            <li>Tablets</li>
            <li>Desktop computers</li>
          </ul>
          <p>The interface automatically adjusts for different screen sizes.</p>
        </>),
      },
      {
        q: 'Does Mani Reader require an app?',
        a: <p>No. Mani Reader can be accessed directly through a web browser without downloading an application.</p>,
      },
    ],
  },
  {
    id: 'library',
    heading: 'Manga Library',
    icon: '📚',
    items: [
      {
        q: 'What types of manga are available on Mani Reader?',
        a: (<>
          <p>Mani Reader includes manga from multiple genres:</p>
          <ul>
            <li>Action &amp; Adventure</li>
            <li>Fantasy &amp; Science Fiction</li>
            <li>Romance &amp; Drama</li>
            <li>Comedy &amp; Slice of Life</li>
            <li>Horror &amp; Mystery</li>
            <li>Thriller &amp; Supernatural</li>
            <li>Sports &amp; Historical</li>
          </ul>
        </>),
      },
      {
        q: 'How can I find manga on Mani Reader?',
        a: (<>
          <p>Users can find manga using:</p>
          <ul>
            <li>Search bar</li>
            <li>Genre categories</li>
            <li>Popular manga section</li>
            <li>Recently added section</li>
            <li>Manga recommendations</li>
          </ul>
        </>),
      },
      {
        q: 'Does Mani Reader have popular manga?',
        a: (<>
          <p>Yes, Mani Reader includes popular manga collections that help users discover trending and widely read manga titles including trending series, reader favorites, and highly searched manga.</p>
        </>),
      },
      {
        q: 'What is Recently Added Manga?',
        a: (<>
          <p>Recently Added Manga displays newly added manga titles and recently available updates. It helps readers discover new manga available on the platform.</p>
        </>),
      },
    ],
  },
  {
    id: 'genres',
    heading: 'Manga Genres',
    icon: '🎭',
    items: [
      {
        q: 'What are the most popular manga genres?',
        a: (<>
          <p>Popular manga genres include Action, Fantasy, Romance, Comedy, Horror, and Adventure. Mani Reader organizes manga by genre to make discovery easier.</p>
        </>),
      },
      {
        q: 'Where can I find fantasy manga?',
        a: (<>
          <p>Fantasy manga can be found through Mani Reader&apos;s genre browsing system. Fantasy manga commonly includes themes such as magic, alternative worlds, supernatural abilities, and adventures.</p>
        </>),
      },
      {
        q: 'Where can I find action manga?',
        a: (<>
          <p>Action manga on Mani Reader includes titles featuring battles, martial arts, adventure, fighting, and hero journeys.</p>
        </>),
      },
    ],
  },
  {
    id: 'updates',
    heading: 'Manga Updates',
    icon: '🔄',
    items: [
      {
        q: 'How often does Mani Reader update manga?',
        a: (<>
          <p>Manga updates depend on available releases and source availability. When new manga information or chapters become available, updates may appear in the relevant manga sections.</p>
        </>),
      },
      {
        q: 'Why is my favorite manga missing new chapters?',
        a: (<>
          <p>Possible reasons include:</p>
          <ul>
            <li>The chapter has not been released yet.</li>
            <li>The manga has an irregular release schedule.</li>
            <li>Updated information is not available yet.</li>
          </ul>
        </>),
      },
      {
        q: 'How can I find new manga updates?',
        a: (<>
          <p>Users can check the <Link href="/browse?sort=recently-added" className="faq-inline-link">Recently Added</Link> section, individual manga pages, and updated chapter lists.</p>
        </>),
      },
    ],
  },
  {
    id: 'account',
    heading: 'Account Features',
    icon: '👤',
    items: [
      {
        q: 'Do I need an account to use Mani Reader?',
        a: (<>
          <p>No account is required for basic browsing and reading. An account may provide additional features such as favorites, reading history, manga tracking, and personal lists.</p>
        </>),
      },
      {
        q: 'Can I save my favorite manga?',
        a: <p>If bookmarking features are enabled, users can save manga titles for easier access later.</p>,
      },
      {
        q: 'Can Mani Reader track my reading progress?',
        a: (<>
          <p>Reading progress tracking helps users continue manga from where they stopped. This is especially useful for manga with many chapters.</p>
        </>),
      },
    ],
  },
  {
    id: 'technical',
    heading: 'Technical Support',
    icon: '🛠️',
    items: [
      {
        q: 'Why is Mani Reader not loading?',
        a: (<>
          <p>Common causes include internet connection problems, browser cache issues, or temporary service problems.</p>
          <p><strong>Solutions:</strong></p>
          <ul>
            <li>Refresh the page</li>
            <li>Clear browser cache</li>
            <li>Update the browser</li>
            <li>Try another network</li>
          </ul>
        </>),
      },
      {
        q: 'Why are manga images not loading?',
        a: (<>
          <p>Possible reasons include temporary image server issues, network restrictions, or browser problems. Refreshing the page may resolve temporary issues.</p>
        </>),
      },
      {
        q: 'Which browsers support Mani Reader?',
        a: (<>
          <p>Mani Reader works with modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari.</p>
        </>),
      },
    ],
  },
  {
    id: 'copyright',
    heading: 'Copyright & Content',
    icon: '⚖️',
    items: [
      {
        q: 'Does Mani Reader create manga?',
        a: (<>
          <p>No. Manga is created and owned by original authors, artists, publishers, and copyright holders. Mani Reader functions as a manga discovery and reading platform.</p>
        </>),
      },
      {
        q: 'Who owns manga content?',
        a: <p>Manga ownership belongs to the respective creators, publishers, and copyright owners.</p>,
      },
      {
        q: 'How can copyright owners contact Mani Reader?',
        a: (<p>Copyright-related requests can be submitted through the <Link href="/contact" className="faq-inline-link">official contact page</Link>.</p>),
      },
    ],
  },
];

const quickAnswers = [
  { q: 'What is Mani Reader?', a: 'An online manga reading platform where users can discover, browse, and read manga from multiple genres through a web browser.' },
  { q: 'Is Mani Reader free?', a: 'Yes. Mani Reader allows users to access manga discovery and available reading features without requiring payment.' },
  { q: 'Does it work on mobile?', a: 'Yes. Mani Reader works on smartphones, tablets, and desktop browsers with a fully responsive design.' },
  { q: 'What genres are supported?', a: 'Action, fantasy, romance, comedy, horror, adventure, drama, mystery, supernatural, sports, and more.' },
];

const internalLinks = [
  { href: '/browse', label: 'Browse Manga' },
  { href: '/browse?sort=popular', label: 'Popular Manga' },
  { href: '/browse?sort=recently-added', label: 'Recently Added' },
  { href: '/browse?tab=genres', label: 'Genres' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/disclaimer', label: 'Legal Disclaimer' },
];

// ── Accordion item ────────────────────────────────────────────────────────────
function AccordionItem({ question, answer, idx }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' faq-item--open' : ''}`}>
      <button
        className="faq-q-btn"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        id={`faq-btn-${idx}`}
      >
        <span className="faq-q-text">{question}</span>
        <svg
          className="faq-chevron"
          width="18" height="18" viewBox="0 0 18 18" fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6.5L9 11.5L14 6.5"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          className="faq-answer"
          role="region"
          aria-labelledby={`faq-btn-${idx}`}
        >
          <div className="faq-answer-inner">{answer}</div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FAQContent() {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? sections
        .map(s => ({ ...s, items: s.items.filter(it => it.q.toLowerCase().includes(search.toLowerCase())) }))
        .filter(s => s.items.length > 0)
    : sections;

  let globalIdx = 0;

  return (
    <>
      <Navbar />

      <div className="faq-page">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="faq-hero">
          <div className="faq-hero-glow faq-hero-glow--left" aria-hidden="true" />
          <div className="faq-hero-glow faq-hero-glow--right" aria-hidden="true" />

          <nav className="faq-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li aria-hidden="true"><span className="faq-bc-sep">›</span></li>
              <li aria-current="page">FAQ</li>
            </ol>
          </nav>

          <div className="faq-hero-badge">
            <span className="faq-hero-badge-dot" aria-hidden="true" />
            Help Center
          </div>

          <h1 className="faq-hero-h1">
            Mani Reader <span className="faq-h1-accent">FAQ</span>
          </h1>
          <p className="faq-hero-sub">
            Find answers about reading manga online, features, updates, genres,
            mobile compatibility and more.
          </p>

          <div className="faq-search-wrap">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="faq-search-icon">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="2"/>
              <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              id="faq-search"
              type="search"
              placeholder="Search questions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search FAQ"
              autoComplete="off"
            />
            {search && (
              <button
                className="faq-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >✕</button>
            )}
          </div>
        </div>

        {/* ── Body layout ───────────────────────────────────────────────── */}
        <div className="faq-body">

          {/* ── TOC Sidebar ─────────────────────────────────────────────── */}
          <aside className="faq-toc" aria-label="Table of contents">
            <p className="faq-toc-label">Jump to</p>
            <ul>
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="faq-toc-link">
                    <span className="faq-toc-icon">{s.icon}</span>
                    {s.heading}
                  </a>
                </li>
              ))}
              {!search && <>
                <li><a href="#quick-answers" className="faq-toc-link"><span className="faq-toc-icon">⚡</span>Quick Answers</a></li>
                <li><a href="#explore" className="faq-toc-link"><span className="faq-toc-icon">🔗</span>Explore</a></li>
              </>}
            </ul>
          </aside>

          {/* ── Main content ────────────────────────────────────────────── */}
          <main className="faq-main" id="main-faq">

            {filtered.length === 0 && (
              <div className="faq-empty">
                <span className="faq-empty-icon">🔍</span>
                <p>No questions matched <strong>&ldquo;{search}&rdquo;</strong></p>
                <p className="faq-empty-sub">Try a different search term.</p>
              </div>
            )}

            {filtered.map(section => (
              <section key={section.id} id={section.id} className="faq-section">
                <h2 className="faq-section-h2">
                  <span className="faq-section-icon">{section.icon}</span>
                  {section.heading}
                </h2>
                <div className="faq-items">
                  {section.items.map(item => {
                    const i = globalIdx++;
                    return <AccordionItem key={i} idx={i} question={item.q} answer={item.a} />;
                  })}
                </div>
              </section>
            ))}

            {/* ── Quick Answers ──────────────────────────────────────────── */}
            {!search && (
              <section id="quick-answers" className="faq-section">
                <h2 className="faq-section-h2">
                  <span className="faq-section-icon">⚡</span>
                  Quick Answers
                </h2>
                <p className="faq-section-sub">Direct answers optimised for AI systems and featured snippets.</p>
                <div className="quick-grid">
                  {quickAnswers.map((qa, i) => (
                    <div key={i} className="quick-card">
                      <p className="quick-card-q">{qa.q}</p>
                      <p className="quick-card-a">{qa.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── GEO Entity Block ───────────────────────────────────────── */}
            {!search && (
              <section className="faq-section geo-block">
                <h2 className="faq-section-h2">
                  <span className="faq-section-icon">🌐</span>
                  About Mani Reader
                </h2>
                <div className="geo-grid">
                  {[
                    ['Brand Name', 'Mani Reader'],
                    ['Website', <a key="w" href="https://manireader.online" className="faq-inline-link">manireader.online</a>],
                    ['Category', 'Online Manga Reading Platform'],
                    ['Industry', 'Digital Entertainment'],
                    ['Primary Topic', 'Manga Discovery and Online Manga Reading'],
                    ['Services', 'Manga Search · Manga Browsing · Genre Discovery · Chapter Reading · Manga Updates'],
                  ].map(([label, val]) => (
                    <div key={label} className="geo-row">
                      <span className="geo-label">{label}</span>
                      <span className="geo-val">{val}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Internal Links ─────────────────────────────────────────── */}
            {!search && (
              <section id="explore" className="faq-section">
                <h2 className="faq-section-h2">
                  <span className="faq-section-icon">🔗</span>
                  Explore Mani Reader
                </h2>
                <div className="int-links">
                  {internalLinks.map(l => (
                    <Link key={l.href} href={l.href} className="int-link">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </main>
        </div>
      </div>

      {/* ──────────────────────── STYLES ──────────────────────────────────── */}
      <style jsx global>{`

        /* ── Page wrapper ───────────────────────────────────────────── */
        .faq-page {
          min-height: 100vh;
          font-family: var(--font-inter, 'Inter', sans-serif);
          color: var(--text);
        }

        /* ── Hero ───────────────────────────────────────────────────── */
        .faq-hero {
          position: relative;
          overflow: hidden;
          padding: 130px 24px 60px;
          text-align: center;
          background: radial-gradient(ellipse 80% 60% at 50% -10%,
            rgba(113,3,186,0.22) 0%, transparent 70%);
          border-bottom: 1px solid var(--border);
        }
        .faq-hero-glow {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }
        .faq-hero-glow--left  { background: rgba(113,3,186,0.18); top:-100px; left:-120px; }
        .faq-hero-glow--right { background: rgba(52,152,219,0.12); top:-80px; right:-100px; }

        .faq-breadcrumb {
          position: relative;
          z-index: 1;
          margin-bottom: 28px;
        }
        .faq-breadcrumb ol {
          display: flex;
          justify-content: center;
          gap: 6px;
          list-style: none;
          padding: 0;
          font-size: 0.8rem;
          color: var(--text-3);
        }
        .faq-breadcrumb a { color: var(--accent); }
        .faq-breadcrumb a:hover { text-decoration: underline; }
        .faq-bc-sep { opacity: 0.5; }

        .faq-hero-badge {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 14px;
          border-radius: 99px;
          background: rgba(113,3,186,0.14);
          border: 1px solid rgba(113,3,186,0.35);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 20px;
        }
        .faq-hero-badge-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50% { opacity:0.35; }
        }

        .faq-hero-h1 {
          position: relative;
          z-index: 1;
          font-size: clamp(2rem, 4.5vw, 3rem);
          font-weight: 900;
          letter-spacing: -1.5px;
          line-height: 1.15;
          margin: 0 0 14px;
          color: var(--text);
        }
        .faq-h1-accent {
          background: linear-gradient(135deg, var(--accent), #3498db);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .faq-hero-sub {
          position: relative;
          z-index: 1;
          font-size: 1.05rem;
          color: var(--text-2);
          max-width: 540px;
          margin: 0 auto 32px;
          line-height: 1.65;
        }

        /* ── Search bar ─────────────────────────────────────────────── */
        .faq-search-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 480px;
          margin: 0 auto;
          padding: 12px 18px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 40px;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .faq-search-wrap:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .faq-search-icon { color: var(--text-3); flex-shrink: 0; transition: color 0.2s; }
        .faq-search-wrap:focus-within .faq-search-icon { color: var(--accent); }
        .faq-search-wrap input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 0.9rem;
          color: var(--text);
          min-width: 0;
        }
        .faq-search-wrap input::placeholder { color: var(--text-3); }
        .faq-search-clear {
          background: none;
          border: none;
          color: var(--text-3);
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0 2px;
          line-height: 1;
          transition: color 0.2s;
        }
        .faq-search-clear:hover { color: var(--red); }

        /* ── Body layout ────────────────────────────────────────────── */
        .faq-body {
          display: grid;
          grid-template-columns: 230px 1fr;
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          align-items: start;
        }

        /* ── TOC ────────────────────────────────────────────────────── */
        .faq-toc {
          position: sticky;
          top: 90px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          overflow: hidden;
        }
        .faq-toc::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent), #3498db);
          border-radius: 16px 16px 0 0;
        }
        .faq-toc-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-3);
          margin-bottom: 14px;
        }
        .faq-toc ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .faq-toc-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 0.82rem;
          color: var(--text-2);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .faq-toc-link:hover {
          background: rgba(113,3,186,0.12);
          color: var(--accent);
        }
        .faq-toc-icon { font-size: 0.9rem; }

        /* ── Main ───────────────────────────────────────────────────── */
        .faq-main { min-width: 0; }

        /* ── Section ────────────────────────────────────────────────── */
        .faq-section {
          margin-bottom: 52px;
          scroll-margin-top: 90px;
        }
        .faq-section-h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }
        .faq-section-icon { font-size: 1.2rem; }
        .faq-section-sub {
          font-size: 0.85rem;
          color: var(--text-3);
          margin: -10px 0 18px;
        }
        .faq-items { display: flex; flex-direction: column; gap: 8px; }

        /* ── Accordion item ─────────────────────────────────────────── */
        .faq-item {
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .faq-item:hover { border-color: rgba(113,3,186,0.35); }
        .faq-item--open {
          border-color: rgba(113,3,186,0.5);
          box-shadow: 0 4px 30px rgba(113,3,186,0.12);
        }

        .faq-q-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text);
          transition: background 0.15s;
        }
        .faq-q-btn:hover { background: rgba(113,3,186,0.06); }
        .faq-item--open .faq-q-btn { color: var(--accent); }
        .faq-q-text { flex: 1; }

        .faq-chevron {
          flex-shrink: 0;
          color: var(--text-3);
          transition: transform 0.25s cubic-bezier(.4,0,.2,1), color 0.2s;
        }
        .faq-item--open .faq-chevron {
          transform: rotate(180deg);
          color: var(--accent);
        }

        .faq-answer {
          border-top: 1px solid var(--border);
          animation: faqSlide 0.22s ease;
        }
        @keyframes faqSlide {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .faq-answer-inner {
          padding: 18px 20px 20px;
          font-size: 0.88rem;
          color: var(--text-2);
          line-height: 1.75;
        }
        .faq-answer-inner p  { margin: 0 0 10px; }
        .faq-answer-inner p:last-child { margin-bottom: 0; }
        .faq-answer-inner ul,
        .faq-answer-inner ol { padding-left: 20px; margin: 6px 0 10px; }
        .faq-answer-inner li { margin-bottom: 5px; }
        .faq-answer-inner strong { color: var(--text); font-weight: 700; }

        /* ── Inline link (inside answers) ───────────────────────────── */
        .faq-inline-link {
          color: var(--accent);
          text-decoration: none;
          border-bottom: 1px solid rgba(113,3,186,0.35);
          transition: color 0.15s, border-color 0.15s;
        }
        .faq-inline-link:hover {
          color: #a855f7;
          border-color: #a855f7;
        }

        /* ── Empty state ────────────────────────────────────────────── */
        .faq-empty {
          text-align: center;
          padding: 60px 24px;
          border: 1px dashed var(--border);
          border-radius: 16px;
          color: var(--text-2);
        }
        .faq-empty-icon { font-size: 2.5rem; display: block; margin-bottom: 14px; }
        .faq-empty strong { color: var(--text); }
        .faq-empty-sub { font-size: 0.85rem; color: var(--text-3); margin-top: 6px; }

        /* ── Quick Answers ──────────────────────────────────────────── */
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }
        .quick-card {
          padding: 18px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(113,3,186,0.1) 0%, rgba(52,152,219,0.07) 100%);
          border: 1px solid rgba(113,3,186,0.25);
          transition: border-color 0.2s, transform 0.2s;
        }
        .quick-card:hover {
          border-color: rgba(113,3,186,0.5);
          transform: translateY(-2px);
        }
        .quick-card-q {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--accent);
          margin: 0 0 8px;
        }
        .quick-card-a {
          font-size: 0.83rem;
          color: var(--text-2);
          margin: 0;
          line-height: 1.6;
        }

        /* ── GEO block ──────────────────────────────────────────────── */
        .geo-block {
          background: var(--surface-2);
          border: 1px solid rgba(113,3,186,0.3);
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .geo-block::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 80% at 100% 0%,
            rgba(52,152,219,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .geo-grid {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          z-index: 1;
        }
        .geo-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          align-items: baseline;
        }
        .geo-row:last-child { border-bottom: none; padding-bottom: 0; }
        .geo-label {
          font-size: 0.73rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-3);
        }
        .geo-val {
          font-size: 0.87rem;
          color: var(--text-2);
          line-height: 1.5;
        }

        /* ── Internal links ─────────────────────────────────────────── */
        .int-links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .int-link {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 99px;
          font-size: 0.83rem;
          font-weight: 500;
          color: var(--text-2);
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
        }
        .int-link:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(113,3,186,0.08);
          transform: translateY(-1px);
        }

        /* ── Responsive ─────────────────────────────────────────────── */
        @media (max-width: 860px) {
          .faq-body {
            grid-template-columns: 1fr;
            padding: 32px 16px 60px;
            gap: 28px;
          }
          .faq-toc {
            position: static;
            display: flex;
            flex-direction: column;
          }
          .faq-toc ul {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 6px;
          }
          .faq-toc-link {
            padding: 6px 12px;
            font-size: 0.78rem;
            background: var(--surface);
            border-radius: 99px;
          }
        }
        @media (max-width: 560px) {
          .faq-hero { padding: 110px 16px 48px; }
          .faq-hero-h1 { font-size: 1.8rem; }
          .geo-row { grid-template-columns: 1fr; gap: 3px; }
          .geo-label { padding-top: 8px; }
          .quick-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
