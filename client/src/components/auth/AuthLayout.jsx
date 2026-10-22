import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import Logo from '../common/Logo';
import Container from '../common/Container';
import {
  fadeUp,
  slideInLeft,
  staggerContainer,
  staggerItem,
  popIn,
  TIMING,
  EASING
} from '../../animations/motion';

/**
 * Standard Auth Page Split Layout:
 * Enhanced with Framer Motion transitions and floating effects
 */
const AuthLayout = ({
  headline,
  benefits = [],
  footerNote = 'Secure Email OTP Verification',
  formTitle,
  formSubtitle,
  footerLinkText,
  footerLinkAction,
  footerLinkTo,
  children
}) => {
  return (
    <section className="w-full flex-1 flex flex-col justify-center py-6 lg:py-8 lg:min-h-[calc(100dvh-64px-49px)]">
      <Container className="h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch w-full">

          {/* -- LEFT INFO PANEL (Desktop only, animated slide-in) -- */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex flex-col justify-between p-6 lg:p-12 text-white relative overflow-hidden" style={{ backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', border: 'var(--border-width) solid var(--color-border)' }}
          >
            {/* Top: Brand Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
            >
              <Logo variant="light" size="md" />
            </motion.div>

            {/* Middle: Headline & 3 Short Benefits */}
            <div className="my-auto py-8 space-y-6">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: TIMING.normal, delay: 0.1, ease: EASING.out }}
                className="font-serif text-2xl lg:text-3xl font-bold text-white leading-snug"
              >
                {headline}
              </motion.h2>

              <motion.div
                variants={staggerContainer(0.08, 0.15)}
                initial="hidden"
                animate="visible"
                className="space-y-4 text-sm text-white/85"
              >
                {benefits.map((benefit, idx) => (
                  <motion.div key={idx} variants={staggerItem} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-caramel shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Bottom: OTP Verification badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: TIMING.normal }}
              className="pt-6 border-t border-white/10 text-xs text-white/70 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-caramel shrink-0" />
                <span>{footerNote}</span>
              </div>
              <span className="text-white/50">Verified Bakers</span>
            </motion.div>
          </motion.div>

          {/* -- RIGHT FORM PANEL (50% desktop, animated entrance) -- */}
          <div className="flex flex-col justify-center p-6 lg:p-12 w-full">

            {/* Mobile Header (Hidden on Desktop) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden mb-6 text-center"
            >
              <div className="flex justify-center mb-3">
                <Logo variant="dark" size="sm" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-chocolate">
                {formTitle}
              </h1>
              {formSubtitle && (
                <p className="mt-1 text-xs text-bakery-600">{formSubtitle}</p>
              )}
            </motion.div>

            {/* Desktop Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
              className="hidden lg:block mb-6"
            >
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-chocolate">
                {formTitle}
              </h1>
              {formSubtitle && (
                <p className="mt-1 text-sm text-bakery-600">{formSubtitle}</p>
              )}
            </motion.div>

            {/* Form Card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-bakery-200 shadow-warm p-6 sm:p-8"
            >
              {children}
            </motion.div>

            {/* Footer Sign in / Sign up Link */}
            {footerLinkText && footerLinkTo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mt-4 text-center text-xs sm:text-sm text-bakery-600"
              >
                <span>{footerLinkText} </span>
                <Link
                  to={footerLinkTo}
                  className="font-semibold text-caramel hover:text-caramel-dark transition-colors inline-block hover:scale-[1.02]"
                >
                  {footerLinkAction}
                </Link>
              </motion.div>
            )}

          </div>

        </div>
      </Container>
    </section>
  );
};

export default AuthLayout;
