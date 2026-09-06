"use client";

import { useEffect, useState } from "react";
import { AdminButton, AdminCard, AdminInput, AdminLabel } from "@/components/admin/ui";

type BusinessSettings = {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
  hours: string;
  social: { instagram: string | null; facebook: string | null };
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json() as Promise<{ settings: BusinessSettings }>)
      .then((data) => setSettings(data.settings))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: settings.name,
          business_tagline: settings.tagline,
          business_phone: settings.phone,
          business_whatsapp: settings.whatsapp,
          business_address_line1: settings.address.line1,
          business_address_line2: settings.address.line2,
          business_address_city: settings.address.city,
          business_address_state: settings.address.state,
          business_address_pincode: settings.address.pincode,
          business_hours: settings.hours,
          business_email: settings.email ?? "",
          social_instagram: settings.social.instagram ?? "",
          social_facebook: settings.social.facebook ?? "",
        }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <p style={{ color: "var(--admin-text-muted)" }}>Loading…</p>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 20 }}>
        Business info shown across the storefront (footer, contact page, WhatsApp messages, structured data).
      </p>

      {saved && (
        <div style={{ background: "var(--admin-success-light)", color: "var(--admin-success)", padding: "8px 12px", borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
          Saved.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <AdminCard title="Business Info">
          <AdminLabel>Business Name</AdminLabel>
          <AdminInput value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
          <div style={{ height: 14 }} />
          <AdminLabel>Tagline</AdminLabel>
          <AdminInput value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
          <div style={{ height: 14 }} />
          <AdminLabel>Store Hours</AdminLabel>
          <AdminInput value={settings.hours} onChange={(e) => setSettings({ ...settings, hours: e.target.value })} />
          <div style={{ height: 14 }} />
          <AdminLabel>Email (optional)</AdminLabel>
          <AdminInput
            type="email"
            value={settings.email ?? ""}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            placeholder="Leave blank if none"
          />
        </AdminCard>

        <AdminCard title="Contact & Phone">
          <AdminLabel>Phone (display format)</AdminLabel>
          <AdminInput value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
          <div style={{ height: 14 }} />
          <AdminLabel>WhatsApp Number (digits only, with country code)</AdminLabel>
          <AdminInput
            value={settings.whatsapp}
            onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
            placeholder="919213285214"
          />
          <div style={{ height: 14 }} />
          <AdminLabel>Instagram URL (optional)</AdminLabel>
          <AdminInput
            value={settings.social.instagram ?? ""}
            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, instagram: e.target.value } })}
            placeholder="Leave blank if none"
          />
          <div style={{ height: 14 }} />
          <AdminLabel>Facebook URL (optional)</AdminLabel>
          <AdminInput
            value={settings.social.facebook ?? ""}
            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, facebook: e.target.value } })}
            placeholder="Leave blank if none"
          />
        </AdminCard>

        <AdminCard title="Store Address">
          <AdminLabel>Address Line 1</AdminLabel>
          <AdminInput
            value={settings.address.line1}
            onChange={(e) => setSettings({ ...settings, address: { ...settings.address, line1: e.target.value } })}
          />
          <div style={{ height: 14 }} />
          <AdminLabel>Address Line 2</AdminLabel>
          <AdminInput
            value={settings.address.line2}
            onChange={(e) => setSettings({ ...settings, address: { ...settings.address, line2: e.target.value } })}
          />
          <div style={{ height: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
            <div>
              <AdminLabel>City</AdminLabel>
              <AdminInput
                value={settings.address.city}
                onChange={(e) => setSettings({ ...settings, address: { ...settings.address, city: e.target.value } })}
              />
            </div>
            <div>
              <AdminLabel>State</AdminLabel>
              <AdminInput
                value={settings.address.state}
                onChange={(e) => setSettings({ ...settings, address: { ...settings.address, state: e.target.value } })}
              />
            </div>
            <div>
              <AdminLabel>Pincode</AdminLabel>
              <AdminInput
                value={settings.address.pincode}
                onChange={(e) => setSettings({ ...settings, address: { ...settings.address, pincode: e.target.value } })}
              />
            </div>
          </div>
        </AdminCard>
      </div>

      <div style={{ height: 20 }} />
      <AdminButton onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save Settings"}
      </AdminButton>
    </div>
  );
}
