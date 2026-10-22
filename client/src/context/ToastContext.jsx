import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { slideInRight, buttonTap } from '../animations/motion';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    remove: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container (top-right fixed) */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.92, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={`pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-warm-lg flex items-start gap-3 backdrop-blur-md ${
                item.type === 'error'
                  ? 'bg-rose-50/95 border-rose-300 text-rose-900'
                  : item.type === 'info'
                  ? 'bg-amber-50/95 border-amber-300 text-amber-950'
                  : 'bg-emerald-50/95 border-emerald-300 text-emerald-950'
              }`}
            >
              {/* Type icon */}
              <div className="shrink-0 mt-0.5">
                {item.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                ) : item.type === 'info' ? (
                  <Info className="w-5 h-5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
              </div>

              {/* Message text */}
              <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
                {item.message}
              </div>

              {/* Close button */}
              <motion.button
                whileTap={buttonTap}
                onClick={() => removeToast(item.id)}
                className="shrink-0 text-bakery-400 hover:text-bakery-700 transition-colors p-0.5"
              >
                <X className="w-4 h-4" />
              </motion.button>

              {/* Shrinking progress bar */}
              {item.duration > 0 && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: item.duration / 1000, ease: 'linear' }}
                  style={{ originX: 0 }}
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    item.type === 'error'
                      ? 'bg-rose-500'
                      : item.type === 'info'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      success: (msg) => console.log('[Toast Success]:', msg),
      error: (msg) => console.error('[Toast Error]:', msg),
      info: (msg) => console.log('[Toast Info]:', msg)
    };
  }
  return context;
};
