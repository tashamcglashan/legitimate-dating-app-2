"use client";
/* global faceapi */
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Heart, X, MessageCircle, Video, Shield, Flag, Settings, Filter, Camera, Check, Clock, Globe, ChevronDown, ChevronUp, Send, Phone, PhoneOff, Crown, AlertCircle } from 'lucide-react';
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import EditProfile from "../components/settings/EditProfile";
import BlockedUsers from "../components/settings/BlockedUsers";


const LegitiMateApp = () => {
  const [currentView, setCurrentView] = useState('onboarding'); // onboarding, home, profile, messages, matches, settings
  const [user, setUser] = useState(null);
  const { isVerified } = useApp();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [videoCall, setVideoCall] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);

  // Load Face-API.js once
useEffect(() => {
  let scriptLoaded = false;

  async function loadFaceApi() {
    try {
      // 1️⃣ Wait for face-api script to exist
      if (!window.faceapi) {
        // only add it once
        if (!scriptLoaded) {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js";
          script.async = true;
          script.onload = loadFaceApi; // try again once it’s loaded
          document.body.appendChild(script);
          scriptLoaded = true;
        }
        return;
      }

      // 2️⃣ Load your local models from /public/models
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      setFaceApiLoaded(true);
      console.log("✅ Face-API models loaded from /models");
    } catch (error) {
      console.error("Error loading Face-API:", error);
    }
  }

  loadFaceApi();
}, []);


  // Initialize demo data
  useEffect(() => {
    if (!user) return;
    
    const demoProfiles = [
      {
        id: 1,
        name: 'Sarah Chen',
        age: 28,
        verified: true,
        botScore: 0.02,
        location: 'San Francisco, CA, USA',
        country: 'USA',
        state: 'California',
        language: ['English', 'Mandarin'],
        height: "5'6\"",
        denomination: 'Non-religious',
        dietary: 'Vegetarian',
        pets: 'Dog lover',
        familyPlans: 'Want children',
        education: 'Masters Degree',
        bio: 'Product designer who loves hiking and trying new restaurants. Always up for an adventure!',
        photos: 6,
        interests: ['Hiking', 'Design', 'Cooking', 'Travel'],
        prompts: [
          { q: 'My perfect Sunday', a: 'Farmers market brunch, hike with my dog, then a good book' },
          { q: 'I geek out on', a: 'UX design and sustainable architecture' }
        ]
      },
      {
        id: 2,
        name: 'Marcus Johnson',
        age: 32,
        verified: true,
        botScore: 0.01,
        location: 'Austin, TX, USA',
        country: 'USA',
        state: 'Texas',
        language: ['English', 'Spanish'],
        height: "6'1\"",
        denomination: 'Christian',
        dietary: 'No restrictions',
        pets: 'Cat person',
        familyPlans: 'Open to children',
        education: 'Bachelors Degree',
        bio: 'Software engineer and amateur chef. Teaching myself guitar poorly but enthusiastically.',
        photos: 8,
        interests: ['Coding', 'Cooking', 'Music', 'Basketball'],
        prompts: [
          { q: 'Best travel story', a: 'Got lost in Tokyo and ended up at an incredible underground jazz club' },
          { q: 'Looking for', a: 'Someone who laughs at my terrible jokes and tries new foods with me' }
        ]
      },
      {
        id: 3,
        name: 'Elena Rodriguez',
        age: 26,
        verified: true,
        botScore: 0.03,
        location: 'Miami, FL, USA',
        country: 'USA',
        state: 'Florida',
        language: ['English', 'Spanish'],
        height: "5'4\"",
        denomination: 'Catholic',
        dietary: 'Pescatarian',
        pets: 'No pets',
        familyPlans: 'Want children',
        education: 'Bachelors Degree',
        bio: 'Marine biologist with a passion for ocean conservation. Beach bum at heart.',
        photos: 7,
        interests: ['Ocean conservation', 'Diving', 'Photography', 'Yoga'],
        prompts: [
          { q: 'I value', a: 'Authenticity, curiosity, and making the world a little better' },
          { q: 'Unusual skill', a: 'Can identify 50+ species of fish on sight' }
        ]
      }
    ];

    setProfiles(demoProfiles);
  }, [user]);

  // Onboarding Component
  const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [onboardingData, setOnboardingData] = useState({
      name: '',
      age: '',
      location: '',
      country: '',
      state: '',
      languages: [],
      height: '',
      denomination: '',
      dietary: '',
      pets: '',
      familyPlans: '',
      education: '',
      bio: '',
      photos: 0,
      verified: false
    });

    const [selfieVerified, setSelfieVerified] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('');
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const startCamera = async () => {
      try {
        setIsCapturing(true);
        setVerificationStatus('Starting camera...');
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false 
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setVerificationStatus('Camera ready! Position your face in the frame and click "Capture & Verify"');
          };
        }
      } catch (error) {
        console.error('Camera error:', error);
        setVerificationStatus('Camera access denied. Please allow camera permissions and try again.');
        setIsCapturing(false);
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const captureSelfie = async () => {
      if (!faceApiLoaded) {
        setVerificationStatus('Face detection not ready. Please wait...');
        return;
      }

      try {
        setVerificationStatus('Detecting face...');
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas) return;

        // Detect face with landmarks and descriptor
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          setVerificationStatus('No face detected. Please ensure your face is clearly visible.');
          return;
        }

        // Check detection confidence
        if (detection.detection.score < 0.5) {
          setVerificationStatus('Face detection confidence too low. Please improve lighting.');
          return;
        }

        // Draw detection on canvas for visual feedback
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        // Draw face box
        const box = detection.detection.box;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Check for basic liveness indicators
        const landmarks = detection.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const nose = landmarks.getNose();
        
        // Simple eye aspect ratio check (basic blink detection)
        const eyeDistance = Math.abs(leftEye[0].x - rightEye[3].x);
        const faceWidth = box.width;
        const eyeRatio = eyeDistance / faceWidth;
        
        if (eyeRatio < 0.2 || eyeRatio > 0.5) {
          setVerificationStatus('Please look directly at the camera.');
          return;
        }

        // Store face descriptor for future verification
        setFaceDescriptor(detection.descriptor);
        
        setVerificationStatus('✓ Face verified successfully!');
        setSelfieVerified(true);
        setOnboardingData({ ...onboardingData, verified: true });
        
        // Stop camera after successful capture
        setTimeout(() => {
          stopCamera();
          setIsCapturing(false);
        }, 2000);

      } catch (error) {
        console.error('Face detection error:', error);
        setVerificationStatus('Verification failed. Please try again.');
      }
    };

    const handleSelfieVerification = () => {
      if (!faceApiLoaded) {
        setVerificationStatus('Loading face detection... Please wait.');
        return;
      }
      startCamera();
    };

    // Cleanup camera on unmount
    useEffect(() => {
      return () => {
        stopCamera();
      };
    }, []);

    const completeOnboarding = () => {
      setUser({
        id: 'user1',
        ...onboardingData,
        verified: selfieVerified,
        botScore: 0.01
      });
      setCurrentView('home');
    };

    if (step === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-pink-100 rounded-full mb-4">
                <Shield className="w-12 h-12 text-pink-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">LegitiMate</h1>
              <p className="text-gray-600">Real connections. Verified people.</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Selfie Verification</p>
                  <p className="text-sm text-gray-600">Ensure everyone is real</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Bot Detection</p>
                  <p className="text-sm text-gray-600">AI-powered scam prevention</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">No Ghosting</p>
                  <p className="text-sm text-gray-600">Response timers keep conversations flowing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">100% Free</p>
                  <p className="text-sm text-gray-600">Unlimited likes, matches, and messages</p>
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
                  We'll verify you're a real person using facial recognition to keep our community safe
                </p>
                
                {!faceApiLoaded && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2 text-blue-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Loading face detection system...</span>
                  </div>
                )}

                {!isCapturing && !selfieVerified && (
                  <button
                    onClick={handleSelfieVerification}
                    disabled={!faceApiLoaded}
                    className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {faceApiLoaded ? 'Start Camera' : 'Loading...'}
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
                      <div className={`p-3 rounded-lg text-sm ${
                        verificationStatus.includes('✓') 
                          ? 'bg-green-50 text-green-700' 
                          : verificationStatus.includes('denied') || verificationStatus.includes('failed')
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {verificationStatus}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          stopCamera();
                          setIsCapturing(false);
                          setVerificationStatus('');
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <Link href="/verify-selfie" className="flex-1">
  <button
    className="w-full bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700"
  >
    Capture & Verify
  </button>
</Link>

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

    if (step === 3) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-2xl mx-auto pt-8">
            <h2 className="text-2xl font-bold mb-6">Create Your Profile</h2>
            
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={onboardingData.name}
                  onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={onboardingData.age}
                  onChange={(e) => setOnboardingData({ ...onboardingData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={onboardingData.country}
                  onChange={(e) => setOnboardingData({ ...onboardingData, country: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                <input
                  type="text"
                  value={onboardingData.state}
                  onChange={(e) => setOnboardingData({ ...onboardingData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="California"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <input
                  type="text"
                  value={onboardingData.height}
                  onChange={(e) => setOnboardingData({ ...onboardingData, height: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="5'10&quot;"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Religion/Denomination</label>
                <select
                  value={onboardingData.denomination}
                  onChange={(e) => setOnboardingData({ ...onboardingData, denomination: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
                <select
                  value={onboardingData.dietary}
                  onChange={(e) => setOnboardingData({ ...onboardingData, dietary: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Pet Preference</label>
                <select
                  value={onboardingData.pets}
                  onChange={(e) => setOnboardingData({ ...onboardingData, pets: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Plans</label>
                <select
                  value={onboardingData.familyPlans}
                  onChange={(e) => setOnboardingData({ ...onboardingData, familyPlans: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <select
                  value={onboardingData.education}
                  onChange={(e) => setOnboardingData({ ...onboardingData, education: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={onboardingData.bio}
                  onChange={(e) => setOnboardingData({ ...onboardingData, bio: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows="4"
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
  };

  // Profile Card Component (Hinge-style)
  const ProfileCard = ({ profile, onLike, onPass }) => {
    const [currentPhoto, setCurrentPhoto] = useState(0);

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto">
        {/* Photo Section */}
        <div className="relative h-96 bg-gray-200">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Photo {currentPhoto + 1} of {profile.photos}
          </div>
          
          {/* Photo Navigation Dots */}
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4">
            {[...Array(profile.photos)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i === currentPhoto ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Verification Badge */}
          {profile.verified && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
              <Shield className="w-4 h-4" />
              Verified
            </div>
          )}
        </div>

        {/* Profile Info */}
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

          <div className="space-y-4 mb-6">
            {profile.prompts.map((prompt, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{prompt.q}</p>
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
              <span className="font-semibold">Education:</span> {profile.education}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Religion:</span> {profile.denomination}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Diet:</span> {profile.dietary}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Pets:</span> {profile.pets}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Family:</span> {profile.familyPlans}
            </div>
          </div>

          {/* Interests */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, idx) => (
                <span key={idx} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
<div className="flex gap-4">
  {/* Pass Button - open to everyone */}
  <button
    onClick={() => onPass(profile.id)}
    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 flex items-center justify-center gap-2"
  >
    <X className="w-5 h-5" />
    Pass
  </button>

  {/* Like Button - requires verification */}
  <button
    onClick={() => {
      if (!isVerified) {
        // 🚨 If user isn't verified, stop and send them to selfie page
        alert("Please verify your selfie before liking profiles.");
        router.push("/verify-selfie");
        return;
      }
      // ✅ Verified users can like normally
      onLike(profile.id);
    }}
    className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2
      ${
        isVerified
          ? "bg-pink-600 text-white hover:bg-pink-700"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    disabled={!isVerified}
  >
    <Heart className="w-5 h-5" />
    {isVerified ? "Like" : "Verify to Like"}
  </button>
</div>
{/* /p-6 */}
</div> 
{/* /card */}
      </div>   
    );
  };
   // --- Filter Panel ---
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={localFilters.country || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, country: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">All Countries</option>
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="UK">UK</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
              <input
                type="text"
                value={localFilters.state || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, state: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Any state"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={localFilters.minAge || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, minAge: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={localFilters.maxAge || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, maxAge: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={localFilters.language || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, language: e.target.value })}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height Range</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={localFilters.minHeight || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, minHeight: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Min height"
                />
                <input
                  type="text"
                  value={localFilters.maxHeight || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, maxHeight: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Max height"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Religion/Denomination</label>
              <select
                value={localFilters.denomination || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, denomination: e.target.value })}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
              <select
                value={localFilters.dietary || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, dietary: e.target.value })}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pet Preference</label>
              <select
                value={localFilters.pets || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, pets: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Any</option>
                <option value="Dog lover">Dog lover</option>
                <option value="Cat person">Cat person</option>
                <option value="Both">Love both</option>
                <option value="No pets">No pets</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Family Plans</label>
              <select
                value={localFilters.familyPlans || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, familyPlans: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Any</option>
                <option value="Want children">Want children</option>
                <option value="Don't want children">Do not want children</option>
                <option value="Open to children">Open to children</option>
                <option value="Have children">Have children</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
              <select
                value={localFilters.education || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, education: e.target.value })}
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

  // Messages View Component (standalone, JS-safe)
const MessagesView = ({ user, selectedConversation, conversations, setConversations, setSelectedConversation, setBlockedUsers, setVideoCall }) => {
  const [messageText, setMessageText] = useState('');
  const [showTranslate, setShowTranslate] = useState(false);

  const sendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage = {
      id: Date.now(),
      senderId: user?.id || "me",
      text: messageText.trim(),
      timestamp: Date.now(),
      responseTimer: 24 * 60 * 60 * 1000, // 24h in ms
    };
      setConversations(conversations.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: messageText,
            lastMessageTime: new Date()
          };
        }
        return conv;
      }));

      setMessageText('');
    };

    const initiateVideoCall = () => {
      setVideoCall({
        status: 'calling',
        participant: selectedConversation.participant
      });
    };

    const blockUser = (userId) => {
      setBlockedUsers([...blockedUsers, userId]);
      setConversations(conversations.filter(conv => conv.participant.id !== userId));
      setSelectedConversation(null);
      alert('User blocked successfully');
    };

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
                {conversations.map(conv => {
                  const timeLeft = conv.responseTimer - (Date.now() - new Date(conv.lastMessageTime).getTime());
                  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

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
                          <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
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
              <h3 className="font-semibold">{selectedConversation.participant.name}</h3>
              <p className="text-xs text-gray-600">
                {selectedConversation.participant.verified && 'Verified • '}
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
                if (confirm('Block this user?')) {
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
          {selectedConversation.messages.map(msg => {
            const isOwn = msg.senderId === user.id;
            const timeLeft = msg.responseTimer - (Date.now() - new Date(msg.timestamp).getTime());
            const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs ${isOwn ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-900'} rounded-2xl px-4 py-2`}>
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
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
                <strong>Auto-translate:</strong> Messages will be automatically translated to {selectedConversation.participant.language?.[0] || 'English'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Video Call Component
  const VideoCallView = () => {
    const acceptCall = () => {
      setVideoCall({ ...videoCall, status: 'active' });
    };

    const declineCall = () => {
      setVideoCall(null);
    };

    const endCall = () => {
      setVideoCall(null);
    };

    if (videoCall?.status === 'calling') {
      return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold mb-2">{videoCall.participant.name}</h3>
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

    if (videoCall?.status === 'active') {
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

  // Matches View
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
              {matches.map(match => (
                <div
                  key={match.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition"
                  onClick={() => {
                    setCurrentView('messages');
                    setSelectedConversation({
                      id: `conv-${match.id}`,
                      participant: match,
                      messages: [],
                      lastMessage: 'Start chatting!',
                      lastMessageTime: new Date(),
                      responseTimer: 24 * 60 * 60 * 1000
                    });
                  }}
                >
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900">{match.name}</h3>
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

  // Premium Modal
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
                <p className="text-sm text-gray-600">Filter by income, body type, politics, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Read Receipts</p>
                <p className="text-sm text-gray-600">See when your messages are read</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Priority Likes</p>
                <p className="text-sm text-gray-600">Your profile appears first to others</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Unlimited Rewinds</p>
                <p className="text-sm text-gray-600">Undo accidental passes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Incognito Mode</p>
                <p className="text-sm text-gray-600">Only people you like can see your profile</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Extended Response Time</p>
                <p className="text-sm text-gray-600">48-hour message timer instead of 24</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Profile Boost</p>
                <p className="text-sm text-gray-600">Get seen by 10x more people (1 per month)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setIsPremium(true);
                onClose();
                alert('Premium activated! (Demo mode)');
              }}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600"
            >
              Upgrade to Premium - $9.99/month
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Home View
  const HomeView = () => {
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const [showPremium, setShowPremium] = useState(false);

    const handleLike = (profileId) => {
      // Simulate match (50% chance)
      if (Math.random() > 0.5) {
        const profile = profiles.find(p => p.id === profileId);
        setMatches([...matches, profile]);
        setConversations([...conversations, {
          id: `conv-${profileId}`,
          participant: profile,
          messages: [],
          lastMessage: 'You matched!',
          lastMessageTime: new Date(),
          responseTimer: 24 * 60 * 60 * 1000
        }]);
        alert(`It's a match with ${profile.name}!`);
      }
      setCurrentProfileIndex(currentProfileIndex + 1);
    };

    const handlePass = () => {
      setCurrentProfileIndex(currentProfileIndex + 1);
    };

    if (currentProfileIndex >= profiles.length) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-semibold mb-2">No more profiles</p>
            <p className="text-sm">Check back later for new matches!</p>
            <button
              onClick={() => setCurrentProfileIndex(0)}
              className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-xl hover:bg-pink-700"
            >
              Review Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Discover</h1>
            <div className="flex items-center gap-2">
              {!isPremium && (
                <button
                  onClick={() => setShowPremium(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
                >
                  <Crown className="w-4 h-4" />
                  Premium
                </button>
              )}
              <button
                onClick={() => setShowFilters(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Filter className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
          
          <ProfileCard
            profile={profiles[currentProfileIndex]}
            onLike={handleLike}
            onPass={handlePass}
          />
        </div>
        {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
      </div>
    );
  };

  // Bottom Navigation
  const BottomNav = () => {
    const navItems = [
      { id: 'home', icon: Heart, label: 'Discover' },
      { id: 'matches', icon: MessageCircle, label: 'Matches', badge: matches.length },
      { id: 'messages', icon: MessageCircle, label: 'Messages', badge: conversations.length },
      { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto flex justify-around">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setSelectedConversation(null);
              }}
              className={`flex-1 py-3 flex flex-col items-center gap-1 relative ${
                currentView === item.id ? 'text-pink-600' : 'text-gray-600'
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

  // Settings View
  const SettingsView = () => {
    return (
      <div className="h-full overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4">
          <h2 className="text-2xl font-bold mb-6">Settings</h2>
          
          <div className="bg-white rounded-xl divide-y">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">Account Status</p>
                <p className="text-sm text-gray-600">
                  {user?.verified ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Verified
                    </span>
                  ) : (
                    'Not verified'
                  )}
                </p>
              </div>
            </div>

            <div className="p-4">
              <p className="font-semibold mb-2">Premium Status</p>
              <p className="text-sm text-gray-600 mb-3">
                {isPremium ? 'Premium Active' : 'Free Account'}
              </p>
              {!isPremium && (
                <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  Upgrade to Premium
                </button>
              )}
            </div>

            <button className="p-4 text-left w-full hover:bg-gray-50">
              <p className="font-semibold">Edit Profile</p>
            </button>

            <button className="p-4 text-left w-full hover:bg-gray-50">
              <p className="font-semibold">Blocked Users</p>
              <p className="text-sm text-gray-600">{blockedUsers.length} blocked</p>
            </button>

            <button className="p-4 text-left w-full hover:bg-gray-50">
              <p className="font-semibold">Privacy Settings</p>
            </button>

            <button className="p-4 text-left w-full hover:bg-gray-50">
              <p className="font-semibold">Notifications</p>
            </button>

            <button className="p-4 text-left w-full hover:bg-gray-50">
              <p className="font-semibold">Help & Support</p>
            </button>

            <button className="p-4 text-left w-full hover:bg-gray-50 text-red-600">
              <p className="font-semibold">Logout</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  if (currentView === 'onboarding') {
    return <Onboarding />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-hidden">
        {currentView === 'home' && <HomeView />}
        {currentView === 'matches' && <MatchesView />}
        {currentView === 'messages' && (
    <MessagesView
      user={user}
      selectedConversation={selectedConversation}
      conversations={conversations}
      setConversations={setConversations}
      setSelectedConversation={setSelectedConversation}
      setBlockedUsers={setBlockedUsers}
      setVideoCall={setVideoCall}
    />
  )}
        {currentView === 'settings' && <SettingsView />}
        {currentView === 'edit-profile' && (
  <EditProfile
    user={user}
    setUser={setUser}
    onBack={() => setCurrentView('settings')}
  />
)}
      {/* NEW: Blocked Users screen */}
      {currentView === "blocked-users" && (
        <BlockedUsers
          blockedUsers={blockedUsers}
          setBlockedUsers={setBlockedUsers}
          onBack={() => setCurrentView("settings")}
        />
      )}
      </div>
      
      <BottomNav />
      
      {showFilters && (
  <FilterPanel
    filters={filters}
    setFilters={setFilters}
    setShowFilters={setShowFilters}
  />
)}

      {videoCall && <VideoCallView />}
    </div>
  );
};

export default LegitiMateApp;