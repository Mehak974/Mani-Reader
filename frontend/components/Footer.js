'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="container">
        {/* Line 2: Corners */}
        <div className="footer-line-2">
          <div className="footer-left">
            © 2026 Mani Reader. All Rights Reserved.
          </div>
          <div className="footer-right">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/disclaimer">Legal Disclaimer</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-container {
          padding: 20px 0;
          border-top: 1px solid var(--border);
          background: var(--bg);
          font-family: 'Inter', sans-serif;
        }
        .footer-line-1 {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .footer-brand {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.05em;
          color: var(--text-1);
          text-decoration: none;
          text-transform: lowercase;
        }
        .footer-line-2 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-3);
          font-size: 0.8rem;
          font-weight: 500;
        }
        .footer-right {
          display: flex;
          gap: 20px;
        }
        .footer-right :global(a) {
          color: var(--text-3);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-right :global(a:hover) {
          color: var(--accent);
        }
        @media (max-width: 600px) {
          .footer-line-2 {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
          .footer-right {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
}
