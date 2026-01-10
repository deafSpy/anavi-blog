/**
 * HeroHead3D
 * Minimal Three.js scene with a placeholder head that reveals on hover.
 * Falls back to a static duotone gradient if WebGL unavailable or reduced-motion is set.
 */

import * as THREE from 'three';

let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let mesh: THREE.Mesh | null = null;
let rafId: number | null = null;

const reducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/** Pointer for hover reveal */
const pointer = new THREE.Vector2(0, 0);

/** Check WebGL support */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

/** Draw duotone fallback gradient on canvas */
function drawFallback(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width || 400;
  const h = canvas.height || 400;
  canvas.width = w;
  canvas.height = h;

  // Duotone gradient
  const grad = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.7);
  grad.addColorStop(0, '#fb923c33');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#1e293b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Stylized text
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillStyle = '#f1f5f9';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Anavi', w / 2, h / 2 - 20);
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('3D model coming soon', w / 2, h / 2 + 20);
}

/** Create placeholder head geometry (icosphere) */
function createHeadGeometry(): THREE.BufferGeometry {
  // Use icosahedron as placeholder "head" shape
  return new THREE.IcosahedronGeometry(1.2, 2);
}

/** Create shader material with hover reveal */
function createHeadMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uRevealRadius: { value: 0.15 },
      uColorA: { value: new THREE.Color('#1e293b') },
      uColorB: { value: new THREE.Color('#fb923c') },
      uColorFace: { value: new THREE.Color('#f8fafc') },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;

        // Subtle wobble
        vec3 pos = position;
        pos += normal * sin(uTime * 0.5 + position.y * 2.0) * 0.02;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uRevealRadius;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorFace;

      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        // Base gradient based on normals
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
        vec3 baseColor = mix(uColorA, uColorB, fresnel * 0.5 + 0.2);

        // Hover reveal: show face color near pointer
        vec2 screenPos = vPosition.xy * 0.5 + 0.5;
        float dist = distance(screenPos, uPointer);
        float reveal = smoothstep(uRevealRadius, uRevealRadius * 0.3, dist);

        vec3 finalColor = mix(baseColor, uColorFace, reveal * 0.7);

        // Add subtle noise/texture
        float noise = fract(sin(dot(vPosition.xy, vec2(12.9898, 78.233))) * 43758.5453);
        finalColor += noise * 0.02;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    wireframe: false,
  });
}

/** Initialize the Three.js scene */
export function init(canvasId = 'anavi-face') {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;

  // Fallback for reduced motion or no WebGL
  if (reducedMotion || !isWebGLAvailable()) {
    drawFallback(canvas);
    return;
  }

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 4;

  // Placeholder head mesh
  const geometry = createHeadGeometry();
  const material = createHeadMaterial();
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Lighting (ambient only for duotone feel)
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  // Pointer tracking
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);

  // Resize observer
  const resizeObserver = new ResizeObserver(() => {
    if (!renderer || !camera || !canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(canvas);

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    rafId = requestAnimationFrame(animate);

    if (!mesh || !renderer || !scene || !camera) return;

    const elapsed = clock.getElapsedTime();

    // Update shader uniforms
    const mat = mesh.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = elapsed;
    mat.uniforms.uPointer.value.lerp(pointer, 0.1);

    // Idle rotation
    mesh.rotation.y = Math.sin(elapsed * 0.3) * 0.2;
    mesh.rotation.x = Math.cos(elapsed * 0.2) * 0.1;

    renderer.render(scene, camera);
  }
  animate();
}

function onPointerMove(e: PointerEvent) {
  const canvas = e.currentTarget as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  pointer.x = (e.clientX - rect.left) / rect.width;
  pointer.y = 1 - (e.clientY - rect.top) / rect.height;
}

function onPointerLeave() {
  // Reset to center
  pointer.set(0.5, 0.5);
}

/** Cleanup */
export function destroy() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  if (mesh) {
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
    mesh = null;
  }
  scene = null;
  camera = null;
}

// Auto-init when imported client-side
if (typeof window !== 'undefined') {
  document.addEventListener('astro:page-load', () => init());
  document.addEventListener('astro:before-swap', destroy);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
}

