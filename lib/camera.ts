export async function startCamera(video: HTMLVideoElement) {
    // Make sure the browser supports camera access
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera not supported in this browser");
    }
  
    // Camera only works on https or localhost
    const isSecure =
      typeof window !== "undefined" &&
      (window.isSecureContext || window.location.hostname === "localhost");
  
    if (!isSecure) {
      throw new Error("Camera requires HTTPS or localhost");
    }
  
    // Ask permission to use the front camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
  
    video.srcObject = stream;
    await video.play();
    return stream;
  }
  
  export function stopCamera(video?: HTMLVideoElement | null) {
    const stream = (video?.srcObject as MediaStream | null) || null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (video) video.srcObject = null;
  }
  