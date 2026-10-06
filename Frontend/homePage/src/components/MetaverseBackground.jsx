import React, { useEffect, useRef } from "react";

// ─── Configuration ─────────────────────────────────────────────────────────────
const CONFIG = {
  // Particle stars / floating digital data nodes
  PARTICLE_COUNT: 220,
  PARTICLE_MAX_RADIUS: 2.8,
  PARTICLE_MIN_SPEED: 0.1,
  PARTICLE_MAX_SPEED: 0.38,

  // Floating wireframe 3D geometric polyhedra (cubes, octahedra, pyramids)
  SHAPE_COUNT: 18,

  // Perspective metaverse grid
  GRID_LINES_H: 14,     // horizontal lines
  GRID_LINES_V: 20,     // vertical lines
  GRID_HORIZON_Y: 0.50, // horizon position
  GRID_VANISH_X: 0.5,   // vanishing point x

  // Avatar silhouettes (humanoid metaverse explorers)
  AVATAR_COUNT: 8,

  // Tech objects: VR Headsets & Hand Controllers
  VR_HEADSET_COUNT: 9,
  VR_CONTROLLER_COUNT: 8,

  // High contrast futuristic neon color palette
  CYAN_COLOR: "0, 240, 255",       // Vivid electric cyan
  PURPLE_COLOR: "168, 85, 247",    // Vibrant holographic violet
  DEEP_BLUE_COLOR: "14, 116, 233",  // High-intensity electric blue
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ─── Particle Star / Node ─────────────────────────────────────────────────────

class Particle {
  constructor(W, H) {
    this.reset(W, H, true);
  }

  reset(W, H, initial = false) {
    this.x = rand(0, W);
    this.y = initial ? rand(0, H) : rand(-15, -2);
    this.r = rand(0.7, CONFIG.PARTICLE_MAX_RADIUS);
    this.speed = rand(CONFIG.PARTICLE_MIN_SPEED, CONFIG.PARTICLE_MAX_SPEED);
    this.alpha = rand(0.5, 0.95);
    this.W = W;
    this.H = H;
    this.vx = rand(-0.08, 0.08);
    this.pulseOffset = rand(0, Math.PI * 2);
    this.pulseSpeed = rand(0.008, 0.025);
    this.color = Math.random() < 0.35 ? CONFIG.PURPLE_COLOR : CONFIG.CYAN_COLOR;
  }

  update(_t) {
    this.y += this.speed;
    this.x += this.vx;
    if (this.y > this.H + 15) this.reset(this.W, this.H);
  }

  draw(ctx, t) {
    const pulse = 0.5 + 0.5 * Math.sin(this.pulseOffset + t * this.pulseSpeed * 60);
    const a = this.alpha * (0.7 + 0.3 * pulse);

    ctx.save();
    ctx.shadowBlur = this.r > 1.8 ? 10 : 5;
    ctx.shadowColor = `rgba(${this.color}, ${a})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${a})`;
    ctx.fill();
    ctx.restore();
  }
}

// ─── Floating 3D Wireframe Shape ──────────────────────────────────────────────

class FloatingShape {
  constructor(W, H) {
    this.W = W;
    this.H = H;
    this.x = rand(0.04 * W, 0.96 * W);
    this.y = rand(0.06 * H, 0.92 * H);
    this.size = rand(22, 60);
    this.rotX = rand(0, Math.PI * 2);
    this.rotY = rand(0, Math.PI * 2);
    this.rotZ = rand(0, Math.PI * 2);
    this.speedX = rand(-0.005, 0.005);
    this.speedY = rand(-0.006, 0.006);
    this.speedZ = rand(-0.004, 0.004);
    this.floatSpeed = rand(0.0005, 0.0012);
    this.floatOffset = rand(0, Math.PI * 2);
    this.alpha = rand(0.45, 0.85); // High contrast visibility
    const pick = Math.random();
    this.type = pick < 0.4 ? "cube" : pick < 0.75 ? "octahedron" : "pyramid";
    this.color = Math.random() < 0.4 ? CONFIG.PURPLE_COLOR : CONFIG.CYAN_COLOR;
  }

  update(_t) {
    this.rotX += this.speedX;
    this.rotY += this.speedY;
    this.rotZ += this.speedZ;
  }

  project(px, py, pz) {
    const cosY = Math.cos(this.rotY), sinY = Math.sin(this.rotY);
    let x1 = px * cosY - pz * sinY;
    let z1 = px * sinY + pz * cosY;

    const cosX = Math.cos(this.rotX), sinX = Math.sin(this.rotX);
    let y1 = py * cosX - z1 * sinX;

    const cosZ = Math.cos(this.rotZ), sinZ = Math.sin(this.rotZ);
    let x2 = x1 * cosZ - y1 * sinZ;
    let y2 = x1 * sinZ + y1 * cosZ;
    return [x2, y2];
  }

  drawEdge(ctx, a, b) {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }

  draw(ctx, t) {
    const floatY = Math.sin(this.floatOffset + t * this.floatSpeed * 60) * 12;
    const cx = this.x;
    const cy = this.y + floatY;
    const s = this.size;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${this.color}, ${this.alpha * 0.9})`;
    ctx.strokeStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.lineWidth = 1.4;

    if (this.type === "cube") {
      const verts = [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s,  s], [s, -s,  s], [s, s,  s], [-s, s,  s],
      ].map(([px, py, pz]) => this.project(px, py, pz));

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];
      for (const [a, b] of edges) this.drawEdge(ctx, verts[a], verts[b]);

      // Subtle translucent inner core
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha * 0.12})`;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === "octahedron") {
      const verts = [
        [0, -s, 0], [0, s, 0], [s, 0, 0],
        [-s, 0, 0], [0, 0, s], [0, 0, -s],
      ].map(([px, py, pz]) => this.project(px, py, pz));

      const edges = [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 4], [4, 3], [3, 5], [5, 2],
      ];
      for (const [a, b] of edges) this.drawEdge(ctx, verts[a], verts[b]);
    } else {
      // 3D Pyramid
      const h = s * 1.2;
      const verts = [
        [0, -h, 0], // apex
        [-s, s * 0.6, -s], [s, s * 0.6, -s], [s, s * 0.6, s], [-s, s * 0.6, s],
      ].map(([px, py, pz]) => this.project(px, py, pz));

      const edges = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 2], [2, 3], [3, 4], [4, 1],
      ];
      for (const [a, b] of edges) this.drawEdge(ctx, verts[a], verts[b]);
    }

    ctx.restore();
  }
}

// ─── Avatar Silhouette (Humanoid Metaverse Traveler) ──────────────────────────

class AvatarSilhouette {
  constructor(W, H) {
    this.W = W;
    this.H = H;
    this.x = rand(0.06 * W, 0.94 * W);
    this.baseY = rand(0.48 * H, 0.88 * H);
    this.scale = rand(0.35, 0.72);
    this.alpha = rand(0.40, 0.75); // High contrast, clearly defined
    this.floatOffset = rand(0, Math.PI * 2);
    this.floatSpeed = rand(0.0004, 0.0009);
    this.color = Math.random() < 0.4 ? CONFIG.PURPLE_COLOR : CONFIG.CYAN_COLOR;
  }

  draw(ctx, t) {
    const floatY = Math.sin(this.floatOffset + t * this.floatSpeed * 60) * 16;
    const y = this.baseY + floatY;
    const s = this.scale;
    const a = this.alpha;

    ctx.save();
    ctx.translate(this.x, y);
    ctx.scale(s, s);

    ctx.shadowBlur = 14;
    ctx.shadowColor = `rgba(${this.color}, ${a * 0.85})`;
    ctx.strokeStyle = `rgba(${this.color}, ${a})`;
    ctx.fillStyle = `rgba(${this.color}, ${a * 0.22})`;
    ctx.lineWidth = 2.0 / s;

    // Glowing VR Visor on Avatar's Head
    ctx.beginPath();
    ctx.arc(0, -90, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();

    // Visor strip across the face
    ctx.fillStyle = `rgba(${CONFIG.CYAN_COLOR}, ${a * 0.95})`;
    ctx.beginPath();
    ctx.roundRect(-14, -94, 28, 9, 3);
    ctx.fill();

    // Torso (futuristic cyberpunk jacket / body)
    ctx.strokeStyle = `rgba(${this.color}, ${a})`;
    ctx.fillStyle = `rgba(${this.color}, ${a * 0.28})`;
    ctx.beginPath();
    ctx.moveTo(-30, -60);
    ctx.lineTo(30, -60);
    ctx.lineTo(22, 5);
    ctx.lineTo(-22, 5);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Cyber spine / chest glow line
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.85})`;
    ctx.lineWidth = 1.6 / s;
    ctx.beginPath();
    ctx.moveTo(0, -56);
    ctx.lineTo(0, -5);
    ctx.stroke();

    // Left arm
    ctx.strokeStyle = `rgba(${this.color}, ${a})`;
    ctx.lineWidth = 2.2 / s;
    ctx.beginPath();
    ctx.moveTo(-30, -56);
    ctx.lineTo(-48, -18);
    ctx.lineTo(-40, 15);
    ctx.stroke();

    // Right arm (interactivity pose)
    ctx.beginPath();
    ctx.moveTo(30, -56);
    ctx.lineTo(48, -25);
    ctx.lineTo(54, -45); // Hand reaching out to interface with holographic space
    ctx.stroke();

    // Holographic interaction point at fingertips
    ctx.fillStyle = `rgba(${CONFIG.CYAN_COLOR}, ${a * 0.9})`;
    ctx.beginPath();
    ctx.arc(54, -45, 4 / s, 0, Math.PI * 2);
    ctx.fill();

    // Left leg
    ctx.beginPath();
    ctx.moveTo(-14, 5);
    ctx.lineTo(-18, 56);
    ctx.lineTo(-14, 90);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(14, 5);
    ctx.lineTo(18, 56);
    ctx.lineTo(14, 90);
    ctx.stroke();

    // Dual AR Orbital Rings with bright dashed scan
    ctx.lineWidth = 1.4 / s;
    ctx.setLineDash([6 / s, 6 / s]);
    ctx.strokeStyle = `rgba(${CONFIG.CYAN_COLOR}, ${a * 0.85})`;
    ctx.beginPath();
    ctx.ellipse(0, 10, 68, 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${CONFIG.PURPLE_COLOR}, ${a * 0.75})`;
    ctx.beginPath();
    ctx.ellipse(0, -35, 45, 14, 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }
}

// ─── VR Headset Tech Object ───────────────────────────────────────────────────

class VRHeadset {
  constructor(W, H) {
    this.W = W;
    this.H = H;
    this.x = rand(0.05 * W, 0.95 * W);
    this.y = rand(0.06 * H, 0.88 * H);
    this.scale = rand(0.42, 0.85); // Prominent size
    this.alpha = rand(0.45, 0.88); // Punchy contrast
    this.floatOffset = rand(0, Math.PI * 2);
    this.floatSpeed = rand(0.0004, 0.001);
    this.tiltOffset = rand(0, Math.PI * 2);
    this.tiltSpeed = rand(0.0003, 0.0007);
    this.rotZ = rand(-0.35, 0.35);
    this.rotSpeed = rand(-0.001, 0.001);
    this.color = Math.random() < 0.35 ? CONFIG.PURPLE_COLOR : CONFIG.CYAN_COLOR;
  }

  draw(ctx, t) {
    const floatY = Math.sin(this.floatOffset + t * this.floatSpeed * 60) * 14;
    const tilt = Math.sin(this.tiltOffset + t * this.tiltSpeed * 60) * 0.15;
    this.rotZ += this.rotSpeed;

    const s = this.scale;
    const a = this.alpha;
    const c = this.color;

    ctx.save();
    ctx.translate(this.x, this.y + floatY);
    ctx.rotate(this.rotZ + tilt);
    ctx.scale(s, s);

    ctx.shadowBlur = 16;
    ctx.shadowColor = `rgba(${c}, ${a * 0.9})`;
    ctx.lineWidth = 2.0 / s;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // ── Main Visor Outer Shell ──
    const bw = 108, bh = 52, br = 16;
    ctx.strokeStyle = `rgba(${c}, ${a})`;
    ctx.fillStyle = `rgba(${c}, ${a * 0.15})`;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, br);
    ctx.fill();
    ctx.stroke();

    // ── Left Optic Lens ──
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.95})`;
    ctx.fillStyle = `rgba(${CONFIG.CYAN_COLOR}, ${a * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(-28, 0, 22, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // ── Right Optic Lens ──
    ctx.beginPath();
    ctx.ellipse(28, 0, 22, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner concentric reticle
    ctx.strokeStyle = `rgba(${CONFIG.CYAN_COLOR}, ${a * 0.9})`;
    ctx.lineWidth = 1.0 / s;
    ctx.beginPath();
    ctx.ellipse(-28, 0, 13, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(28, 0, 13, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // ── Center Lens Bridge ──
    ctx.strokeStyle = `rgba(${c}, ${a * 0.8})`;
    ctx.lineWidth = 2.0 / s;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();

    // ── Head Strap Curve ──
    ctx.strokeStyle = `rgba(${CONFIG.DEEP_BLUE_COLOR}, ${a * 0.95})`;
    ctx.lineWidth = 2.2 / s;
    ctx.beginPath();
    ctx.moveTo(-bw / 2 + 6, -bh / 2);
    ctx.quadraticCurveTo(0, -bh / 2 - 38, bw / 2 - 6, -bh / 2);
    ctx.stroke();

    // ── Side Tensioner Mounts ──
    ctx.beginPath();
    ctx.moveTo(-bw / 2, -10);
    ctx.lineTo(-bw / 2 - 24, -6);
    ctx.lineTo(-bw / 2 - 24, 6);
    ctx.lineTo(-bw / 2, 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bw / 2, -10);
    ctx.lineTo(bw / 2 + 24, -6);
    ctx.lineTo(bw / 2 + 24, 6);
    ctx.lineTo(bw / 2, 10);
    ctx.stroke();

    // ── High-Contrast Status LED ──
    ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(0, 240, 255, ${a})`;
    ctx.beginPath();
    ctx.arc(0, -bh / 2 + 6, 3.5 / s, 0, Math.PI * 2);
    ctx.fill();

    // ── Animated Cyber Scan Line ──
    const scanProgress = ((t * 0.012) % 1);
    const scanX = lerp(-bw / 2 + 6, bw / 2 - 6, scanProgress);
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.95})`;
    ctx.lineWidth = 1.4 / s;
    ctx.beginPath();
    ctx.moveTo(scanX, -bh / 2 + 8);
    ctx.lineTo(scanX, bh / 2 - 8);
    ctx.stroke();

    ctx.restore();
  }
}

// ─── VR Hand Controller Tech Object ───────────────────────────────────────────

class VRController {
  constructor(W, H) {
    this.W = W;
    this.H = H;
    this.x = rand(0.04 * W, 0.96 * W);
    this.y = rand(0.06 * H, 0.90 * H);
    this.scale = rand(0.38, 0.70);
    this.alpha = rand(0.42, 0.85); // High contrast
    this.floatOffset = rand(0, Math.PI * 2);
    this.floatSpeed = rand(0.0004, 0.0009);
    this.rotZ = rand(-0.6, 0.6);
    this.rotSpeed = rand(-0.001, 0.001);
    this.color = Math.random() < 0.5 ? CONFIG.CYAN_COLOR : CONFIG.PURPLE_COLOR;
  }

  draw(ctx, t) {
    const floatY = Math.sin(this.floatOffset + t * this.floatSpeed * 60) * 12;
    this.rotZ += this.rotSpeed;

    const s = this.scale;
    const a = this.alpha;
    const c = this.color;

    ctx.save();
    ctx.translate(this.x, this.y + floatY);
    ctx.rotate(this.rotZ);
    ctx.scale(s, s);

    ctx.shadowBlur = 14;
    ctx.shadowColor = `rgba(${c}, ${a * 0.85})`;
    ctx.lineWidth = 1.8 / s;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // ── Grip Handle ──
    ctx.strokeStyle = `rgba(${CONFIG.DEEP_BLUE_COLOR}, ${a * 0.95})`;
    ctx.fillStyle = `rgba(${CONFIG.DEEP_BLUE_COLOR}, ${a * 0.22})`;
    ctx.beginPath();
    ctx.roundRect(-11, 10, 22, 56, 8);
    ctx.fill();
    ctx.stroke();

    // ── Tracking Sensor Halo Ring ──
    ctx.strokeStyle = `rgba(${c}, ${a})`;
    ctx.fillStyle = `rgba(${c}, ${a * 0.16})`;
    ctx.beginPath();
    ctx.ellipse(0, -4, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner Tracking Rim
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.8})`;
    ctx.lineWidth = 1.0 / s;
    ctx.beginPath();
    ctx.ellipse(0, -4, 21, 13, 0, 0, Math.PI * 2);
    ctx.stroke();

    // ── Analog Thumbstick ──
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.9})`;
    ctx.fillStyle = `rgba(${c}, ${a * 0.45})`;
    ctx.lineWidth = 1.6 / s;
    ctx.beginPath();
    ctx.arc(-8, -5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // ── Action Buttons ──
    ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
    ctx.beginPath();
    ctx.arc(10, -2, 3.5, 0, Math.PI * 2);
    ctx.arc(9, -13, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // ── Index Finger Trigger ──
    ctx.strokeStyle = `rgba(${c}, ${a * 0.9})`;
    ctx.lineWidth = 1.6 / s;
    ctx.beginPath();
    ctx.moveTo(-9, 16);
    ctx.quadraticCurveTo(-20, 20, -18, 32);
    ctx.stroke();

    // ── Top Tracking Beacon LED Pulse ──
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.07 + this.floatOffset);
    ctx.fillStyle = `rgba(0, 240, 255, ${a * pulse * 1.5})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(0, 240, 255, 1)`;
    ctx.beginPath();
    ctx.arc(0, -22, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ─── Perspective Grid ─────────────────────────────────────────────────────────

function drawGrid(ctx, W, H, t) {
  const horizonY = CONFIG.GRID_HORIZON_Y * H;
  const vanishX = CONFIG.GRID_VANISH_X * W;
  const bottomY = H * 1.08;

  // Forward scroll animation
  const offset = (t * 0.022) % (1 / CONFIG.GRID_LINES_H);

  ctx.save();

  // Horizontal perspective lines with high contrast cyan
  for (let i = 0; i <= CONFIG.GRID_LINES_H; i++) {
    const progress = (i / CONFIG.GRID_LINES_H + offset) % 1;
    const y = lerp(horizonY, bottomY, Math.pow(progress, 1.7));
    if (y < horizonY) continue;

    const lineAlpha = Math.pow(progress, 1.2) * 0.65; // High contrast
    const widthAtY = lerp(0, W * 1.45, progress);
    const x0 = vanishX - widthAtY / 2;
    const x1 = vanishX + widthAtY / 2;

    ctx.lineWidth = 1.2 + progress * 1.2;
    ctx.strokeStyle = `rgba(${CONFIG.CYAN_COLOR}, ${lineAlpha})`;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
  }

  // Vertical convergence lines with cyan/purple gradient
  for (let i = 0; i <= CONFIG.GRID_LINES_V; i++) {
    const frac = i / CONFIG.GRID_LINES_V;
    const bx = lerp(-W * 0.22, W * 1.22, frac);
    const alpha = 0.22 + 0.28 * (1 - Math.abs(frac - 0.5) * 2);

    ctx.lineWidth = 1.1;
    ctx.strokeStyle = `rgba(${CONFIG.CYAN_COLOR}, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(vanishX, horizonY);
    ctx.lineTo(bx, bottomY);
    ctx.stroke();
  }

  // Intense Horizon Laser Line
  const grad = ctx.createLinearGradient(0, horizonY, W, horizonY);
  grad.addColorStop(0, `rgba(${CONFIG.CYAN_COLOR}, 0)`);
  grad.addColorStop(0.25, `rgba(${CONFIG.CYAN_COLOR}, 0.65)`);
  grad.addColorStop(0.5, `rgba(255, 255, 255, 0.95)`);
  grad.addColorStop(0.75, `rgba(${CONFIG.CYAN_COLOR}, 0.65)`);
  grad.addColorStop(1, `rgba(${CONFIG.CYAN_COLOR}, 0)`);

  ctx.shadowBlur = 18;
  ctx.shadowColor = `rgba(${CONFIG.CYAN_COLOR}, 0.9)`;
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(W, horizonY);
  ctx.stroke();

  ctx.restore();
}

// ─── Main Canvas Component ────────────────────────────────────────────────────

export default function MetaverseBackground() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    particles: [],
    shapes: [],
    avatars: [],
    vrHeadsets: [],
    vrControllers: [],
    animId: null,
    t: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const state = stateRef.current;

    function init() {
      const W = canvas.width;
      const H = canvas.height;
      state.particles     = Array.from({ length: CONFIG.PARTICLE_COUNT },      () => new Particle(W, H));
      state.shapes        = Array.from({ length: CONFIG.SHAPE_COUNT },         () => new FloatingShape(W, H));
      state.avatars       = Array.from({ length: CONFIG.AVATAR_COUNT },        () => new AvatarSilhouette(W, H));
      state.vrHeadsets    = Array.from({ length: CONFIG.VR_HEADSET_COUNT },    () => new VRHeadset(W, H));
      state.vrControllers = Array.from({ length: CONFIG.VR_CONTROLLER_COUNT }, () => new VRController(W, H));
    }

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    }

    function render() {
      const W = canvas.width;
      const H = canvas.height;
      state.t++;

      ctx.clearRect(0, 0, W, H);

      // 1. Perspective grid floor
      drawGrid(ctx, W, H, state.t);

      // 2. Avatar silhouettes
      for (const av of state.avatars) av.draw(ctx, state.t);

      // 3. VR Headsets
      for (const hmd of state.vrHeadsets) hmd.draw(ctx, state.t);

      // 4. VR Controllers
      for (const ctrl of state.vrControllers) ctrl.draw(ctx, state.t);

      // 5. Floating 3D wireframe polyhedra
      for (const sh of state.shapes) {
        sh.update(state.t);
        sh.draw(ctx, state.t);
      }

      // 6. Glowing digital particle nodes
      for (const p of state.particles) {
        p.update(state.t);
        p.draw(ctx, state.t);
      }

      state.animId = requestAnimationFrame(render);
    }

    resize();
    render();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(state.animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        display: "block",
      }}
    />
  );
}
