import { DesignPreset, LightingPreset, WeaveType } from '../types';

export const EDITORIAL_ASSETS = {
  atelierMood: '/src/assets/images/atelier_tailoring_mood_1790581430705.jpg',
  linenBlazer: '/src/assets/images/lookbook_linen_blazer_1790581442423.jpg',
  silkJacquard: '/src/assets/images/lookbook_silk_jacquard_1790581453599.jpg',
};

export const LIGHTING_PRESETS: LightingPreset[] = [
  {
    id: 'atelier_daylight',
    name: 'Atelier Skylight',
    environmentColor: '#f8f8f6',
    mainLightColor: '#fff8f0',
    mainLightIntensity: 1.4,
    rimLightColor: '#e0e8f0',
    rimLightIntensity: 0.8,
    shadowDarkness: 0.35,
  },
  {
    id: 'golden_hour',
    name: 'Golden Cast',
    environmentColor: '#2b2118',
    mainLightColor: '#fed7aa',
    mainLightIntensity: 2.1,
    rimLightColor: '#f97316',
    rimLightIntensity: 1.2,
    shadowDarkness: 0.55,
  },
  {
    id: 'editorial_studio',
    name: 'Studio Minimal',
    environmentColor: '#1c1917',
    mainLightColor: '#ffffff',
    mainLightIntensity: 1.8,
    rimLightColor: '#cbd5e1',
    rimLightIntensity: 1.4,
    shadowDarkness: 0.6,
  },
  {
    id: 'night_gallery',
    name: 'Nocturne Gallery',
    environmentColor: '#0a0a0c',
    mainLightColor: '#e2e8f0',
    mainLightIntensity: 1.2,
    rimLightColor: '#38bdf8',
    rimLightIntensity: 1.6,
    shadowDarkness: 0.75,
  },
];

export const WEAVE_ARCHETYPES: {
  id: WeaveType;
  name: string;
  category: string;
  description: string;
  bestFor: string;
}[] = [
  {
    id: 'twill_2_2',
    name: '2/2 Diagonal Twill',
    category: 'Sartorial Tailoring',
    description: 'Distinct 45-degree diagonal rib created by floating warp over two and under two weft picks. Excellent drape and crease resistance.',
    bestFor: 'Blazers, suiting, heavy trousers, trench coats',
  },
  {
    id: 'houndstooth',
    name: 'Pied-de-Poule Houndstooth',
    category: 'Scottish Heritage',
    description: 'Classic four-by-four color-and-weave broken check with micro serrations that creates an iconic optical rhythm.',
    bestFor: 'Structured coats, winter jackets, artisanal scarves',
  },
  {
    id: 'herringbone',
    name: 'Broken Chevron Herringbone',
    category: 'Heritage Suiting',
    description: 'Directional zigzag twill featuring column breaks reminiscent of fish skeleton geometry. Supple and architectural.',
    bestFor: 'Tailored overcoats, winter blazers, vestments',
  },
  {
    id: 'plain',
    name: 'Tabby Balanced Plain Weave',
    category: 'Universal Essential',
    description: 'Fundamental over-one under-one grid interlacing. Highly breathable, stable, and highlights raw yarn slub characteristics.',
    bestFor: 'Crisp linen shirts, summer dresses, boxy tees',
  },
  {
    id: 'satin',
    name: '5-End Liquid Satin',
    category: 'Lustrous Silk',
    description: 'Long floating yarns with minimal interlacing points producing an ultra-smooth, light-catching high-luster drape.',
    bestFor: 'Bias evening slip gowns, neckties, jacket linings',
  },
  {
    id: 'basketweave',
    name: 'Oxford 2/2 Basketweave',
    category: 'Artisanal Canvas',
    description: 'Double warp and weft yarns interlaced in pairs to create a distinct tactile checkerboard relief texture.',
    bestFor: 'Heavy cotton tees, utility overshirts, studio bags',
  },
  {
    id: 'waffle',
    name: 'Thermal Waffle Honeycomb',
    category: 'Dimensional Knit/Weave',
    description: 'Three-dimensional square cell structure that traps warmth and offers an exceptional tactile handfeel.',
    bestFor: 'Relaxed pullovers, artisanal wraps, loungewear',
  },
  {
    id: 'jacquard_floral',
    name: 'Brocade Jacquard Damask',
    category: 'Opulent Textile Art',
    description: 'Intricate figured motifs woven directly into the structural ground cloth through individual warp control.',
    bestFor: 'Statement evening coats, couture slip dresses',
  },
  {
    id: 'rib_knit',
    name: 'Architectural Rib Knit',
    category: 'Sculptural Knit',
    description: 'Alternating vertical knit wales and purl courses yielding dynamic lateral elasticity and contouring.',
    bestFor: 'Knit sweaters, collar ribbings, sleeve cuffs',
  },
];

export const DESIGNER_PRESETS: DesignPreset[] = [
  {
    id: 'milanese_houndstooth',
    title: 'Milanese Sartorial Houndstooth',
    tagline: 'Refined 280GSM Wool & Silk Micro-Check',
    garmentId: 'blazer',
    weaveType: 'houndstooth',
    yarn: {
      warpColor: '#1c1b1a', // Charcoal black
      weftColor: '#e7e3dc', // Cream bone
      threadGauge: 3,
      slubIntensity: 0.15,
      fiberLuster: 0.45,
      fiberType: 'wool',
    },
    lightingId: 'atelier_daylight',
    season: 'Autumn / Winter 2026',
    story: 'Inspired by Via Montenapoleone bespoke tailoring. The balanced contrast between charcoal combed wool and unbleached silk creates a quiet, architectural presence.',
  },
  {
    id: 'kyoto_indigo_linen',
    title: 'Kyoto Dip-Dye Shibori Linen',
    tagline: 'Artisanal Indigo Raw Slub on Pure Linen',
    garmentId: 'tee',
    weaveType: 'plain',
    yarn: {
      warpColor: '#1e3a8a', // Deep indigo
      weftColor: '#93c5fd', // Pale sky blue
      threadGauge: 2,
      slubIntensity: 0.85,
      fiberLuster: 0.2,
      fiberType: 'linen',
    },
    print: {
      id: 'kyoto_shibori',
      name: 'Kyoto Shibori Dye',
      scale: 1.1,
      rotation: 12,
      repeatMode: 'half_drop',
      blendMode: 'multiply',
      opacity: 0.75,
      tintColor: '#172554',
    },
    lightingId: 'golden_hour',
    season: 'Spring / Summer 2026',
    story: 'Honoring traditional Japanese botanical indigo fermentation vats. The slub linen yarns take the dye with natural irregularity, creating a lived-in patina.',
  },
  {
    id: 'biophilic_silk_gown',
    title: 'Biophilic Botanical Silk Gown',
    tagline: 'Mulberry Satin with Toile de Jouy Overprint',
    garmentId: 'slip_dress',
    weaveType: 'satin',
    yarn: {
      warpColor: '#2d3326', // Forest moss olive
      weftColor: '#c5cbbe', // Pale sage
      threadGauge: 1,
      slubIntensity: 0.05,
      fiberLuster: 0.9,
      fiberType: 'silk',
    },
    print: {
      id: 'botanical_toile',
      name: 'Toile de Jouy Flore',
      scale: 0.9,
      rotation: 0,
      repeatMode: 'grid',
      blendMode: 'multiply',
      opacity: 0.65,
      tintColor: '#1b2216',
    },
    lightingId: 'editorial_studio',
    season: 'Resort 2026',
    story: 'Lustrous mulberry silk woven on a 5-shaft satin harness, overprinted with delicate monochrome botanical engravings. Flows like liquid emerald in movement.',
  },
  {
    id: 'scandi_oatmeal_knit',
    title: 'Nordic Waffle Cashmere Pullover',
    tagline: 'Tactile 3D Honeycomb in Pure Mongolian Cashmere',
    garmentId: 'crewneck',
    weaveType: 'waffle',
    yarn: {
      warpColor: '#d6c8b2', // Warm oatmeal
      weftColor: '#ece5d8', // Raw alabaster
      threadGauge: 4,
      slubIntensity: 0.35,
      fiberLuster: 0.3,
      fiberType: 'cashmere',
    },
    lightingId: 'atelier_daylight',
    season: 'Pre-Fall 2026',
    story: 'A cloud-soft three-dimensional honeycomb knit that insulates through natural air pockets. Untreated neutral yarns reveal the authentic shade of fine cashmere.',
  },
  {
    id: 'bauhaus_architectural_trouser',
    title: 'Weimar Constructivist Trouser',
    tagline: 'High-Twist Wool Twill with Geometric Rhythm',
    garmentId: 'trousers',
    weaveType: 'twill_2_2',
    yarn: {
      warpColor: '#262626', // Cast iron
      weftColor: '#a88350', // Ochre bronze
      threadGauge: 2,
      slubIntensity: 0.1,
      fiberLuster: 0.5,
      fiberType: 'wool',
    },
    print: {
      id: 'bauhaus_geometry',
      name: 'Constructivist Bauhaus',
      scale: 1.4,
      rotation: 45,
      repeatMode: 'mirror',
      blendMode: 'overlay',
      opacity: 0.45,
      tintColor: '#f59e0b',
    },
    lightingId: 'editorial_studio',
    season: 'Architectural Edition',
    story: 'Strict 45-degree diagonal wool twill juxtaposed with constructivist geometry. Designed for fluid movement with sharp pleat retention.',
  },
  {
    id: 'damask_monochrome_wrap',
    title: 'Heritage Damask Jacquard Wrap',
    tagline: 'Bespoke Double-Weave Jacquard Brocade',
    garmentId: 'tote_scarf',
    weaveType: 'jacquard_floral',
    yarn: {
      warpColor: '#0f172a', // Midnight ink
      weftColor: '#cbd5e1', // Slate silver
      threadGauge: 3,
      slubIntensity: 0.25,
      fiberLuster: 0.65,
      fiberType: 'silk',
    },
    lightingId: 'night_gallery',
    season: 'Limited Atelier Edition',
    story: 'Individual warp yarn control creates reversible positive/negative damask scroll motifs. Finished with hand-twisted fringing.',
  },
];

// Curated Couture Colorway Palettes with Pantone approximations
export const CURATED_COLORWAYS = [
  {
    category: 'Earthy Atelier Neutrals',
    colors: [
      { name: 'Raw Alabaster', hex: '#F4F2EC', pantone: '11-0601 TCX' },
      { name: 'Oatmeal Tweed', hex: '#DDD2C1', pantone: '13-0919 TCX' },
      { name: 'Warm Travertine', hex: '#C2B69F', pantone: '14-1116 TCX' },
      { name: 'Smoked Truffle', hex: '#716558', pantone: '18-0920 TCX' },
      { name: 'Cast Charcoal', hex: '#232221', pantone: '19-3908 TCX' },
    ],
  },
  {
    category: 'Indigo & Mineral Blues',
    colors: [
      { name: 'Bleached Chambray', hex: '#BFDBFE', pantone: '14-4115 TCX' },
      { name: 'Cerulean Mist', hex: '#60A5FA', pantone: '16-4134 TCX' },
      { name: 'Kyoto Vat Indigo', hex: '#1E3A8A', pantone: '19-4052 TCX' },
      { name: 'Midnight Ink', hex: '#0F172A', pantone: '19-4024 TCX' },
      { name: 'Lapis Ultramarine', hex: '#2563EB', pantone: '18-3949 TCX' },
    ],
  },
  {
    category: 'Botanical & Olive Greens',
    colors: [
      { name: 'Dried Eucalyptus', hex: '#D1D5DB', pantone: '13-6105 TCX' },
      { name: 'Tuscan Sage', hex: '#84A98C', pantone: '16-5806 TCX' },
      { name: 'Verdant Forest', hex: '#2D4A3E', pantone: '19-5411 TCX' },
      { name: 'Smoked Moss', hex: '#3E4436', pantone: '19-0414 TCX' },
      { name: 'Dark Juniper', hex: '#1A2E26', pantone: '19-5320 TCX' },
    ],
  },
  {
    category: 'Sartorial Warm Terracottas',
    colors: [
      { name: 'Raw Ochre', hex: '#D97706', pantone: '16-1144 TCX' },
      { name: 'Burnt Sienna', hex: '#B45309', pantone: '18-1244 TCX' },
      { name: 'Tuscan Terracotta', hex: '#9A3412', pantone: '18-1442 TCX' },
      { name: 'Wine Merlot', hex: '#581C2B', pantone: '19-1725 TCX' },
      { name: 'Bespoke Rust', hex: '#C2410C', pantone: '17-1456 TCX' },
    ],
  },
];
