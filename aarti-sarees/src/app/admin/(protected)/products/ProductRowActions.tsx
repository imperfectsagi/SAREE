"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminButton } from "@/components/admin/ui";

export function ProductRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product permanently? This cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
      <Link href={`/admin/products/${id}`}>
        <AdminButton size="sm" variant="secondary">
          Edit
        </AdminButton>
      </Link>
      <AdminButton size="sm" variant="secondary" onClick={handleDuplicate} disabled={loading}>
        Duplicate
      </AdminButton>
      <AdminButton size="sm" variant="danger" onClick={handleDelete} disabled={loading}>
        Delete
      </AdminButton>
    </div>
  );
}
