"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import ProfileCard from "@/components/ProfileCard";

export default function ProfilePage() {
  const { onboarding, isVerified } = useApp();
  const router = useRouter();

  // If user has not finished onboarding / not verified
  if (!onboarding || !isVerified) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-xl mx-auto bg-white rounded-xl p-6 shadow">
          <h1 className="text-xl font-bold mb-2">No profile yet</h1>
          <p className="text-gray-600">
            Let’s finish onboarding so we can build your profile preview.
          </p>
          <a
            href="/onboarding"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-pink-600 text-white"
          >
            Go to Onboarding
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ⭐ FIXED PROP NAME */}
        <ProfileCard onboarding={onboarding} />

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700"
        >
          Start Discovering Matches
        </button>
      </div>
    </main>
  );
}
