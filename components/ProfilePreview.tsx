"use client";
import { useApp } from "@/context/AppContext";

export default function ProfilePreview() {
  const { onboarding } = useApp();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow space-y-4">
      <h1 className="text-2xl font-bold">Profile Preview</h1>
      {!onboarding?.name ? (
        <p className="text-gray-500">No onboarding data yet.</p>
      ) : (
        <div className="space-y-2">
          <div><strong>Name:</strong> {onboarding.name}</div>
          <div><strong>Age:</strong> {onboarding.age}</div>
          <div><strong>Location:</strong> {onboarding.location}</div>
          <div><strong>Country/State:</strong> {onboarding.country} / {onboarding.state}</div>
          <div><strong>Languages:</strong> {onboarding.languages.join(", ")}</div>
          <div><strong>Height:</strong> {onboarding.height}</div>
          <div><strong>Denomination:</strong> {onboarding.denomination}</div>
          <div><strong>Dietary:</strong> {onboarding.dietary}</div>
          <div><strong>Pets:</strong> {onboarding.pets}</div>
          <div><strong>Family Plans:</strong> {onboarding.familyPlans}</div>
          <div><strong>Education:</strong> {onboarding.education}</div>
          <div><strong>Bio:</strong> {onboarding.bio}</div>
          <div><strong>Verified:</strong> {onboarding.verified ? "Yes" : "No"}</div>
        </div>
      )}
      <a href="/" className="inline-block mt-4 text-pink-600 underline">Back to Home</a>
    </div>
  );
}
