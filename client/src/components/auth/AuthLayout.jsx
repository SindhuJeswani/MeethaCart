import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import Logo from '../common/Logo';
import Container from '../common/Container';
import {
  fadeUp,
  slideInLeft,
  staggerContainer,
  staggerItem,
  TIMING,
  EASING
} from '../../animations/motion';

/**
 * Handcrafted Auth Page Split Layout:
 * Bespoke diffused layered depth, generous breathable padding, and warm artisanal aesthetics
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
    <section className="w-full flex-1 flex flex-col justify-center py-8 lg:py-12 lg:min-h-[calc(100dvh-64px-49px)]">
      <Container className="h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center w-full max-w-5xl mx-auto">

          {/* ── LEFT INFO PANEL (Desktop only, rich artisan presentation) ── */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex flex-col justify-between p-10 lg:p-12 text-white relative overflow-hidden rounded-3xl border border-amber-950/20 shadow-[0_24px_50px_-12px_rgba(38,21,7,0.35)] min-h-[540px]"
            style={{
              background: 'linear-gradient(145deg, #4A2C1A 0%, #361E10 50%, #241306 100%)'
            }}
          >
            {/* Ambient Background Warm Glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-caramel/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-strawberry/15 blur-3xl" />

            {/* Top: Brand Logo & Verified Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
              className="relative z-10 flex items-center justify-between"
            >
              <Logo variant="light" size="md" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-amber-200">
                <Sparkles className="w-3 h-3 text-caramel-light" />
                <span>Artisan Marketplace</span>
              </div>
            </motion.div>

            {/* Middle: Headline & Benefits */}
            <div className="my-auto py-8 space-y-6 relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: TIMING.normal, delay: 0.1, ease: EASING.out }}
                className="font-serif text-2xl lg:text-3xl font-bold text-white/95 leading-snug tracking-tight"
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
                  <motion.div key={idx} variants={staggerItem} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 border border-amber-300/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-relaxed font-normal">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Bottom: OTP Verification badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: TIMING.normal }}
              className="pt-6 border-t border-white/10 text-xs text-white/70 flex items-center justify-between relative z-10"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-caramel-light shrink-0" />
                <span className="font-medium">{footerNote}</span>
              </div>
              <span className="text-white/45 text-[11px] uppercase tracking-wider font-semibold">
                Verified Bakes
              </span>
            </motion.div>
          </motion.div>

          {/* ── RIGHT FORM PANEL (Floating bespoke card) ── */}
          <div className="flex flex-col justify-center w-full">

            {/* Mobile Header (Hidden on Desktop) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden mb-6 text-center"
            >
              <div className="flex justify-center mb-3">
                <Logo variant="dark" size="sm" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-chocolate tracking-tight">
                {formTitle}
              </h1>
              {formSubtitle && (
                <p className="mt-1 text-xs text-bakery-600 font-normal">{formSubtitle}</p>
              )}
            </motion.div>

            {/* Desktop Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
              className="hidden lg:block mb-6 px-1"
            >
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-chocolate tracking-tight">
                {formTitle}
              </h1>
              {formSubtitle && (
                <p className="mt-1.5 text-sm text-bakery-600 font-normal leading-relaxed">{formSubtitle}</p>
              )}
            </motion.div>

            {/* Floating Form Card — Bespoke Depth, Soft Layered Shadows, Breathable Padding */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-white/95 backdrop-blur-md rounded-3xl border border-amber-950/[0.06] p-7 sm:p-9 lg:p-10 shadow-[0_20px_60px_-15px_rgba(74,44,26,0.08),0_8px_24px_-4px_rgba(74,44,26,0.03)]"
            >
              {children}
            </motion.div>

            {/* Footer Sign in / Sign up Link */}
            {footerLinkText && footerLinkTo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mt-5 text-center text-xs sm:text-sm text-bakery-600"
              >
                <span>{footerLinkText} </span>
                <Link
                  to={footerLinkTo}
                  className="font-bold text-caramel hover:text-caramel-dark transition-colors inline-block hover:scale-[1.02] underline underline-offset-4"
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
