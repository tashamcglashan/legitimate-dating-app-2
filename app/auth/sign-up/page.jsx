"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";  // correct browser client

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();  // <-- CREATE BROWSER CLIENT HERE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Unable to sign up. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // ⭐ STEP 1 — Create a simple local user object for LegitiMateApp
    if (data?.user) {
      const newUser = {
        id: data.user.id,
        email: data.user.email,
        verified: false,
        onboardingComplete: false,
      };
    
      localStorage.setItem("lm_user", JSON.stringify(newUser));
    }
    
    setMessage("Account created! Redirecting…");
    setIsSubmitting(false);
    
    // ⭐ Go into the app (LegitiMateApp.jsx will show onboarding)
    router.push("/");
  };    
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDF6F9] via-white to-[#FFE5EC] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center mb-3">
            <Heart className="w-6 h-6 text-pink-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Join LegitiMate
          </h1>
          <p className="text-sm text-gray-600 mt-1 text-center">
            Create a free account to start meeting verified matches.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          {message && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
              {message}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-2xl bg-pink-600 text-white py-3.5 text-sm sm:text-base font-semibold shadow-md hover:bg-pink-700 disabled:bg-gray-300 transition cursor-pointer"
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-600">
          <span>Already have an account?</span>
          <Link
            href="/auth/sign-in"
            className="text-pink-600 font-semibold hover:underline cursor-pointer"
          >
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
