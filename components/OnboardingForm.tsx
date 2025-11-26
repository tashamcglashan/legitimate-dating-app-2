"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

// ----------------------
// FORM SHAPE
// ----------------------
type FormShape = {
  name: string;
  age: string;
  sex: string;
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
  photos: string[];
  verified: boolean;
};

// ----------------------
// DEFAULT FORM
// ----------------------
const DEFAULT_FORM: FormShape = {
  name: "",
  age: "",
  sex: "",
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

// ----------------------
// OPTIONS
// ----------------------
const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "Other"];
const US_STATES = [ "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana",
  "Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana",
  "Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","Other" ];
const SEX = ["Male", "Female", "Non-binary", "Other"];
const LANGUAGES = ["English","Spanish","French","German","Mandarin","Cantonese","Hindi","Arabic",
  "Portuguese","Russian","Japanese","Korean","Italian","Tagalog","Vietnamese","Other"];
const HEIGHTS = ["4'10\"","4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"",
  "5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\"","6'3\"","6'4\"","6'5\"","6'6\"","Other"];
const DENOMINATIONS = ["Non-religious","Christian","Catholic","Protestant","Muslim","Jewish","Hindu","Buddhist","Spiritual","Other"];
const DIETARY = ["No preference","Vegetarian","Vegan","Pescatarian","Halal","Kosher","Gluten-free","Other"];
const PETS = ["No pets","Cat person","Dog person","Both cats & dogs","All animals lover","Allergic","Other"];
const FAMILY_PLANS = ["Want children","Don’t want children","Open to children","Undecided"];
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

  // ----------------------
  // ADD PHOTO (BASE64)
  // ----------------------
  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...form.photos];
      updated[index] = reader.result as string;
      update("photos", updated);
    };
    reader.readAsDataURL(file);
  };

  // ----------------------
  // NEXT BUTTON VALIDATION
  // ----------------------
  const next = () => {
    if (step === 1) {
      if (!form.name.trim()) return alert("Please enter your name.");
      if (!form.age.trim()) return alert("Please enter your age.");
      if (!form.sex.trim()) return alert("Please select your sex.");
      if (!form.location.trim()) return alert("Please enter your city.");
      if (!form.country) return alert("Please select your country.");
      if (!form.state) return alert("Please select your state.");
    }

    if (step === 2) {
      if (!form.languages.length) return alert("Please choose at least one language.");
      if (!form.height) return alert("Please select your height.");
      if (!form.denomination) return alert("Please select a denomination.");
      if (!form.dietary) return alert("Please select dietary preference.");
      if (!form.pets) return alert("Please select a pets preference.");
    }

    if (step === 3) {
      if (!form.familyPlans) return alert("Select family plans.");
      if (!form.education) return alert("Select education.");
      if (!form.bio.trim()) return alert("Please write a short bio.");
    }

    setStep((s) => Math.min(4, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  // ----------------------
  // ENTER KEY HANDLING
  // ----------------------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const isTextArea = (e.target as HTMLElement).tagName.toLowerCase() === "textarea";
    if (!isTextArea && e.key === "Enter") {
      e.preventDefault();
      if (step < 4) next();
    }
  };

  // ----------------------
  // SUBMIT FINAL FORM
  // ----------------------
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (step < 4) {
      next();
      return;
    }

    if (form.photos.length < 1) {
      alert("Please upload at least one photo.");
      return;
    }

    setOnboarding({ ...form, verified: true });
    router.push("/profile");
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow space-y-6"
    >
      <h1 className="text-black text-2xl font-bold">Onboarding</h1>
      <p className="text-black">Tell us a bit about yourself.</p>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1,2,3,4].map((n) => (
          <div
            key={n}
            className={`h-2 flex-1 rounded-full ${n <= step ? "bg-pink-600" : "bg-gray-200"}`}
          />
        ))}
      </div>

      {/* ---------------------- */}
      {/* STEP 1 */}
      {/* ---------------------- */}
      {step === 1 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-black">Name</label>
            <input className="w-full border rounded-lg px-3 py-2 text-black" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>

          <div>
            <label className="text-black">Age</label>
            <input className="w-full border rounded-lg px-3 py-2 text-black" value={form.age} onChange={(e) => update("age", e.target.value)} />
          </div>

          <div>
            <label className="text-black">Sex</label>
            <select className="w-full border rounded-lg px-3 py-2 text-black bg-white" value={form.sex} onChange={(e) => update("sex", e.target.value)}>
              <option value="">Select</option>
              {SEX.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-black">Location</label>
            <input className="w-full border rounded-lg px-3 py-2 text-black" value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>

          <div>
            <label className="text-black">Country</label>
            <select className="w-full border rounded-lg px-3 py-2 text-black bg-white" value={form.country} onChange={(e) => update("country", e.target.value)}>
              <option value="">Select</option>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-black">State/Region</label>
            <select className="w-full border rounded-lg px-3 py-2 text-black bg-white" value={form.state} onChange={(e) => update("state", e.target.value)}>
              <option value="">Select</option>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ---------------------- */}
      {/* STEP 2 */}
      {/* ---------------------- */}
      {step === 2 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-black">Languages</label>
            <select multiple size={6} className="w-full border rounded-lg px-3 py-2 text-black bg-white" value={form.languages}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                update("languages", selected);
              }}>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="text-black">Height</label>
            <select className="w-full border rounded-lg px-3 py-2 text-black bg-white" value={form.height} onChange={(e) => update("height", e.target.value)}>
              <option value="">Select height</option>
              {HEIGHTS.map((h) => <option key={h}>{h}</option>)}
            </select>
          </div>

          <div>
            <label className="text-black">Denomination</label>
            <select className="w-full border rounded-lg px-3 py-2 text-black bg-white" value={form.denomination} onChange={(e) => update("denomination", e.target.value)}>
              <option value="">Select</option>
              {DENOMINATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-black">Dietary</label>
            <select className="w-full border rounded-lg px-3 py-2 text-black bg-white" value={form.dietary} onChange={(e) => update("dietary", e.target.value)}>
              <option value="">Select</option>
              {DIETARY.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-black">Pets</label>
            <select className="w-full border rounded-lg px-3 py-2 text-black bg-white" value={form.pets} onChange={(e) => update("pets", e.target.value)}>
              <option value="">Select</option>
              {PETS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ---------------------- */}
      {/* STEP 3 */}
      {/* ---------------------- */}
      {step === 3 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-black">Family Plans</label>
            <select className="w-full border rounded-lg px-3 py-2 text-black bg-white" value={form.familyPlans} onChange={(e) => update("familyPlans", e.target.value)}>
              <option value="">Select</option>
              {FAMILY_PLANS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="text-black">Education</label>
            <select className="w-full border rounded-lg px-3 py-2 text-black bg-white"value={form.education}onChange={(e) => update("education", e.target.value)}>
              <option value="">Select</option>
              {EDUCATION.map((ed) => <option key={ed}>{ed}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-black">Ethnicity</label>
            <select className="w-full border rounded-lg px-3 py-2 text-black bg-white" value={form.ethnicity} onChange={(e) => update("ethnicity", e.target.value)}>
              <option value="">Select</option>
              {ETHNICITIES.map((eth) => <option key={eth}>{eth}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-black">Bio</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-black h-28" value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>
        </div>
      )}

      {/* ---------------------- */}
      {/* STEP 4 — HINGE-STYLE PHOTOS */}
      {/* ---------------------- */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold text-black mb-4">Add Your Photos</h2>
          <p className="text-gray-600 mb-4">Add up to 6 photos. Tap a box to upload.</p>

          <div className="grid grid-cols-3 gap-4">
            {[0,1,2,3,4,5].map((idx) => {
              const photo = form.photos[idx];

              return (
                <div key={idx} className="relative">
                  {photo ? (
                    <div className="relative">
                      <img
                        src={photo}
                        alt="Uploaded"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...form.photos];
                          updated.splice(idx, 1);
                          update("photos", updated);
                        }}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById(`photo-input-${idx}`)?.click()}
                      className="w-full h-32 border border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
                    >
                      + Add
                    </button>
                  )}

                  <input
                    id={`photo-input-${idx}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAddPhoto(e, idx)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className={`px-5 py-2 rounded-lg font-semibold bg-pink-600 text-white hover:bg-pink-700 ${
            step === 1 ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          Back
        </button>

        {step < 4 ? (
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
