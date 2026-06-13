'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';

export default function SupportModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card support-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>

        <div className="support-modal-header">
          <div className="jewel-icon">
            <span className="material-icons" style={{ fontSize: '2.5rem', color: '#fff' }}>favorite</span>
          </div>
          <h2>Support Mani Reader</h2>
          <p>Help us keep the site ad-free and lightning fast.</p>
        </div>

        <div className="support-modal-body">
          <div className="qr-container">
            <Image
              src="/Paypal Scan.jpeg"
              alt="PayPal QR Code"
              width={200}
              height={200}
              style={{ borderRadius: '8px' }}
            />
          </div>
          
          <div className="support-actions">
            <a 
              href="https://www.paypal.com/paypalme/manireader" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="paypal-btn"
            >
              <span className="material-icons">payments</span>
              Support via PayPal
            </a>
          </div>
          
          <p className="support-note">
            Scanning the QR code or clicking the link will take you to PayPal. 
            Every cent goes toward server costs and manga updates!
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
