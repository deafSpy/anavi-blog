/**
 * Scroll Orchestrator
 * Initializes Lenis smooth scroll and GSAP ScrollTrigger
 * Enhanced with better velocity, depth separation, and semicircle effects
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

/** Initialize Lenis smooth scroll with enhanced velocity */
function initLenis() {
  if (getReducedMotion()) return;
  if (lenis) return;

  try {
    lenis = new Lenis({
      duration: 1.4,  // Slightly longer for smoother feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,  // More responsive on touch
      infinite: false,
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 1.2,  // More velocity on wheel
    });

    // Lenis CSS hooks
    document.documentElement.classList.add('lenis', 'lenis-smooth');
    document.documentElement.classList.remove('lenis-stopped');

    // Keep ScrollTrigger synced with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis via GSAP ticker
    lenisTicker = (time: number) => {
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);
  } catch (err) {
    console.error('[ScrollOrchestrator] Lenis init failed', err);
    lenis = null;
  }
}

/** Parallax effect with depth-based separation */
function initParallax() {
  if (getReducedMotion()) return;

  const parallaxElements = document.querySelectorAll<HTMLElement>('[data-parallax]');
  parallaxElements.forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.2');
    const depth = parseFloat(el.dataset.depth || '1');  // Optional depth multiplier
    
    const tween = gsap.to(el, {
      yPercent: speed * 100 * depth,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,  // Smooth scrub
      },
    });
    activeTweens.push(tween);
  });
}

/** Simple fade/slide reveal for [data-reveal] (fallback for non-flip elements) */
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

    const tween = gsap.from(el, {
      ...fromVars,
      immediateRender: false,
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',  // Trigger earlier
        toggleActions: 'play none none none',
      },
    });
    activeTweens.push(tween);
  });
}

/** Enhanced horizontal scroll with velocity-based movement */
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
        scrub: 0.8,  // Smoother scrub with slight delay
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

/** Semicircle expansion effect */
function initSemicircleAnimation() {
  if (getReducedMotion()) return;

  const semicircle = document.querySelector<SVGSVGElement>('[data-journey-semicircle]');
  if (!semicircle) return;

  const ellipse = semicircle.querySelector('ellipse');
  if (!ellipse) return;

  // Animate the ellipse ry from 50 to 0 as it scrolls up
  const tween = gsap.fromTo(ellipse,
    { attr: { ry: 50 } },
    {
      attr: { ry: 0 },
      ease: 'none',
      scrollTrigger: {
        trigger: semicircle,
        start: 'top bottom',
        end: 'top 20%',
        scrub: 1,
      },
    }
  );
  activeTweens.push(tween);
}

/** Stagger reveal for blog items */
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
      stagger: 0.08,
      ease: 'power2.out',
      immediateRender: false,
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',  // Earlier trigger
        toggleActions: 'play none none none',
      },
    });
    activeTweens.push(tween);
  });
}

/** Navbar scroll behavior - hide on scroll down, show on scroll up */
function initNavbarScroll() {
  const navbar = document.querySelector('[data-navbar]') as HTMLElement;
  if (!navbar) return;

  let lastScrollY = 0;
  
  if (lenis) {
    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      if (scroll > lastScrollY && scroll > 100) {
        // Scrolling down
        gsap.to(navbar, { y: -100, duration: 0.3, ease: 'power2.out' });
      } else {
        // Scrolling up
        gsap.to(navbar, { y: 0, duration: 0.3, ease: 'power2.out' });
      }
      lastScrollY = scroll;
    });
  }
}

/** Initialize all scroll effects */
export async function init() {
  if (initialized) {
    ScrollTrigger.refresh();
    return;
  }
  initialized = true;

  setupLoadRefreshOnce();
  
  // Initialize Lenis FIRST - before any animations
  initLenis();
  
  // Initialize scroll effects that don't depend on page load
  initParallax();
  initReveals();
  initHorizontalScroll();
  initStaggerReveal();
  initSemicircleAnimation();
  // initNavbarScroll(); // Disabled - keeping navbar always visible

  // Initialize scroll-triggered animations from PageAnimations
  initScrollAnimations();
  
  // Play page load animations (non-blocking - wrap in try/catch)
  try {
    await playPageLoadSequence();
  } catch (err) {
    console.error('[ScrollOrchestrator] Page load sequence failed', err);
  }

  // Refresh after layout settles
  requestAnimationFrame(() => ScrollTrigger.refresh());
  
  console.log('[ScrollOrchestrator] Initialized successfully');
}

/** Cleanup all scroll effects */
export function destroy() {
  while (activeTweens.length) {
    activeTweens.pop()?.kill();
  }

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
  document.addEventListener('astro:before-swap', destroy);
  document.addEventListener('astro:page-load', init);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    queueMicrotask(init);
  }
}
