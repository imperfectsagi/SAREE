"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BusinessSettings } from "@/lib/repo/settings";

const BusinessSettingsContext = createContext<BusinessSettings | null>(null);

export function BusinessSettingsProvider({
  value,
  children,
}: {
  value: BusinessSettings;
  children: ReactNode;
}) {
  return (
    <BusinessSettingsContext.Provider value={value}>
      {children}
    </BusinessSettingsContext.Provider>
  );
}

/** Reads business info (name, phone, WhatsApp, address, etc.) as set in
 * Admin → Settings. Must be used within BusinessSettingsProvider (already
 * wraps the whole app in the root layout). */
export function useBusinessSettings(): BusinessSettings {
  const ctx = useContext(BusinessSettingsContext);
  if (!ctx) {
    throw new Error(
      "useBusinessSettings must be used within BusinessSettingsProvider"
    );
  }
  return ctx;
}
