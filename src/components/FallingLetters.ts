/**
 * FallingLetters.ts
 * Giant "ANAVI" letters with physics collision
 * Uses simplified vertex extraction for reliable collision detection
 */

import Matter from 'matter-js';
import opentype from 'opentype.js';
import decomp from 'poly-decomp';

const { Engine, World, Bodies, Body, Runner, Mouse, MouseConstraint, Common, Vertices } = Matter;

// CRITICAL: Set decomp for concave shape decomposition
Common.setDecomp(decomp);

// ============================================
// CONFIGURATION
// ============================================
export const CONFIG = {
  fontSize: 0.3,            // 30vw
  fontSizeMin: 150,
  fontSizeMax: 450,
  
  gravity: 2,
  
  // Physics - tuned for stable stacking
  restitution: 0.05,
  friction: 0.9,
  frictionStatic: 5,
  frictionAir: 0.02,
  density: 0.004,
  
  // Vertex sampling - points per letter outline
  vertexCount: 24,
  
  // Drop timing
  dropDelay: 200,
  
  // Mouse interaction
  nudgeRadius: 180,
  nudgeStrength: 0.0008,
};

// Letter configurations with position and rotation control
const LETTERS = [
  { char: 'A', xPercent: 15, yOffset: -100, angle: -0.1 },
  { char: 'N', xPercent: 32, yOffset: -150, angle: 0.08 },
  { char: 'A', xPercent: 50, yOffset: -120, angle: -0.05 },
  { char: 'V', xPercent: 68, yOffset: -180, angle: 0.12 },
  { char: 'I', xPercent: 85, yOffset: -130, angle: -0.08 },
];

// State
let engine: Matter.Engine | null = null;
let runner: Matter.Runner | null = null;
let letterData: Array<{ body: Matter.Body | null; el: HTMLElement }> = [];
let animFrameId: number | null = null;
let font: opentype.Font | null = null;
let container: HTMLElement | null = null;
let mousePos = { x: -9999, y: -9999 };

// ============================================
// HELPERS
// ============================================

function getFontSize(): number {
  const size = window.innerWidth * CONFIG.fontSize;
  return Math.max(CONFIG.fontSizeMin, Math.min(size, CONFIG.fontSizeMax));
}

/**
 * Get bounding box vertices from font path
 * This creates a simplified polygon that approximates the letter shape
 */
function getLetterVertices(char: string, fontSize: number): Matter.Vector[] | null {
  if (!font) return null;
  
  try {
    const path = font.getPath(char, 0, 0, fontSize);
    const bbox = path.getBoundingBox();
    
    // Get path commands and sample key points
    const commands = path.commands;
    const points: { x: number; y: number }[] = [];
    
    let cx = 0, cy = 0;
    
    for (const cmd of commands) {
      if (cmd.type === 'M' || cmd.type === 'L') {
        points.push({ x: cmd.x, y: cmd.y });
        cx = cmd.x;
        cy = cmd.y;
      } else if (cmd.type === 'C') {
        // Sample cubic bezier at midpoint and endpoint
        const t = 0.5;
        const mt = 1 - t;
        const mx = mt*mt*mt*cx + 3*mt*mt*t*cmd.x1 + 3*mt*t*t*cmd.x2 + t*t*t*cmd.x;
        const my = mt*mt*mt*cy + 3*mt*mt*t*cmd.y1 + 3*mt*t*t*cmd.y2 + t*t*t*cmd.y;
        points.push({ x: mx, y: my });
        points.push({ x: cmd.x, y: cmd.y });
        cx = cmd.x;
        cy = cmd.y;
      } else if (cmd.type === 'Q') {
        // Sample quadratic bezier
        const t = 0.5;
        const mt = 1 - t;
        const mx = mt*mt*cx + 2*mt*t*cmd.x1 + t*t*cmd.x;
        const my = mt*mt*cy + 2*mt*t*cmd.y1 + t*t*cmd.y;
        points.push({ x: mx, y: my });
        points.push({ x: cmd.x, y: cmd.y });
        cx = cmd.x;
        cy = cmd.y;
      }
    }
    
    if (points.length < 3) return null;
    
    // Remove duplicates and very close points
    const filtered: Matter.Vector[] = [];
    const minDist = fontSize * 0.05;
    
    for (const p of points) {
      if (filtered.length === 0) {
        filtered.push({ x: p.x, y: p.y });
      } else {
        const last = filtered[filtered.length - 1];
        const dist = Math.sqrt((p.x - last.x) ** 2 + (p.y - last.y) ** 2);
        if (dist > minDist) {
          filtered.push({ x: p.x, y: p.y });
        }
      }
    }
    
    // Need at least 3 points for a valid polygon
    if (filtered.length >= 3) {
      console.log(`[FallingLetters] "${char}" has ${filtered.length} vertices`);
      return filtered;
    }
    
  } catch (e) {
    console.error(`[FallingLetters] Vertex extraction failed for "${char}":`, e);
  }
  
  return null;
}

/**
 * Create a physics body for a letter
 */
function createLetterBody(char: string, x: number, y: number, fontSize: number): Matter.Body {
  const vertices = getLetterVertices(char, fontSize);
  
  if (vertices && vertices.length >= 3) {
    try {
      // Use Bodies.fromVertices with decomposition enabled
      const body = Bodies.fromVertices(x, y, [vertices], {
        restitution: CONFIG.restitution,
        friction: CONFIG.friction,
        frictionStatic: CONFIG.frictionStatic,
        frictionAir: CONFIG.frictionAir,
        density: CONFIG.density,
      }, true); // flagInternal = true for decomposition
      
      if (body && body.position) {
        console.log(`[FallingLetters] Created vertex body for "${char}"`);
        return body;
      }
    } catch (e) {
      console.error(`[FallingLetters] fromVertices failed for "${char}":`, e);
    }
  }
  
  // Fallback: create appropriately sized rectangle
  console.log(`[FallingLetters] Using rectangle for "${char}"`);
  
  let w: number, h: number;
  
  // Size rectangles based on character shape
  switch (char) {
    case 'I':
      w = fontSize * 0.35;
      h = fontSize * 0.85;
      break;
    case 'V':
    case 'A':
      w = fontSize * 0.75;
      h = fontSize * 0.85;
      break;
    case 'N':
      w = fontSize * 0.7;
      h = fontSize * 0.85;
      break;
    default:
      w = fontSize * 0.65;
      h = fontSize * 0.85;
  }
  
  return Bodies.rectangle(x, y, w, h, {
    restitution: CONFIG.restitution,
    friction: CONFIG.friction,
    frictionStatic: CONFIG.frictionStatic,
    frictionAir: CONFIG.frictionAir,
    density: CONFIG.density,
  });
}

// ============================================
// MAIN FUNCTIONS
// ============================================

export async function initFallingLetters(): Promise<void> {
  container = document.getElementById('falling-letters-container');
  if (!container) {
    console.error('[FallingLetters] Container not found');
    return;
  }
  
  // Use container bounds, not viewport
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const fontSize = getFontSize();
  
  console.log('[FallingLetters] Init:', { width, height, fontSize });
  
  // Load font
  try {
    font = await new Promise<opentype.Font>((resolve, reject) => {
      opentype.load(
        'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_0ew.woff',
        (err, f) => (err || !f ? reject(err) : resolve(f))
      );
    });
    console.log('[FallingLetters] Font loaded');
  } catch (e) {
    console.error('[FallingLetters] Font load failed:', e);
    font = null;
  }
  
  // Create physics engine
  engine = Engine.create({
    gravity: { x: 0, y: CONFIG.gravity, scale: 0.001 },
  });
  
  // Floor at container bottom
  const floorY = height - 5;
  const floor = Bodies.rectangle(width / 2, floorY + 50, width * 3, 100, {
    isStatic: true,
    friction: 1,
    restitution: 0,
    label: 'floor',
  });
  
  // Walls
  const leftWall = Bodies.rectangle(-50, height / 2, 100, height * 3, { isStatic: true });
  const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height * 3, { isStatic: true });
  
  World.add(engine.world, [floor, leftWall, rightWall]);
  
  // Create letter DOM elements
  LETTERS.forEach((letter, i) => {
    const el = document.createElement('div');
    el.className = 'falling-letter';
    el.textContent = letter.char;
    el.style.cssText = `
      position: absolute;
      font-size: ${fontSize}px;
      font-weight: 900;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #1c1917;
      line-height: 0.9;
      user-select: none;
      pointer-events: none;
      will-change: transform;
      opacity: 0;
      z-index: ${10 + i};
    `;
    container!.appendChild(el);
    letterData.push({ body: null, el });
  });
  
  // Mouse drag interaction
  const mouse = Mouse.create(container);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  World.add(engine.world, mouseConstraint);
  
  // Track mouse for hover nudge
  container.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });
  container.addEventListener('mouseleave', () => {
    mousePos = { x: -9999, y: -9999 };
  });
  
  // Start physics
  runner = Runner.create();
  Runner.run(runner, engine);
  
  // Render loop
  const offset = fontSize * 0.4;
  
  function render() {
    if (!engine) return;
    
    // Mouse hover nudge
    letterData.forEach(({ body }) => {
      if (!body) return;
      const dx = body.position.x - mousePos.x;
      const dy = body.position.y - mousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < CONFIG.nudgeRadius && dist > 5) {
        const strength = (1 - dist / CONFIG.nudgeRadius) * CONFIG.nudgeStrength;
        Body.applyForce(body, body.position, {
          x: (dx / dist) * strength,
          y: (dy / dist) * strength * 0.4,
        });
      }
    });
    
    // Sync DOM with physics
    letterData.forEach(({ body, el }) => {
      if (!body) return;
      const { x, y } = body.position;
      const angle = body.angle;
      el.style.transform = `translate(${x - offset}px, ${y - offset}px) rotate(${angle}rad)`;
    });
    
    animFrameId = requestAnimationFrame(render);
  }
  render();
  
  console.log('[FallingLetters] Ready');
}

export function dropLetters(): Promise<void> {
  return new Promise((resolve) => {
    if (!engine || !container) {
      resolve();
      return;
    }
    
    // Use container bounds
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const fontSize = getFontSize();
    
    LETTERS.forEach((letter, i) => {
      setTimeout(() => {
        const x = (letter.xPercent / 100) * width;
        const y = letter.yOffset;
        
        const body = createLetterBody(letter.char, x, y, fontSize);
        
        // Set configured angle
        Body.setAngle(body, letter.angle);
        
        // Gentle initial velocity
        Body.setVelocity(body, { x: (Math.random() - 0.5) * 0.5, y: 2 });
        
        letterData[i].body = body;
        World.add(engine!.world, body);
        
        // Show element
        letterData[i].el.style.opacity = '1';
        letterData[i].el.style.pointerEvents = 'auto';
        
      }, i * CONFIG.dropDelay);
    });
    
    setTimeout(resolve, LETTERS.length * CONFIG.dropDelay + 2500);
  });
}

export function destroyFallingLetters(): void {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (runner) Runner.stop(runner);
  if (engine) {
    World.clear(engine.world, false);
    Engine.clear(engine);
  }
  letterData.forEach(({ el }) => el.remove());
  
  engine = null;
  runner = null;
  letterData = [];
  animFrameId = null;
  font = null;
  container = null;
}

export function isReady(): boolean {
  return engine !== null;
}

// Expose for console debugging
if (typeof window !== 'undefined') {
  (window as any).FALLING_CONFIG = CONFIG;
  (window as any).FALLING_LETTERS = LETTERS;
}
