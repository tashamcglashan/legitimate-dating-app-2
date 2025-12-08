"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // The token Supabase sends in the email URL
  const token = searchParams.get("token");
  const type = searchParams.get("type"); // should be "recovery"

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // If no token → user can't reset password
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

    setError("");
    setMessage("Updating your password…");

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
      setMessage("");
      return;
    }

    setMessage("Password updated! Redirecting to login…");

    setTimeout(() => {
      router.push("/auth/sign-in");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EDF6F9] p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-2xl font-bold text-center text-black mb-4">
          Reset Your Password
        </h1>

        {error && (
          <p className="text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded mb-4">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded mb-4">
            {message}
          </p>
        )}

        {!error && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-lg text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full p-3 border rounded-lg text-black"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 cursor-pointer"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
