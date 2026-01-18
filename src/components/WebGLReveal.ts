/**
 * WebGL Reveal Transition
 * Creates a curved vertex displacement effect that reveals content beneath
 * Uses Three.js for GPU-accelerated mesh deformation
 */

import * as THREE from 'three';

interface WebGLRevealOptions {
  /** Container element for the WebGL canvas */
  container: HTMLElement;
  /** Duration of the reveal animation in seconds */
  duration?: number;
  /** Callback when reveal is complete */
  onComplete?: () => void;
}

export class WebGLReveal {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private container: HTMLElement;
  private duration: number;
  private onComplete?: () => void;
  private animationId: number | null = null;
  private startTime: number = 0;
  private isAnimating: boolean = false;

  // Vertex shader - handles curved displacement
  private vertexShader = `
    varying vec2 vUv;
    uniform float uProgress;
    uniform float uCurve;
    
    void main() {
      vUv = uv;
      
      vec3 pos = position;
      
      // Create curved reveal effect from bottom
      float curveInfluence = smoothstep(0.0, 1.0, uProgress);
      float yOffset = (1.0 - vUv.y) * uCurve * curveInfluence;
      
      // Displace vertices upward in a curve
      pos.y += yOffset * (1.0 - uProgress);
      
      // Add subtle wave effect
      float wave = sin(vUv.x * 3.14159) * 0.1 * (1.0 - uProgress);
      pos.y += wave;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  // Fragment shader - handles opacity and color
  private fragmentShader = `
    varying vec2 vUv;
    uniform float uProgress;
    uniform vec3 uColor;
    
    void main() {
      // Fade out as reveal progresses
      float alpha = 1.0 - smoothstep(0.3, 1.0, uProgress);
      
      // Add gradient from bottom
      float gradientAlpha = smoothstep(uProgress, uProgress + 0.2, 1.0 - vUv.y);
      
      gl_FragColor = vec4(uColor, alpha * gradientAlpha);
    }
  `;

  constructor(options: WebGLRevealOptions) {
    this.container = options.container;
    this.duration = options.duration ?? 1.5;
    this.onComplete = options.onComplete;

    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    
    // Orthographic camera for 2D overlay
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    // Renderer with transparency
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Style the canvas
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.pointerEvents = 'none';
    this.renderer.domElement.style.zIndex = '9998';

    // Create mesh with curved geometry
    this.material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uCurve: { value: 0.5 },
        uColor: { value: new THREE.Color('#fafafa') }
      },
      transparent: true,
      side: THREE.DoubleSide
    });

    // Create a plane that covers the viewport
    const geometry = new THREE.PlaneGeometry(aspect * 2.2, 2.2, 32, 32);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Start the reveal animation
   */
  public start(): void {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.startTime = performance.now();
    this.animate();
  }

  private animate(): void {
    if (!this.isAnimating) return;

    const elapsed = (performance.now() - this.startTime) / 1000;
    const progress = Math.min(elapsed / this.duration, 1);

    // Easing function for smooth animation
    const eased = this.easeOutExpo(progress);
    
    this.material.uniforms.uProgress.value = eased;
    
    this.renderer.render(this.scene, this.camera);

    if (progress < 1) {
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    } else {
      this.complete();
    }
  }

  private easeOutExpo(x: number): number {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  private complete(): void {
    this.isAnimating = false;
    
    // Clean up
    this.dispose();
    
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Clean up WebGL resources
   */
  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}

/**
 * Initialize WebGL reveal on page load
 */
export function initWebGLReveal(container: HTMLElement): WebGLReveal | null {
  // Check for WebGL support
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported, falling back to CSS transition');
      return null;
    }
  } catch (e) {
    console.warn('WebGL check failed:', e);
    return null;
  }

  const reveal = new WebGLReveal({
    container,
    duration: 1.5,
    onComplete: () => {
      console.log('WebGL reveal complete');
    }
  });

  return reveal;
}
