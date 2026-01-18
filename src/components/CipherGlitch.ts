/**
 * CipherGlitch.ts
 * Mysterious glitch/cipher animation for treasure hunt activation
 * Features text scrambling, halftone overlay, and RGB displacement
 */

import gsap from 'gsap';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // Text scramble
  scrambleChars: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`░▒▓█▀▄■□●○◆◇♦♠♣♥',
  scrambleDuration: 1.5,
  scrambleStagger: 0.02,
  
  // Glitch
  glitchDuration: 2,
  halftoneOpacity: 0.4,
  rgbOffset: 10,
};

// ============================================
// CSS INJECTION
// ============================================
function injectStyles(): void {
  if (document.getElementById('cipher-glitch-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'cipher-glitch-styles';
  style.textContent = `
    @keyframes cipher-flicker {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
      75% { opacity: 0.9; }
    }
    
    @keyframes cipher-scan {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    
    .cipher-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
      overflow: hidden;
    }
    
    .cipher-halftone {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, #000 1px, transparent 1px);
      background-size: 4px 4px;
      opacity: 0;
      mix-blend-mode: overlay;
    }
    
    .cipher-scanline {
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(255, 100, 100, 0.3) 50%,
        transparent 100%
      );
      box-shadow: 0 0 20px rgba(255, 100, 100, 0.5);
    }
    
    .cipher-rgb-layer {
      position: absolute;
      inset: 0;
      opacity: 0;
    }
    
    .cipher-rgb-layer.red {
      background: rgba(255, 0, 0, 0.15);
      transform: translateX(0);
    }
    
    .cipher-rgb-layer.cyan {
      background: rgba(0, 255, 255, 0.15);
      transform: translateX(0);
    }
    
    .cipher-text-scramble {
      position: relative;
    }
    
    .cipher-flash {
      position: absolute;
      inset: 0;
      background: white;
      opacity: 0;
    }
    
    /* Glitch displacement */
    .cipher-displaced {
      animation: cipher-flicker 0.1s infinite;
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// TEXT SCRAMBLING
// ============================================
function scrambleText(element: HTMLElement, originalText: string, progress: number): void {
  const length = originalText.length;
  const revealedCount = Math.floor(progress * length);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    if (originalText[i] === ' ') {
      result += ' ';
    } else if (i < revealedCount) {
      result += originalText[i];
    } else {
      result += CONFIG.scrambleChars[Math.floor(Math.random() * CONFIG.scrambleChars.length)];
    }
  }
  
  element.textContent = result;
}

// ============================================
// MAIN ANIMATION
// ============================================
export function playCipherAnimation(): Promise<void> {
  return new Promise((resolve) => {
    injectStyles();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'cipher-overlay';
    
    // Halftone layer
    const halftone = document.createElement('div');
    halftone.className = 'cipher-halftone';
    overlay.appendChild(halftone);
    
    // RGB layers
    const redLayer = document.createElement('div');
    redLayer.className = 'cipher-rgb-layer red';
    overlay.appendChild(redLayer);
    
    const cyanLayer = document.createElement('div');
    cyanLayer.className = 'cipher-rgb-layer cyan';
    overlay.appendChild(cyanLayer);
    
    // Scanline
    const scanline = document.createElement('div');
    scanline.className = 'cipher-scanline';
    scanline.style.top = '-10px';
    overlay.appendChild(scanline);
    
    // Flash
    const flash = document.createElement('div');
    flash.className = 'cipher-flash';
    overlay.appendChild(flash);
    
    document.body.appendChild(overlay);
    
    // Collect all text elements
    const textElements: { el: HTMLElement; original: string }[] = [];
    const selectors = 'h1, h2, h3, h4, h5, h6, p, span, a, li, button, label';
    document.querySelectorAll(selectors).forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.textContent && !htmlEl.closest('.cipher-overlay') && !htmlEl.querySelector('*')) {
        const original = htmlEl.textContent.trim();
        if (original.length > 0 && original.length < 200) {
          textElements.push({ el: htmlEl, original });
        }
      }
    });
    
    // Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Restore all text
        textElements.forEach(({ el, original }) => {
          el.textContent = original;
        });
        overlay.remove();
        resolve();
      },
    });
    
    // Phase 1: Initial flash + halftone
    tl.to(flash, {
      opacity: 0.8,
      duration: 0.05,
    })
    .to(flash, {
      opacity: 0,
      duration: 0.1,
    })
    .to(halftone, {
      opacity: CONFIG.halftoneOpacity,
      duration: 0.2,
    }, '<')
    
    // Phase 2: RGB displacement
    .to(redLayer, {
      opacity: 1,
      x: -CONFIG.rgbOffset,
      duration: 0.1,
      ease: 'power2.out',
    })
    .to(cyanLayer, {
      opacity: 1,
      x: CONFIG.rgbOffset,
      duration: 0.1,
      ease: 'power2.out',
    }, '<')
    
    // Phase 3: Scanline sweep
    .to(scanline, {
      top: '100vh',
      duration: 0.8,
      ease: 'none',
    }, '<')
    
    // Phase 4: Text scramble (runs during RGB)
    .add(() => {
      // Scramble all text elements with stagger
      textElements.forEach(({ el, original }, index) => {
        const delay = index * CONFIG.scrambleStagger;
        
        gsap.to({ progress: 0 }, {
          progress: 1,
          duration: CONFIG.scrambleDuration,
          delay,
          ease: 'power2.inOut',
          onUpdate: function() {
            scrambleText(el, original, this.targets()[0].progress);
          },
        });
      });
    }, '-=0.6')
    
    // Phase 5: Clean up glitch effects
    .to([redLayer, cyanLayer], {
      opacity: 0,
      x: 0,
      duration: 0.3,
      ease: 'power2.out',
    }, `+=${CONFIG.scrambleDuration - 0.5}`)
    .to(halftone, {
      opacity: 0,
      duration: 0.4,
    }, '<')
    
    // Phase 6: Final flash
    .to(flash, {
      opacity: 1,
      duration: 0.08,
    })
    .to(flash, {
      opacity: 0,
      duration: 0.2,
    });
  });
}

// ============================================
// SIMPLE SCRAMBLE EFFECT
// ============================================
export function scrambleElement(element: HTMLElement): gsap.core.Timeline {
  const original = element.textContent || '';
  
  return gsap.timeline()
    .to({ progress: 0 }, {
      progress: 1,
      duration: 1,
      ease: 'power2.inOut',
      onUpdate: function() {
        scrambleText(element, original, this.targets()[0].progress);
      },
      onComplete: () => {
        element.textContent = original;
      },
    });
}
