"use client";
import { useApp } from "@/context/AppContext";
import ProfileCard from "@/components/ProfileCard"; // or keep ProfilePreview if you prefer

export default function ProfilePage() {
  const { onboarding } = useApp();

  if (!onboarding) {
    // Nothing saved yet — send them to onboarding
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
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <ProfileCard profile={onboarding} />
      </div>
    </main>
  );
}
