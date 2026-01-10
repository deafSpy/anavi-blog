/**
 * Page Animations
 * Handles page load and scroll-triggered animations
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const getReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Play loading overlay animation on page load
 * Slides up and disappears
 */
export function playLoadingOverlayAnimation(): Promise<void> {
  return new Promise((resolve) => {
    if (getReducedMotion()) {
      resolve();
      return;
    }

    const overlay = document.getElementById('loading-overlay');
    if (!overlay) {
      resolve();
      return;
    }

    // Show overlay, then animate up
    gsap.set(overlay, { display: 'block' });
    gsap.to(overlay, {
      delay: 0.4,
      duration: 1.2,
      y: '-100%',
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(overlay, { display: 'none' });
        resolve();
      },
    });
  });
}

/**
 * Play line break animation on page load
 * Draws from left to right
 */
export function playLineBreakAnimation(): Promise<void> {
  return new Promise((resolve) => {
    if (getReducedMotion()) {
      resolve();
      return;
    }

    const lineBreak = document.querySelector('.line-break');
    if (!lineBreak) {
      resolve();
      return;
    }

    // Line animates from 0% to 100% width (scaleX)
    gsap.fromTo(
      lineBreak,
      { scaleX: 0, transformOrigin: 'left center' },
      {
        scaleX: 1,
        duration: 1.4,
        ease: 'power2.out',
        onComplete: resolve,
      }
    );
  });
}

/**
 * Play page load sequence
 * Overlay recedes, then line breaks animates
 */
export async function playPageLoadSequence() {
  // Run overlay + line animation in parallel
  const overlayPromise = playLoadingOverlayAnimation();
  const linePromise = playLineBreakAnimation();

  await Promise.all([overlayPromise, linePromise]);

  console.log('[PageAnimations] Page load sequence complete');
}

/**
 * Animate blog header lines on scroll trigger (earlier trigger)
 */
export function initBlogHeaderAnimation() {
  if (getReducedMotion()) return;

  const blogHeader = document.querySelector('[data-blog-header]');
  if (!blogHeader) return;

  const lines = blogHeader.querySelectorAll('[data-blog-line]');
  if (!lines.length) return;

  gsap.from(lines, {
    duration: 0.9,
    y: 60,
    opacity: 0,
    ease: 'power3.out',
    stagger: 0.15,
    scrollTrigger: {
      trigger: blogHeader,
      start: 'top bottom',
      toggleActions: 'play none none none',
    },
  });
}

/**
 * Initialize all scroll-triggered animations
 */
export function initScrollAnimations() {
  initBlogHeaderAnimation();
  console.log('[PageAnimations] Scroll animations initialized');
}
