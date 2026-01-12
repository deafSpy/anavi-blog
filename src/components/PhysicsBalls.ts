/**
 * PhysicsBalls.ts
 * Interactive bouncing balls simulation using Matter.js
 * For the right-side hero box
 */

import Matter from 'matter-js';

const { Engine, World, Bodies, Body, Runner, Mouse, MouseConstraint, Common } = Matter;

// ============================================
// CONFIGURATION
// ============================================
export const BALLS_CONFIG = {
  // Number of balls
  count: 8,
  
  // Ball sizes (random between min and max)
  radiusMin: 20,
  radiusMax: 50,
  
  // Physics
  gravity: 1.5,
  restitution: 0.8,    // Bouncy!
  friction: 0.3,
  frictionAir: 0.01,
  
  // Colors for balls
  colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#1c1917', '#44403c'],
  
  // Mouse interaction
  nudgeRadius: 100,
  nudgeStrength: 0.001,
};

interface Ball {
  body: Matter.Body;
  el: HTMLElement;
  radius: number;
  color: string;
}

let engine: Matter.Engine | null = null;
let runner: Matter.Runner | null = null;
let balls: Ball[] = [];
let animFrameId: number | null = null;
let container: HTMLElement | null = null;
let mousePos = { x: -9999, y: -9999 };

export async function initPhysicsBalls(containerId: string): Promise<void> {
  container = document.getElementById(containerId);
  if (!container) {
    console.error('[PhysicsBalls] Container not found:', containerId);
    return;
  }
  
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  
  console.log('[PhysicsBalls] Init:', { width, height });
  
  // Create engine
  engine = Engine.create({
    gravity: { x: 0, y: BALLS_CONFIG.gravity, scale: 0.001 },
  });
  
  // Create walls
  const wallThickness = 50;
  const floor = Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, { isStatic: true, restitution: 0.5 });
  const ceiling = Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true });
  const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true });
  const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true });
  
  World.add(engine.world, [floor, ceiling, leftWall, rightWall]);
  
  // Create balls
  for (let i = 0; i < BALLS_CONFIG.count; i++) {
    const radius = BALLS_CONFIG.radiusMin + Math.random() * (BALLS_CONFIG.radiusMax - BALLS_CONFIG.radiusMin);
    const x = radius + Math.random() * (width - radius * 2);
    const y = -radius - Math.random() * height * 0.5; // Start above container
    const color = BALLS_CONFIG.colors[i % BALLS_CONFIG.colors.length];
    
    // Create physics body
    const body = Bodies.circle(x, y, radius, {
      restitution: BALLS_CONFIG.restitution,
      friction: BALLS_CONFIG.friction,
      frictionAir: BALLS_CONFIG.frictionAir,
      density: 0.002,
    });
    
    // Initial velocity
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 3,
      y: Math.random() * 2,
    });
    
    World.add(engine.world, body);
    
    // Create DOM element
    const el = document.createElement('div');
    el.className = 'physics-ball';
    el.style.cssText = `
      position: absolute;
      width: ${radius * 2}px;
      height: ${radius * 2}px;
      border-radius: 50%;
      background: ${color};
      pointer-events: none;
      will-change: transform;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    container.appendChild(el);
    
    balls.push({ body, el, radius, color });
  }
  
  // Mouse interaction
  const mouse = Mouse.create(container);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  World.add(engine.world, mouseConstraint);
  
  // Track mouse for nudge
  container.addEventListener('mousemove', (e) => {
    const r = container!.getBoundingClientRect();
    mousePos.x = e.clientX - r.left;
    mousePos.y = e.clientY - r.top;
  });
  container.addEventListener('mouseleave', () => {
    mousePos = { x: -9999, y: -9999 };
  });
  
  // Start physics
  runner = Runner.create();
  Runner.run(runner, engine);
  
  // Render loop
  function render() {
    if (!engine) return;
    
    // Mouse hover nudge
    balls.forEach(({ body, radius }) => {
      const dx = body.position.x - mousePos.x;
      const dy = body.position.y - mousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < BALLS_CONFIG.nudgeRadius && dist > 5) {
        const strength = (1 - dist / BALLS_CONFIG.nudgeRadius) * BALLS_CONFIG.nudgeStrength;
        Body.applyForce(body, body.position, {
          x: (dx / dist) * strength,
          y: (dy / dist) * strength,
        });
      }
    });
    
    // Sync DOM
    balls.forEach(({ body, el, radius }) => {
      const { x, y } = body.position;
      el.style.transform = `translate(${x - radius}px, ${y - radius}px)`;
    });
    
    animFrameId = requestAnimationFrame(render);
  }
  render();
  
  console.log('[PhysicsBalls] Ready');
}

export function showBalls(): void {
  balls.forEach((ball, i) => {
    setTimeout(() => {
      ball.el.style.opacity = '1';
    }, i * 100);
  });
}

export function destroyPhysicsBalls(): void {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (runner) Runner.stop(runner);
  if (engine) {
    World.clear(engine.world, false);
    Engine.clear(engine);
  }
  balls.forEach(({ el }) => el.remove());
  
  engine = null;
  runner = null;
  balls = [];
  animFrameId = null;
  container = null;
}

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).BALLS_CONFIG = BALLS_CONFIG;
}
