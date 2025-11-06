// Loads face-api (vladmandic build) once and its models.
// Returns a Promise that resolves when models are ready.
let loadPromise: Promise<void> | null = null;

export function loadFaceApi(): Promise<void> {
  if (typeof window === "undefined") {
    // server guard
    return Promise.resolve();
  }
  if ((window as any).faceapi && loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    try {
      // If script already present
      if ((window as any).faceapi) {
        const fa = (window as any).faceapi;
        loadModels(fa).then(resolve).catch(reject);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js";
      script.async = true;
      script.onload = async () => {
        try {
          const fa = (window as any).faceapi;
          await loadModels(fa);
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      script.onerror = () => reject(new Error("Failed to load face-api script"));
      document.body.appendChild(script);
    } catch (err) {
      reject(err);
    }
  });

  return loadPromise;
}

async function loadModels(faceapi: any) {
  const MODEL_URL =
    "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  //await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
}
