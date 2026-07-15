"use client";

import { Crown, Gauge, ScanLine, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { SocialLinks } from "@/components/social/SocialLinks";
import { KingSparkonLoader } from "@/components/ui/KingSparkonLoader";
import {
  buildOperatingCrown,
  buildParticleField,
  createMesh,
  disposeScene,
} from "@/components/hero/three/scene";
import {
  loadThreeGsapRuntime,
  type GsapRuntime,
  type GsapTweenLike,
  type RendererLike,
  type SceneLike,
} from "@/components/hero/three/runtime";

type SceneStatus = "loading" | "ready" | "fallback";

type SceneControls = {
  move(normalizedX: number, normalizedY: number): void;
  reset(): void;
};

const sceneMetrics = [
  { icon: ScanLine, label: "Scanner", value: "GSAP beam sweep" },
  { icon: Crown, label: "Object", value: "Generated crown mesh" },
  { icon: Gauge, label: "Camera", value: "Responsive parallax" },
] as const;

export function ScanLoop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<SceneControls | null>(null);
  const [status, setStatus] = useState<SceneStatus>("loading");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const host = container;
    const sceneCanvas = canvas;

    let cancelled = false;
    let renderer: RendererLike | null = null;
    let scene: SceneLike | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let activeTweens: GsapTweenLike[] = [];
    let gsapRuntime: GsapRuntime | null = null;
    let animatedTargets: object[] = [];
    let sceneIsVisible = true;
    let pageIsVisible = document.visibilityState === "visible";

    async function initializeScene() {
      try {
        const { THREE, gsap } = await loadThreeGsapRuntime();
        if (cancelled) return undefined;
        gsapRuntime = gsap;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

        renderer = new THREE.WebGLRenderer({
          canvas: sceneCanvas,
          alpha: true,
          antialias: !coarsePointer,
          powerPreference: "high-performance",
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.18;
        renderer.shadowMap.enabled = !coarsePointer;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarsePointer ? 1.25 : 1.75));

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x120f16);
        scene.fog = new THREE.FogExp2(0x120f16, 0.047);

        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 70);
        camera.position.set(0, 2.8, 11.8);
        camera.lookAt(0, -0.15, 0);

        const ambientLight = new THREE.AmbientLight(0xffe8bb, 0.9);
        const hemisphereLight = new THREE.HemisphereLight(0xffd66b, 0x20101c, 1.45);
        const keyLight = new THREE.DirectionalLight(0xffe7a3, 4.8);
        keyLight.position.set(4.5, 7.2, 7.5);
        keyLight.castShadow = !coarsePointer;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.bias = -0.00025;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 30;
        keyLight.shadow.camera.left = -7;
        keyLight.shadow.camera.right = 7;
        keyLight.shadow.camera.top = 7;
        keyLight.shadow.camera.bottom = -7;

        const rimLight = new THREE.PointLight(0x4aa9df, 23, 18, 2);
        rimLight.position.set(-4.8, 2.4, 3.6);
        const signalLight = new THREE.PointLight(0xff4d2e, 28, 16, 2);
        signalLight.position.set(4.6, -0.6, 4.4);
        scene.add(ambientLight, hemisphereLight, keyLight, rimLight, signalLight);

        const stage = buildOperatingCrown(THREE);
        stage.root.position.set(0, 0.2, 0);
        stage.root.rotation.y = -0.7;
        stage.root.scale.set(0.08, 0.08, 0.08);
        scene.add(stage.root);

        animatedTargets = [
          camera.position,
          stage.root.position,
          stage.root.rotation,
          stage.root.scale,
          stage.crown.position,
          stage.crown.rotation,
          stage.orbit.rotation,
          stage.beam.position,
          stage.beamGlow.position,
          stage.signal,
          stage.scanner.rotation,
          stage.barcode.scale,
        ];

        const particles = buildParticleField(THREE);
        scene.add(particles);

        const floor = createMesh(
          THREE,
          new THREE.CylinderGeometry(4.35, 4.8, 0.38, 72),
          new THREE.MeshPhysicalMaterial({
            color: 0x19131b,
            metalness: 0.7,
            roughness: 0.28,
            clearcoat: 0.55,
          }),
        );
        floor.position.set(0, -1.86, 0);
        scene.add(floor);

        const floorRing = createMesh(
          THREE,
          new THREE.RingGeometry(3.28, 3.34, 96),
          new THREE.MeshBasicMaterial({
            color: 0xffc857,
            transparent: true,
            opacity: 0.58,
            side: THREE.DoubleSide,
          }),
          false,
        );
        floorRing.rotation.x = -Math.PI / 2;
        floorRing.position.set(0, -1.64, 0);
        scene.add(floorRing);

        function lookAtScene() {
          camera.lookAt(0, -0.1, 0);
        }

        function resize() {
          if (!renderer || !scene) return;
          const width = Math.max(host.clientWidth, 1);
          const height = Math.max(host.clientHeight, 1);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          renderer.render(scene, camera);
        }

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .to(camera.position, {
            x: 0,
            y: 1.15,
            z: 7.65,
            duration: prefersReducedMotion ? 0 : 2.2,
            onUpdate: lookAtScene,
          })
          .to(stage.root.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: prefersReducedMotion ? 0 : 1.7,
            ease: "back.out(1.35)",
          }, prefersReducedMotion ? 0 : "<0.15")
          .to(stage.root.rotation, {
            x: 0.02,
            y: 0.18,
            z: 0,
            duration: prefersReducedMotion ? 0 : 2.15,
          }, prefersReducedMotion ? 0 : "<")
          .fromTo(stage.barcode.scale, {
            x: 0.05,
            y: 0.25,
            z: 1,
          }, {
            x: 1,
            y: 1,
            z: 1,
            duration: prefersReducedMotion ? 0 : 1.05,
            ease: "back.out(1.7)",
          }, prefersReducedMotion ? 0 : "<0.5");
        activeTweens.push(intro);

        if (!prefersReducedMotion) {
          activeTweens = activeTweens.concat([
            gsap.to(stage.crown.position, {
              y: 0.18,
              duration: 2.8,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            }),
            gsap.to(stage.crown.rotation, {
              y: Math.PI * 2 + 0.18,
              duration: 24,
              ease: "none",
              repeat: -1,
            }),
            gsap.to(stage.orbit.rotation, {
              y: -Math.PI * 2,
              z: Math.PI * 2,
              duration: 18,
              ease: "none",
              repeat: -1,
            }),
            gsap.fromTo(stage.beam.position, {
              y: 2.48,
            }, {
              y: -1.22,
              duration: 2.45,
              ease: "power1.inOut",
              repeat: -1,
              repeatDelay: 0.45,
            }),
            gsap.fromTo(stage.beamGlow.position, {
              y: 2.48,
            }, {
              y: -1.22,
              duration: 2.45,
              ease: "power1.inOut",
              repeat: -1,
              repeatDelay: 0.45,
            }),
            gsap.to(stage.signal, {
              emissiveIntensity: 2.15,
              duration: 0.9,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            }),
            gsap.to(stage.scanner.rotation, {
              z: 0.012,
              duration: 2.2,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            }),
          ]);
        }

        controlsRef.current = {
          move(normalizedX, normalizedY) {
            if (prefersReducedMotion) return;
            gsap.to(camera.position, {
              x: normalizedX * 0.62,
              y: 1.15 - normalizedY * 0.34,
              duration: 0.72,
              ease: "power2.out",
              overwrite: "auto",
              onUpdate: lookAtScene,
            });
            gsap.to(stage.root.rotation, {
              x: 0.02 + normalizedY * 0.11,
              y: 0.18 + normalizedX * 0.25,
              duration: 0.82,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
          reset() {
            gsap.to(camera.position, {
              x: 0,
              y: 1.15,
              duration: 0.9,
              ease: "power2.out",
              overwrite: "auto",
              onUpdate: lookAtScene,
            });
            gsap.to(stage.root.rotation, {
              x: 0.02,
              y: 0.18,
              duration: 0.9,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
        };

        function syncPlayback() {
          const shouldPlay = sceneIsVisible && pageIsVisible;
          activeTweens.forEach((tween) => shouldPlay ? tween.resume() : tween.pause());
        }

        intersectionObserver = new IntersectionObserver(([entry]) => {
          sceneIsVisible = entry?.isIntersecting ?? true;
          syncPlayback();
        }, { rootMargin: "120px 0px", threshold: 0.01 });
        intersectionObserver.observe(host);

        function handleVisibilityChange() {
          pageIsVisible = document.visibilityState === "visible";
          syncPlayback();
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);

        renderer.setAnimationLoop((time) => {
          if (!sceneIsVisible || !pageIsVisible || !renderer || !scene) return;
          if (!prefersReducedMotion) {
            particles.rotation.y = time * 0.000035;
            particles.rotation.x = Math.sin(time * 0.00019) * 0.055;
            floorRing.rotation.z = time * 0.00009;
          }
          renderer.render(scene, camera);
        });

        if (prefersReducedMotion) renderer.render(scene, camera);
        setStatus("ready");

        return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
      } catch (error) {
        console.error("King Sparkon Three.js scene failed to initialize", error);
        if (!cancelled) setStatus("fallback");
        return undefined;
      }
    }

    let removeVisibilityListener: (() => void) | undefined;
    void initializeScene().then((cleanup) => {
      if (cancelled) {
        cleanup?.();
        return;
      }
      removeVisibilityListener = cleanup;
    });

    return () => {
      cancelled = true;
      controlsRef.current = null;
      removeVisibilityListener?.();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      activeTweens.forEach((tween) => tween.kill());
      animatedTargets.forEach((target) => gsapRuntime?.killTweensOf(target));
      renderer?.setAnimationLoop(null);
      if (scene) disposeScene(scene);
      renderer?.dispose();
      renderer?.forceContextLoss?.();
    };
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    controlsRef.current?.move(normalizedX, normalizedY);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        ref={containerRef}
        className="group relative min-h-[34rem] overflow-hidden rounded-[2.65rem] border border-[#302635] bg-[#120f16] shadow-[0_38px_120px_rgba(7,19,31,0.34)] sm:min-h-[42rem]"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => controlsRef.current?.reset()}
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${status === "ready" ? "opacity-100" : "opacity-0"}`}
          role="img"
          aria-label="Interactive Three.js operating crown with barcode scanner geometry"
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,200,87,0.17),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(18,15,22,0.28))]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-30 scan-grid" aria-hidden="true" />

        <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex flex-wrap items-center justify-between gap-2 sm:inset-x-6 sm:top-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/28 px-3 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--gold)] backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5" /> Real Three.js scene
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-3 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-white/74 backdrop-blur-xl">
            <span className={`h-2 w-2 rounded-full ${status === "ready" ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" : "bg-[var(--gold)]"}`} />
            {status === "ready" ? "GSAP timeline live" : "Scene booting"}
          </div>
        </div>

        {status === "loading" ? (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#120f16]">
            <KingSparkonLoader compact label="Building 3D operating crown" message="Camera and scanner timeline loading." />
          </div>
        ) : null}

        {status === "fallback" ? (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[radial-gradient(circle_at_50%_28%,rgba(255,200,87,0.18),transparent_42%),#120f16] px-6 text-center text-white">
            <div className="max-w-sm rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.6rem] border border-[var(--gold)]/50 bg-[var(--gold)]/12 text-[var(--gold)]">
                <Crown className="h-10 w-10" />
              </div>
              <p className="mt-5 font-mono text-xs font-black uppercase tracking-[0.17em] text-[var(--gold)]">3D fallback active</p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">The operating crown remains accessible.</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">WebGL or the animation runtime is unavailable, so the page keeps a lightweight branded fallback instead of breaking.</p>
            </div>
          </div>
        ) : null}

        <span className="pointer-events-none absolute left-5 top-20 z-20 h-10 w-10 border-l-2 border-t-2 border-[var(--gold)]/55" aria-hidden="true" />
        <span className="pointer-events-none absolute right-5 top-20 z-20 h-10 w-10 border-r-2 border-t-2 border-[var(--gold)]/55" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-28 left-5 z-20 h-10 w-10 border-b-2 border-l-2 border-[var(--signal)]/55" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-28 right-5 z-20 h-10 w-10 border-b-2 border-r-2 border-[var(--signal)]/55" aria-hidden="true" />

        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 grid gap-2 rounded-[1.55rem] border border-white/10 bg-black/34 p-3 text-white shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:grid-cols-3">
          {sceneMetrics.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-[1.1rem] border border-white/[0.08] bg-white/[0.055] p-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.9rem] bg-[var(--gold)] text-[#171218]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[0.55rem] font-black uppercase tracking-[0.14em] text-white/38">{label}</p>
                <p className="truncate text-sm font-black text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-20 mt-5 rounded-[1.65rem] border border-[var(--line)] bg-white/92 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Official profiles</p>
          <span className="rounded-full border border-[var(--gold)]/45 bg-[var(--gold)]/20 px-3 py-1 font-mono text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--ink)]">Move pointer to orbit</span>
        </div>
        <SocialLinks variant="light" />
      </div>
    </div>
  );
}
