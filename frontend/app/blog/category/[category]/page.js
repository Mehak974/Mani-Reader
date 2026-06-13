import Link from 'next/link';
import Navbar from '../../../../components/Navbar';
import { blogApi } from '../../../../lib/api';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `Best ${capitalized} Manga Recommendations | ManiReader`,
    description: `Browse all curated lists and recommendation guides for ${capitalized} manga & manhwa.`,
  };
}

export default async function CategoryBlogsPage({ params }) {
  const { category } = await params;
  const capCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  let posts = [];
  try {
    const res = await blogApi.list(category);
    posts = res.data || [];
  } catch (err) {
    console.error('Failed to load blog posts for category:', err.message);
  }

  const getCategoryColor = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('romance')) return '#ff4d6d';
    if (c.includes('action')) return '#ff9f43';
    if (c.includes('isekai') || c.includes('fantasy')) return '#00d2d3';
    if (c.includes('historical')) return '#ffd700';
    return 'var(--accent)';
  };

  const activeColor = getCategoryColor(category);

  return (
    <div style={{ 
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
        top: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: `radial-gradient(circle, ${activeColor}12 0%, transparent 70%)`,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Grid Pattern overlay */}
      <div className="hero-grid-lines" style={{ opacity: 0.02, pointerEvents: 'none' }} />

      <Navbar />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 850, padding: '40px 20px 80px' }}>
        
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
          transition: 'all 0.2s ease'
        }}
        className="back-btn"
        >
          <span className="material-icons" style={{ fontSize: '1.1rem' }}>arrow_back</span> 
          All Recommendations
        </Link>

        {/* Category Header */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ 
            background: `rgba(${activeColor === '#ffd700' ? '255,215,0' : activeColor === '#00d2d3' ? '0,210,211' : activeColor === '#ff9f43' ? '255,159,67' : '255,77,109'}, 0.12)`, 
            border: `1px solid ${activeColor}`, 
            color: activeColor, 
            padding: '6px 16px', 
            borderRadius: 99, 
            fontSize: '0.8rem', 
            fontWeight: 800, 
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            display: 'inline-block',
            marginBottom: 16
          }}>
            {capCategory} Edition
          </span>
          <h1 className="glow-text" style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 3.2rem)', 
            fontWeight: 900, 
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 12
          }}>
            {capCategory} Recommendations
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.6 }}>
            Browse curated reviews, matching comparisons, and tier lists for {capCategory.toLowerCase()} series.
          </p>
        </div>

        {/* Blogs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 12,
                padding: '28px 32px', 
                background: 'rgba(18, 18, 26, 0.45)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: 24, 
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="blog-list-item-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: activeColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {post.category} list
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 style={{ 
                color: '#fff', 
                fontWeight: 800, 
                fontSize: '1.4rem',
                margin: 0,
                letterSpacing: '-0.01em',
                lineHeight: 1.3
              }}>
                {post.title}
              </h3>
              <p style={{ 
                color: 'var(--text-2)', 
                fontSize: '0.95rem', 
                lineHeight: 1.6, 
                opacity: 0.8,
                margin: 0
              }}>
                {post.content.replace(/#|\*|!\[.*?\]\(.*?\)/g, '').substring(0, 140) + '...'}
              </p>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                color: activeColor, 
                fontWeight: 700, 
                fontSize: '0.9rem',
                marginTop: 8
              }}>
                Open Article <span className="material-icons" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
              </div>
            </Link>
          ))}

          {posts.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px', 
              background: 'rgba(18, 18, 26, 0.3)', 
              borderRadius: 24, 
              border: '1px solid var(--border)' 
            }}>
              <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--text-3)', marginBottom: 16 }}>rss_feed</span>
              <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 8 }}>No lists posted yet</h3>
              <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Check back soon for curated lists compiled by the administration.</p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .back-btn {
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          border-color: ${activeColor} !important;
          color: #fff !important;
        }
        .blog-list-item-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .blog-list-item-card:hover {
          transform: translateY(-4px);
          border-color: ${activeColor} !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25), 0 0 20px ${activeColor}1a;
        }
      `}} />
    </div>
  );
}
