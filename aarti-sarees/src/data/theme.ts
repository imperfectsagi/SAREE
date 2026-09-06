// Centralized theme configuration
// Admin panel can later override these values dynamically

export type ThemeConfig = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  button: string;
  buttonText: string;
  success: string;
  error: string;
  warning: string;
  // Extended tokens for full admin theme control
  header: string;
  footer: string;
  card: string;
  sale: string;
  badge: string;
  links: string;
  overlay: string;
};

// Premium Indian ethnic palette - Deep maroon + gold
export const defaultTheme: ThemeConfig = {
  primary: "#8B1E3F",      // Deep rose/maroon
  secondary: "#4A1942",    // Deep purple
  accent: "#C9A227",       // Rich gold
  background: "#FDF8F5",   // Warm cream
  surface: "#FFFFFF",
  text: "#1A1210",         // Near black warm
  muted: "#6B5B54",        // Warm gray
  border: "#E8DED6",
  button: "#8B1E3F",
  buttonText: "#FFFFFF",
  success: "#2E7D32",
  error: "#C62828",
  warning: "#F9A825",
  header: "#FFFFFF",
  footer: "#4A1942",
  card: "#FFFFFF",
  sale: "#C62828",
  badge: "#C9A227",
  links: "#8B1E3F",
  overlay: "rgba(0,0,0,0.4)",
};

// Generate supporting colors from primary (simple algorithm for demo)
export function generatePalette(primaryHex: string): Partial<ThemeConfig> {
  // For production admin panel, use a proper color library
  // This is a simple demo that keeps the gold accent and adjusts backgrounds
  return {
    primary: primaryHex,
    button: primaryHex,
    // Keep elegant supporting colors
  };
}

export function applyTheme(theme: ThemeConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}
