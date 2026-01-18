/**
 * ImageTrail.ts
 * Curved distortion image trail effect using Three.js
 * Shows images following mouse cursor on completed puzzle pages
 */

import * as THREE from 'three';
import gsap from 'gsap';

// ============================================
// CONFIGURATION
// ============================================
export const TRAIL_CONFIG = {
  // Spawn distance threshold
  spawnDistance: 60,
  
  // Image settings
  imageSize: 200,
  
  // Animation
  fadeInDuration: 0.15,
  fadeOutDuration: 0.8,
  fadeOutDelay: 0.3,
  
  // Distortion
  amplitude: 0.0008,
  
  // Trail length (max active images)
  maxImages: 12,
  
  // Image folder
  imagePath: '/hunt/trail-images/',
  imageCount: 10, // Will try to load 1.jpg through 10.jpg
};

// Shader code for curved distortion
const vertexShader = `
varying vec2 vUv;
uniform vec2 uDelta;
uniform float uAmplitude;

#define PI 3.141592653589793

void main() {
  vUv = uv;
  vec3 newPosition = position;
  newPosition.x += sin(uv.y * PI) * uDelta.x * uAmplitude;
  newPosition.y += sin(uv.x * PI) * uDelta.y * uAmplitude;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uAlpha;

void main() {
  vec4 texColor = texture2D(uTexture, vUv);
  gl_FragColor = vec4(texColor.rgb, texColor.a * uAlpha);
}
`;

interface TrailImage {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  isActive: boolean;
}

// State
let scene: THREE.Scene | null = null;
let camera: THREE.OrthographicCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let container: HTMLElement | null = null;
let isActive = false;
let animFrameId: number | null = null;

let textures: THREE.Texture[] = [];
let trailImages: TrailImage[] = [];
let currentImageIndex = 0;
let shuffledIndices: number[] = [];

let lastMousePos = { x: -9999, y: -9999 };
let currentMousePos = { x: 0, y: 0 };
let mouseDelta = { x: 0, y: 0 };
let smoothDelta = { x: 0, y: 0 };

// ============================================
// HELPERS
// ============================================

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getNextImageIndex(): number {
  if (shuffledIndices.length === 0) {
    // Reshuffle when exhausted
    shuffledIndices = shuffleArray([...Array(textures.length).keys()]);
  }
  return shuffledIndices.pop()!;
}

function screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
  if (!camera || !container) return { x: 0, y: 0 };
  
  const rect = container.getBoundingClientRect();
  const x = ((screenX - rect.left) / rect.width) * 2 - 1;
  const y = -((screenY - rect.top) / rect.height) * 2 + 1;
  
  return {
    x: x * (rect.width / 2),
    y: y * (rect.height / 2),
  };
}

// ============================================
// MAIN FUNCTIONS
// ============================================

export async function initImageTrail(containerId: string): Promise<void> {
  container = document.getElementById(containerId);
  if (!container) {
    console.error('[ImageTrail] Container not found:', containerId);
    return;
  }
  
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  
  console.log('[ImageTrail] Init:', { width, height });
  
  // Create scene
  scene = new THREE.Scene();
  
  // Orthographic camera for 2D
  camera = new THREE.OrthographicCamera(
    -width / 2, width / 2,
    height / 2, -height / 2,
    0.1, 1000
  );
  camera.position.z = 100;
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
  `;
  container.appendChild(renderer.domElement);
  
  // Load textures
  const loader = new THREE.TextureLoader();
  const loadPromises: Promise<THREE.Texture | null>[] = [];
  
  for (let i = 1; i <= TRAIL_CONFIG.imageCount; i++) {
    const url = `${TRAIL_CONFIG.imagePath}${i}.jpg`;
    loadPromises.push(
      new Promise((resolve) => {
        loader.load(
          url,
          (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            resolve(texture);
          },
          undefined,
          () => resolve(null) // Failed to load
        );
      })
    );
  }
  
  const loadedTextures = await Promise.all(loadPromises);
  textures = loadedTextures.filter((t): t is THREE.Texture => t !== null);
  
  if (textures.length === 0) {
    console.warn('[ImageTrail] No images loaded, using fallback');
    // Create a simple colored texture as fallback
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f97316';
    ctx.fillRect(0, 0, 64, 64);
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    textures.push(fallbackTexture);
  }
  
  console.log('[ImageTrail] Loaded', textures.length, 'images');
  
  // Initialize shuffled indices
  shuffledIndices = shuffleArray([...Array(textures.length).keys()]);
  
  // Pre-create mesh pool
  for (let i = 0; i < TRAIL_CONFIG.maxImages; i++) {
    const geometry = new THREE.PlaneGeometry(
      TRAIL_CONFIG.imageSize,
      TRAIL_CONFIG.imageSize,
      16, 16
    );
    
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: textures[0] },
        uDelta: { value: new THREE.Vector2(0, 0) },
        uAmplitude: { value: TRAIL_CONFIG.amplitude },
        uAlpha: { value: 0 },
      },
      transparent: true,
      depthTest: false,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    scene.add(mesh);
    
    trailImages.push({ mesh, material, isActive: false });
  }
  
  // Mouse tracking
  const onMouseMove = (e: MouseEvent) => {
    currentMousePos.x = e.clientX;
    currentMousePos.y = e.clientY;
  };
  
  window.addEventListener('mousemove', onMouseMove);
  
  // Animation loop
  function animate() {
    if (!renderer || !scene || !camera || !isActive) {
      animFrameId = requestAnimationFrame(animate);
      return;
    }
    
    // Update smooth delta
    smoothDelta.x = lerp(smoothDelta.x, mouseDelta.x, 0.15);
    smoothDelta.y = lerp(smoothDelta.y, mouseDelta.y, 0.15);
    
    // Update all active meshes with smooth delta
    trailImages.forEach(({ mesh, material, isActive }) => {
      if (isActive) {
        material.uniforms.uDelta.value.set(smoothDelta.x, -smoothDelta.y);
      }
    });
    
    // Decay delta
    mouseDelta.x *= 0.95;
    mouseDelta.y *= 0.95;
    
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }
  animate();
  
  console.log('[ImageTrail] Ready');
}

export function startTrail(): void {
  isActive = true;
  lastMousePos = { x: -9999, y: -9999 };
  
  // Start checking mouse distance
  const checkDistance = () => {
    if (!isActive) return;
    
    const dx = currentMousePos.x - lastMousePos.x;
    const dy = currentMousePos.y - lastMousePos.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance > TRAIL_CONFIG.spawnDistance && lastMousePos.x !== -9999) {
      spawnImage(currentMousePos.x, currentMousePos.y);
      mouseDelta.x = dx;
      mouseDelta.y = dy;
      lastMousePos = { ...currentMousePos };
    } else if (lastMousePos.x === -9999) {
      lastMousePos = { ...currentMousePos };
    }
    
    requestAnimationFrame(checkDistance);
  };
  checkDistance();
}

export function stopTrail(): void {
  isActive = false;
}

function spawnImage(screenX: number, screenY: number): void {
  if (!scene) return;
  
  // Find inactive mesh
  const trailImage = trailImages.find(t => !t.isActive);
  if (!trailImage) return;
  
  const { mesh, material } = trailImage;
  const worldPos = screenToWorld(screenX, screenY);
  
  // Set position
  mesh.position.set(worldPos.x, worldPos.y, currentImageIndex * 0.01);
  currentImageIndex = (currentImageIndex + 1) % TRAIL_CONFIG.maxImages;
  
  // Set random texture
  const textureIndex = getNextImageIndex();
  material.uniforms.uTexture.value = textures[textureIndex];
  material.uniforms.uAlpha.value = 0;
  
  // Random rotation
  mesh.rotation.z = (Math.random() - 0.5) * 0.3;
  
  // Show mesh
  mesh.visible = true;
  trailImage.isActive = true;
  
  // Animate in
  gsap.to(material.uniforms.uAlpha, {
    value: 1,
    duration: TRAIL_CONFIG.fadeInDuration,
    ease: 'power2.out',
  });
  
  // Animate out after delay
  gsap.to(material.uniforms.uAlpha, {
    value: 0,
    duration: TRAIL_CONFIG.fadeOutDuration,
    delay: TRAIL_CONFIG.fadeOutDelay,
    ease: 'power2.inOut',
    onComplete: () => {
      mesh.visible = false;
      trailImage.isActive = false;
    },
  });
}

export function destroyImageTrail(): void {
  stopTrail();
  
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
  }
  
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
  }
  
  trailImages.forEach(({ mesh, material }) => {
    mesh.geometry.dispose();
    material.dispose();
  });
  
  textures.forEach(t => t.dispose());
  
  scene = null;
  camera = null;
  renderer = null;
  container = null;
  trailImages = [];
  textures = [];
}

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).TRAIL_CONFIG = TRAIL_CONFIG;
}
