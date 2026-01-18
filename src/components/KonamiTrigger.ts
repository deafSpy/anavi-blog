/**
 * KonamiTrigger.ts
 * Lightweight Konami code listener for main page
 * Plays cipher animation and redirects to /hunt
 */

import { playCipherAnimation } from './CipherGlitch';

// Konami sequence configuration
const KONAMI_SEQUENCE = ['h', 'i'];

let konamiProgress: string[] = [];

export function initKonamiTrigger(): void {
  document.addEventListener('keydown', async (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konamiProgress.push(key);

    const targetSlice = KONAMI_SEQUENCE.slice(0, konamiProgress.length);
    const matches = targetSlice.every((k, i) => {
      const target = k.length === 1 ? k.toLowerCase() : k;
      return target === konamiProgress[i];
    });

    if (!matches) {
      konamiProgress = [];
      return;
    }

    if (konamiProgress.length === KONAMI_SEQUENCE.length) {
      konamiProgress = [];
      
      // Play cipher animation on current page
      await playCipherAnimation();
      
      // Navigate to hunt page
      window.location.href = '/hunt';
    }
  });
}

// Auto-init when imported
if (typeof window !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKonamiTrigger);
  } else {
    initKonamiTrigger();
  }
}
