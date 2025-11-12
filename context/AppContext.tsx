"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type OnboardingData = {
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
  photos: string[];   // ← store as base64 data URLs so it survives reload
  verified: boolean;
};

type AppState = {
  onboarding: OnboardingData;
  setOnboarding: (d: OnboardingData) => void;
  isVerified: boolean;
};

const DEFAULT_FORM: OnboardingData = {
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
  photos: [],        // ← start empty
  verified: false,
};

const AppCtx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarding, setOnboarding] = useState<OnboardingData>(DEFAULT_FORM);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("onboarding");
      if (raw) {
        const parsed = JSON.parse(raw);
        setOnboarding({ ...DEFAULT_FORM, ...parsed });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("onboarding", JSON.stringify(onboarding));
    } catch {}
  }, [onboarding]);

  return (
    <AppCtx.Provider value={{ onboarding, setOnboarding }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
