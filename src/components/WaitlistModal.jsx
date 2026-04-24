import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './WaitlistModal.css';

export default function WaitlistModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;
    
    if (!endpoint || endpoint === 'PASTE_YOUR_ENDPOINT_HERE') {
      console.warn("Formspree endpoint not configured in .env");
      // Simulate success for dev environment if not configured
      setTimeout(() => setStatus('success'), 1500);
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setStatus('error');
    }
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStatus('idle');
      setEmail('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-wrapper">
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
          />
          <motion.div
            className="modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="modal-close-btn" onClick={resetAndClose}>
              <X size={20} />
            </button>

            {status === 'success' ? (
              <div className="modal-success">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <CheckCircle size={60} color="var(--accent-red)" />
                </motion.div>
                <h2>{t('modal_success_title')}</h2>
                <p>{t('modal_success_desc')}</p>
                <button className="btn btn-secondary" onClick={resetAndClose} style={{ marginTop: '24px' }}>
                  {t('modal_close')}
                </button>
              </div>
            ) : (
              <div className="modal-content">
                <h2>{t('modal_title')}</h2>
                <p>{t('modal_desc')}</p>

                <form onSubmit={handleSubmit} className="waitlist-form">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('modal_input_placeholder')}
                    required
                    disabled={status === 'loading'}
                  />
                  <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                    {status === 'loading' ? <Loader2 className="spinner" size={20} /> : <>{t('modal_submit')} <ArrowRight size={18} /></>}
                  </button>
                </form>
                {status === 'error' && (
                  <p className="modal-error">{t('modal_error')}</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
