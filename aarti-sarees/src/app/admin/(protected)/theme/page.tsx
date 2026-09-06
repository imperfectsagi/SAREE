import { getActiveThemeDb } from "@/lib/repo/theme";
import { ThemeEditor } from "./ThemeEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Theme" };

export default async function AdminThemePage() {
  const theme = await getActiveThemeDb();

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Theme</h1>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 20 }}>
        Customize any color on your storefront using HEX values. Changes apply site-wide immediately after saving.
      </p>
      <ThemeEditor initialTheme={theme} />
    </div>
  );
}
