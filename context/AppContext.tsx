"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type OnboardingData = {
  name: string;
  age: string;
  sex: string;
  email: string;
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

type AppState = {
  onboarding: OnboardingData | null;
  setOnboarding: (d: OnboardingData | null) => void;
  isVerified: boolean;
  hydrated: boolean;
};

// ⬇️ Make sure this is defined BEFORE AppProvider and BEFORE it’s used
export const EMPTY_FORM: OnboardingData = {
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
  photos: string[],
  verified: false,
};

const AppCtx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarding, setOnboardingState] = useState<OnboardingData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // ✅ Load from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lm_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        // merge with EMPTY_FORM so all fields exist
        setOnboardingState({ ...EMPTY_FORM, ...parsed });
      }
    } catch (err) {
      console.error("Failed to load onboarding from localStorage", err);
    } finally {
      setHydrated(true); // we’re done trying to load
    }
  }, []);

  // ✅ Single function to update + persist
  const setOnboarding = (d: OnboardingData | null) => {
    setOnboardingState(d);
    try {
      if (d) {
        localStorage.setItem("lm_user", JSON.stringify(d));
      } else {
        localStorage.removeItem("lm_user");
      }
    } catch (err) {
      console.error("Failed to save onboarding to localStorage", err);
    }
  };

  const isVerified = !!onboarding?.verified;

  return (
    <AppCtx.Provider value={{ onboarding, setOnboarding, isVerified: onboarding?.verified ?? false, hydrated }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
