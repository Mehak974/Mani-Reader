'use client';
import React, { createContext, useContext } from 'react';
import UnifiedAuthModal from '../components/UnifiedAuthModal';
import SupportModal from '../components/SupportModal';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [authModal, setAuthModal] = React.useState({ isOpen: false, view: 'login' });
  const [supportModalOpen, setSupportModalOpen] = React.useState(false);

  const openLogin = () => setAuthModal({ isOpen: true, view: 'login' });
  const openRegister = () => setAuthModal({ isOpen: true, view: 'register' });
  const openSupport = () => setSupportModalOpen(true);

  return (
    <ModalContext.Provider value={{ openLogin, openRegister, openSupport }}>
      {children}
      <UnifiedAuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        initialView={authModal.view} 
      />
      <SupportModal 
        isOpen={supportModalOpen} 
        onClose={() => setSupportModalOpen(false)} 
      />
    </ModalContext.Provider>
  );
}

export const useModals = () => React.useContext(ModalContext);
