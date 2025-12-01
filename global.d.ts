// global.d.ts
export {};

declare global {
  interface Window {
    faceapi?: any;
  }

  // Global faceapi object loaded via script tag
  const faceapi: any;
}
