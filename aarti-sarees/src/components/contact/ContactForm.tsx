"use client";

import { useState } from "react";
import { buildWhatsAppUrl } from "@/data/business";
import { useBusinessSettings } from "@/context/BusinessSettingsContext";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const business = useBusinessSettings();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const canSubmit = name.trim() && message.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const lines = [
      `Hello ${business.name}! 👋`,
      "",
      `Name: ${name.trim()}`,
      phone.trim() ? `Phone: ${phone.trim()}` : null,
      "",
      message.trim(),
    ].filter((line) => line !== null);

    const url = buildWhatsAppUrl(lines.join("\n"), business.whatsapp);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="name">
          Name <span className="text-[var(--primary)]">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="phone">
          Phone (optional)
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          placeholder="Your phone number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="message">
          Message <span className="text-[var(--primary)]">*</span>
        </label>
        <textarea
          id="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] outline-none focus:ring-2 focus:ring-[var(--primary)]/30 resize-none"
          placeholder="How can we help?"
        />
      </div>
      <Button
        type="submit"
        variant="whatsapp"
        fullWidth
        disabled={!canSubmit}
      >
        Send via WhatsApp
      </Button>
    </form>
  );
}
