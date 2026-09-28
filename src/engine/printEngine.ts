import { PrintConfig, RepeatMode } from '../types';

/**
 * Curated Designer Print Library with Procedural Canvas Renderers
 */
export interface CuratedPrintTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  renderToCanvas: (width: number, height: number, tintColor?: string) => HTMLCanvasElement;
}

export const CURATED_PRINTS: CuratedPrintTemplate[] = [
  {
    id: 'botanical_toile',
    name: 'Toile de Jouy Flore',
    category: 'Heritage Botanical',
    description: 'Fine 18th-century monochrome pastoral flora and vine etchings.',
    renderToCanvas: (w, h, tint = '#2b2a28') => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = tint;
      ctx.fillStyle = tint;
      ctx.lineWidth = 1.6;

      // Draw elegant botanical branches and leaves
      ctx.beginPath();
      // Curved stem 1
      ctx.moveTo(w * 0.2, h * 0.9);
      ctx.bezierCurveTo(w * 0.4, h * 0.6, w * 0.1, h * 0.3, w * 0.45, h * 0.15);
      ctx.stroke();

      // Curved stem 2
      ctx.beginPath();
      ctx.moveTo(w * 0.7, h * 0.95);
      ctx.bezierCurveTo(w * 0.6, h * 0.5, w * 0.85, h * 0.35, w * 0.75, h * 0.1);
      ctx.stroke();

      // Leaflets
      const leaves = [
        { x: w * 0.32, y: h * 0.65, r: -0.4, s: 22 },
        { x: w * 0.22, y: h * 0.48, r: 0.6, s: 26 },
        { x: w * 0.35, y: h * 0.32, r: -0.7, s: 20 },
        { x: w * 0.45, y: h * 0.15, r: 0.2, s: 28 },
        { x: w * 0.66, y: h * 0.75, r: 0.5, s: 24 },
        { x: w * 0.72, y: h * 0.42, r: -0.5, s: 26 },
        { x: w * 0.8, y: h * 0.25, r: 0.8, s: 22 },
      ];

      leaves.forEach(l => {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.r);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(l.s * 0.6, -l.s * 0.4, l.s, 0);
        ctx.quadraticCurveTo(l.s * 0.6, l.s * 0.4, 0, 0);
        ctx.stroke();
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();
      });

      return c;
    },
  },
  {
    id: 'bauhaus_geometry',
    name: 'Constructivist Bauhaus',
    category: 'Modernist Geometric',
    description: 'Minimalist intersecting arches, solid spheres, and rectilinear balance.',
    renderToCanvas: (w, h, tint = '#1a1918') => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = tint;

      // Semicircle
      ctx.beginPath();
      ctx.arc(w * 0.35, h * 0.4, w * 0.25, 0, Math.PI, true);
      ctx.closePath();
      ctx.fill();

      // Bold balance line
      ctx.fillRect(w * 0.1, h * 0.65, w * 0.8, 8);

      // Contrast disc
      ctx.beginPath();
      ctx.arc(w * 0.72, h * 0.45, w * 0.14, 0, Math.PI * 2);
      ctx.fill();

      // Diagonal slab
      ctx.save();
      ctx.translate(w * 0.5, h * 0.78);
      ctx.rotate(-0.35);
      ctx.fillRect(-w * 0.25, -6, w * 0.5, 12);
      ctx.restore();

      return c;
    },
  },
  {
    id: 'kyoto_shibori',
    name: 'Kyoto Shibori Dye',
    category: 'Artisanal Resist',
    description: 'Traditional Japanese circular dip-dye resist bleeds on cotton.',
    renderToCanvas: (w, h, tint = '#172554') => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, w, h);

      const circles = [
        { x: w * 0.35, y: h * 0.35, r: w * 0.22 },
        { x: w * 0.75, y: h * 0.65, r: w * 0.18 },
        { x: w * 0.2, y: h * 0.8, r: w * 0.14 },
      ];

      circles.forEach(circ => {
        const grad = ctx.createRadialGradient(
          circ.x, circ.y, circ.r * 0.15,
          circ.x, circ.y, circ.r
        );
        grad.addColorStop(0, 'rgba(255,255,255,0.9)');
        grad.addColorStop(0.35, 'rgba(255,255,255,0.7)');
        grad.addColorStop(0.7, tint);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(circ.x, circ.y, circ.r, 0, Math.PI * 2);
        ctx.fill();
      });

      return c;
    },
  },
  {
    id: 'op_art_lines',
    name: 'Optic Ripple Waves',
    category: 'Kinetic Op-Art',
    description: 'Dynamic undulating moiré rhythm lines creating 3D illusion.',
    renderToCanvas: (w, h, tint = '#18181b') => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = tint;
      ctx.lineWidth = 3.5;

      const numLines = 16;
      const step = h / (numLines - 1);

      for (let i = 0; i < numLines; i++) {
        const baseY = i * step;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const wave = Math.sin((x / w) * Math.PI * 3 + i * 0.4) * (14 + Math.sin(i * 0.7) * 8);
          if (x === 0) ctx.moveTo(x, baseY + wave);
          else ctx.lineTo(x, baseY + wave);
        }
        ctx.stroke();
      }

      return c;
    },
  },
  {
    id: 'wild_flora',
    name: 'Sylvan Meadow',
    category: 'Expressive Flora',
    description: 'Loose contemporary botanical silhouette sprays with delicate petals.',
    renderToCanvas: (w, h, tint = '#3f3e3a') => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = tint;

      // Small blossom clusters
      const blossoms = [
        { x: w * 0.25, y: h * 0.25, count: 5, radius: 14 },
        { x: w * 0.7, y: h * 0.3, count: 6, radius: 18 },
        { x: w * 0.45, y: h * 0.65, count: 5, radius: 16 },
        { x: w * 0.8, y: h * 0.8, count: 4, radius: 12 },
        { x: w * 0.15, y: h * 0.75, count: 5, radius: 15 },
      ];

      blossoms.forEach(b => {
        for (let p = 0; p < b.count; p++) {
          const angle = (p / b.count) * Math.PI * 2;
          const px = b.x + Math.cos(angle) * b.radius;
          const py = b.y + Math.sin(angle) * b.radius;
          ctx.beginPath();
          ctx.arc(px, py, b.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center pistil
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = '#f5f5f4';
        ctx.fill();
        ctx.fillStyle = tint;
      });

      return c;
    },
  },
];

/**
 * Composites Print over Fabric Texture with Repeat, Scale, Rotation, and Blend Mode
 */
export function compositeFabricWithPrint(
  fabricCanvas: HTMLCanvasElement,
  printConfig?: PrintConfig,
  customImageElement?: HTMLImageElement | null
): HTMLCanvasElement {
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = fabricCanvas.width;
  outputCanvas.height = fabricCanvas.height;
  const ctx = outputCanvas.getContext('2d')!;

  // 1. Draw base woven fabric texture
  ctx.drawImage(fabricCanvas, 0, 0);

  // If no print is configured or opacity is 0, return base fabric
  if (!printConfig || printConfig.opacity <= 0.01) {
    return outputCanvas;
  }

  // 2. Prepare print source canvas / image
  let printSource: HTMLCanvasElement | HTMLImageElement | null = null;

  if (customImageElement && printConfig.id === 'custom_upload') {
    printSource = customImageElement;
  } else {
    const template = CURATED_PRINTS.find(p => p.id === printConfig.id);
    if (template) {
      printSource = template.renderToCanvas(256, 256, printConfig.tintColor);
    }
  }

  if (!printSource) {
    return outputCanvas;
  }

  // 3. Composite print with specified blendMode and repeat pattern
  ctx.save();
  ctx.globalAlpha = printConfig.opacity;
  ctx.globalCompositeOperation = printConfig.blendMode === 'normal' ? 'source-over' : printConfig.blendMode;

  const w = outputCanvas.width;
  const h = outputCanvas.height;

  // Scale of pattern tile
  const tileWidth = 256 * printConfig.scale;
  const tileHeight = 256 * printConfig.scale;

  if (printConfig.repeatMode === 'single') {
    // Single placement at center
    ctx.translate(w / 2, h / 2);
    ctx.rotate((printConfig.rotation * Math.PI) / 180);
    ctx.drawImage(printSource, -tileWidth / 2, -tileHeight / 2, tileWidth, tileHeight);
  } else {
    // Repeated tiling pattern
    const rad = (printConfig.rotation * Math.PI) / 180;
    const cols = Math.ceil(w / tileWidth) + 3;
    const rows = Math.ceil(h / tileHeight) + 3;

    for (let r = -1; r <= rows; r++) {
      let xOffset = 0;
      if (printConfig.repeatMode === 'half_drop' && r % 2 !== 0) {
        xOffset = tileWidth * 0.5; // Half-drop brick repeat
      }

      for (let c = -1; c <= cols; c++) {
        const x = c * tileWidth + xOffset;
        const y = r * tileHeight;

        ctx.save();
        ctx.translate(x + tileWidth / 2, y + tileHeight / 2);
        ctx.rotate(rad);

        if (printConfig.repeatMode === 'mirror' && (c % 2 !== 0 || r % 2 !== 0)) {
          ctx.scale(c % 2 !== 0 ? -1 : 1, r % 2 !== 0 ? -1 : 1);
        }

        ctx.drawImage(printSource, -tileWidth / 2, -tileHeight / 2, tileWidth, tileHeight);
        ctx.restore();
      }
    }
  }

  ctx.restore();
  return outputCanvas;
}
