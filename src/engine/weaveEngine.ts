import { FiberType, WeaveType, YarnConfig } from '../types';

/**
 * Procedural Textile & Weave Simulation Engine
 * Generates seamless high-definition yarn interlacing maps, normal maps, and diffuse cloth textures.
 */

// Helper to convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: (num >> 0) & 255,
  };
}

// Convert RGB back to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Simple deterministic pseudo-random noise for slub fibers
function pseudoNoise(x: number, y: number, seed: number = 42): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Returns whether at grid coordinate (x, y), the WARP yarn is on top (true) or WEFT yarn is on top (false)
 */
export function isWarpOnTop(x: number, y: number, weaveType: WeaveType): boolean {
  switch (weaveType) {
    case 'plain':
      return (x + y) % 2 === 0;

    case 'twill_2_2':
      // 2 over, 2 under diagonal
      return ((x + y) % 4) < 2;

    case 'herringbone': {
      // Chevron reversal every 8 columns
      const period = 16;
      const modX = ((x % period) + period) % period;
      const dir = modX < 8 ? 1 : -1;
      const eff = modX < 8 ? x + y : -x + y;
      return ((eff % 4) + 4) % 4 < 2;
    }

    case 'houndstooth': {
      // 4x4 color and weave pattern
      const px = ((x % 8) + 8) % 8;
      const py = ((y % 8) + 8) % 8;
      // Classic 2/2 twill interlaced with 4-warp 4-weft color grouping
      const twill = ((x + y) % 4 + 4) % 4 < 2;
      // Houndstooth check shape
      const inDarkQuarter = (px < 4 && py < 4) || (px >= 4 && py >= 4);
      return inDarkQuarter ? twill : !twill;
    }

    case 'satin':
      // 5-end satin: step 2 or 3
      return (x * 2 + y) % 5 === 0;

    case 'basketweave': {
      // 2x2 basketweave
      const bx = Math.floor(x / 2);
      const by = Math.floor(y / 2);
      return (bx + by) % 2 === 0;
    }

    case 'waffle': {
      // 8x8 diamond honeycomb cells
      const wx = ((x % 8) + 8) % 8;
      const wy = ((y % 8) + 8) % 8;
      const dist = Math.abs(wx - 3.5) + Math.abs(wy - 3.5);
      return dist <= 3;
    }

    case 'jacquard_floral': {
      // Organic damask scroll motif repeat (16x16)
      const jx = ((x % 16) + 16) % 16;
      const jy = ((y % 16) + 16) % 16;
      const circle1 = Math.hypot(jx - 5, jy - 5);
      const circle2 = Math.hypot(jx - 11, jy - 11);
      const isFloral = circle1 < 4 || circle2 < 3.5 || (jx + jy) % 7 === 0;
      return isFloral ? ((x + y) % 3 !== 0) : ((x + y) % 2 === 0);
    }

    case 'rib_knit':
      // 2x1 rib knit simulation
      return x % 3 !== 2;

    default:
      return (x + y) % 2 === 0;
  }
}

/**
 * Renders a seamless procedural fabric canvas tile
 */
export function generateFabricTextureCanvas(
  weaveType: WeaveType,
  yarn: YarnConfig,
  canvasWidth: number = 512,
  canvasHeight: number = 512,
  options: { showNormalMap?: boolean; zoomMultiplier?: number } = {}
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const warpRgb = hexToRgb(yarn.warpColor);
  const weftRgb = hexToRgb(yarn.weftColor);

  // Thread pitch / pixel dimension per yarn based on gauge & zoom
  // Lower gauge = finer threads (more threads per canvas), higher gauge = chunky threads
  const zoom = options.zoomMultiplier || 1.0;
  const baseThreadSize = Math.max(4, Math.round(18 / yarn.threadGauge) * zoom);
  const threadSizeX = baseThreadSize;
  const threadSizeY = baseThreadSize;

  const cols = Math.ceil(canvasWidth / threadSizeX) + 1;
  const rows = Math.ceil(canvasHeight / threadSizeY) + 1;

  const imgData = ctx.createImageData(canvasWidth, canvasHeight);
  const data = imgData.data;

  const showNormals = !!options.showNormalMap;

  // Render pixel by pixel with thread curvature shading & slub fiber noise
  for (let y = 0; y < canvasHeight; y++) {
    const rowIdx = Math.floor(y / threadSizeY);
    const vInThreadY = (y % threadSizeY) / threadSizeY; // 0 to 1 across horizontal weft thread
    const curveY = Math.sin(vInThreadY * Math.PI); // Peak in center

    for (let x = 0; x < canvasWidth; x++) {
      const colIdx = Math.floor(x / threadSizeX);
      const uInThreadX = (x % threadSizeX) / threadSizeX; // 0 to 1 across vertical warp thread
      const curveX = Math.sin(uInThreadX * Math.PI); // Peak in center

      const warpTop = isWarpOnTop(colIdx, rowIdx, weaveType);

      // Slub variation for raw artisanal textures (linen/hemp)
      const slub = yarn.slubIntensity > 0 
        ? (pseudoNoise(colIdx * 0.7, rowIdx * 0.7) - 0.5) * yarn.slubIntensity * 0.4
        : 0;

      // Micro fiber grain
      const microGrain = (pseudoNoise(x * 1.5, y * 1.5) - 0.5) * 0.12;

      let r: number, g: number, b: number;
      let nx = 0, ny = 0, nz = 1;

      if (warpTop) {
        // Vertical warp thread is showing on top
        // Normal curves along X axis (cylinder perpendicular to vertical direction)
        const dX = (uInThreadX - 0.5) * 2; // -1 to 1
        nx = -dX * 0.8;
        ny = 0;
        nz = Math.sqrt(Math.max(0.1, 1 - nx * nx));

        // Shading: Thread curvature + specular luster
        const threadShadow = 0.55 + 0.45 * Math.pow(curveX, 0.65);
        const luster = yarn.fiberLuster * Math.pow(Math.max(0, 1 - Math.abs(dX)), 4) * 0.5;

        // Base color with slub & grain modulation
        const factor = Math.max(0.2, (threadShadow + microGrain + slub + luster));
        r = warpRgb.r * factor;
        g = warpRgb.g * factor;
        b = warpRgb.b * factor;

        // Edge ambient occlusion between warp and weft
        if (uInThreadX < 0.12 || uInThreadX > 0.88) {
          r *= 0.65;
          g *= 0.65;
          b *= 0.65;
        }
      } else {
        // Horizontal weft thread is showing on top
        // Normal curves along Y axis
        const dY = (vInThreadY - 0.5) * 2;
        nx = 0;
        ny = -dY * 0.8;
        nz = Math.sqrt(Math.max(0.1, 1 - ny * ny));

        const threadShadow = 0.55 + 0.45 * Math.pow(curveY, 0.65);
        const luster = yarn.fiberLuster * Math.pow(Math.max(0, 1 - Math.abs(dY)), 4) * 0.5;

        const factor = Math.max(0.2, (threadShadow + microGrain - slub + luster));
        r = weftRgb.r * factor;
        g = weftRgb.g * factor;
        b = weftRgb.b * factor;

        // Edge ambient occlusion
        if (vInThreadY < 0.12 || vInThreadY > 0.88) {
          r *= 0.65;
          g *= 0.65;
          b *= 0.65;
        }
      }

      const pixelIdx = (y * canvasWidth + x) * 4;

      if (showNormals) {
        // Encode normal vector [-1, 1] to RGB [0, 255]
        data[pixelIdx + 0] = Math.floor((nx * 0.5 + 0.5) * 255);
        data[pixelIdx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        data[pixelIdx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        data[pixelIdx + 3] = 255;
      } else {
        data[pixelIdx + 0] = Math.min(255, Math.max(0, Math.round(r)));
        data[pixelIdx + 1] = Math.min(255, Math.max(0, Math.round(g)));
        data[pixelIdx + 2] = Math.min(255, Math.max(0, Math.round(b)));
        data[pixelIdx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Calculates estimated fabric physical properties for fashion designers & technical spec
 */
export function calculateFabricSpec(weaveType: WeaveType, yarn: YarnConfig) {
  // Density and yarn count calculations
  const baseGsm: Record<FiberType, number> = {
    silk: 95,
    linen: 195,
    cotton: 160,
    wool: 280,
    cashmere: 240,
    hemp: 230,
  };

  const gaugeWeightMultiplier = 0.6 + yarn.threadGauge * 0.25;
  const slubWeight = 1 + yarn.slubIntensity * 0.15;
  const gsm = Math.round(baseGsm[yarn.fiberType] * gaugeWeightMultiplier * slubWeight);

  const ozPerSqYard = (gsm / 33.906).toFixed(1);

  // Warp/Weft thread count per inch (approximate EPI / PPI)
  const epi = Math.round(110 / (yarn.threadGauge * 0.7));
  const ppi = Math.round(95 / (yarn.threadGauge * 0.7));

  // Drape coefficient (0 = ultra fluid, 1 = stiff sculptural)
  let drapeCoeff = 0.45;
  if (yarn.fiberType === 'silk') drapeCoeff = 0.2;
  if (yarn.fiberType === 'linen') drapeCoeff = 0.75;
  if (yarn.fiberType === 'wool') drapeCoeff = 0.55;
  if (yarn.fiberType === 'hemp') drapeCoeff = 0.85;

  return {
    gsm,
    ozPerSqYard,
    epi,
    ppi,
    totalThreadCount: epi + ppi,
    drapeCoeff,
    fiberName: yarn.fiberType.toUpperCase(),
  };
}
