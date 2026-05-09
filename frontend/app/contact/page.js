'use client';
import Navbar from '../../components/Navbar';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Logic for form submission would go here
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg)', color: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <div className="hero-grid-lines" style={{ opacity: 0.1 }} />

      <div className="container" style={{ paddingTop: '60px', paddingBottom: '100px', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div className="floating-icon" style={{ fontSize: '4rem', color: 'var(--accent)', marginBottom: '24px' }}>
            <span className="material-icons" style={{ fontSize: 'inherit' }}>mail</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-2px' }}>
            Get in <span style={{ color: 'var(--accent)' }}>Touch</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-2)', maxWidth: '600px', margin: '0 auto' }}>
            Have a suggestion, found a bug, or just want to say hello? Our sanctuary doors are always open.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-card">
              <h3>Community Hub</h3>
              <p>Join our Discord for the fastest updates and direct chat with the team.</p>
              <a href="https://discord.gg/manireader" className="social-link discord">
                <span className="material-icons">discord</span> Discord Sanctuary
              </a>
            </div>
            <div className="info-card">
              <h3>Stay Updated</h3>
              <p>Follow us for the latest news on Turbo-Sync updates and new features.</p>
              <a href="https://twitter.com/manireader" className="social-link twitter">
                <span className="material-icons">alternate_email</span> Twitter / X
              </a>
            </div>
          </div>

          <div className="contact-form-container">
            {submitted ? (
              <div className="success-message">
                <span className="material-icons">check_circle</span>
                <h2>Message Sent!</h2>
                <p>Thank you for reaching out. We'll get back to you in our sanctuary as soon as possible.</p>
                <button onClick={() => setSubmitted(false)} className="submit-btn">Send Another</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      placeholder="your@email.com" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Reason for Contact</label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={{ 
                      padding: '16px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border)', 
                      borderRadius: '12px', color: '#fff', outline: 'none', appearance: 'none'
                    }}
                  >
                    <option value="" disabled style={{ background: 'var(--bg)' }}>Select a category...</option>
                    <option value="suggestion" style={{ background: 'var(--bg)' }}>💡 Feature Suggestion</option>
                    <option value="complaint" style={{ background: 'var(--bg)' }}>⚠️ Report a Complaint</option>
                    <option value="feedback" style={{ background: 'var(--bg)' }}>⭐ General Feedback</option>
                    <option value="bug" style={{ background: 'var(--bg)' }}>🐛 Bug Report</option>
                    <option value="other" style={{ background: 'var(--bg)' }}>❓ Other Inquiry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    placeholder="Short summary..." 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    rows="5" 
                    placeholder="Tell us everything..." 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 60px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr; }
        }
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .info-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
        }
        .info-card h3 {
          font-size: 1.5rem;
          margin-bottom: 12px;
          color: var(--accent);
        }
        .info-card p {
          color: var(--text-2);
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .social-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s;
        }
        .discord { background: #5865F2; color: #fff; }
        .twitter { background: #000; color: #fff; border: 1px solid #333; }
        .social-link:hover { transform: translateY(-3px); filter: brightness(1.2); }

        .contact-form-container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 48px;
          backdrop-filter: blur(20px);
        }
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .form-group input, .form-group textarea {
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: #fff;
          font-family: inherit;
          outline: none;
          transition: all 0.3s;
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: var(--accent);
          background: rgba(113, 3, 186, 0.05);
        }
        .submit-btn {
          padding: 18px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px var(--accent-glow);
        }
        .submit-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 15px 40px var(--accent-glow);
        }
        .success-message {
          text-align: center;
          padding: 40px 0;
          animation: fadeIn 0.5s ease-out;
        }
        .success-message .material-icons {
          font-size: 5rem;
          color: var(--green);
          margin-bottom: 24px;
        }
        .success-message h2 { font-size: 2rem; margin-bottom: 12px; }
        .success-message p { color: var(--text-2); margin-bottom: 32px; }

        .floating-icon {
          animation: float 3s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
