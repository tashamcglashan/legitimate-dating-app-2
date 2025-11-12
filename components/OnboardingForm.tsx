"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

// Local form shape (kept simple and in sync with your context)
type FormShape = {
  name: string;
  age: string;
  location: string;
  country: string;
  state: string;
  languages: string[];
  height: string;
  denomination: string;
  dietary: string;
  pets: string;
  familyPlans: string;
  education: string;
  ethnicity: string;
  bio: string;
  photos: string[];      // context stores string[]; form doesn't edit here
  verified: boolean;
};

const DEFAULT_FORM: FormShape = {
  name: "",
  age: "",
  location: "",
  country: "",
  state: "",
  languages: [],
  height: "",
  denomination: "",
  dietary: "",
  pets: "",
  familyPlans: "",
  education: "",
  ethnicity: "",
  bio: "",
  photos: [],
  verified: false,
};

// Dropdown option sets (starter lists; expand anytime)
const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "Other"];
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana",
  "Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana",
  "Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","Other"
];
const LANGUAGES = [
  "English","Spanish","French","German","Mandarin","Cantonese","Hindi","Arabic",
  "Portuguese","Russian","Japanese","Korean","Italian","Tagalog","Vietnamese","Other"
];
const HEIGHTS = [
  "4'10\"","4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"",
  "5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\"","6'3\"","6'4\"","6'5\"","6'6\"","Other"
];
const DENOMINATIONS = [
  "Non-religious","Christian","Catholic","Protestant","Muslim","Jewish","Hindu","Buddhist","Spiritual","Other"
];
const DIETARY = [
  "No preference","Vegetarian","Vegan","Pescatarian","Halal","Kosher","Gluten-free","Other"
];
const PETS = [
  "No pets","Cat person","Dog person","Both cats & dogs","All animals lover","Allergic","Other"
];
const FAMILY_PLANS = [
  "Want children","Don’t want children","Open to children","Undecided"
];
const EDUCATION = [
  "High School","Some College","Associate Degree","Bachelor’s Degree","Masters Degree","Doctorate","Trade/Bootcamp","Other"
];
const ETHNICITIES = [
  "Black","White","Hispanic/Latino","Asian","Middle Eastern/North African","Native American/Alaska Native",
  "Pacific Islander","Mixed","Other","Prefer not to say"
];

export default function OnboardingForm() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useApp();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormShape>({ ...DEFAULT_FORM, ...(onboarding || {}) });

  const update = (k: keyof FormShape, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  // Handle multi-select languages
  const onLanguagesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected: string[] = Array.from(e.target.selectedOptions).map((o) => o.value);
    update("languages", selected);
  };

  // ⬇️ Prevent Enter from submitting early on steps 1–2
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    const isTextArea = target.tagName.toLowerCase() === "textarea";
    if (!isTextArea && e.key === "Enter") {
      e.preventDefault();
      if (step < 3) next();
    }
  };

  // Only finish on step 3
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (step < 3) {
      next();
      return;
    }

    // Final step (3): minimal validation + save + go
    if (!form.familyPlans) return alert("Please choose your family plans.");
    if (!form.education) return alert("Please choose your education.");
    if (!form.bio.trim()) return alert("Please write a short bio.");

    setOnboarding({ ...form, verified: true });
    router.push("/profile");
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow space-y-6"
    >
      <h1 className="text-2xl font-bold">Onboarding</h1>
      <p className="text-gray-600">Tell us a bit about yourself.</p>

      {/* progress bar */}
      <div className="flex items-center gap-2">
        {[1,2,3].map((n) => (
          <div
            key={n}
            className={`h-2 flex-1 rounded-full ${n <= step ? "bg-pink-600" : "bg-gray-200"}`}
          />
        ))}
      </div>

      {/* STEP 1: Basics */}
      {step === 1 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
              placeholder="28"
              inputMode="numeric"
            />
          </div>

          {/* Location */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="City"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* State/Region */}
          <div>
            <label className="block text-sm font-medium mb-1">State/Region</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            >
              <option value="">Select state/region</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* STEP 2: Preferences */}
      {step === 2 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Languages (multi-select) */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Languages <span className="text-gray-400">(Cmd/Ctrl-click for multiple)</span>
            </label>
            <select
              multiple
              size={6}
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.languages}
              onChange={onLanguagesChange}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium mb-1">Height</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.height}
              onChange={(e) => update("height", e.target.value)}
            >
              <option value="">Select height</option>
              {HEIGHTS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Denomination */}
          <div>
            <label className="block text-sm font-medium mb-1">Denomination</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.denomination}
              onChange={(e) => update("denomination", e.target.value)}
            >
              <option value="">Select</option>
              {DENOMINATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Dietary */}
          <div>
            <label className="block text-sm font-medium mb-1">Dietary</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.dietary}
              onChange={(e) => update("dietary", e.target.value)}
            >
              <option value="">Select</option>
              {DIETARY.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Pets */}
          <div>
            <label className="block text-sm font-medium mb-1">Pets</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.pets}
              onChange={(e) => update("pets", e.target.value)}
            >
              <option value="">Select</option>
              {PETS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* STEP 3: More about you */}
      {step === 3 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Family Plans */}
          <div>
            <label className="block text-sm font-medium mb-1">Family Plans</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.familyPlans}
              onChange={(e) => update("familyPlans", e.target.value)}
            >
              <option value="">Select</option>
              {FAMILY_PLANS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-medium mb-1">Education</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.education}
              onChange={(e) => update("education", e.target.value)}
            >
              <option value="">Select</option>
              {EDUCATION.map((ed) => (
                <option key={ed} value={ed}>{ed}</option>
              ))}
            </select>
          </div>

          {/* Ethnicity */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Ethnicity</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.ethnicity}
              onChange={(e) => update("ethnicity", e.target.value)}
            >
              <option value="">Select</option>
              {ETHNICITIES.map((eth) => (
                <option key={eth} value={eth}>{eth}</option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 h-28"
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Tell people a little about yourself…"
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          className={`px-5 py-2 rounded-lg font-semibold border ${step === 1 ? "opacity-40 cursor-not-allowed" : ""}`}
          disabled={step === 1}
        >
          Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-700"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            Finish
          </button>
        )}
      </div>
    </form>
  );
}
