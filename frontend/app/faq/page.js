'use client';
import { AuthProvider } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

function FAQContent() {
  const faqs = [
    {
      q: "What is Mani Reader?",
      a: "Mani Reader is a premium manga discovery platform that lets you read your favorite stories from across the web in one beautiful, ad-free interface."
    },
    {
      q: "Is it free to use?",
      a: "Yes! Mani Reader is completely free to use. We don't host any content; we simply provide a better way to browse public manga sources."
    },
    {
      q: "Why are some images not loading?",
      a: "Some sources may be temporarily down or protected. We use high-speed proxies to bypass most blocks, but occasionally a specific title may have issues."
    },
    {
      q: "Can I save my progress?",
      a: "Absolutely. Create a free account to sync your reading history, bookmarks, and favorite libraries across all your devices."
    },
    {
      q: "How can I report a bug?",
      a: "You can contact us via the support link in the sidebar or reach out to our admin team directly."
    }
  ];

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <main className="content-area" style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--text)' }}>Frequently Asked Questions</h1>
          <p style={{ color: 'var(--text-3)', marginBottom: '40px' }}>Everything you need to know about Mani Reader.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ 
                background: 'var(--bg-2)', 
                padding: '24px', 
                borderRadius: '16px',
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ color: 'var(--accent)', marginBottom: '12px', fontSize: '1.2rem' }}>{faq.q}</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return <AuthProvider><FAQContent /></AuthProvider>;
}
