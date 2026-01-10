/**
 * Scroll Orchestrator
 * Initializes Lenis smooth scroll and GSAP ScrollTrigger for parallax/reveals/horizontal scroll.
 * Respects prefers-reduced-motion and cleans up on page navigation.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { playPageLoadSequence, initScrollAnimations } from './PageAnimations';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let lenisTicker: ((time: number) => void) | null = null;
let initialized = false;
let hasBoundLoadRefresh = false;

const activeTweens: gsap.core.Tween[] = [];

const getReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupLoadRefreshOnce() {
  if (hasBoundLoadRefresh) return;
  hasBoundLoadRefresh = true;
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/** Initialize Lenis smooth scroll */
function initLenis() {
  if (getReducedMotion()) return;
  if (lenis) return;

  try {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.25,
      infinite: false,
      smoothWheel: true,
      syncTouch: true,
    });

    // Lenis CSS hooks
    document.documentElement.classList.add('lenis', 'lenis-smooth');
    document.documentElement.classList.remove('lenis-stopped');

    // Keep ScrollTrigger synced with Lenis.
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis via GSAP ticker (avoids running multiple RAF loops).
    lenisTicker = (time: number) => {
      // GSAP ticker time is seconds; Lenis expects milliseconds.
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);
  } catch (err) {
    console.error('[ScrollOrchestrator] Lenis init failed', err);
    lenis = null;
  }
}

/** Parallax effect for elements with [data-parallax] */
function initParallax() {
  if (getReducedMotion()) return;

  const parallaxElements = document.querySelectorAll<HTMLElement>('[data-parallax]');
  parallaxElements.forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.2');
    const tween = gsap.to(el, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
    activeTweens.push(tween);
  });
}

/** Fade/slide reveal for elements with [data-reveal] */
function initReveals() {
  if (getReducedMotion()) return;

  const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]');
  revealElements.forEach((el) => {
    const direction = el.dataset.reveal || 'up';
    const fromVars: gsap.TweenVars = { opacity: 0, duration: 0.8, ease: 'power2.out' };

    if (direction === 'up') fromVars.y = 40;
    else if (direction === 'down') fromVars.y = -40;
    else if (direction === 'left') fromVars.x = 40;
    else if (direction === 'right') fromVars.x = -40;

    // Critical: prevents "content appears then disappears" if ScrollTrigger fails to fire.
    const tween = gsap.from(el, {
      ...fromVars,
      immediateRender: false,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
    activeTweens.push(tween);
  });
}

/** Pinned horizontal scroll for [data-horizontal-scroll] on desktop */
function initHorizontalScroll() {
  if (getReducedMotion()) return;

  const container = document.querySelector<HTMLElement>('[data-horizontal-scroll]');
  const wrapper = document.querySelector<HTMLElement>('[data-horizontal-wrapper]');
  if (!container || !wrapper) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const scrollWidth = Math.max(wrapper.scrollWidth - container.offsetWidth, 0);
    if (scrollWidth <= 0) return undefined;

    const tween = gsap.to(wrapper, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${scrollWidth}`,
        invalidateOnRefresh: true,
      },
    });
    activeTweens.push(tween);

    return () => {
      gsap.set(wrapper, { x: 0 });
    };
  });

  mm.add('(max-width: 1023px)', () => {
    container.style.overflowX = 'auto';
    container.style.overflowY = 'hidden';
  });
}

/** Animate semicircle deformation as it scrolls to top */
function initSemicircleAnimation() {
  if (getReducedMotion()) return;

  const semicircle = document.querySelector<SVGSVGElement>('[data-journey-semicircle]');
  if (!semicircle) return;

  const path = semicircle.querySelector('ellipse') || semicircle.querySelector('path');
  if (!path) return;

  const tween = gsap.to(path, {
    attr: { ry: 0 },
    ease: 'none',
    scrollTrigger: {
      trigger: semicircle,
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
    },
  });
  activeTweens.push(tween);
}

/** Stagger reveal for blog list items with [data-stagger] */
function initStaggerReveal() {
  if (getReducedMotion()) return;

  const containers = document.querySelectorAll<HTMLElement>('[data-stagger]');
  containers.forEach((container) => {
    const items = container.querySelectorAll<HTMLElement>('[data-stagger-item]');
    if (!items.length) return;

    const tween = gsap.from(items, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      immediateRender: false,
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
    activeTweens.push(tween);
  });
}

/** Initialize all scroll effects */
export async function init() {
  // Guard against double-init on the same page load.
  if (initialized) {
    ScrollTrigger.refresh();
    return;
  }
  initialized = true;

  setupLoadRefreshOnce();
  
  // Play page load animations first (overlay + line break)
  await playPageLoadSequence();

  // Then initialize Lenis and other scroll effects
  initLenis();
  initParallax();
  initReveals();
  initHorizontalScroll();
  initStaggerReveal();
  initSemicircleAnimation();

  // Initialize scroll-triggered animations
  initScrollAnimations();

  // Refresh after initial layout settles.
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/** Cleanup all scroll effects */
export function destroy() {
  while (activeTweens.length) {
    activeTweens.pop()?.kill();
  }

  // Revert pins / inline styles.
  ScrollTrigger.getAll().forEach((st) => st.kill(true));
  ScrollTrigger.clearMatchMedia();

  if (lenisTicker) {
    gsap.ticker.remove(lenisTicker);
    lenisTicker = null;
  }

  if (lenis) {
    lenis.destroy();
    lenis = null;
  }

  document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
  initialized = false;
}

// Auto-init when imported client-side
if (typeof window !== 'undefined') {
  // Astro View Transitions
  document.addEventListener('astro:before-swap', destroy);
  document.addEventListener('astro:page-load', init);

  // Fallback (should be a no-op because of the init() guard)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    queueMicrotask(init);
  }
}
