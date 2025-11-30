"use client";
/* global faceapi */
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Heart,
  X,
  MessageCircle,
  Video,
  Shield,
  Flag,
  Settings,
  Filter,
  Camera,
  Check,
  Clock,
  Globe,
  ChevronDown,
  ChevronUp,
  Send,
  Phone,
  PhoneOff,
  Crown,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import EditProfile from "./settings/EditProfile";
import BlockedUsers from "./settings/BlockedUsers";

const LegitiMateApp = () => {
  // Get app state from context
  const { isVerified, onboarding } = useApp();
  const router = useRouter();

  // Which main screen we’re on
  // Start as "loading" and then decide based on localStorage
  const [currentView, setCurrentView] = useState("loading");

  // Logged-in user (from onboarding)
  const [user, setUser] = useState(onboarding);

  // App-wide state
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [videoCall, setVideoCall] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);

  // ✅ Notification settings (Phase 1 - local only)
  const [notificationSettings, setNotificationSettings] = useState({
    newMatches: true,
    newMessages: true,
    responseTimers: true,
    productUpdates: false,
  });

  // (optional) computed value — currently unused
  const hasNewNotifications =
    (notificationSettings.productUpdates && !isPremium) || matches.length > 0;

  // 🚀 Correct startup logic
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("lm_user");

    // 1. No user → sign-in page
    if (!saved) {
      setCurrentView("sign-in-redirect");
      return;
    }

    const userData = JSON.parse(saved);
    setUser(userData);

    // 2. User exists but has NOT completed onboarding
    if (!userData.onboardingComplete) {
      setCurrentView("onboarding");
      return;
    }

    // 3. User exists and finished onboarding → Discover
    setCurrentView("discover");
  }, []);

  // ✅ Load saved notification settings from localStorage (if any)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("lm_notification_settings");
    if (saved) {
      try {
        setNotificationSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notification settings:", e);
      }
    }
  }, []);

  // ✅ Whenever settings change, save them to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "lm_notification_settings",
      JSON.stringify(notificationSettings)
    );
  }, [notificationSettings]);

  // ⭐ Phase 2: In-app toast alerts
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ✅ NEW — SAFE REDIRECT EFFECT (add it here)
useEffect(() => {
  if (currentView === "sign-in-redirect") {
    router.push("/auth/sign-in");
  }
}, [currentView, router]);

  // ⭐ Send email helper (used by Discover + Messages)
  const sendEmailNotification = async ({ to, subject, html }) => {
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, html }),
      });
    } catch (error) {
      console.error("Email failed:", error);
    }
  };

  // ⭐ Simple logout handler
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    router.push("/auth/sign-in");
  };

  // Discover feed (other people)
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  // NOTE: removed the old "if isVerified → home" effect so Behavior A works

  // Load Face API once
  useEffect(() => {
    let scriptLoaded = false;

    async function loadFaceApi() {
      try {
        if (!window.faceapi) {
          if (!scriptLoaded) {
            const script = document.createElement("script");
            script.src =
              "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js";
            script.async = true;
            script.onload = loadFaceApi;
            document.body.appendChild(script);
            scriptLoaded = true;
          }
          return;
        }

        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        setFaceApiLoaded(true);
      } catch (error) {
        console.error("Error loading Face-API:", error);
      }
    }

    loadFaceApi();
  }, []);

  // ------------------------------
  // Onboarding Flow
  // ------------------------------
  const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [onboardingData, setOnboardingData] = useState({
      email: "",
      name: "",
      age: "",
      location: "",
      country: "",
      state: "",
      languages: [],
      height: "",
      denomination: "",
      dietary: "",
      pets: "",
      familyPlans: "",
      education: "",
      bio: "",
      photos: 0,
      verified: false,
    });

    // Prefill email from user (if available)
    useEffect(() => {
      if (user?.email && !onboardingData.email) {
        setOnboardingData((prev) => ({ ...prev, email: user.email }));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const [selfieVerified, setSelfieVerified] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState("");
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const startCamera = async () => {
      try {
        setIsCapturing(true);
        setVerificationStatus("Starting camera...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setVerificationStatus(
              'Camera ready! Position your face in the frame and click "Capture & Verify"'
            );
          };
        }
      } catch (error) {
        console.error("Camera error:", error);
        setVerificationStatus(
          "Camera access denied. Please allow camera permissions and try again."
        );
        setIsCapturing(false);
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const captureSelfie = async () => {
      if (!faceApiLoaded) {
        setVerificationStatus("Face detection not ready. Please wait...");
        return;
      }

      try {
        setVerificationStatus("Detecting face...");

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          setVerificationStatus(
            "No face detected. Please ensure your face is clearly visible."
          );
          return;
        }

        if (detection.detection.score < 0.5) {
          setVerificationStatus(
            "Face detection confidence too low. Please improve lighting."
          );
          return;
        }

        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const box = detection.detection.box;
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        const landmarks = detection.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const eyeDistance = Math.abs(leftEye[0].x - rightEye[3].x);
        const faceWidth = box.width;
        const eyeRatio = eyeDistance / faceWidth;

        if (eyeRatio < 0.2 || eyeRatio > 0.5) {
          setVerificationStatus("Please look directly at the camera.");
          return;
        }

        setFaceDescriptor(detection.descriptor);

        setVerificationStatus("✓ Face verified successfully!");
        setSelfieVerified(true);
        setOnboardingData({ ...onboardingData, verified: true });

        setTimeout(() => {
          stopCamera();
          setIsCapturing(false);
        }, 2000);
      } catch (error) {
        console.error("Face detection error:", error);
        setVerificationStatus("Verification failed. Please try again.");
      }
    };

    const handleSelfieVerification = () => {
      if (!faceApiLoaded) {
        setVerificationStatus("Loading face detection... Please wait.");
        return;
      }
      startCamera();
    };

    useEffect(() => {
      return () => {
        stopCamera();
      };
    }, []);

    const completeOnboarding = () => {
      // Merge the onboarding data with the existing user
      const updatedUser = {
        ...user,
        ...onboardingData,
        verified: true,
        onboardingComplete: true,
      };

      // Save updated user to localStorage
      localStorage.setItem("lm_user", JSON.stringify(updatedUser));

      // Update app state
      setUser(updatedUser);

      // Go to Discover page
      setCurrentView("discover");
    };

    // STEP 1
    if (step === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-pink-100 rounded-full mb-4">
                <Shield className="w-12 h-12 text-pink-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                LegitiMate
              </h1>
              <p className="text-gray-600">Real connections. Verified people.</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Selfie Verification
                  </p>
                  <p className="text-sm text-gray-600">
                    Ensure everyone is real
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Bot Detection</p>
                  <p className="text-sm text-gray-600">
                    AI-powered scam prevention
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">No Ghosting</p>
                  <p className="text-sm text-gray-600">
                    Response timers keep conversations flowing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">100% Free</p>
                  <p className="text-sm text-gray-600">
                    Unlimited likes, matches, and messages
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-pink-600 text-white py-4 rounded-xl font-semibold hover:bg-pink-700 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      );
    }

    // STEP 2
    if (step === 2) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-2xl mx-auto pt-8">
            <h2 className="text-2xl font-bold mb-6">Verify Your Identity</h2>

            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="text-center">
                <Camera className="w-16 h-16 text-pink-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Take a Selfie</h3>
                <p className="text-gray-600 mb-6">
                  We'll verify you're a real person using facial recognition to
                  keep our community safe
                </p>

                {!faceApiLoaded && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2 text-blue-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">
                      Loading face detection system...
                    </span>
                  </div>
                )}

                {!isCapturing && !selfieVerified && (
                  <button
                    onClick={handleSelfieVerification}
                    disabled={!faceApiLoaded}
                    className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {faceApiLoaded ? "Start Camera" : "Loading..."}
                  </button>
                )}

                {isCapturing && !selfieVerified && (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-w-md mx-auto rounded-lg bg-black"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md rounded-lg pointer-events-none"
                      />
                    </div>

                    {verificationStatus && (
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          verificationStatus.includes("✓")
                            ? "bg-green-50 text-green-700"
                            : verificationStatus.includes("denied") ||
                              verificationStatus.includes("failed")
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {verificationStatus}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          stopCamera();
                          setIsCapturing(false);
                          setVerificationStatus("");
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={captureSelfie}
                        className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700"
                      >
                        Capture & Verify
                      </button>
                    </div>
                  </div>
                )}

                {selfieVerified && (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-xl">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Verified!</span>
                  </div>
                )}
              </div>
            </div>

            {selfieVerified && (
              <button
                onClick={() => setStep(3)}
                className="w-full bg-pink-600 text-white py-4 rounded-xl font-semibold hover:bg-pink-700"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      );
    }

    // STEP 3
    if (step === 3) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-2xl mx-auto pt-8">
            <h2 className="text-2xl font-bold mb-6">Create Your Profile</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={onboardingData.email}
                onChange={(e) =>
                  setOnboardingData({
                    ...onboardingData,
                    email: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div className="bg-white rounded-xl p-6 space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={onboardingData.name}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={onboardingData.age}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      age: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={onboardingData.country}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      country: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select country</option>
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                  <option value="UK">UK</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={onboardingData.state}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      state: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="California"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <input
                  type="text"
                  value={onboardingData.height}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      height: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={`5'10"`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Religion/Denomination
                </label>
                <select
                  value={onboardingData.denomination}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      denomination: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="Christian">Christian</option>
                  <option value="Catholic">Catholic</option>
                  <option value="Jewish">Jewish</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Non-religious">Non-religious</option>
                  <option value="Spiritual">Spiritual</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Preferences
                </label>
                <select
                  value={onboardingData.dietary}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      dietary: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="No restrictions">No restrictions</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Pescatarian">Pescatarian</option>
                  <option value="Halal">Halal</option>
                  <option value="Kosher">Kosher</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Preference
                </label>
                <select
                  value={onboardingData.pets}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      pets: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="Dog lover">Dog lover</option>
                  <option value="Cat person">Cat person</option>
                  <option value="Both">Love both</option>
                  <option value="No pets">No pets</option>
                  <option value="Other pets">Other pets</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Plans
                </label>
                <select
                  value={onboardingData.familyPlans}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      familyPlans: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="Want children">Want children</option>
                  <option value="Don't want children">Don't want children</option>
                  <option value="Open to children">Open to children</option>
                  <option value="Have children">Have children</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education
                </label>
                <select
                  value={onboardingData.education}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      education: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="High School">High School</option>
                  <option value="Some College">Some College</option>
                  <option value="Bachelors Degree">Bachelors Degree</option>
                  <option value="Masters Degree">Masters Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Trade School">Trade School</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={onboardingData.bio}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      bio: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button
                onClick={completeOnboarding}
                disabled={!onboardingData.name || !onboardingData.age}
                className="w-full bg-pink-600 text-white py-4 rounded-xl font-semibold hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // ------------------------------
  // Profile Card (for Discover feed)
  // ------------------------------
  const ProfileCard = ({ profile, onLike, onPass, isVerified }) => {
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const router = useRouter();

    const photosArray = Array.isArray(profile.photos) ? profile.photos : [];

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto">
        {/* Photo Section */}
        <div className="relative h-96 bg-black rounded-xl overflow-hidden">
          {photosArray.length > 0 ? (
            <img
              src={photosArray[currentPhoto]}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No photos uploaded
            </div>
          )}

          {photosArray.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setCurrentPhoto((prev) =>
                    prev === 0 ? photosArray.length - 1 : prev - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/40 backdrop-blur-sm p-2 rounded-full hover:bg-white/70"
              >
                <ChevronUp className="w-5 h-5 -rotate-90" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentPhoto((prev) =>
                    prev === photosArray.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/40 backdrop-blur-sm p-2 rounded-full hover:bg-white/70"
              >
                <ChevronUp className="w-5 h-5 rotate-90" />
              </button>
            </>
          )}

          {photosArray.length > 0 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {photosArray.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i === currentPhoto ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {profile.verified && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
              <Shield className="w-4 h-4" />
              Verified
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {profile.name}, {profile.age}
              </h3>
              <p className="text-gray-600 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {profile.location}
              </p>
            </div>
          </div>

          {/* Prompts */}
          <div className="space-y-4 mb-6">
            {profile.prompts?.map((prompt, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {prompt.q}
                </p>
                <p className="text-gray-900">{prompt.a}</p>
              </div>
            ))}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Height:</span> {profile.height}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Education:</span>
              {profile.education}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Religion:</span>
              {profile.denomination}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Diet:</span> {profile.dietary}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Pets:</span> {profile.pets}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Family:</span>
              {profile.familyPlans}
            </div>
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onPass}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
              Pass
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isVerified) {
                  alert("Please verify your selfie before liking profiles.");
                  router.push("/verify-selfie");
                  return;
                }
                onLike();
              }}
              className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                isVerified
                  ? "bg-pink-600 text-white hover:bg-pink-700 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isVerified}
            >
              <Heart className="w-5 h-5" />
              {isVerified ? "Like" : "Verify to Like"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------
  // Filter Panel (modal)
  // ------------------------------
  const FilterPanel = ({ filters, setFilters, setShowFilters }) => {
    const [localFilters, setLocalFilters] = useState(filters || {});

    const applyFilters = () => {
      setFilters(localFilters);
      setShowFilters(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={localFilters.country || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    country: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">All Countries</option>
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="UK">UK</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={localFilters.state || ""}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, state: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Any state"
              />
            </div>

            {/* Age range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Range
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={localFilters.minAge || ""}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      minAge: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={localFilters.maxAge || ""}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      maxAge: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={localFilters.language || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    language: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Any Language</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="Mandarin">Mandarin</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>

            {/* Height range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height Range
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={localFilters.minHeight || ""}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      minHeight: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Min height"
                />
                <input
                  type="text"
                  value={localFilters.maxHeight || ""}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      maxHeight: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Max height"
                />
              </div>
            </div>

            {/* Denomination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Religion/Denomination
              </label>
              <select
                value={localFilters.denomination || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    denomination: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Any</option>
                <option value="Christian">Christian</option>
                <option value="Catholic">Catholic</option>
                <option value="Jewish">Jewish</option>
                <option value="Muslim">Muslim</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Non-religious">Non-religious</option>
              </select>
            </div>

            {/* Dietary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Preference
              </label>
              <select
                value={localFilters.dietary || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    dietary: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Any</option>
                <option value="No restrictions">No restrictions</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Pescatarian">Pescatarian</option>
                <option value="Halal">Halal</option>
                <option value="Kosher">Kosher</option>
              </select>
            </div>

            {/* Pets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Preference
              </label>
              <select
                value={localFilters.pets || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    pets: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Any</option>
                <option value="Dog lover">Dog lover</option>
                <option value="Cat person">Cat person</option>
                <option value="Both">Love both</option>
                <option value="No pets">No pets</option>
              </select>
            </div>

            {/* Family plans */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family Plans
              </label>
              <select
                value={localFilters.familyPlans || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    familyPlans: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Any</option>
                <option value="Want children">Want children</option>
                <option value="Don't want children">Do not want children</option>
                <option value="Open to children">Open to children</option>
                <option value="Have children">Have children</option>
              </select>
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education
              </label>
              <select
                value={localFilters.education || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    education: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Any</option>
                <option value="High School">High School</option>
                <option value="Some College">Some College</option>
                <option value="Bachelors Degree">Bachelors Degree</option>
                <option value="Masters Degree">Masters Degree</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setLocalFilters({});
                  setFilters({});
                  setShowFilters(false);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------
  // Messages View
  // ------------------------------
  const MessagesView = ({
    user,
    selectedConversation,
    conversations,
    setConversations,
    setSelectedConversation,
    blockedUsers,
    setBlockedUsers,
    setVideoCall,
    notificationSettings,
    showToast,
    sendEmailNotification,
  }) => {
    const [messageText, setMessageText] = useState("");
    const [showTranslate, setShowTranslate] = useState(false);

    const sendMessage = () => {
      if (!messageText.trim() || !selectedConversation) return;

      const newMessage = {
        id: Date.now(),
        senderId: user?.id || "me",
        text: messageText.trim(),
        timestamp: Date.now(),
        responseTimer: 24 * 60 * 60 * 1000,
      };

      setConversations(
        conversations.map((conv) => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: messageText,
              lastMessageTime: new Date(),
            };
          }
          return conv;
        })
      );

      if (notificationSettings.newMessages) {
        showToast("Message sent");
      }

      // Email notification (to YOU, the current user, in this demo)
      if (notificationSettings.newMessages && newMessage.senderId !== user?.id && user?.email) {
        sendEmailNotification({
          to: user.email,
          subject: "💬 New message on LegitiMate",
          html: `<p>You received a new message from ${selectedConversation.participant.name}.</p>`,
        });
      }

      setMessageText("");
    };

    const initiateVideoCall = () => {
      setVideoCall({
        status: "calling",
        participant: selectedConversation.participant,
      });
    };

    const blockUser = (userId) => {
      setBlockedUsers([...blockedUsers, userId]);
      setConversations(
        conversations.filter((conv) => conv.participant.id !== userId)
      );
      setSelectedConversation(null);
      alert("User blocked successfully");
    };

    // Conversation list
    if (!selectedConversation) {
      return (
        <div className="h-full flex flex-col">
          <div className="border-b p-4">
            <h2 className="text-xl font-bold">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start liking profiles to make matches!</p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => {
                  const timeLeft =
                    conv.responseTimer -
                    (Date.now() - new Date(conv.lastMessageTime).getTime());
                  const hoursLeft = Math.max(
                    0,
                    Math.floor(timeLeft / (1000 * 60 * 60))
                  );

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                          {conv.participant.verified && (
                            <Shield className="w-6 h-6 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conv.participant.name}
                            </h3>
                            {hoursLeft < 24 && (
                              <span className="text-xs text-orange-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {hoursLeft}h left
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Single conversation
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedConversation(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronDown className="w-6 h-6 rotate-90" />
            </button>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <h3 className="font-semibold">
                {selectedConversation.participant.name}
              </h3>
              <p className="text-xs text-gray-600">
                {selectedConversation.participant.verified && "Verified • "}
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={initiateVideoCall}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Video className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => {
                if (confirm("Block this user?")) {
                  blockUser(selectedConversation.participant.id);
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
            >
              <Flag className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation.messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            const hoursLeft = Math.max(
              0,
              Math.floor(
                (msg.responseTimer -
                  (Date.now() - new Date(msg.timestamp).getTime())) /
                  (1000 * 60 * 60)
              )
            );

            // (Note: this will fire inside render; okay for now in demo)
            if (
              notificationSettings.responseTimers &&
              hoursLeft > 0 &&
              hoursLeft <= 2
            ) {
              showToast("⏰ Response timer is running out!");
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs ${
                    isOwn
                      ? "bg-pink-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  } rounded-2xl px-4 py-2`}
                >
                  <p>{msg.text}</p>
                  {!isOwn && hoursLeft < 24 && hoursLeft > 0 && (
                    <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Response timer: {hoursLeft}h
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranslate(!showTranslate)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Translate"
            >
              <Globe className="w-5 h-5 text-gray-600" />
            </button>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={sendMessage}
              disabled={!messageText.trim()}
              className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 disabled:bg-gray-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {showTranslate && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
              <p className="text-blue-900">
                <strong>Auto-translate:</strong> Messages will be automatically
                translated to{" "}
                {selectedConversation.participant.language?.[0] || "English"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ------------------------------
  // Video Call View
  // ------------------------------
  const VideoCallView = () => {
    const acceptCall = () => {
      setVideoCall({ ...videoCall, status: "active" });
    };

    const declineCall = () => {
      setVideoCall(null);
    };

    const endCall = () => {
      setVideoCall(null);
    };

    if (videoCall?.status === "calling") {
      return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold mb-2">
              {videoCall.participant.name}
            </h3>
            <p className="text-gray-300 mb-8">Calling...</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={declineCall}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={acceptCall}
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (videoCall?.status === "active") {
      return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
              Video Call Active
            </div>
            <div className="absolute bottom-4 right-4 w-32 h-48 bg-gray-800 rounded-lg"></div>
          </div>
          <div className="p-6 flex justify-center gap-4">
            <button
              onClick={endCall}
              className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // ------------------------------
  // Matches View
  // ------------------------------
  const MatchesView = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-4">
          <h2 className="text-xl font-bold">Matches</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {matches.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No matches yet</p>
                <p className="text-sm">Keep swiping to find your match!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition"
                  onClick={() => {
                    setCurrentView("messages");
                    setSelectedConversation({
                      id: `conv-${match.id}`,
                      participant: match,
                      messages: [],
                      lastMessage: "Start chatting!",
                      lastMessageTime: new Date(),
                      responseTimer: 24 * 60 * 60 * 1000,
                    });
                  }}
                >
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900">
                      {match.name}
                    </h3>
                    <p className="text-sm text-gray-600">{match.age}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ------------------------------
  // Premium Modal
  // ------------------------------
  const PremiumModal = ({ onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">LegitiMate Premium</h2>
            <p className="text-gray-600">Unlock premium features</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Advanced Filters</p>
                <p className="text-sm text-gray-600">
                  Filter by income, body type, politics, and more
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Read Receipts</p>
                <p className="text-sm text-gray-600">
                  See when your messages are read
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Priority Likes</p>
                <p className="text-sm text-gray-600">
                  Your profile appears first to others
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Unlimited Rewinds</p>
                <p className="text-sm text-gray-600">
                  Undo accidental passes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Incognito Mode</p>
                <p className="text-sm text-gray-600">
                  Only people you like can see your profile
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Extended Response Time</p>
                <p className="text-sm text-gray-600">
                  48-hour message timer instead of 24
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Profile Boost</p>
                <p className="text-sm text-gray-600">
                  Get seen by 10x more people (1 per month)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowPremium(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            >
              Upgrade to Premium
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------
  // Discover View — other people's profiles
  // ------------------------------
  const DiscoverView = ({
    profiles,
    currentProfileIndex,
    setCurrentProfileIndex,
    setCurrentView,
    setShowFilters,
    isVerified,
    setMatches,
    showToast,
    notificationSettings,
    user,
    sendEmailNotification,
  }) => {
    const currentProfile = profiles[currentProfileIndex];

    if (!currentProfile) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p>No more profiles</p>
            <button
              onClick={() => setCurrentProfileIndex(0)}
              className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-xl cursor-pointer"
            >
              Review Again
            </button>
          </div>
        </div>
      );
    }

    const handleLike = () => {
      // Move to next profile
      setCurrentProfileIndex((prev) => prev + 1);

      // Toast: You liked someone
      if (notificationSettings.newMatches) {
        showToast("You liked a profile!");
      }

      // 30% chance of a "match" (demo)
      if (Math.random() < 0.3) {
        const matchedPerson = currentProfile;

        // Add to matches list
        setMatches((prev) => [...prev, matchedPerson]);

        // Toast and email
        if (notificationSettings.newMatches) {
          showToast(`🔥 New match with ${matchedPerson.name}!`);
        }

        if (notificationSettings.newMatches && user?.email) {
          sendEmailNotification({
            to: user.email,
            subject: "🔥 You have a new match!",
            html: `<h2>New Match on LegitiMate!</h2><p>You matched with ${matchedPerson.name}.</p>`,
          });
        }
      }
    };

    const handlePass = () => {
      setCurrentProfileIndex((prev) => prev + 1);
    };

    return (
      <div className="h-full overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto p-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Discover</h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Filter className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => setCurrentView("settings")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Profile card */}
          <ProfileCard
            profile={currentProfile}
            onLike={handleLike}
            onPass={handlePass}
            isVerified={isVerified}
          />
        </div>
      </div>
    );
  };

  // ------------------------------
  // Home View — your own profile
  // ------------------------------
  const HomeView = ({ profile }) => {
    if (!profile) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>Loading your profile...</p>
        </div>
      );
    }

    const images = Array.isArray(profile.photos) ? profile.photos : [];

    return (
      <div className="h-full overflow-y-auto pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Photo */}
            <div className="h-80 bg-gray-200 flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[0]}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-500">No photos yet</div>
              )}
            </div>

            {/* Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-1">
                {profile.name || "New Member"}
                {profile.age ? `, ${profile.age}` : ""}
              </h2>
              {(profile.country || profile.state) && (
                <p className="text-gray-600 mb-4">
                  {[profile.state, profile.country].filter(Boolean).join(", ")}
                </p>
              )}

              {profile.bio && (
                <p className="text-gray-800 mb-4">{profile.bio}</p>
              )}

              <button
                onClick={() => setCurrentView("edit-profile")}
                className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700"
              >
                Edit My Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------
  // Bottom Navigation
  // ------------------------------
  const BottomNav = () => {
    const navItems = [
      { id: "discover", icon: Heart, label: "Discover" },
      {
        id: "matches",
        icon: MessageCircle,
        label: "Matches",
        badge: matches.length,
      },
      {
        id: "messages",
        icon: MessageCircle,
        label: "Messages",
        badge: conversations.length,
      },
      { id: "settings", icon: Settings, label: "Settings" },
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setSelectedConversation(null);
              }}
              className={`flex-1 py-3 flex flex-col items-center gap-1 relative cursor-pointer ${
                currentView === item.id ? "text-pink-600" : "text-gray-600"
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>

              {item.badge > 0 && (
                <span className="absolute top-1 right-1/4 bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ------------------------------
  // Notifications View
  // ------------------------------
  const NotificationsView = ({
    notificationSettings = {
      newMatches: true,
      newMessages: true,
      responseTimers: true,
      productUpdates: false,
    },
    setNotificationSettings,
    onBack,
  }) => {
    const handleToggle = (key) => {
      if (!setNotificationSettings) return;
      setNotificationSettings((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };

    return (
      <div className="h-full overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4">
          <button
            onClick={onBack}
            className="mb-4 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ← Back to Settings
          </button>

          <h2 className="text-2xl font-bold mb-6 text-black">Notifications</h2>

          <div className="bg-white rounded-xl divide-y">
            {/* New Matches */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-black">New Matches</p>
                <p className="text-sm text-gray-600">
                  Get notified when you have a new match.
                </p>
              </div>
              <input
                type="checkbox"
                checked={!!notificationSettings.newMatches}
                onChange={() => handleToggle("newMatches")}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            {/* New Messages */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-black">New Messages</p>
                <p className="text-sm text-gray-600">
                  Get notified when someone sends you a message.
                </p>
              </div>
              <input
                type="checkbox"
                checked={!!notificationSettings.newMessages}
                onChange={() => handleToggle("newMessages")}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            {/* Response Timers */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-black">Response Timers</p>
                <p className="text-sm text-gray-600">
                  Be reminded before a match expires.
                </p>
              </div>
              <input
                type="checkbox"
                checked={!!notificationSettings.responseTimers}
                onChange={() => handleToggle("responseTimers")}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            {/* Product Updates */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-black">Product Updates</p>
                <p className="text-sm text-gray-600">
                  Occasionally hear about new features.
                </p>
              </div>
              <input
                type="checkbox"
                checked={!!notificationSettings.productUpdates}
                onChange={() => handleToggle("productUpdates")}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------
  // Privacy Settings View
  // ------------------------------
  const PrivacySettingsView = ({ onBack }) => {
    return (
      <div className="h-full overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4">
          <button
            onClick={onBack}
            className="text-sm text-gray-600 mb-4 hover:underline cursor-pointer"
          >
            ← Back to Settings
          </button>

          <h2 className="text-2xl font-bold mb-4 text-black">
            Privacy Settings
          </h2>

          <div className="bg-white rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-800">
                Only show my profile to verified users
              </span>
              <input type="checkbox" className="w-5 h-5 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-800">
                Hide my last seen activity
              </span>
              <input type="checkbox" className="w-5 h-5 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-800">
                Allow only matches to message me
              </span>
              <input type="checkbox" className="w-5 h-5 cursor-pointer" />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              (These switches are demo-only right now — later we can save them
              to your database.)
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------
  // Help & Support View
  // ------------------------------
  const HelpSupportView = ({ onBack }) => {
    return (
      <div className="h-full overflow-y-auto pb-20 !text-black">
        <div className="max-w-2xl mx-auto p-4">
          <button
            onClick={onBack}
            className="text-sm !text-black mb-4 hover:underline cursor-pointer font-semibold"
          >
            ← Back to Settings
          </button>

          <h2 className="text-2xl font-bold mb-4 !text-black">
            Help & Support
          </h2>

          <div className="bg-white rounded-xl p-4 space-y-4 !text-black">
            <p className="text-sm !text-black">
              If you feel unsafe, are being harassed, or suspect a scammer,
              please block the user and report them immediately.
            </p>

            {/* Safety Tips */}
            <div>
              <p className="font-semibold !text-black mb-1">Safety Tips</p>
              <ul className="list-disc list-inside text-sm !text-black space-y-1">
                <li>Never send money to someone you haven’t met in person.</li>
                <li>Keep conversations inside the app until you feel safe.</li>
                <li>Meet in public places for the first few dates.</li>
                <li>Tell a friend or family member your plans.</li>
                <li>Use the video call feature before meeting in person.</li>
              </ul>
            </div>

            {/* Support Email */}
            <div>
              <p className="font-semibold !text-black mb-1">Need help?</p>
              <p className="text-sm !text-black">
                You can reach us at{" "}
                <a
                  href="mailto:admin@legitimate-dating.com"
                  className="text-pink-600 underline"
                >
                  admin@legitimate-dating.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------
  // Settings View
  // ------------------------------
  const SettingsView = ({
    setCurrentView,
    user,
    isPremium,
    blockedUsers,
    setBlockedUsers,
    handleLogout,
  }) => {
    const router = useRouter();
    blockedUsers = blockedUsers || [];

    return (
      <div className="h-full overflow-y-auto pb-20 p-6 !text-black">
        <h1 className="text-2xl font-bold mb-6 !text-black">Settings</h1>

        <div className="space-y-4 !text-black">
          {/* Edit Profile */}
          <button
            onClick={() => setCurrentView("edit-profile")}
            className="w-full text-left bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100 !text-black"
          >
            <span className="!text-black">Edit Profile</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setCurrentView("notifications")}
            className="w-full text-left bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100 !text-black"
          >
            <span className="!text-black">Notifications</span>
          </button>

          {/* Privacy */}
          <button
            onClick={() => setCurrentView("privacy")}
            className="w-full text-left bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100 !text-black"
          >
            <span className="!text-black">Privacy Settings</span>
          </button>

          {/* Blocked Users */}
          <button
            onClick={() => setCurrentView("blocked-users")}
            className="w-full text-left bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100"
            style={{ color: "black" }}
          >
            <span style={{ color: "black" }}>
              Blocked Users ({blockedUsers.length})
            </span>
          </button>

          {/* Help & Support */}
          <button
            onClick={() => setCurrentView("support")}
            className="w-full text-left bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100 !text-black"
          >
            <span className="!text-black">Help & Support</span>
          </button>

          {/* Premium */}
          <div className="bg-white p-4 rounded-xl shadow !text-black">
            <p className="font-semibold mb-2 !text-black">Premium Status</p>
            <p className="mb-3 !text-black">
              {isPremium ? "Premium Active" : "Free Account"}
            </p>

            {!isPremium && (
              <button
                onClick={() => alert("Premium upgrade coming soon!")}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
              >
                Upgrade to Premium
              </button>
            )}
          </div>

          {/* Log Out */}
          <button
            onClick={handleLogout}
            className="w-full text-left bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-red-50 text-red-600 font-semibold"
          >
            Log out
          </button>
        </div>
      </div>
    );
  };

  // ==========================
  // VIEW ROUTING
  // ==========================

  // Loading state while we decide where to send them
  if (currentView === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // 1. If user is onboarding → show onboarding flow
  if (currentView === "onboarding") {
    return <Onboarding />;
  }

 
  // 3. Otherwise → render full app UI
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toast */}
      {toastMessage && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 
                      bg-black text-white px-6 py-3 rounded-xl shadow-lg 
                      z-[9999] animate-fadeIn"
        >
          {toastMessage}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {/* Discover = other profiles */}
        {currentView === "discover" && (
          <DiscoverView
            profiles={profiles}
            currentProfileIndex={currentProfileIndex}
            setCurrentProfileIndex={setCurrentProfileIndex}
            setCurrentView={setCurrentView}
            setShowFilters={setShowFilters}
            isVerified={isVerified}
            setMatches={setMatches}
            showToast={showToast}
            notificationSettings={notificationSettings}
            user={user}
            sendEmailNotification={sendEmailNotification}
          />
        )}

        {/* Optional Home (your profile) */}
        {currentView === "home" && <HomeView profile={user} />}

        {/* Matches */}
        {currentView === "matches" && <MatchesView />}

        {/* Messages */}
        {currentView === "messages" && (
          <MessagesView
            user={user}
            selectedConversation={selectedConversation}
            conversations={conversations}
            setConversations={setConversations}
            setSelectedConversation={setSelectedConversation}
            blockedUsers={blockedUsers}
            setBlockedUsers={setBlockedUsers}
            setVideoCall={setVideoCall}
            notificationSettings={notificationSettings}
            showToast={showToast}
            sendEmailNotification={sendEmailNotification}
          />
        )}

        {/* Settings */}
        {currentView === "settings" && (
          <SettingsView
            setCurrentView={setCurrentView}
            user={user}
            isPremium={isPremium}
            blockedUsers={blockedUsers}
            setBlockedUsers={setBlockedUsers}
            handleLogout={handleLogout}
          />
        )}

        {/* Notifications */}
        {currentView === "notifications" && (
          <NotificationsView
            notificationSettings={notificationSettings}
            setNotificationSettings={setNotificationSettings}
            onBack={() => setCurrentView("settings")}
          />
        )}

        {/* Edit Profile */}
        {currentView === "edit-profile" && (
          <EditProfile
            user={user}
            setUser={setUser}
            onBack={() => setCurrentView("settings")}
          />
        )}

        {/* Blocked Users */}
        {currentView === "blocked-users" && (
          <BlockedUsers
            blockedUsers={blockedUsers}
            setBlockedUsers={setBlockedUsers}
            onBack={() => setCurrentView("settings")}
          />
        )}

        {/* Privacy */}
        {currentView === "privacy" && (
          <PrivacySettingsView onBack={() => setCurrentView("settings")} />
        )}

        {/* Help & Support (using "support" as the route name) */}
        {currentView === "support" && (
          <HelpSupportView onBack={() => setCurrentView("settings")} />
        )}
      </div>

      {/* Bottom Nav */}
      <BottomNav />

      {/* Filters */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          setShowFilters={setShowFilters}
        />
      )}

      {/* Video Call Overlay */}
      {videoCall && <VideoCallView />}

      {/* Premium Modal */}
      {showPremium && (
        <PremiumModal onClose={() => setShowPremium(false)} />
      )}
    </div>
  );
};

export default LegitiMateApp;
