"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { startCamera, stopCamera } from "@/lib/camera";
import { loadFaceApi } from "@/lib/faceapi";

export default function VerifySelfie() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [faceApiReady, setFaceApiReady] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);

  // load face-api once
  useEffect(() => {
    let mounted = true;
    loadFaceApi()
      .then(() => mounted && setFaceApiReady(true))
      .catch((e) => {
        console.error(e);
        mounted && setFaceApiReady(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // draw helper: size canvas to match video
  const syncCanvasToVideo = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    if (v.videoWidth && v.videoHeight) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
    }
  };

  // detection loop refs so we can stop cleanly
  const rafId = useRef<number | null>(null);
  const consecutiveHits = useRef(0);

  const stopDetection = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = null;
  }, []);

  const startDetection = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    const faceapi: any = (window as any).faceapi;
    if (!v || !c || !faceapi) return;
  
    const ctx = c.getContext("2d");
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: 0.5,
    });
  
    const loop = async () => {
      try {
        syncCanvasToVideo();
        ctx?.clearRect(0, 0, c.width, c.height);
  
        const det = await faceapi.detectSingleFace(v, options).withFaceLandmarks();
  
        if (det) {
          // draw detections
          if (faceapi.draw) {
            faceapi.draw.drawDetections(c, [det]);
            faceapi.draw.drawFaceLandmarks(c, [det]);
          } else if (ctx) {
            const { x, y, width, height } = det.detection.box;
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
          }
  
          // verification rules
          const conf = det.detection.score ?? 0;
          const { height } = det.detection.box;
          const bigEnough = height >= c.height * 0.2;
          const confident = conf >= 0.5;
  
          if (bigEnough && confident) {
            consecutiveHits.current += 1;
          } else {
            consecutiveHits.current = 0;
          }
  
          if (!selfieVerified && consecutiveHits.current >= 8) {
            setSelfieVerified(true);
            setStatus("✓ Face detected and steady — verified!");
          } else if (!selfieVerified) {
            setStatus(
              `Face detected… hold steady (conf ${conf.toFixed(2)} / ${consecutiveHits.current}/8)`
            );
          }
        } else {
          consecutiveHits.current = 0;
          if (!selfieVerified) setStatus("No face detected — center your face");
        }
      } catch (e) {
        console.error("faceapi loop error", e);
      } finally {
        // 🔹 This keeps the detection running
        rafId.current = requestAnimationFrame(loop);
      }
    };
  
    // ✅ Start the loop
    rafId.current = requestAnimationFrame(loop);
  }, [selfieVerified]);
  
  const handleStart = useCallback(async () => {
    try {
      if (!faceApiReady) {
        setStatus("Loading face detection…");
        await loadFaceApi();
        setFaceApiReady(true);
      }

      if (!videoRef.current) throw new Error("Video element not ready.");
      setStatus("Requesting camera permission…");
      await startCamera(videoRef.current);
      setIsCapturing(true);
      setStatus("Camera started. Center your face in the frame.");

      // size canvas and start detection
      syncCanvasToVideo();
      startDetection();
    } catch (err: any) {
      const name = err?.name;
      if (name === "NotAllowedError") setStatus("Permission denied. Please allow camera access.");
      else if (name === "NotFoundError" || name === "OverconstrainedError")
        setStatus("No suitable camera found.");
      else setStatus(err?.message || "Failed to start camera.");
      setIsCapturing(false);
      stopDetection();
      stopCamera(videoRef.current);
    }
  }, [faceApiReady, startDetection, stopDetection]);

  const handleStop = useCallback(() => {
    stopDetection();
    stopCamera(videoRef.current);
    setIsCapturing(false);
    setStatus("Camera stopped.");
  }, [stopDetection]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      stopCamera(videoRef.current);
    };
  }, [stopDetection]);

  return (
    <div className="max-w-xl mx-auto rounded-xl bg-white p-8 shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-2">Verify Your Identity</h2>
      <p className="text-gray-600 mb-6">We’ll confirm you’re a real person.</p>

      {!isCapturing ? (
        <button
          onClick={handleStart}
          disabled={!faceApiReady}
          className="bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 disabled:bg-gray-300"
        >
          {faceApiReady ? "Start Camera" : "Loading detector…"}
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black"
        >
          Stop Camera
        </button>
      )}

      <div className="mt-6 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 bg-black rounded-lg object-cover"
        />
        {/* overlay for boxes/landmarks */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-64 pointer-events-none"
        />
      </div>

      {status && (
  <div
    className={`mt-4 text-sm p-3 rounded-lg ${
      status.startsWith("✓")
        ? "bg-green-50 text-green-700"
        : "bg-blue-50 text-blue-700"
    }`}
  >
    {status}
  </div>
)}

{selfieVerified && (
  <div className="mt-3 text-sm p-2 rounded-lg bg-green-100 text-green-800">
    ✓ Verified! You can continue.
  </div>
)}

{selfieVerified && (
  <a
    href="/onboarding"
    className="inline-block mt-4 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
  >
    Continue to Onboarding
  </a>
)}
    </div>
  );
}