"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showReset, setShowReset] = useState(false);
const [resetEmail, setResetEmail] = useState("");
const [resetMessage, setResetMessage] = useState("");
const [resetError, setResetError] = useState("");

const handleForgotPassword = async (e) => {
  e.preventDefault();
  setResetMessage("");
  setResetError("");

  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    setResetError(error.message);
    return;
  }

  setResetMessage("Reset link sent! Check your email.");
};


  const handleSignIn = (e) => {
    e.preventDefault();

    const saved = localStorage.getItem("lm_user");

    if (!saved) {
      alert("No account found. Please sign up first.");
      return;
    }

    const userData = JSON.parse(saved);

    // 🚀 Only allow sign-in if the email matches the stored user
    if (userData.email !== email) {
      alert("Email does not match any existing account. Please sign up first.");
      return;
    }

    // 🚀 DO NOT overwrite the stored user
    // Keep the exact onboardingComplete:true state
    localStorage.setItem("lm_user", JSON.stringify(userData));

    router.push("/");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-black">Sign In</h1>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-black">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-lg text-black"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-black">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg text-black"
            />
            <p className="text-right mt-1">
  <button
    type="button"
    onClick={() => setShowReset(true)}
    className="text-pink-600 text-sm font-medium hover:underline"
  >
    Forgot your password?
  </button>
</p>

{showReset && (
  <form
    onSubmit={handleForgotPassword}
    className="mt-4 p-4 border rounded-lg bg-gray-50"
  >
    <label className="block text-sm text-black mb-1">
      Enter your email
    </label>

    <input
      type="email"
      required
      value={resetEmail}
      onChange={(e) => setResetEmail(e.target.value)}
      className="w-full p-2 border rounded-lg text-black mb-3"
    />

    <button
      type="submit"
      className="w-full bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 cursor-pointer"
    >
      Send Reset Link
    </button>

    {resetMessage && (
      <p className="mt-2 text-green-700 text-sm">{resetMessage}</p>
    )}
    {resetError && (
      <p className="mt-2 text-red-700 text-sm">{resetError}</p>
    )}
  </form>
)}


          </div>



          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-black text-sm mt-4">
          Don’t have an account?{" "}
          <a href="/auth/sign-up" className="text-pink-600 font-medium underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
