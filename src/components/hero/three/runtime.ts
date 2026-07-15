const RUNTIME_SCRIPT_ID = "king-sparkon-three-runtime";
const RUNTIME_READY_EVENT = "king-sparkon:3d-ready";

export type VectorLike = {
  x: number;
  y: number;
  z: number;
  set(x: number, y: number, z: number): VectorLike;
};

export type RotationLike = {
  x: number;
  y: number;
  z: number;
};

export type GeometryLike = {
  dispose(): void;
  setAttribute?(name: string, attribute: unknown): void;
};

export type MaterialLike = {
  dispose(): void;
  opacity?: number;
  emissiveIntensity?: number;
};

export type Object3DLike = {
  position: VectorLike;
  rotation: RotationLike;
  scale: VectorLike;
  visible: boolean;
  children: Object3DLike[];
  add(...objects: Object3DLike[]): void;
  traverse(callback: (object: DisposableObjectLike) => void): void;
};

export type DisposableObjectLike = Object3DLike & {
  geometry?: GeometryLike;
  material?: MaterialLike | MaterialLike[];
};

export type MeshLike = DisposableObjectLike & {
  castShadow: boolean;
  receiveShadow: boolean;
};

export type SceneLike = Object3DLike & {
  background: unknown;
  fog: unknown;
};

export type CameraLike = Object3DLike & {
  aspect: number;
  lookAt(x: number, y: number, z: number): void;
  updateProjectionMatrix(): void;
};

export type DirectionalLightLike = Object3DLike & {
  castShadow: boolean;
  shadow: {
    bias: number;
    mapSize: { set(width: number, height: number): void };
    camera: {
      near: number;
      far: number;
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  };
};

export type RendererLike = {
  outputColorSpace: unknown;
  toneMapping: unknown;
  toneMappingExposure: number;
  shadowMap: { enabled: boolean; type: unknown };
  setPixelRatio(pixelRatio: number): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
  setAnimationLoop(callback: ((time: number) => void) | null): void;
  render(scene: SceneLike, camera: CameraLike): void;
  dispose(): void;
  forceContextLoss?(): void;
};

export type ThreeRuntime = {
  WebGLRenderer: new (parameters: Record<string, unknown>) => RendererLike;
  Scene: new () => SceneLike;
  PerspectiveCamera: new (fieldOfView: number, aspect: number, near: number, far: number) => CameraLike;
  Group: new () => Object3DLike;
  Color: new (value: string | number) => unknown;
  FogExp2: new (color: string | number, density: number) => unknown;
  AmbientLight: new (color: string | number, intensity: number) => Object3DLike;
  HemisphereLight: new (skyColor: string | number, groundColor: string | number, intensity: number) => Object3DLike;
  DirectionalLight: new (color: string | number, intensity: number) => DirectionalLightLike;
  PointLight: new (color: string | number, intensity: number, distance?: number, decay?: number) => Object3DLike;
  Mesh: new (geometry: GeometryLike, material: MaterialLike) => MeshLike;
  Points: new (geometry: GeometryLike, material: MaterialLike) => Object3DLike;
  MeshStandardMaterial: new (parameters: Record<string, unknown>) => MaterialLike;
  MeshPhysicalMaterial: new (parameters: Record<string, unknown>) => MaterialLike;
  MeshBasicMaterial: new (parameters: Record<string, unknown>) => MaterialLike;
  PointsMaterial: new (parameters: Record<string, unknown>) => MaterialLike;
  BoxGeometry: new (width: number, height: number, depth: number, widthSegments?: number, heightSegments?: number, depthSegments?: number) => GeometryLike;
  CylinderGeometry: new (radiusTop: number, radiusBottom: number, height: number, radialSegments?: number, heightSegments?: number, openEnded?: boolean) => GeometryLike;
  ConeGeometry: new (radius: number, height: number, radialSegments?: number) => GeometryLike;
  TorusGeometry: new (radius: number, tube: number, radialSegments?: number, tubularSegments?: number) => GeometryLike;
  SphereGeometry: new (radius: number, widthSegments?: number, heightSegments?: number) => GeometryLike;
  RingGeometry: new (innerRadius: number, outerRadius: number, thetaSegments?: number) => GeometryLike;
  PlaneGeometry: new (width: number, height: number) => GeometryLike;
  BufferGeometry: new () => GeometryLike;
  Float32BufferAttribute: new (array: number[], itemSize: number) => unknown;
  AdditiveBlending: unknown;
  DoubleSide: unknown;
  SRGBColorSpace: unknown;
  ACESFilmicToneMapping: unknown;
  PCFSoftShadowMap: unknown;
};

export type GsapTweenLike = {
  kill(): void;
  pause(): void;
  resume(): void;
};

export type GsapTimelineLike = GsapTweenLike & {
  fromTo(target: object, fromVars: Record<string, unknown>, toVars: Record<string, unknown>, position?: string | number): GsapTimelineLike;
  to(target: object, vars: Record<string, unknown>, position?: string | number): GsapTimelineLike;
};

export type GsapRuntime = {
  timeline(vars?: Record<string, unknown>): GsapTimelineLike;
  fromTo(target: object, fromVars: Record<string, unknown>, toVars: Record<string, unknown>): GsapTweenLike;
  to(target: object, vars: Record<string, unknown>): GsapTweenLike;
  killTweensOf(target: object): void;
};

type ThreeGsapBundle = {
  THREE: ThreeRuntime;
  gsap: GsapRuntime;
};

declare global {
  interface Window {
    __KING_SPARKON_3D__?: ThreeGsapBundle;
  }
}

export function loadThreeGsapRuntime() {
  if (window.__KING_SPARKON_3D__) {
    return Promise.resolve(window.__KING_SPARKON_3D__);
  }

  return new Promise<ThreeGsapBundle>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Three.js and GSAP runtime timed out"));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeoutId);
      window.removeEventListener(RUNTIME_READY_EVENT, handleReady);
    }

    function handleReady() {
      const runtime = window.__KING_SPARKON_3D__;
      if (!runtime) return;
      cleanup();
      resolve(runtime);
    }

    window.addEventListener(RUNTIME_READY_EVENT, handleReady);

    const existingScript = document.getElementById(RUNTIME_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("error", () => {
        cleanup();
        reject(new Error("Three.js and GSAP runtime failed to load"));
      }, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = RUNTIME_SCRIPT_ID;
    script.type = "module";
    script.src = "/king-sparkon-three-runtime.js";
    script.addEventListener("error", () => {
      cleanup();
      reject(new Error("Three.js and GSAP runtime failed to load"));
    }, { once: true });
    document.head.appendChild(script);
  });
}
