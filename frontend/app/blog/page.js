import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { blogApi } from '../../lib/api';

export const metadata = {
  title: 'Best Manga Curated Lists & Reviews | ManiReader',
  description: 'Explore premium handpicked lists of the best Action, Romance, Historical, and Isekai manhwa & manga recommendations.',
};

export default async function BlogIndexPage() {
  let posts = [];
  try {
    const res = await blogApi.list();
    posts = res.data || [];
  } catch (err) {
    console.error('Failed to load blog posts list on index:', err.message);
  }

  // Pre-filtered standard categorised links with design tokens
  const categories = [
    { 
      name: 'Best Romance Manga', 
      slug: 'best-romance-manga', 
      category: 'romance',
      icon: 'favorite',
      color: '#ff4d6d',
      glow: 'rgba(255, 77, 109, 0.4)',
      badge: 'Love & Drama',
      desc: 'Swoon-worthy romances, high school drama, and historical otome reincarnations.'
    },
    { 
      name: 'Best Action Manga', 
      slug: 'best-action-manga', 
      category: 'action',
      icon: 'whatshot',
      color: '#ff9f43',
      glow: 'rgba(255, 159, 67, 0.4)',
      badge: 'Adrenaline Rush',
      desc: 'High-octane battles, overpowered systems, and martial arts cultivation paths.'
    },
    { 
      name: 'Best Isekai & Fantasy', 
      slug: 'best-isekai-fantasy-manga', 
      category: 'isekai',
      icon: 'auto_awesome',
      color: '#00d2d3',
      glow: 'rgba(0, 210, 211, 0.4)',
      badge: 'Otherworldly Realms',
      desc: 'Transported to magical worlds, monster empires, and royal fantasy chronicles.'
    },
    { 
      name: 'Best Historical Manga', 
      slug: 'best-historical-manga', 
      category: 'historical',
      icon: 'history_edu',
      color: '#ffd700',
      glow: 'rgba(255, 215, 0, 0.4)',
      badge: 'Medieval Intrigue',
      desc: 'Dynastic politics, swordmasters, philosophy, and medieval nobility struggles.'
    },
  ];

  return (
    <div style={{ 
      background: 'var(--bg)', 
      minHeight: '100vh', 
      color: 'var(--text)', 
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Background Glowing Ambient Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(113, 3, 186, 0.15) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '-10%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Grid Pattern overlay */}
      <div className="hero-grid-lines" style={{ opacity: 0.03, pointerEvents: 'none' }} />

      <Navbar />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 1200, padding: '140px 20px 80px' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ 
            background: 'var(--accent-glow)', 
            border: '1px solid var(--border)', 
            color: 'var(--text-2)', 
            padding: '6px 16px', 
            borderRadius: 99, 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            display: 'inline-block',
            marginBottom: 16
          }}>
            Curator Editorial
          </span>
          <h1 className="glow-text" style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', 
            fontWeight: 900, 
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 16,
            background: 'linear-gradient(135deg, #fff 30%, var(--text-2) 70%, var(--accent-2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Curated Recommendations
          </h1>
          <p style={{ 
            color: 'var(--text-2)', 
            fontSize: '1.2rem', 
            maxWidth: 680, 
            margin: '0 auto', 
            lineHeight: 1.6,
            opacity: 0.85
          }}>
            Explore premium handpicked compilations, comprehensive reviews, and reading tier lists crafted for true enthusiasts.
          </p>
        </div>

        {/* Categories Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', 
          gap: 30, 
          marginBottom: 80 
        }}>
          {categories.map((cat) => {
            const matchedPost = posts.find(p => p.slug === cat.slug || p.category === cat.category);
            return (
              <div 
                key={cat.slug} 
                style={{ 
                  background: 'rgba(18, 18, 26, 0.45)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(155, 89, 182, 0.15)',
                  borderRadius: 24, 
                  padding: 32, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="manga-card"
              >
                {/* Glow spot behind icon */}
                <div style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  background: `radial-gradient(circle, ${cat.glow} 0%, transparent 70%)`,
                  pointerEvents: 'none'
                }} />

                <div>
                  {/* Category Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 16, 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: `0 0 15px -3px ${cat.glow}`
                    }}>
                      <span className="material-icons" style={{ 
                        color: cat.color, 
                        fontSize: '1.6rem',
                        textShadow: `0 0 10px ${cat.color}`
                      }}>
                        {cat.icon}
                      </span>
                    </div>

                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      color: cat.color, 
                      background: `rgba(${cat.color === '#ffd700' ? '255,215,0' : cat.color === '#00d2d3' ? '0,210,211' : cat.color === '#ff9f43' ? '255,159,67' : '255,77,109'}, 0.1)`, 
                      padding: '4px 10px', 
                      borderRadius: 99,
                      border: `1px solid ${cat.color}33`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {cat.badge}
                    </span>
                  </div>

                  {/* Category Title */}
                  <h3 style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: 800, 
                    color: 'var(--text)', 
                    marginBottom: 12,
                    letterSpacing: '-0.02em'
                  }}>
                    {cat.name}
                  </h3>
                  
                  {/* Description */}
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-2)', 
                    lineHeight: 1.6, 
                    marginBottom: 28,
                    opacity: 0.8 
                  }}>
                    {matchedPost ? (matchedPost.content.substring(0, 80) + '...') : cat.desc}
                  </p>
                </div>

                <Link 
                  href={`/blog/category/${cat.category}`}
                  className="btn jewel-btn"
                  style={{ 
                    textDecoration: 'none', 
                    textAlign: 'center', 
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.9rem', 
                    fontWeight: 700,
                    borderRadius: 14
                  }}
                >
                  Browse Lists
                </Link>
              </div>
            );
          })}
        </div>

        {/* More Articles Section */}
        {posts.length > categories.length && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              fontWeight: 850, 
              marginBottom: 24,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <span className="material-icons" style={{ color: 'var(--accent)' }}>dashboard</span>
              Community Submissions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {posts.filter(p => !categories.some(c => c.slug === p.slug)).map(post => (
                <Link 
                  key={post.id} 
                  href={`/blog/${post.slug}`}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '24px 30px', 
                    background: 'rgba(18, 18, 26, 0.3)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border)', 
                    borderRadius: 20, 
                    textDecoration: 'none',
                  }}
                  className="community-post-link"
                >
                  <div>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      color: 'var(--accent)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em',
                      display: 'block',
                      marginBottom: 6
                    }}>
                      {post.category?.name || post.category}
                    </span>
                    <h4 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem' }}>{post.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      Published {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}>
                    <span className="material-icons" style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>arrow_forward</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .community-post-link {
          transition: all 0.2s ease-in-out;
        }
        .community-post-link:hover {
          border-color: rgba(155, 89, 182, 0.4) !important;
          background: rgba(18, 18, 26, 0.6) !important;
          transform: translateX(6px);
        }
      `}} />
    </div>
  );
}
