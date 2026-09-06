"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          router.push(`/search?q=${encodeURIComponent(value.trim())}`);
        }
      }}
      className="flex gap-2 max-w-xl"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search sarees, suits, fabrics..."
        className="flex-1 px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
      />
      <button
        type="submit"
        className="px-5 py-2.5 rounded-[var(--radius-sm)] bg-[var(--primary)] text-white font-medium hover:opacity-90 transition"
      >
        Search
      </button>
    </form>
  );
}
