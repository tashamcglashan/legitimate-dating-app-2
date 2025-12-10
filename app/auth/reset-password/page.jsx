"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ResetPasswordForm from "./reset-form";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
