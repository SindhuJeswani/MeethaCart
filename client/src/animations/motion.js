/**
 * Shared Motion & Animation System for MeethaCart
 * Built with Framer Motion + Respects prefers-reduced-motion
 */

// -- Timing & Easing Constants (Adjustable in one place) --
export const TIMING = {
  micro: 0.18,      // 180ms for buttons, icons, pills, hover
  normal: 0.28,     // 280ms for cards, lists, toasts, drawers
  page: 0.35,       // 350ms for page transitions & modals
  stagger: 0.05,    // 50ms between staggered child items
};

export const EASING = {
  out: [0.16, 1, 0.3, 1],      // Smooth deceleration curve for entrances
  in: [0.7, 0, 0.84, 0],       // Acceleration curve for exits
  inOut: [0.65, 0, 0.35, 1],   // Smooth symmetric transition
  spring: { type: 'spring', stiffness: 420, damping: 28 },
  springGentle: { type: 'spring', stiffness: 260, damping: 20 },
  springBouncy: { type: 'spring', stiffness: 500, damping: 18 },
};

export const STANDARD_TRANSITION = {
  duration: TIMING.normal,
  ease: EASING.out,
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// -- Shared Animation Variants --

// 1. Simple Fade In
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: TIMING.normal, ease: EASING.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: TIMING.micro, ease: EASING.in },
  },
};

// 2. Fade Up (standard card / section entrance)
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.normal, ease: EASING.out },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: TIMING.micro, ease: EASING.in },
  },
};

// 3. Slide In Left / Right
export const slideInLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.normal, ease: EASING.out },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: TIMING.micro, ease: EASING.in },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.normal, ease: EASING.out },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: TIMING.micro, ease: EASING.in },
  },
};

// 4. Scale In (cards, modals, badges)
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: TIMING.normal, ease: EASING.out },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: TIMING.micro, ease: EASING.in },
  },
};

// 5. Stagger Containers & Items
export const staggerContainer = (staggerDelay = TIMING.stagger, delayChildren = 0.04) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: TIMING.normal, ease: EASING.out },
  },
};

// 6. Full Page Transition (between routes)
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.page, ease: EASING.out },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: TIMING.micro, ease: EASING.in },
  },
};

// 7. Modal & Backdrop
export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: TIMING.normal, ease: EASING.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: TIMING.micro, ease: EASING.in },
  },
};

export const modalIn = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: TIMING.normal, ease: EASING.out },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: TIMING.micro, ease: EASING.in },
  },
};

// 8. Shake (validation errors, wrong OTP)
export const shakeVariant = {
  idle: { x: 0 },
  shake: {
    x: [-8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.45, ease: 'easeInOut' },
  },
};

// 9. Pop / Bounce (icons, badges, successful actions)
export const popIn = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: EASING.spring,
  },
};

// 10. Micro-interactions for buttons and cards
export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.08 },
};

export const buttonHover = {
  y: -1.5,
  scale: 1.015,
  transition: { duration: TIMING.micro, ease: EASING.out },
};

export const cardHover = {
  y: -4,
  boxShadow: '0 14px 34px -4px rgba(74, 44, 26, 0.16), 0 4px 12px -2px rgba(74, 44, 26, 0.08)',
  transition: { duration: TIMING.micro, ease: EASING.out },
};
