import Navbar from '../../../components/Navbar';
import Image from 'next/image';
import { blogApi } from '../../../lib/api';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Dynamically fetch and display each individual article list
export async function generateMetadata({ params }) {
  const { slug } = await params;
  let title = 'Best Manga Recommendation Lists | ManiReader';
  let description = 'Curated recommendation list of best series to read online.';
  try {
    const res = await blogApi.get(slug);
    if (res.data) {
      title = `${res.data.title} | ManiReader`;
      description = res.data.content.substring(0, 150).replace(/[#*_]/g, '') + '...';
    }
  } catch {}

  return {
    title,
    description,
  };
}

// Simple Markdown bold and paragraph formatter
function formatText(text) {
  if (!text) return '';
  // Convert **text** to strong
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} style={{ color: '#fff', fontWeight: 800 }}>{part}</strong>;
    }
    return part;
  });
}

// Custom parser to format recommendations dynamically into card blocks with images
function parseContent(content) {
  if (!content) return [];
  const lines = content.split('\n');
  const items = [];
  let currentItem = null;
  let currentParagraph = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match: "1. **Title** - Description" or "1. **Title**: Description" or "1. Title - Description"
    const listMatch = trimmed.match(/^(\d+)\.\s+(?:\*\*(.*?)\*\*|([^-:\n]+))(?:\s*[-:]\s*(.*))?$/);
    if (listMatch) {
      if (currentItem) {
        items.push(currentItem);
        currentItem = null;
      } else if (currentParagraph.length > 0) {
        items.push({ type: 'text', text: currentParagraph.join('\n') });
        currentParagraph = [];
      }
      const num = listMatch[1];
      const title = listMatch[2] || listMatch[3];
      const desc = listMatch[4] || '';
      currentItem = {
        type: 'list-item',
        number: num,
        title: title.trim(),
        description: desc.trim(),
        image: null
      };
    } else {
      // Check if it's an image block: ![alt](url)
      const imgMatch = trimmed.match(/^!\[.*?\]\((.*?)\)$/);
      if (imgMatch && currentItem) {
        currentItem.image = imgMatch[1];
      } else if (currentItem) {
        // Append description lines to the current list item
        const descLine = trimmed.replace(/^-\s*/, ''); // strip leading dash if any
        if (currentItem.description) {
          currentItem.description += '\n' + descLine;
        } else {
          currentItem.description = descLine;
        }
      } else {
        currentParagraph.push(trimmed);
      }
    }
  }

  if (currentItem) {
    items.push(currentItem);
  } else if (currentParagraph.length > 0) {
    items.push({ type: 'text', text: currentParagraph.join('\n') });
  }

  return items;
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  let post = null;

  try {
    const res = await blogApi.get(slug);
    post = res.data;
  } catch (e) {
    // Ignore, will use fallbackSuggestions
  }

  // Pre-configured category meta fallback recommendations
  const fallbackSuggestions = {
    'best-romance-manga': {
      title: 'Best Romance Manga & Manhwa Recommendations',
      category: 'romance',
      content: 'Here are some of the top-rated romantic manhwa and manga series to capture your heart:\n\n1. **The Reason Why Raeliana Ended up at the Duke\'s Mansion** - Splendid historical fantasy romance with high stakes royalty drama.\n2. **My Dress-Up Darling** - Wholesome modern high-school slice of life romance focusing on cosplay and passion.\n3. **Sign** - A beautifully pacing sign-language romantic manhwa that delivers heartwarming emotions.\n4. **Beware of the Villainess!** - Hilarious otome reincarnation where the heroine kicks trashy male leads to the curb.'
    },
    'best-action-manga': {
      title: 'Best Action Manga & Manhwa Recommendations',
      category: 'action',
      content: 'Uncover the highest rated action and battle systems available to read online:\n\n1. **Solo Leveling** - The legendary gate hunter system manhwa that redefined action art style.\n2. **Omniscient Reader\'s Viewpoint** - A mind-bending story where the reader knows the entire world\'s apocalypse scenarios.\n3. **Nano Machine** - A glorious mashup of futuristic nanotech artificial intelligence and ancient martial arts.\n4. **Doom Breaker (Reincarnation of the Battle God)** - The last human combatant returns in time to crush demon gods.'
    },
    'best-isekai-fantasy-manga': {
      title: 'Best Isekai & Fantasy Manga & Manhwa Recommendations',
      category: 'isekai',
      content: 'Transport yourself into magical fantasy worlds, subverted tropes, and overpowered reincarnation series:\n\n1. **Beginning After The End** - King Grey reincarnates into a world of magic and monsters to redeem his past life.\n2. **Tensei Shitara Slime Datta Ken** - Reincarnating as a low-level slime, acquiring broken skills, and building a monster empire.\n3. **Mushoku Tensei** - The masterful father of modern isekai series following a flawed protagonist\'s redemption.\n4. **Lout of Count\'s Family** - Waking up inside a novel as a minor trash noble and preparing to avoid war to live a slacker life.'
    },
    'best-historical-manga': {
      title: 'Best Historical Manga & Manhwa Recommendations',
      category: 'historical',
      content: 'Journey back in time with dynastic politics, medieval fantasy, philosophical battles, and royal intrigue:\n\n1. **A Stepmother\'s Marchen** - Highly realistic, emotionally deep historical drama with magnificent cathedral artwork.\n2. **Kingdom** - Epic historical military fiction set during the warring states period in China, following Shin\'s path to Great General.\n3. **Who Made Me a Princess** - Stunning artwork following royal survival, magical family ties, and cold emperors.\n4. **Vagabond** - The philosophical life and battles of master swordsman Musashi Miyamoto.'
    }
  };

  const activePost = post || fallbackSuggestions[slug] || {
    title: slug.replace(/-/g, ' ').toUpperCase(),
    category: 'General',
    content: 'Check back later for curated reviews and list uploads!'
  };

  const sidebarLinks = [
    { name: 'Romance', slug: 'best-romance-manga', color: '#ff4d6d', icon: 'favorite' },
    { name: 'Action', slug: 'best-action-manga', color: '#ff9f43', icon: 'whatshot' },
    { name: 'Isekai / Fantasy', slug: 'best-isekai-fantasy-manga', color: '#00d2d3', icon: 'auto_awesome' },
    { name: 'Historical', slug: 'best-historical-manga', color: '#ffd700', icon: 'history_edu' },
  ];

  const parsedContent = parseContent(activePost.content);

  const getCategoryColor = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('romance')) return '#ff4d6d';
    if (c.includes('action')) return '#ff9f43';
    if (c.includes('isekai') || c.includes('fantasy')) return '#00d2d3';
    if (c.includes('historical')) return '#ffd700';
    return 'var(--accent)';
  };

  const activeColor = getCategoryColor(activePost.category?.name || activePost.category);

  return (
    <div className="page-wrapper" style={{ 
      background: 'var(--bg)', 
      minHeight: '100vh', 
      color: 'var(--text)',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 100
    }}>
      
      {/* Background Glowing Ambient Orbs */}
      <div style={{
        position: 'absolute',
        top: '-5%',
        right: '-5%',
        width: '50vw',
        height: '50vw',
        background: `radial-gradient(circle, ${activeColor}15 0%, transparent 70%)`,
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(113, 3, 186, 0.1) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Grid pattern overlay */}
      <div className="hero-grid-lines" style={{ opacity: 0.02, pointerEvents: 'none' }} />

      <Navbar />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 1200, padding: '40px 20px 80px' }}>
        
        {/* Back navigation */}
        <Link href="/blog" style={{ 
          color: 'var(--text-2)', 
          textDecoration: 'none', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 32, 
          fontSize: '0.95rem', 
          fontWeight: 700,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          padding: '8px 16px',
          borderRadius: 12,
        }}
        className="back-btn"
        >
          <span className="material-icons" style={{ fontSize: '1.1rem' }}>arrow_back</span> 
          Back to Curated Lists
        </Link>

        {/* Two-Column Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 300px', 
          gap: 40,
          alignItems: 'start'
        }}
        className="blog-grid-layout"
        >
          {/* Main Article column */}
          <article style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Title Card */}
            <header style={{ 
              background: 'rgba(18, 18, 26, 0.4)', 
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 24, 
              padding: '40px 32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <span style={{ 
                background: `rgba(${activeColor === '#ffd700' ? '255,215,0' : activeColor === '#00d2d3' ? '0,210,211' : activeColor === '#ff9f43' ? '255,159,67' : '255,77,109'}, 0.12)`, 
                border: `1px solid ${activeColor}`, 
                color: activeColor, 
                padding: '5px 14px', 
                borderRadius: 8, 
                fontSize: '0.75rem', 
                fontWeight: 800, 
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                display: 'inline-block'
              }}>
                {activePost.category?.name || activePost.category} Recommendation List
              </span>

              <h1 className="glow-text" style={{ 
                fontSize: 'clamp(2rem, 4vw, 2.8rem)', 
                fontWeight: 900, 
                marginTop: 20, 
                marginBottom: 16, 
                lineHeight: 1.2,
                background: 'linear-gradient(135deg, #fff 40%, var(--text-2) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {activePost.title}
              </h1>

              <div style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-3)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                marginTop: 8
              }}>
                <span className="material-icons" style={{ fontSize: '1rem' }}>schedule</span>
                {post ? `Published: ${new Date(post.createdAt).toLocaleDateString()}` : 'Official ManiReader Guide'}
              </div>
            </header>

            {/* Recommendations Content Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {(!activePost.entries || activePost.entries.length === 0) ? (
                <>
                  {parsedContent.map((block, idx) => {
                    if (block.type === 'text') {
                      return (
                        <p key={idx} style={{ 
                          fontSize: '1.1rem', 
                          lineHeight: 1.8, 
                          color: 'var(--text-2)', 
                          whiteSpace: 'pre-wrap',
                          padding: '0 8px'
                        }}>
                          {formatText(block.text)}
                        </p>
                      );
                    } else if (block.type === 'list-item') {
                      return (
                        <div 
                          key={idx}
                          style={{
                            background: 'rgba(18, 18, 26, 0.45)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: 20,
                            padding: 30,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative'
                          }}
                          className="recommendation-list-item-card"
                        >
                          {/* Left Badge with Rank */}
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            border: `2px solid ${activeColor}`,
                            background: `rgba(${activeColor === '#ffd700' ? '255,215,0' : activeColor === '#00d2d3' ? '0,210,211' : activeColor === '#ff9f43' ? '255,159,67' : '255,77,109'}, 0.08)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            color: activeColor,
                            flexShrink: 0,
                            boxShadow: `0 0 15px -3px ${activeColor}80`
                          }} className="rank-badge">
                            #{block.number}
                          </div>

                          {/* Optional Manga Image */}
                          {block.image && (
                            <div style={{
                              width: 110,
                              height: 165,
                              borderRadius: 12,
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                              position: 'relative'
                            }} className="manga-item-image-container">
                              <Image
                                src={block.image}
                                alt={block.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                referrerPolicy="no-referrer"
                                placeholder="blur"
                                blurDataURL="/placeholder-cover.jpg"
                              />
                            </div>
                          )}

                          {/* Info & Button */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                              <h3 style={{ 
                                fontSize: '1.35rem', 
                                fontWeight: 800, 
                                color: '#fff', 
                                lineHeight: 1.3,
                                marginBottom: 8
                              }}>
                                {block.title}
                              </h3>
                              <p style={{ 
                                fontSize: '0.98rem', 
                                lineHeight: 1.6, 
                                color: 'var(--text-2)', 
                                opacity: 0.9,
                                whiteSpace: 'pre-wrap'
                              }}>
                                {block.description}
                              </p>
                            </div>

                            {/* Search Link Button */}
                            <div style={{ marginTop: 8 }}>
                              <Link 
                                href={`/browse?keyword=${encodeURIComponent(block.title)}`}
                                className="btn btn-ghost btn-sm read-link"
                                style={{ 
                                  borderRadius: 10,
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  color: 'var(--text-2)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <span className="material-icons" style={{ fontSize: '1rem' }}>menu_book</span>
                                Read on ManiReader
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </>
              ) : (
                <>
                  {activePost.entries.map((entry, idx) => (
                    <div 
                      key={entry.id}
                      style={{
                        background: 'rgba(18, 18, 26, 0.45)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 20,
                        padding: 30,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        display: 'flex',
                        gap: 24
                      }}
                      className="recommendation-list-item-card"
                    >
                      {/* Left Badge with Rank */}
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        border: `2px solid ${activeColor}`,
                        background: `rgba(${activeColor === '#ffd700' ? '255,215,0' : activeColor === '#00d2d3' ? '0,210,211' : activeColor === '#ff9f43' ? '255,159,67' : '255,77,109'}, 0.08)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: activeColor,
                        flexShrink: 0,
                        boxShadow: `0 0 15px -3px ${activeColor}80`
                      }} className="rank-badge">
                        #{idx + 1}
                      </div>

                      {/* Optional Manga Image */}
                      {entry.image && (
                        <div style={{
                          width: 110,
                          height: 165,
                          borderRadius: 12,
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                          position: 'relative'
                        }} className="manga-item-image-container">
                          <img
                            src={entry.image}
                            alt={entry.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Info & Button */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <h3 style={{ 
                            fontSize: '1.35rem', 
                            fontWeight: 800, 
                            color: '#fff', 
                            lineHeight: 1.3,
                            marginBottom: 8
                          }}>
                            {entry.title}
                          </h3>
                          <p style={{ 
                            fontSize: '0.98rem', 
                            lineHeight: 1.6, 
                            color: 'var(--text-2)', 
                            opacity: 0.9,
                            whiteSpace: 'pre-wrap'
                          }}>
                            {formatText(entry.content)}
                          </p>
                        </div>

                        {/* Search Link Button */}
                        <div style={{ marginTop: 8 }}>
                          <Link 
                            href={`/manga/${entry.slug}`}
                            className="btn btn-ghost btn-sm read-link"
                            style={{ 
                              borderRadius: 10,
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              color: 'var(--text-2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: '1rem' }}>menu_book</span>
                            Read on ManiReader
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </article>

          {/* Quick Navigation Sidebar */}
          <aside style={{ 
            position: 'sticky', 
            top: 130,
            display: 'flex', 
            flexDirection: 'column', 
            gap: 24 
          }}
          className="blog-sidebar"
          >
            <div style={{
              background: 'rgba(18, 18, 26, 0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 24,
              padding: 24,
            }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                color: 'var(--text-3)',
                marginBottom: 16
              }}>
                Curated Categories
              </h3>
              
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sidebarLinks.map((link) => {
                  const isCurrent = slug === link.slug;
                  return (
                    <Link 
                      key={link.slug}
                      href={`/blog/${link.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: isCurrent ? `rgba(${link.color === '#ffd700' ? '255,215,0' : link.color === '#00d2d3' ? '0,210,211' : link.color === '#ff9f43' ? '255,159,67' : '255,77,109'}, 0.08)` : 'transparent',
                        border: '1px solid',
                        borderColor: isCurrent ? link.color : 'transparent',
                        color: isCurrent ? '#fff' : 'var(--text-2)',
                        fontSize: '0.9rem',
                        fontWeight: isCurrent ? 700 : 500,
                      }}
                      className="sidebar-nav-link"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="material-icons" style={{ 
                          fontSize: '1.1rem', 
                          color: link.color,
                          textShadow: isCurrent ? `0 0 10px ${link.color}` : 'none'
                        }}>
                          {link.icon}
                        </span>
                        {link.name}
                      </div>
                      <span className="material-icons" style={{ 
                        fontSize: '1rem', 
                        opacity: isCurrent ? 1 : 0, 
                        color: link.color 
                      }}>
                        chevron_right
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Aesthetic card promotion */}
            <div style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              borderRadius: 24,
              padding: 28,
              boxShadow: '0 20px 40px var(--accent-glow)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
              
              <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>
                Join the Sanctuary
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: 20 }}>
                Create collections, track chapters, and rate your favorite series ad-free.
              </p>
              
              <Link href="/" className="btn" style={{ 
                background: '#fff', 
                color: 'var(--accent)', 
                width: '100%', 
                textAlign: 'center',
                padding: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                borderRadius: 12
              }}>
                Go to Homepage
              </Link>
            </div>
          </aside>
        </div>
      </div>
      
      {/* Sidebar Responsive and Hover Styling overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        .back-btn {
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          border-color: ${activeColor} !important;
          color: #fff !important;
        }
        .read-link {
          transition: all 0.2s ease;
        }
        .read-link:hover {
          border-color: ${activeColor} !important;
          color: #fff !important;
        }
        .sidebar-nav-link {
          transition: all 0.2s ease-in-out;
        }
        .sidebar-nav-link:hover {
          background: rgba(255, 255, 255, 0.02) !important;
          color: #fff !important;
        }
        .recommendation-list-item-card {
          display: flex;
          gap: 24px;
        }
        .recommendation-list-item-card:hover {
          transform: translateY(-4px);
          border-color: ${activeColor} !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25), 0 0 20px ${activeColor}1a;
        }
        @media (max-width: 900px) {
          .blog-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .blog-sidebar {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .recommendation-list-item-card {
            flex-direction: column !important;
            gap: 20px !important;
            padding: 24px !important;
          }
          .manga-item-image-container {
            width: 100% !important;
            height: 280px !important;
          }
        }
      `}} />
    </div>
  );
}
