'use client';
import { useState } from 'react';

export default function SupportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card support-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>

        <div className="support-modal-header">
          <div className="jewel-icon">
            <span className="material-icons">favorite</span>
          </div>
          <h2>Support Mani Reader</h2>
          <p>Help us keep the site ad-free and lightning fast.</p>
        </div>

        <div className="support-modal-body">
          <div className="qr-container">
            <img src="/paypal_qr.png" alt="PayPal QR Code" onError={(e) => e.target.src = 'https://placehold.co/300x400?text=Scan+to+Donate'} />
          </div>
          
          <div className="support-actions">
            <a 
              href="https://www.paypal.me/miqbal974" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary btn-block"
            >
              <span className="material-icons">payments</span>
              Donate via PayPal
            </a>
          </div>
          
          <p className="support-note">
            Scanning the QR code or clicking the link will take you to PayPal. 
            Every cent goes toward server costs and manga updates!
          </p>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .modal-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            width: 100%;
            max-width: 400px;
            position: relative;
            padding: 40px 30px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px var(--accent-glow);
            animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            color: var(--text-3);
            transition: var(--transition);
          }
          .modal-close:hover {
            color: var(--red);
            transform: rotate(90deg);
          }
          .support-modal-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .jewel-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, var(--accent), var(--accent-2));
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            box-shadow: 0 8px 20px var(--accent-glow);
          }
          .jewel-icon span {
            font-size: 2rem;
            color: #fff;
          }
          .support-modal-header h2 {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
          }
          .support-modal-header p {
            color: var(--text-3);
            font-size: 0.95rem;
          }
          .qr-container {
            background: #fff;
            padding: 15px;
            border-radius: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .qr-container img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }
          .btn-block {
            width: 100%;
            padding: 14px;
            font-size: 1rem;
            border-radius: 12px;
          }
          .support-note {
            margin-top: 20px;
            font-size: 0.8rem;
            color: var(--text-3);
            text-align: center;
            line-height: 1.5;
          }
        `}</style>
      </div>
    </div>
  );
}
