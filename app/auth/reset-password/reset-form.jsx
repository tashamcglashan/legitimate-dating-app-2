"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
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

    const { error: resetError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Password updated! Redirecting to sign in…");
    setTimeout(() => router.push("/auth/sign-in"), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-black">Reset Password</h1>

        {error && <p className="text-red-600 mb-3">{error}</p>}
        {message && <p className="text-green-600 mb-3">{message}</p>}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-black">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-lg text-black"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-black">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-2 border rounded-lg text-black"
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
