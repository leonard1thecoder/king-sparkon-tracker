import type {
  GeometryLike,
  MaterialLike,
  MeshLike,
  Object3DLike,
  SceneLike,
  ThreeRuntime,
} from "@/components/hero/three/runtime";

export type OperatingCrownStage = {
  root: Object3DLike;
  crown: Object3DLike;
  scanner: Object3DLike;
  barcode: Object3DLike;
  beam: MeshLike;
  beamGlow: MeshLike;
  orbit: Object3DLike;
  signal: MaterialLike;
};

export function createMesh(
  THREE: ThreeRuntime,
  geometry: GeometryLike,
  material: MaterialLike,
  shadows = true,
) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = shadows;
  mesh.receiveShadow = shadows;
  return mesh;
}

export function buildOperatingCrown(THREE: ThreeRuntime): OperatingCrownStage {
  const root = new THREE.Group();
  const crown = new THREE.Group();
  const scanner = new THREE.Group();
  const orbit = new THREE.Group();

  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xffc857,
    emissive: 0x5b2f00,
    emissiveIntensity: 0.28,
    metalness: 0.86,
    roughness: 0.22,
    clearcoat: 0.9,
    clearcoatRoughness: 0.18,
  });
  const deepGold = new THREE.MeshStandardMaterial({
    color: 0xd98c20,
    emissive: 0x2e1700,
    emissiveIntensity: 0.18,
    metalness: 0.78,
    roughness: 0.28,
  });
  const ink = new THREE.MeshPhysicalMaterial({
    color: 0x16131a,
    metalness: 0.72,
    roughness: 0.26,
    clearcoat: 0.68,
  });
  const signal = new THREE.MeshStandardMaterial({
    color: 0xff4d2e,
    emissive: 0xff2400,
    emissiveIntensity: 1.4,
    metalness: 0.18,
    roughness: 0.32,
  });
  const blue = new THREE.MeshStandardMaterial({
    color: 0x4aa9df,
    emissive: 0x0d4f73,
    emissiveIntensity: 0.85,
    metalness: 0.52,
    roughness: 0.28,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffd66b,
    transparent: true,
    opacity: 0.22,
    transmission: 0.78,
    thickness: 0.5,
    roughness: 0.1,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  const base = createMesh(THREE, new THREE.CylinderGeometry(1.62, 1.78, 0.48, 64), gold);
  base.position.set(0, 0.2, 0);
  crown.add(base);

  const lowerBand = createMesh(THREE, new THREE.TorusGeometry(1.67, 0.12, 18, 96), deepGold);
  lowerBand.rotation.x = Math.PI / 2;
  lowerBand.position.set(0, 0.05, 0);
  crown.add(lowerBand);

  const upperBand = createMesh(THREE, new THREE.TorusGeometry(1.44, 0.1, 18, 96), gold);
  upperBand.rotation.x = Math.PI / 2;
  upperBand.position.set(0, 0.52, 0);
  crown.add(upperBand);

  const peakCount = 9;
  for (let index = 0; index < peakCount; index += 1) {
    const angle = (index / peakCount) * Math.PI * 2;
    const height = index % 2 === 0 ? 1.65 : 1.22;
    const radius = index % 2 === 0 ? 1.16 : 1.25;
    const peak = createMesh(
      THREE,
      new THREE.ConeGeometry(0.26, height, 24),
      index % 3 === 0 ? deepGold : gold,
    );
    peak.position.set(Math.cos(angle) * radius, 0.6 + height / 2, Math.sin(angle) * radius);
    peak.rotation.y = -angle;
    crown.add(peak);

    const jewel = createMesh(
      THREE,
      new THREE.SphereGeometry(index % 2 === 0 ? 0.16 : 0.12, 24, 16),
      index % 3 === 0 ? signal : blue,
      false,
    );
    jewel.position.set(Math.cos(angle) * radius, 0.68 + height, Math.sin(angle) * radius);
    crown.add(jewel);
  }

  const core = createMesh(THREE, new THREE.SphereGeometry(0.58, 48, 32), glass, false);
  core.position.set(0, 1.2, 0);
  crown.add(core);

  const coreRing = createMesh(THREE, new THREE.TorusGeometry(0.84, 0.035, 10, 72), signal, false);
  coreRing.position.set(0, 1.2, 0.04);
  crown.add(coreRing);

  const scannerDeck = createMesh(THREE, new THREE.BoxGeometry(5.15, 0.26, 2.35), ink);
  scannerDeck.position.set(0, -1.58, 0.12);
  scanner.add(scannerDeck);

  const frontRail = createMesh(THREE, new THREE.BoxGeometry(4.78, 0.16, 0.12), gold);
  frontRail.position.set(0, -1.35, 1.16);
  scanner.add(frontRail);

  const barcode = new THREE.Group();
  const widths = [0.08, 0.18, 0.08, 0.12, 0.22, 0.08, 0.16, 0.1, 0.08, 0.2, 0.12, 0.08, 0.16, 0.08, 0.24, 0.1, 0.08, 0.18, 0.08, 0.14, 0.1, 0.22, 0.08, 0.16];
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + (widths.length - 1) * 0.08;
  let cursor = -totalWidth / 2;

  widths.forEach((width, index) => {
    const height = 0.72 + ((index * 7) % 6) * 0.13;
    const bar = createMesh(
      THREE,
      new THREE.BoxGeometry(width, height, 0.18),
      index % 7 === 0 ? signal : gold,
    );
    bar.position.set(cursor + width / 2, -1.19 + height / 2, 1.28);
    barcode.add(bar);
    cursor += width + 0.08;
  });
  scanner.add(barcode);

  const beam = createMesh(
    THREE,
    new THREE.PlaneGeometry(5.25, 0.14),
    new THREE.MeshBasicMaterial({
      color: 0xff4d2e,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    false,
  );
  beam.position.set(0, 2.45, 1.48);
  scanner.add(beam);

  const beamGlow = createMesh(
    THREE,
    new THREE.PlaneGeometry(5.55, 0.7),
    new THREE.MeshBasicMaterial({
      color: 0xff4d2e,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    false,
  );
  beamGlow.position.set(0, 2.45, 1.45);
  scanner.add(beamGlow);

  const outerOrbit = createMesh(THREE, new THREE.TorusGeometry(3.45, 0.025, 8, 160), gold, false);
  outerOrbit.rotation.x = Math.PI / 2.55;
  outerOrbit.rotation.z = 0.28;
  orbit.add(outerOrbit);

  const innerOrbit = createMesh(THREE, new THREE.TorusGeometry(2.72, 0.018, 8, 140), blue, false);
  innerOrbit.rotation.x = Math.PI / 2.15;
  innerOrbit.rotation.z = -0.42;
  orbit.add(innerOrbit);

  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2;
    const node = createMesh(
      THREE,
      new THREE.SphereGeometry(0.08, 18, 12),
      index % 2 === 0 ? signal : gold,
      false,
    );
    node.position.set(Math.cos(angle) * 3.43, Math.sin(angle) * 0.8, Math.sin(angle) * 2.6);
    orbit.add(node);
  }

  crown.position.set(0, -0.04, 0);
  orbit.position.set(0, 0.2, -0.35);
  root.add(orbit, crown, scanner);

  return { root, crown, scanner, barcode, beam, beamGlow, orbit, signal };
}

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function buildParticleField(THREE: ThreeRuntime) {
  const random = seededRandom(7391);
  const positions: number[] = [];

  for (let index = 0; index < 130; index += 1) {
    const radius = 4.2 + random() * 3.7;
    const angle = random() * Math.PI * 2;
    positions.push(
      Math.cos(angle) * radius,
      (random() - 0.46) * 6.4,
      Math.sin(angle) * radius - 1.4,
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute?.("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffc857,
    size: 0.045,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}

export function disposeScene(scene: SceneLike) {
  const geometries = new Set<GeometryLike>();
  const materials = new Set<MaterialLike>();

  scene.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : object.material
        ? [object.material]
        : [];
    objectMaterials.forEach((material) => materials.add(material));
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
