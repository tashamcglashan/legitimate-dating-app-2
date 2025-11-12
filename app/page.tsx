"use client";
import Script from "next/script";
import LegitiMateApp from "./LegitiMateApp.jsx";

export default function Page() {
  return (
    <>
      {/* 👇 This line loads the face detection library */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js"
        strategy="afterInteractive"
      />
      <LegitiMateApp />
    </>
  );
}
