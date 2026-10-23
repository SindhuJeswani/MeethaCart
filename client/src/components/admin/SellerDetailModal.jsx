import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SellerDetailView from './SellerDetailView';
import { X } from 'lucide-react';
import { TIMING, EASING } from '../../animations/motion';

const SellerDetailModal = ({ isOpen, sellerId, onClose, onStatusChange }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !sellerId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: TIMING.fast, ease: EASING.out }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: TIMING.normal, ease: EASING.out }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-bakery-50 rounded-2xl shadow-warm-lg border border-bakery-200 overflow-hidden flex flex-col z-10"
        >
          {/* Modal Header Bar */}
          <div className="px-6 py-4 bg-white border-b border-bakery-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <h3 className="text-sm font-bold text-chocolate tracking-wide">
                Seller Details
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-bakery-400 hover:text-chocolate hover:bg-bakery-100 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable View Body */}
          <div className="flex-1 p-6 overflow-y-auto">
            <SellerDetailView
              sellerId={sellerId}
              isModal={true}
              onClose={onClose}
              onStatusChange={onStatusChange}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SellerDetailModal;
