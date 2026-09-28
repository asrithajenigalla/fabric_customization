export type WeaveType = 
  | 'plain'
  | 'twill_2_2'
  | 'herringbone'
  | 'houndstooth'
  | 'satin'
  | 'basketweave'
  | 'waffle'
  | 'jacquard_floral'
  | 'rib_knit';

export type FiberType = 'cotton' | 'linen' | 'silk' | 'wool' | 'cashmere' | 'hemp';

export type RepeatMode = 'grid' | 'half_drop' | 'mirror' | 'single';

export type BlendMode = 'multiply' | 'overlay' | 'normal' | 'screen';

export type GarmentId = 'blazer' | 'crewneck' | 'tee' | 'slip_dress' | 'trousers' | 'tote_scarf';

export type ZoneId = 'body' | 'lapel_collar' | 'sleeves' | 'pockets_trim';

export interface YarnConfig {
  warpColor: string;
  warpSecondaryColor?: string;
  weftColor: string;
  weftSecondaryColor?: string;
  threadGauge: number; // 1 (ultra fine) to 5 (chunky)
  slubIntensity: number; // 0 (smooth combed) to 1 (raw slub linen)
  fiberLuster: number; // 0 (matte) to 1 (silk sheen)
  fiberType: FiberType;
}

export interface PrintConfig {
  id: string;
  name: string;
  imageUrl?: string;
  scale: number; // 0.2 to 3
  rotation: number; // 0 to 360
  repeatMode: RepeatMode;
  blendMode: BlendMode;
  opacity: number; // 0 to 1
  tintColor?: string;
}

export interface DecalConfig {
  id: string;
  text?: string;
  imageUrl?: string;
  posX: number; // 0 to 100
  posY: number; // 0 to 100
  scale: number;
  rotation: number;
  style: 'embroidery' | 'silkscreen' | 'leather_patch';
}

export interface ZoneConfig {
  id: ZoneId;
  name: string;
  weaveType: WeaveType;
  yarn: YarnConfig;
  print?: PrintConfig;
  decal?: DecalConfig;
}

export interface GarmentSilhouette {
  id: GarmentId;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  availableZones: { id: ZoneId; label: string }[];
  fabricConsumptionYards: number;
  careInstructions: string[];
}

export interface LightingPreset {
  id: string;
  name: string;
  environmentColor: string;
  mainLightColor: string;
  mainLightIntensity: number;
  rimLightColor: string;
  rimLightIntensity: number;
  shadowDarkness: number;
}

export interface DesignPreset {
  id: string;
  title: string;
  tagline: string;
  garmentId: GarmentId;
  weaveType: WeaveType;
  yarn: YarnConfig;
  print?: PrintConfig;
  contrastZones?: Partial<Record<ZoneId, Partial<ZoneConfig>>>;
  lightingId: string;
  season: string;
  story: string;
}

export interface CartItem {
  id: string;
  garmentId: GarmentId;
  garmentName: string;
  fabricTitle: string;
  type: 'custom_garment' | 'swatch_kit' | 'fabric_bolt';
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Custom';
  yards?: number;
  unitPrice: number;
  quantity: number;
  thumbnail: string;
  specSummary: string;
}
