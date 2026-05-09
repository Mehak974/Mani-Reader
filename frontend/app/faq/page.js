'use client';
import Navbar from '../../components/Navbar';
import { useState } from 'react';

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const faqs = [
    {
      q: "What is Mani Reader?",
      a: "Mani Reader is a high-performance, community-driven platform for reading manga, manhwa, and manhua. We focus on speed, cleanliness, and a premium gemstone-themed experience."
    },
    {
      q: "Is Mani Reader free to use?",
      a: "Yes! Mani Reader is and will always be free to use. We support our servers through community contributions and minimal advertisements."
    },
    {
      q: "How does the Turbo-Sync engine work?",
      a: "Our Turbo-Sync technology ensures that you get the latest chapters the second they are released. We index multiple high-quality sources to provide the best reading experience."
    },
    {
      q: "Can I download manga for offline reading?",
      a: "Currently, we are an online-first platform, but we are working hard on an offline-mode for our upcoming mobile application."
    },
    {
      q: "How can I report a bug or suggest a feature?",
      a: "You can reach out to us via our Contact Us page or join our Discord sanctuary to speak directly with the developers."
    },
    {
      q: "Is my data safe?",
      a: "Absolutely. We follow strict privacy protocols and never sell your data. Your bookmarks and history are stored securely within your account."
    }
  ];

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg)', color: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <div className="hero-grid-lines" style={{ opacity: 0.1 }} />

      <div className="container" style={{ paddingTop: '60px', paddingBottom: '100px', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div className="floating-icon" style={{ fontSize: '4rem', color: 'var(--accent)', marginBottom: '24px' }}>
            <span className="material-icons" style={{ fontSize: 'inherit' }}>quiz</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-2px' }}>
            Common <span style={{ color: 'var(--accent)' }}>Questions</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-2)', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to know about Mani Reader, our mission, and how to make the most of your sanctuary.
          </p>
        </div>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
            >
              <div className="faq-question">
                <h3>{faq.q}</h3>
                <span className="material-icons">{activeIndex === index ? 'remove' : 'add'}</span>
              </div>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <p>Still have questions?</p>
          <a href="/contact" className="jewel-btn btn" style={{ marginTop: '20px' }}>Visit Help Center</a>
        </div>
      </div>

      <style jsx>{`
        .faq-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .faq-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
        }
        .faq-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--accent);
        }
        .faq-item.active {
          background: rgba(113, 3, 186, 0.05);
          border-color: var(--accent);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .faq-question {
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .faq-question h3 {
          font-size: 1.15rem;
          font-weight: 700;
        }
        .faq-question .material-icons {
          color: var(--accent);
        }
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
        }
        .faq-item.active .faq-answer {
          max-height: 200px;
          padding: 0 32px 32px;
          opacity: 1;
        }
        .faq-answer p {
          color: var(--text-2);
          line-height: 1.8;
          font-size: 0.95rem;
        }
        .faq-footer {
          margin-top: 80px;
          text-align: center;
          color: var(--text-3);
        }
        .floating-icon {
          animation: float 3s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
