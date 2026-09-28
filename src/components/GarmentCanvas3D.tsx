import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GarmentId, LightingPreset, PrintConfig, WeaveType, YarnConfig, ZoneConfig, ZoneId } from '../types';
import { generateFabricTextureCanvas } from '../engine/weaveEngine';
import { compositeFabricWithPrint } from '../engine/printEngine';
import { LIGHTING_PRESETS } from '../data/presets';
import { RotateCw, ZoomIn, ZoomOut, Camera, Sun, Layers, Maximize2 } from 'lucide-react';

interface GarmentCanvas3DProps {
  garmentId: GarmentId;
  weaveType: WeaveType;
  yarn: YarnConfig;
  print?: PrintConfig;
  contrastZones: Record<ZoneId, Partial<ZoneConfig>>;
  activeZoneId: ZoneId;
  onSelectZone: (zoneId: ZoneId) => void;
  lightingId: string;
  onLightingChange: (lightingId: string) => void;
  customPrintImage?: HTMLImageElement | null;
  onExportRender?: (dataUrl: string) => void;
}

export const GarmentCanvas3D: React.FC<GarmentCanvas3DProps> = ({
  garmentId,
  weaveType,
  yarn,
  print,
  contrastZones,
  activeZoneId,
  onSelectZone,
  lightingId,
  onLightingChange,
  customPrintImage,
  onExportRender,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const garmentGroupRef = useRef<THREE.Group | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);

  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(true);

  // Cached textures
  const textureCacheRef = useRef<Map<string, THREE.CanvasTexture>>(new Map());

  // Setup Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f7f7f5');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 3.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // for snapshot export
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    // Clear previous DOM canvas if any
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 6.5;
    controls.minDistance = 1.4;
    controls.target.set(0, 0.1, 0);
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // 5. Studio Pedestal / Ground Shadow Plane
    const groundGeo = new THREE.PlaneGeometry(8, 8);
    const groundMat = new THREE.ShadowMaterial({
      opacity: 0.14,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.55;
    ground.receiveShadow = true;
    scene.add(ground);

    // Pedestal Disc
    const pedestalGeo = new THREE.CylinderGeometry(1.3, 1.4, 0.08, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeec,
      roughness: 0.8,
      metalness: 0.1,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.58;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // 6. Lights Group
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // 7. Garment Group
    const garmentGroup = new THREE.Group();
    scene.add(garmentGroup);
    garmentGroupRef.current = garmentGroup;

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update OrbitControls auto-rotation
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  // Update Lighting
  useEffect(() => {
    if (!sceneRef.current || !lightsGroupRef.current) return;
    const group = lightsGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const preset = LIGHTING_PRESETS.find(l => l.id === lightingId) || LIGHTING_PRESETS[0];

    // Background tone
    sceneRef.current.background = new THREE.Color(preset.environmentColor);

    // Ambient Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(
      preset.mainLightColor,
      preset.environmentColor,
      0.85
    );
    group.add(hemiLight);

    // Main Key Light
    const keyLight = new THREE.DirectionalLight(preset.mainLightColor, preset.mainLightIntensity);
    keyLight.position.set(2.5, 4.0, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    keyLight.shadow.bias = -0.0005;
    group.add(keyLight);

    // Soft Rim Light from rear
    const rimLight = new THREE.DirectionalLight(preset.rimLightColor, preset.rimLightIntensity);
    rimLight.position.set(-2.5, 2.5, -2.5);
    group.add(rimLight);

    // Soft Fill Light from left
    const fillLight = new THREE.PointLight(preset.mainLightColor, 0.6, 10);
    fillLight.position.set(-2.0, 0.5, 2.0);
    group.add(fillLight);
  }, [lightingId]);

  // Generate & Cache Fabric Material for a specific zone
  const getMaterialForZone = (zoneId: ZoneId): THREE.Material => {
    const isContrast = !!contrastZones[zoneId];
    const zoneWeave = contrastZones[zoneId]?.weaveType || weaveType;
    const zoneYarn = contrastZones[zoneId]?.yarn || yarn;
    const zonePrint = contrastZones[zoneId]?.print !== undefined ? contrastZones[zoneId]?.print : print;

    // Generate texture on the fly
    const baseCanvas = generateFabricTextureCanvas(zoneWeave, zoneYarn, 512, 512);
    const normalCanvas = generateFabricTextureCanvas(zoneWeave, zoneYarn, 512, 512, { showNormalMap: true });

    // Composite with print if active
    const diffuseCanvas = compositeFabricWithPrint(baseCanvas, zonePrint, customPrintImage);

    // Three.js Textures
    const diffuseTexture = new THREE.CanvasTexture(diffuseCanvas);
    diffuseTexture.wrapS = THREE.RepeatWrapping;
    diffuseTexture.wrapT = THREE.RepeatWrapping;
    diffuseTexture.repeat.set(3, 3);
    diffuseTexture.anisotropy = 8;
    diffuseTexture.needsUpdate = true;

    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(3, 3);
    normalTexture.needsUpdate = true;

    // Fiber roughness & metalness based on fiber properties
    let roughness = 0.85;
    let metalness = 0.05;
    if (zoneYarn.fiberType === 'silk') {
      roughness = 0.35;
      metalness = 0.15;
    } else if (zoneYarn.fiberType === 'wool') {
      roughness = 0.9;
      metalness = 0.02;
    } else if (zoneYarn.fiberType === 'linen') {
      roughness = 0.8;
      metalness = 0.05;
    }

    const material = new THREE.MeshStandardMaterial({
      map: diffuseTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughness: roughness - (zoneYarn.fiberLuster * 0.25),
      metalness: metalness + (zoneYarn.fiberLuster * 0.1),
      wireframe: wireframeMode,
      side: THREE.DoubleSide,
    });

    // If active zone selected, give a very subtle highlight rim or emissive glow
    if (zoneId === activeZoneId) {
      material.emissive = new THREE.Color(0x222222);
      material.emissiveIntensity = 0.08;
    }

    return material;
  };

  // Build Garment 3D Mesh
  useEffect(() => {
    if (!garmentGroupRef.current) return;
    setIsRendering(true);
    const group = garmentGroupRef.current;

    // Clear previous children
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      group.remove(child);
    }

    const bodyMat = getMaterialForZone('body');
    const collarMat = getMaterialForZone('lapel_collar');
    const sleeveMat = getMaterialForZone('sleeves');
    const trimMat = getMaterialForZone('pockets_trim');

    // Build specific silhouettes
    if (garmentId === 'blazer') {
      // 1. Torso body with tailored waist taper
      const torsoGeo = new THREE.CylinderGeometry(0.55, 0.62, 1.45, 32, 16);
      // Displace vertices to form chest drape and shoulders
      const pos = torsoGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const x = pos.getX(i);
        const z = pos.getZ(i);
        // Broaden shoulders
        if (y > 0.4) {
          pos.setX(i, x * 1.35);
          pos.setZ(i, z * 0.9);
        }
        // Chest curve
        if (y > 0.0 && y < 0.4 && z > 0) {
          pos.setZ(i, z * 1.15 + Math.sin((y - 0.1) * Math.PI) * 0.08);
        }
        // Subtle cloth drape ripple
        const ripple = Math.sin(x * 6 + y * 4) * 0.012;
        pos.setX(i, pos.getX(i) + ripple);
      }
      torsoGeo.computeVertexNormals();
      const torso = new THREE.Mesh(torsoGeo, bodyMat);
      torso.position.y = 0.1;
      torso.castShadow = true;
      torso.receiveShadow = true;
      group.add(torso);

      // 2. Lapels (Notch Lapel folded over chest)
      const lapelLeftGeo = new THREE.PlaneGeometry(0.32, 0.85, 12, 12);
      const lapelLeft = new THREE.Mesh(lapelLeftGeo, collarMat);
      lapelLeft.position.set(-0.25, 0.35, 0.48);
      lapelLeft.rotation.set(-0.1, 0.35, 0.2);
      lapelLeft.castShadow = true;
      group.add(lapelLeft);

      const lapelRightGeo = new THREE.PlaneGeometry(0.32, 0.85, 12, 12);
      const lapelRight = new THREE.Mesh(lapelRightGeo, collarMat);
      lapelRight.position.set(0.25, 0.35, 0.48);
      lapelRight.rotation.set(-0.1, -0.35, -0.2);
      lapelRight.castShadow = true;
      group.add(lapelRight);

      // Collar band
      const collarBandGeo = new THREE.TorusGeometry(0.36, 0.06, 16, 32, Math.PI);
      const collarBand = new THREE.Mesh(collarBandGeo, collarMat);
      collarBand.position.set(0, 0.72, 0.02);
      collarBand.rotation.x = Math.PI / 2.3;
      group.add(collarBand);

      // 3. Tailored Sleeves (left and right with natural drape angle)
      const sleeveLeftGeo = new THREE.CylinderGeometry(0.18, 0.14, 1.35, 24);
      const sleeveLeft = new THREE.Mesh(sleeveLeftGeo, sleeveMat);
      sleeveLeft.position.set(-0.76, 0.05, 0);
      sleeveLeft.rotation.z = 0.18;
      sleeveLeft.rotation.x = 0.08;
      sleeveLeft.castShadow = true;
      group.add(sleeveLeft);

      const sleeveRightGeo = new THREE.CylinderGeometry(0.18, 0.14, 1.35, 24);
      const sleeveRight = new THREE.Mesh(sleeveRightGeo, sleeveMat);
      sleeveRight.position.set(0.76, 0.05, 0);
      sleeveRight.rotation.z = -0.18;
      sleeveRight.rotation.x = 0.08;
      sleeveRight.castShadow = true;
      group.add(sleeveRight);

      // 4. Flap Pockets
      const pocketLeftGeo = new THREE.BoxGeometry(0.24, 0.12, 0.04);
      const pocketLeft = new THREE.Mesh(pocketLeftGeo, trimMat);
      pocketLeft.position.set(-0.38, -0.32, 0.52);
      pocketLeft.rotation.y = 0.15;
      pocketLeft.castShadow = true;
      group.add(pocketLeft);

      const pocketRightGeo = new THREE.BoxGeometry(0.24, 0.12, 0.04);
      const pocketRight = new THREE.Mesh(pocketRightGeo, trimMat);
      pocketRight.position.set(0.38, -0.32, 0.52);
      pocketRight.rotation.y = -0.15;
      pocketRight.castShadow = true;
      group.add(pocketRight);
    } else if (garmentId === 'crewneck') {
      // Crewneck Pullover
      const torsoGeo = new THREE.CylinderGeometry(0.56, 0.52, 1.35, 32, 16);
      const pos = torsoGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const x = pos.getX(i);
        if (y > 0.35) {
          pos.setX(i, x * 1.32);
        }
      }
      torsoGeo.computeVertexNormals();
      const torso = new THREE.Mesh(torsoGeo, bodyMat);
      torso.position.y = 0.05;
      torso.castShadow = true;
      torso.receiveShadow = true;
      group.add(torso);

      // Rib Collar
      const ribCollarGeo = new THREE.TorusGeometry(0.32, 0.06, 16, 32);
      const ribCollar = new THREE.Mesh(ribCollarGeo, collarMat);
      ribCollar.position.set(0, 0.72, 0);
      ribCollar.rotation.x = Math.PI / 2;
      group.add(ribCollar);

      // Relaxed Sleeves
      const sleeveLeftGeo = new THREE.CylinderGeometry(0.22, 0.14, 1.3, 24);
      const sleeveLeft = new THREE.Mesh(sleeveLeftGeo, sleeveMat);
      sleeveLeft.position.set(-0.76, 0.02, 0);
      sleeveLeft.rotation.z = 0.24;
      sleeveLeft.castShadow = true;
      group.add(sleeveLeft);

      const sleeveRightGeo = new THREE.CylinderGeometry(0.22, 0.14, 1.3, 24);
      const sleeveRight = new THREE.Mesh(sleeveRightGeo, sleeveMat);
      sleeveRight.position.set(0.76, 0.02, 0);
      sleeveRight.rotation.z = -0.24;
      sleeveRight.castShadow = true;
      group.add(sleeveRight);

      // Bottom Rib Hem
      const hemGeo = new THREE.CylinderGeometry(0.51, 0.5, 0.15, 32);
      const hem = new THREE.Mesh(hemGeo, trimMat);
      hem.position.set(0, -0.66, 0);
      hem.castShadow = true;
      group.add(hem);
    } else if (garmentId === 'slip_dress') {
      // Flowing bias-cut maxi gown
      const gownGeo = new THREE.CylinderGeometry(0.38, 0.95, 2.15, 36, 24);
      const pos = gownGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const x = pos.getX(i);
        const z = pos.getZ(i);
        // Feminine waist taper
        if (y > 0.2 && y < 0.6) {
          pos.setX(i, x * 0.88);
          pos.setZ(i, z * 0.88);
        }
        // Flowing skirt waves at hem
        if (y < 0.0) {
          const wave = Math.sin(Math.atan2(z, x) * 6) * 0.08 * (Math.abs(y) / 1.0);
          pos.setX(i, pos.getX(i) + (x / Math.hypot(x, z)) * wave);
          pos.setZ(i, pos.getZ(i) + (z / Math.hypot(x, z)) * wave);
        }
      }
      gownGeo.computeVertexNormals();
      const gown = new THREE.Mesh(gownGeo, bodyMat);
      gown.position.y = -0.15;
      gown.castShadow = true;
      gown.receiveShadow = true;
      group.add(gown);

      // Delicate straps
      const strapLGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 12);
      const strapL = new THREE.Mesh(strapLGeo, collarMat);
      strapL.position.set(-0.22, 1.0, 0);
      group.add(strapL);

      const strapRGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 12);
      const strapR = new THREE.Mesh(strapRGeo, collarMat);
      strapR.position.set(0.22, 1.0, 0);
      group.add(strapR);

      // Flowing draped stole / shawl on shoulders
      const shawlGeo = new THREE.TorusGeometry(0.65, 0.12, 16, 32, Math.PI * 1.1);
      const shawl = new THREE.Mesh(shawlGeo, sleeveMat);
      shawl.position.set(0, 0.68, -0.05);
      shawl.rotation.x = Math.PI / 2.2;
      group.add(shawl);
    } else if (garmentId === 'tee') {
      // Boxy Streetwear Tee
      const teeGeo = new THREE.CylinderGeometry(0.55, 0.58, 1.25, 32);
      const pos = teeGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const x = pos.getX(i);
        if (y > 0.3) {
          pos.setX(i, x * 1.3);
        }
      }
      teeGeo.computeVertexNormals();
      const tee = new THREE.Mesh(teeGeo, bodyMat);
      tee.position.y = 0.1;
      tee.castShadow = true;
      tee.receiveShadow = true;
      group.add(tee);

      // Bound Neckband
      const neckGeo = new THREE.TorusGeometry(0.3, 0.045, 16, 32);
      const neck = new THREE.Mesh(neckGeo, collarMat);
      neck.position.set(0, 0.72, 0);
      neck.rotation.x = Math.PI / 2;
      group.add(neck);

      // Boxy Elbow-length sleeves
      const sleeveLeftGeo = new THREE.CylinderGeometry(0.22, 0.2, 0.65, 24);
      const sleeveLeft = new THREE.Mesh(sleeveLeftGeo, sleeveMat);
      sleeveLeft.position.set(-0.7, 0.42, 0);
      sleeveLeft.rotation.z = 0.45;
      sleeveLeft.castShadow = true;
      group.add(sleeveLeft);

      const sleeveRightGeo = new THREE.CylinderGeometry(0.22, 0.2, 0.65, 24);
      const sleeveRight = new THREE.Mesh(sleeveRightGeo, sleeveMat);
      sleeveRight.position.set(0.7, 0.42, 0);
      sleeveRight.rotation.z = -0.45;
      sleeveRight.castShadow = true;
      group.add(sleeveRight);

      // Chest Patch Pocket
      const pocketGeo = new THREE.BoxGeometry(0.18, 0.2, 0.02);
      const pocket = new THREE.Mesh(pocketGeo, trimMat);
      pocket.position.set(-0.25, 0.25, 0.55);
      pocket.castShadow = true;
      group.add(pocket);
    } else if (garmentId === 'trousers') {
      // Wide-leg tailored trousers with pleats
      // Left leg
      const legLGeo = new THREE.CylinderGeometry(0.28, 0.32, 1.85, 24);
      const legL = new THREE.Mesh(legLGeo, bodyMat);
      legL.position.set(-0.32, -0.45, 0);
      legL.castShadow = true;
      group.add(legL);

      // Right leg
      const legRGeo = new THREE.CylinderGeometry(0.28, 0.32, 1.85, 24);
      const legR = new THREE.Mesh(legRGeo, bodyMat);
      legR.position.set(0.32, -0.45, 0);
      legR.castShadow = true;
      group.add(legR);

      // High Waistband
      const waistGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.35, 32);
      const waist = new THREE.Mesh(waistGeo, collarMat);
      waist.position.set(0, 0.55, 0);
      waist.castShadow = true;
      group.add(waist);

      // Turn-up Cuffs
      const cuffLGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.12, 24);
      const cuffL = new THREE.Mesh(cuffLGeo, trimMat);
      cuffL.position.set(-0.32, -1.35, 0);
      group.add(cuffL);

      const cuffRGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.12, 24);
      const cuffR = new THREE.Mesh(cuffRGeo, trimMat);
      cuffR.position.set(0.32, -1.35, 0);
      group.add(cuffR);
    } else if (garmentId === 'tote_scarf') {
      // Artisanal studio wrap draped on mannequin shoulders
      const drapeGeo = new THREE.CylinderGeometry(0.42, 0.72, 1.6, 32, 16);
      const pos = drapeGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const ripple = Math.sin(x * 5 + y * 4) * 0.05;
        pos.setZ(i, z + ripple);
      }
      drapeGeo.computeVertexNormals();
      const drape = new THREE.Mesh(drapeGeo, bodyMat);
      drape.position.set(0, 0.1, 0);
      drape.castShadow = true;
      group.add(drape);

      // Oversized tote bag resting beside
      const toteGeo = new THREE.BoxGeometry(0.75, 0.65, 0.28);
      const tote = new THREE.Mesh(toteGeo, collarMat);
      tote.position.set(0.85, -0.9, 0.3);
      tote.rotation.y = -0.3;
      tote.castShadow = true;
      group.add(tote);

      // Tote leather handles
      const handleGeo = new THREE.TorusGeometry(0.2, 0.025, 12, 24, Math.PI);
      const handle = new THREE.Mesh(handleGeo, trimMat);
      handle.position.set(0.85, -0.55, 0.3);
      handle.rotation.x = Math.PI / 2;
      group.add(handle);
    }

    setIsRendering(false);
  }, [garmentId, weaveType, yarn, print, contrastZones, activeZoneId, wireframeMode, customPrintImage]);

  // Set camera view angles
  const setCameraView = (angle: 'front' | 'three_quarter' | 'side' | 'back' | 'macro') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setIsRotating(false);
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (angle) {
      case 'front':
        camera.position.set(0, 0.2, 3.8);
        controls.target.set(0, 0.1, 0);
        break;
      case 'three_quarter':
        camera.position.set(2.4, 0.6, 2.9);
        controls.target.set(0, 0.1, 0);
        break;
      case 'side':
        camera.position.set(3.6, 0.2, 0);
        controls.target.set(0, 0.1, 0);
        break;
      case 'back':
        camera.position.set(0, 0.2, -3.8);
        controls.target.set(0, 0.1, 0);
        break;
      case 'macro':
        camera.position.set(0.3, 0.4, 1.6);
        controls.target.set(0, 0.3, 0);
        break;
    }
    controls.update();
  };

  // Export 3D Viewport Snapshot
  const handleCaptureSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    if (onExportRender) {
      onExportRender(dataUrl);
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `atelier-trama-${garmentId}-custom.png`;
      a.click();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col select-none overflow-hidden bg-neutral-900/5">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Controls: View Angles */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-sm rounded-lg text-xs font-medium text-neutral-700">
        <button
          onClick={() => setCameraView('front')}
          className="px-2.5 py-1 rounded hover:bg-neutral-100 transition-colors"
          title="Front View"
        >
          Front
        </button>
        <button
          onClick={() => setCameraView('three_quarter')}
          className="px-2.5 py-1 rounded hover:bg-neutral-100 transition-colors"
          title="Perspective View"
        >
          Perspective
        </button>
        <button
          onClick={() => setCameraView('side')}
          className="px-2.5 py-1 rounded hover:bg-neutral-100 transition-colors"
          title="Side Profile"
        >
          Side
        </button>
        <button
          onClick={() => setCameraView('back')}
          className="px-2.5 py-1 rounded hover:bg-neutral-100 transition-colors"
          title="Back View"
        >
          Back
        </button>
        <button
          onClick={() => setCameraView('macro')}
          className="px-2.5 py-1 rounded hover:bg-neutral-100 transition-colors text-amber-800 bg-amber-50/70"
          title="Macro Weave Close-up"
        >
          Macro Close-up
        </button>
      </div>

      {/* Lighting Presets Selector in Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-sm rounded-lg text-xs">
          <Sun className="w-3.5 h-3.5 text-neutral-500 ml-1.5" />
          <select
            value={lightingId}
            onChange={(e) => onLightingChange(e.target.value)}
            className="bg-transparent text-neutral-800 text-xs py-1 px-1.5 focus:outline-none cursor-pointer font-medium"
          >
            {LIGHTING_PRESETS.map((lp) => (
              <option key={lp.id} value={lp.id}>
                {lp.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCaptureSnapshot}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
          title="Download High-Res 3D Snapshot"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Capture</span>
        </button>
      </div>

      {/* Bottom Floating Toolbar: Turntable & Wireframe */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg backdrop-blur-md border transition-all ${
            isRotating
              ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
              : 'bg-white/90 text-neutral-700 border-neutral-200/80 hover:bg-white'
          }`}
          title="Auto-rotate 360 Turntable"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>360° Turntable</span>
        </button>

        <button
          onClick={() => setWireframeMode(!wireframeMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg backdrop-blur-md border transition-all ${
            wireframeMode
              ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
              : 'bg-white/90 text-neutral-700 border-neutral-200/80 hover:bg-white'
          }`}
          title="Toggle Wireframe Drape Mesh"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{wireframeMode ? 'Drape Mesh' : 'Solid Shading'}</span>
        </button>
      </div>

      {/* 3D Interaction Hint */}
      <div className="absolute bottom-4 right-4 pointer-events-none text-[11px] text-neutral-500 font-mono bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-md border border-neutral-200/60 hidden sm:block">
        DRAG TO ROTATE · SCROLL TO ZOOM · SHIFT+DRAG TO PAN
      </div>
    </div>
  );
};
