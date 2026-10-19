import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import Logo from '../common/Logo';
import Container from '../common/Container';

/**
 * Standard Auth Page Split Layout:
 * - Height: 100dvh - navbar (64px) - auth footer (~49px)
 * - 50% Left Info Panel (desktop), 50% Right Form Panel
 * - Content inside both panels uses inner padding: 48px desktop (p-12), 24px mobile (p-6)
 * - Both panels align to the exact same top line
 * - Left panel: Logo, one headline, 3 short benefits, OTP verification badge
 * - Right panel: Form card centered vertically with footer link underneath
 * - Mobile: Left panel hidden, short heading above form
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

          {/* ── LEFT INFO PANEL (50% desktop, hidden mobile) ── */}
          <div className="hidden lg:flex flex-col justify-between p-6 lg:p-12 bg-chocolate text-white rounded-2xl shadow-sm relative overflow-hidden">
            {/* Top: Brand Logo */}
            <div>
              <Logo variant="light" size="md" />
            </div>

            {/* Middle: Headline & 3 Short Benefits */}
            <div className="my-auto py-8 space-y-6">
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-white leading-snug">
                {headline}
              </h2>

              <div className="space-y-4 text-sm text-white/85">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-caramel shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: OTP Verification badge */}
            <div className="pt-6 border-t border-white/10 text-xs text-white/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-caramel shrink-0" />
                <span>{footerNote}</span>
              </div>
              <span className="text-white/50">Verified Bakers</span>
            </div>
          </div>

          {/* ── RIGHT FORM PANEL (50% desktop) ── */}
          <div className="flex flex-col justify-center p-6 lg:p-12 w-full">

            {/* Mobile Header (Hidden on Desktop) */}
            <div className="lg:hidden mb-6 text-center">
              <div className="flex justify-center mb-3">
                <Logo variant="dark" size="sm" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-chocolate">
                {formTitle}
              </h1>
              {formSubtitle && (
                <p className="mt-1 text-xs text-bakery-600">{formSubtitle}</p>
              )}
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-chocolate">
                {formTitle}
              </h1>
              {formSubtitle && (
                <p className="mt-1 text-sm text-bakery-600">{formSubtitle}</p>
              )}
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-bakery-200 shadow-warm p-6 sm:p-8">
              {children}
            </div>

            {/* Footer Sign in / Sign up Link */}
            {footerLinkText && footerLinkTo && (
              <div className="mt-4 text-center text-xs sm:text-sm text-bakery-600">
                <span>{footerLinkText} </span>
                <Link
                  to={footerLinkTo}
                  className="font-semibold text-caramel hover:text-caramel-dark transition-colors"
                >
                  {footerLinkAction}
                </Link>
              </div>
            )}

          </div>

        </div>
      </Container>
    </section>
  );
};

export default AuthLayout;
