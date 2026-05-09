'use client';
import Navbar from '../../components/Navbar';

export default function AboutPage() {
  return (
    <div className="page-wrapper about-page-wrapper" style={{ background: 'var(--bg)', color: '#fff', overflowX: 'hidden' }}>
      <Navbar />
      
      {/* ✨ Fan-Focused Hero Section */}
      <section className="hero-section">
        <div className="hero-grid-lines" />
        <div className="hero-glow" style={{ background: 'radial-gradient(circle, rgba(113, 3, 186, 0.15) 0%, transparent 70%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="hero-content">
            <span className="hero-tag">THE STORY BEHIND THE SANCTUARY</span>
            <h1 className="hero-title">
              Escape the <br />
              <span style={{ color: 'var(--accent)' }}>Manga Maze</span>.
            </h1>
            <p className="hero-subtitle">
              We built Mani Reader for one reason: to end the frustration of slow, cluttered, and broken reading sites. Welcome to the sanctuary.
            </p>
          </div>
        </div>
      </section>

      {/* 💎 The Story (Glassmorphic Section) */}
      <section className="section" style={{ paddingTop: '20px' }}>
        <div className="container">
          <div className="vision-card">
            <div className="vision-header">
              <span className="material-icons">auto_awesome</span>
              <h2>A Sanctuary Built from Obsession 💎</h2>
            </div>
            <p>
              Mani Reader started as a late-night project between friends who were tired of the "manga maze"—those sites where every click leads to a pop-up and every page takes forever to load. We knew there was a better way.
            </p>
            <p style={{ marginTop: '20px' }}>
              Leveraging our obsession with performance and high-end design, we engineered the <strong>Turbo-Sync engine</strong>. We didn't just want another reader; we wanted a seamless, high-performance gateway that stays out of your way and lets the art shine. Today, Mani Reader is the fastest sanctuary on the web, built by readers who refuse to settle for "good enough."
            </p>
          </div>
        </div>
      </section>

      {/* 🛠️ Core Features Grid */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">The <span>Mani</span> Standard 📖</h2>
            <p style={{ color: 'var(--text-3)', marginTop: '12px' }}>Engineered for speed, designed for you.</p>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon"><span className="material-icons">bolt</span></div>
              <h3>Turbo-Sync Tech</h3>
              <p>Real-time synchronization with global sources ensures you get the latest chapters the second they drop. 🚀</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon"><span className="material-icons">auto_fix_high</span></div>
              <h3>Frictionless UI</h3>
              <p>Our "Gemstone" interface is stripped of clutter, focusing entirely on your reading comfort. 💎</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon"><span className="material-icons">sync</span></div>
              <h3>Global Library</h3>
              <p>Seamlessly sync your bookmarks and history across all your devices with a single account. 📲</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon"><span className="material-icons">verified_user</span></div>
              <h3>The Promise</h3>
              <p>We keep ads minimal and out of the way. Your reading experience is our highest priority. 🙏</p>
            </div>
          </div>
        </div>
      </section>

      {/* 📈 Support Us */}
      <section className="section" style={{ background: 'rgba(113, 3, 186, 0.05)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Fuel the Engine 🍵</h2>
          <p style={{ color: 'var(--text-2)', maxWidth: '700px', margin: '0 auto 30px', lineHeight: 1.8 }}>
            Maintaining the world's fastest sanctuary takes a lot of coffee and even more server power. If you love what we've built, consider supporting our journey. 💰
          </p>
          <button onClick={() => window.open('/support')} className="cta-btn">Buy Us a Coffee 🍵</button>
        </div>
      </section>

      {/* 👋 Final Hello */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontSize: '1.2rem', color: 'var(--text-2)', marginBottom: '40px' }}>
            We're just getting started. If you have suggestions or just want to talk manga, our sanctuary doors are always open.
          </p>
          <div style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 700, fontSize: '1.5rem' }}>
            The Mani Reader Team
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-page-wrapper {
          padding-top: 110px !important;
        }
        .hero-section {
          padding: 100px 0 60px;
          min-height: 400px;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .hero-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          opacity: 0.3;
          pointer-events: none;
        }
        .hero-content {
          max-width: 800px;
          animation: fadeInUp 1s ease-out;
        }
        .hero-tag {
          display: inline-block;
          padding: 6px 16px;
          background: rgba(113, 3, 186, 0.1);
          border: 1px solid var(--accent);
          border-radius: 99px;
          color: var(--accent);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: clamp(3rem, 10vw, 5.5rem);
          font-weight: 900;
          line-height: 1;
          margin-bottom: 32px;
          letter-spacing: -2px;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-2);
          max-width: 600px;
          line-height: 1.6;
        }
        .vision-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          backdrop-filter: blur(20px);
          padding: 60px;
          border-radius: 40px;
          position: relative;
          z-index: 20;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          animation: fadeInUp 1s ease-out 0.2s both;
        }
        .vision-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          color: var(--accent);
        }
        .vision-header h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
        }
        .vision-card p {
          font-size: 1.2rem;
          line-height: 1.8;
          color: var(--text-2);
        }
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .pillars-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .pillars-grid { grid-template-columns: 1fr; }
        }
        .pillar-card {
          background: var(--surface-2);
          border: 1px solid var(--border);
          padding: 40px;
          border-radius: 32px;
          transition: all 0.3s ease;
        }
        .pillar-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent);
          transform: translateY(-10px);
        }
        .pillar-icon {
          width: 50px;
          height: 50px;
          background: var(--accent);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          color: #fff;
          box-shadow: 0 8px 16px var(--accent-glow);
        }
        .pillar-card h3 {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .pillar-card p {
          color: var(--text-3);
          line-height: 1.6;
          font-size: 0.95rem;
        }
        .stats-row {
          display: flex;
          justify-content: space-around;
          padding: 40px 0;
          text-align: center;
        }
        @media (max-width: 600px) {
          .stats-row { flex-direction: column; gap: 40px; }
        }
        .stat-value {
          display: block;
          font-size: 3rem;
          font-weight: 900;
          color: var(--accent);
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .cta-btn {
          display: inline-block;
          padding: 16px 40px;
          background: var(--accent);
          color: #fff;
          text-decoration: none;
          border-radius: 16px;
          font-weight: 700;
          transition: all 0.3s;
          box-shadow: 0 10px 30px var(--accent-glow);
        }
        .cta-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 15px 40px var(--accent-glow);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
