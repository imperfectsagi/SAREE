"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminButton } from "@/components/admin/ui";

export function BlogRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this blog post?")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
      <Link href={`/admin/blog/${id}`}>
        <AdminButton size="sm" variant="secondary">
          Edit
        </AdminButton>
      </Link>
      <AdminButton size="sm" variant="danger" onClick={handleDelete} disabled={loading}>
        Delete
      </AdminButton>
    </div>
  );
}
