'use client';
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { contactApi } from '../../lib/api';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      await contactApi.send(data);
      setSuccess(true);
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: 800, paddingTop: 80, paddingBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: 16, background: 'linear-gradient(to right, #fff, var(--text-3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Contact Us</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
            Have a question, feedback, or found a bug? Send us a message and our team will get back to you.
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 32, padding: 48, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}>
                <span className="material-icons" style={{ fontSize: '3rem', color: '#fff' }}>check</span>
              </div>
              <h2 style={{ marginBottom: 12 }}>Message Sent!</h2>
              <p style={{ color: 'var(--text-3)', marginBottom: 32 }}>Thank you for reaching out. We&apos;ll review your inquiry shortly.</p>
              <button onClick={() => setSuccess(false)} className="btn btn-primary">Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-3)', marginLeft: 4 }}>Full Name</label>
                  <input name="name" required placeholder="John Doe" className="search-input" style={{ width: '100%', marginBottom: 0 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-3)', marginLeft: 4 }}>Email Address</label>
                  <input name="email" type="email" required placeholder="john@example.com" className="search-input" style={{ width: '100%', marginBottom: 0 }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-3)', marginLeft: 4 }}>Subject</label>
                <input name="subject" placeholder="What is this about?" className="search-input" style={{ width: '100%', marginBottom: 0 }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-3)', marginLeft: 4 }}>Message</label>
                <textarea name="message" required placeholder="Write your message here..." className="search-input" style={{ width: '100%', minHeight: 180, padding: '16px 20px', resize: 'vertical', marginBottom: 0 }} />
              </div>

              {error && <div style={{ color: 'var(--red)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

              <button type="submit" disabled={loading} className="btn btn-amethyst" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: 12 }}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
