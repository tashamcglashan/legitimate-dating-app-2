"use client";

import { OnboardingData } from "@/context/AppContext";
import {
  Check,
  MapPin,
  Globe,
  User,
  Ruler,
  HeartHandshake,
  PawPrint,
  BookOpen,
  GraduationCap,
} from "lucide-react";

type ProfileCardProps = {
  onboarding: OnboardingData;
};

export default function ProfileCard({ onboarding }: ProfileCardProps) {
  const {
    name,
    age,
    location,
    country,
    state,
    languages = [],
    height,
    denomination,
    dietary,
    pets,
    familyPlans,
    education,
    bio,
    verified,
  } = onboarding;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {name}
            <span className="ml-2 text-gray-500 text-xl">{age}</span>
          </h1>
          <p className="flex items-center gap-2 text-gray-600 mt-2">
            <MapPin size={18} className="text-pink-600" />
            {[location, state, country].filter(Boolean).join(", ")}
          </p>
        </div>

        {verified && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm">
            <Check size={16} />
            Verified
          </div>
        )}
      </div>

      {/* Bio */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">About Me</h2>
        <p className="text-gray-700 leading-relaxed">
          {bio || "Tell others a little about yourself…"}
        </p>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* Details */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Detail label="Languages" value={languages.join(", ")} icon={<Globe size={18} />} />
        <Detail label="Height" value={height} icon={<Ruler size={18} />} />
        <Detail label="Denomination" value={denomination} icon={<BookOpen size={18} />} />
        <Detail label="Dietary Preference" value={dietary} icon={<HeartHandshake size={18} />} />
        <Detail label="Pets" value={pets} icon={<PawPrint size={18} />} />
        <Detail label="Family Plans" value={familyPlans} icon={<HeartHandshake size={18} />} />
        <Detail label="Education" value={education} icon={<GraduationCap size={18} />} />
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
        {icon} {label}
      </p>
      <p className="text-gray-800 font-medium">{value || "—"}</p>
    </div>
  );
}
