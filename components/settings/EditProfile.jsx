"use client";
import React, { useState } from "react";

const EditProfile = ({ user, setUser, onBack }) => {
  // 1) start with the user’s current values (fallbacks if null)
  const [form, setForm] = useState({
    name: user?.name || "",
    age: user?.age || "",
    country: user?.country || "",
    state: user?.state || "",
    height: user?.height || "",
    denomination: user?.denomination || "",
    dietary: user?.dietary || "",
    pets: user?.pets || "",
    familyPlans: user?.familyPlans || "",
    education: user?.education || "",
    bio: user?.bio || "",
    interests: Array.isArray(user?.interests) ? user.interests : [],
    photos: Number.isInteger(user?.photos) ? user.photos : 0,
  });

  // simple “add interest” helper
  const [newInterest, setNewInterest] = useState("");

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const addInterest = () => {
    const v = newInterest.trim();
    if (!v) return;
    setForm((f) => ({ ...f, interests: [...f.interests, v] }));
    setNewInterest("");
  };

  const removeInterest = (i) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.filter((_, idx) => idx !== i),
    }));
  };

  const save = () => {
    // merge back into app-level user
    setUser((u) => ({
      ...(u || { id: "user1", verified: !!user?.verified, botScore: 0.01 }),
      ...form,
    }));
    onBack(); // go back to Settings
  };

  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button
            onClick={onBack}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.name}
                onChange={update("name")}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                value={form.age}
                onChange={update("age")}
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.country}
                onChange={update("country")}
                placeholder="USA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                State/Province
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.state}
                onChange={update("state")}
                placeholder="California"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.height}
                onChange={update("height")}
                placeholder={`5'6"`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Education
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.education}
                onChange={update("education")}
                placeholder="Bachelors Degree"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Religion</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.denomination}
                onChange={update("denomination")}
                placeholder="Non-religious"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Diet</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.dietary}
                onChange={update("dietary")}
                placeholder="Vegetarian"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pets</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.pets}
                onChange={update("pets")}
                placeholder="Dog lover"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Family Plans
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.familyPlans}
                onChange={update("familyPlans")}
                placeholder="Want children"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border rounded-lg"
              value={form.bio}
              onChange={update("bio")}
              placeholder="Tell people about you…"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium mb-2">Interests</label>
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 px-3 py-2 border rounded-lg"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
              />
              <button
                onClick={addInterest}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.interests.map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeInterest(i)}
                    className="text-pink-700 hover:opacity-70"
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Photos (simple counter for now) */}
          <div>
            <label className="block text-sm font-medium mb-1">Photos</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setForm((f) => ({ ...f, photos: Math.max(0, f.photos - 1) }))
                }
                className="px-3 py-2 border rounded-lg"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center font-semibold">
                {form.photos}
              </span>
              <button
                onClick={() =>
                  setForm((f) => ({ ...f, photos: f.photos + 1 }))
                }
                className="px-3 py-2 border rounded-lg"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              (Hook up real uploads later — this just updates your count.)
            </p>
          </div>

          {/* Save */}
          <div className="pt-2">
            <button
              onClick={save}
              className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
