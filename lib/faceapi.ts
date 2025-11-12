// /lib/faceapi.ts
// Load vladmandic face-api script exactly once and ensure models are ready.

let ready: Promise<void> | null = null;

export function loadFaceApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (ready) return ready;

  ready = new Promise<void>((resolve, reject) => {
    const onScriptReady = async () => {
      try {
        const fa: any = (window as any).faceapi;
        await loadModels(fa); // local first, then fallback
        resolve();
      } catch (e) {
        reject(e);
      }
    };

    // If script already present, just load models
    if ((window as any).faceapi) {
      onScriptReady();
      return;
    }

    // Inject script once
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js";
    script.async = true;
    script.onload = onScriptReady;
    script.onerror = () => reject(new Error("Failed to load face-api script"));
    document.body.appendChild(script);
  });

  return ready;
}

async function loadModels(faceapi: any) {
  // 1) Try local models in /public/models (recommended)
  const LOCAL = "/models";

  // 2) Fallback to CDN if local files aren’t found
  const CDN =
    "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";

  // Helper: try a base URL, fall back if it fails
  async function tryBase(base: string) {
    await faceapi.nets.tinyFaceDetector.loadFromUri(base);
    await faceapi.nets.faceLandmark68Net.loadFromUri(base);
    await faceapi.nets.faceRecognitionNet.loadFromUri(base);
  }

  try {
    await tryBase(LOCAL);
    // console.log("FaceAPI models loaded from /models");
  } catch {
    await tryBase(CDN);
    // console.log("FaceAPI models loaded from CDN");
  }
}
