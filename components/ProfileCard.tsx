"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import { Check, Heart } from "lucide-react";

export default function ProfileCard() {
  const { profiles } = useApp();

  // 🧠 if there are no profiles yet, show an empty state
  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-center text-gray-500 p-10 border rounded-xl shadow-sm bg-white">
        No profiles yet. Once you verify your account and set your preferences, 
        potential matches will appear here.
      </div>
    );
  }

  // 🧱 display real profiles when data exists
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          {/* Photo placeholder */}
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Profile Photo</span>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{profile.name}</h3>
              {profile.verified && (
                <Check className="w-5 h-5 text-green-500" title = "Verified" />
              )}
            </div>
            <p className="text-gray-600">
              {profile.age} • {profile.location}
            </p>

            {profile.bio && (
              <p className="text-gray-500 text-sm mt-2 line-clamp-3">
                {profile.bio}
              </p>
            )}

            {/* Example "Like" button */}
            <button className="mt-4 w-full bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" /> Like
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
