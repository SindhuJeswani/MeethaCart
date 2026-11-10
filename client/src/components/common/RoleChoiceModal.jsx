import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Store, ArrowRight } from 'lucide-react';
import { modalBackdrop, modalIn, buttonTap } from '../../animations/motion';

const RoleChoiceModal = ({ isOpen, onClose, onSelectRole }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      >
        <motion.div
          variants={modalIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-2xl border border-bakery-200 shadow-warm-xl max-w-sm w-full p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-bakery-200">
            <h3 className="font-serif font-bold text-chocolate text-base">
              Join MeethaCart
            </h3>
            <motion.button
              whileTap={buttonTap}
              type="button"
              onClick={onClose}
              className="text-bakery-400 hover:text-chocolate p-1 rounded-lg"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-3 pt-1">
            {/* Buyer Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={buttonTap}
              type="button"
              onClick={() => onSelectRole('buyer')}
              className="w-full p-3.5 rounded-xl border border-bakery-200 hover:border-caramel hover:bg-amber-50/50 text-left flex items-start gap-3 transition-colors group shadow-2xs cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-bakery-100 flex items-center justify-center shrink-0 group-hover:bg-caramel/20 text-chocolate">
                <User className="w-4 h-4 text-caramel" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-chocolate text-xs sm:text-sm flex items-center justify-between">
                  <span>I want to buy homemade bakes</span>
                  <ArrowRight className="w-3.5 h-3.5 text-bakery-400 group-hover:text-caramel group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-bakery-500 mt-0.5">
                  Order fresh handcrafted cakes, bakes and sweets from local home bakers.
                </p>
              </div>
            </motion.button>

            {/* Seller Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={buttonTap}
              type="button"
              onClick={() => onSelectRole('seller')}
              className="w-full p-3.5 rounded-xl border border-bakery-200 hover:border-caramel hover:bg-amber-50/50 text-left flex items-start gap-3 transition-colors group shadow-2xs cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-bakery-100 flex items-center justify-center shrink-0 group-hover:bg-caramel/20 text-chocolate">
                <Store className="w-4 h-4 text-caramel" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-chocolate text-xs sm:text-sm flex items-center justify-between">
                  <span>I am a home baker & want to sell</span>
                  <ArrowRight className="w-3.5 h-3.5 text-bakery-400 group-hover:text-caramel group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-bakery-500 mt-0.5">
                  Sell your handcrafted baked goods and grow your homemade bakery business.
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoleChoiceModal;

