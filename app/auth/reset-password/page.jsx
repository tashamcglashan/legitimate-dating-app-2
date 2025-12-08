"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const token = searchParams.get("token");
  const type = searchParams.get("type");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || type !== "recovery") {
      setError("Invalid or expired reset link.");
    }
  }, [token, type]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password updated! Redirecting...");
    setTimeout(() => router.push("/auth/sign-in"), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white shadow-md p-6 rounded-xl border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-black">Reset Password</h1>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {message && <p className="text-green-600 mb-2">{message}</p>}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-black">
              New Password
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded-lg text-black"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-black">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded-lg text-black"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 cursor-pointer"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

// ⭐ Wrapping component to satisfy Next.js requirement
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
