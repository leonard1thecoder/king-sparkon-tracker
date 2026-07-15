const MOTION_SCRIPT_ID = "king-sparkon-gsap-runtime";
const MOTION_READY_EVENT = "king-sparkon:motion-ready";

export type GsapTweenLike = {
  kill(): void;
  pause?(): void;
  resume?(): void;
};

export type GsapTimelineLike = GsapTweenLike & {
  set(targets: unknown, vars: Record<string, unknown>, position?: string | number): GsapTimelineLike;
  to(targets: unknown, vars: Record<string, unknown>, position?: string | number): GsapTimelineLike;
  fromTo(
    targets: unknown,
    fromVars: Record<string, unknown>,
    toVars: Record<string, unknown>,
    position?: string | number,
  ): GsapTimelineLike;
};

export type GsapRuntime = {
  set(targets: unknown, vars: Record<string, unknown>): void;
  to(targets: unknown, vars: Record<string, unknown>): GsapTweenLike;
  fromTo(
    targets: unknown,
    fromVars: Record<string, unknown>,
    toVars: Record<string, unknown>,
  ): GsapTweenLike;
  timeline(vars?: Record<string, unknown>): GsapTimelineLike;
  killTweensOf(targets: unknown): void;
};

type MotionRuntimeBundle = {
  gsap: GsapRuntime;
};

declare global {
  interface Window {
    __KING_SPARKON_MOTION__?: MotionRuntimeBundle;
  }
}

export function loadGsapRuntime() {
  if (window.__KING_SPARKON_MOTION__) {
    return Promise.resolve(window.__KING_SPARKON_MOTION__);
  }

  return new Promise<MotionRuntimeBundle>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("GSAP motion runtime timed out"));
    }, 12000);

    function cleanup() {
      window.clearTimeout(timeoutId);
      window.removeEventListener(MOTION_READY_EVENT, handleReady);
    }

    function handleReady() {
      const runtime = window.__KING_SPARKON_MOTION__;
      if (!runtime) return;
      cleanup();
      resolve(runtime);
    }

    window.addEventListener(MOTION_READY_EVENT, handleReady);

    const existingScript = document.getElementById(MOTION_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener(
        "error",
        () => {
          cleanup();
          reject(new Error("GSAP motion runtime failed to load"));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = MOTION_SCRIPT_ID;
    script.type = "module";
    script.src = "/king-sparkon-gsap-runtime.js";
    script.addEventListener(
      "error",
      () => {
        cleanup();
        reject(new Error("GSAP motion runtime failed to load"));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });
}
