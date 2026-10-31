import React from 'react';
import { motion, type Variants, type Transition } from 'motion/react';

// ============================================================================
// MOTION TIMING & EASING TOKENS
// ============================================================================

export const MOTION_DURATIONS = {
  instant: 0.1,
  fast: 0.14,
  normal: 0.18,
  smooth: 0.24,
  emphasis: 0.3,
  pageTransition: 0.26,
  modalTransition: 0.2,
};

export const MOTION_EASINGS = {
  standard: [0.2, 0, 0, 1] as const,
  enter: [0, 0, 0.2, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
};

export const defaultTransition: Transition = {
  duration: MOTION_DURATIONS.smooth,
  ease: MOTION_EASINGS.standard,
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Standard page entrance & exit
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.pageTransition,
      ease: MOTION_EASINGS.enter,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

/**
 * Stagger container for lists, grids, and dashboards
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

/**
 * Individual items inside a staggered container
 */
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.standard,
    },
  },
};

/**
 * Dialogs, modals, and popovers
 */
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 4,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.modalTransition,
      ease: MOTION_EASINGS.standard,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 4,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

/**
 * Tab content transition
 */
export const tabContentVariants: Variants = {
  initial: {
    opacity: 0,
    y: 4,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.standard,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

// ============================================================================
// ACCESSIBLE PAGE WRAPPER COMPONENT
// ============================================================================

interface PageMotionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageMotion({ children, className = '' }: PageMotionProps) {
  // Check user prefers-reduced-motion
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
