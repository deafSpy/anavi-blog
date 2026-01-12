/**
 * Page Animations
 * Handles page load and scroll-triggered animations
 * Includes 3D flip-in reveals and awwwards-style effects
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const getReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Play loading overlay animation
 * Note: For main page, FallingLetters.ts handles the loading animation
 * This is a fallback for other pages
 */
export function playLoadingOverlayAnimation(): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.getElementById('loading-overlay');
    
    // If overlay doesn't exist or is already handled by FallingLetters, resolve immediately
    if (!overlay || overlay.style.display === 'none' || overlay.style.pointerEvents === 'none') {
      resolve();
      return;
    }

    if (getReducedMotion()) {
      overlay.style.display = 'none';
      resolve();
      return;
    }

    const logoChars = overlay.querySelectorAll('.loading-logo span');
    
    if (logoChars.length > 0) {
      // Animate each character with 3D flip
      gsap.to(logoChars, {
        y: '0%',
        rotateX: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
        onComplete: () => {
          gsap.to(overlay, {
            delay: 0.3,
            y: '-100%',
            duration: 0.9,
            ease: 'power3.inOut',
            onComplete: () => {
              overlay.style.display = 'none';
              resolve();
            },
          });
        },
      });
    } else {
      // No logo chars and not handled by FallingLetters - just hide
      overlay.style.display = 'none';
      resolve();
    }
  });
}

/**
 * Play line break animation
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

    gsap.to(lineBreak, {
      scaleX: 1,
      duration: 1.4,
      ease: 'power2.out',
      onComplete: resolve,
    });
  });
}

/**
 * Initialize 3D flip-in reveals for elements with [data-flip-reveal]
 */
export function init3DFlipReveals() {
  if (getReducedMotion()) return;

  const flipElements = document.querySelectorAll<HTMLElement>('[data-flip-reveal]');
  
  flipElements.forEach((el) => {
    const delay = parseFloat(el.dataset.flipDelay || '0');
    const stagger = parseFloat(el.dataset.flipStagger || '0.05');
    const splitType = el.dataset.flipSplit || 'words'; // 'words' or 'chars'
    
    // Split text into spans if needed
    if (!el.querySelector('.flip-word') && !el.querySelector('.flip-char')) {
      const text = el.textContent || '';
      el.innerHTML = '';
      
      if (splitType === 'chars') {
        text.split('').forEach((char) => {
          const span = document.createElement('span');
          span.className = 'flip-char';
          span.textContent = char === ' ' ? '\u00A0' : char;
          el.appendChild(span);
        });
      } else {
        text.split(' ').forEach((word, i, arr) => {
          const span = document.createElement('span');
          span.className = 'flip-word';
          span.textContent = word;
          el.appendChild(span);
          if (i < arr.length - 1) {
            el.appendChild(document.createTextNode(' '));
          }
        });
      }
    }
    
    const targets = el.querySelectorAll('.flip-word, .flip-char');
    
    gsap.fromTo(targets, 
      {
        rotateX: -90,
        y: 20,
        opacity: 0,
      },
      {
        rotateX: 0,
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: stagger,
        ease: 'power3.out',
        delay: delay,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });
}

/**
 * Initialize footer text reveal animation
 */
export function initFooterReveal() {
  if (getReducedMotion()) return;

  const footer = document.querySelector('[data-footer-reveal]');
  if (!footer) return;

  const titleChars = footer.querySelectorAll('.footer-title-char');
  const links = footer.querySelectorAll('.footer-link');

  if (titleChars.length > 0) {
    gsap.fromTo(titleChars,
      {
        y: '100%',
        opacity: 0,
      },
      {
        y: '0%',
        opacity: 1,
        duration: 1.0,
        stagger: 0.03,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  if (links.length > 0) {
    gsap.fromTo(links,
      {
        y: 30,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      }
    );
  }
}

/**
 * Initialize navbar pill highlight animation
 */
export function initNavbarPill() {
  if (getReducedMotion()) return;

  const navLinks = document.querySelector('.nav-links');
  const pill = document.querySelector('.nav-pill') as HTMLElement;
  const links = document.querySelectorAll<HTMLElement>('.nav-link');

  if (!navLinks || !pill || !links.length) return;

  links.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      const rect = link.getBoundingClientRect();
      const parentRect = navLinks.getBoundingClientRect();
      
      gsap.to(pill, {
        x: rect.left - parentRect.left,
        width: rect.width,
        height: rect.height,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  });

  navLinks.addEventListener('mouseleave', () => {
    gsap.to(pill, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.out',
    });
  });
}

/**
 * Animate blog header lines on scroll trigger
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
      start: 'top 90%', // Trigger earlier
      toggleActions: 'play none none none',
    },
  });
}

/**
 * Play page load sequence
 */
export async function playPageLoadSequence() {
  const overlayPromise = playLoadingOverlayAnimation();
  const linePromise = playLineBreakAnimation();

  await Promise.all([overlayPromise, linePromise]);

  console.log('[PageAnimations] Page load sequence complete');
}

/**
 * Initialize all scroll-triggered animations
 */
export function initScrollAnimations() {
  init3DFlipReveals();
  initBlogHeaderAnimation();
  initFooterReveal();
  initNavbarPill();
  
  console.log('[PageAnimations] Scroll animations initialized');
}
