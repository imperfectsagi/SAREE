"use client";

import { useEffect, useState } from "react";
import { AdminButton, AdminCard, AdminInput, AdminSelect, AdminBadge } from "@/components/admin/ui";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor";
  is_active: number;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "", password: "", role: "editor" as UserRow["role"] });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/users")
      .then((r) => r.json() as Promise<{ users: UserRow[] } | { error: string }>)
      .then((data) => {
        if ("users" in data) setUsers(data.users);
        else setError(data.error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const addUser = async () => {
    setError(null);
    if (!draft.name.trim() || !draft.email.trim() || !draft.password) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to create user");
        return;
      }
      setDraft({ name: "", email: "", password: "", role: "editor" });
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: UserRow) => {
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: u.name, role: u.role, isActive: u.is_active !== 1 }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      alert(data.error || "Failed to update");
      return;
    }
    load();
  };

  const changeRole = async (u: UserRow, role: UserRow["role"]) => {
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: u.name, role, isActive: u.is_active === 1 }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      alert(data.error || "Failed to update");
      return;
    }
    load();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user account?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      alert(data.error || "Failed to delete");
      return;
    }
    load();
  };

  if (loading) return <p style={{ color: "var(--admin-text-muted)" }}>Loading…</p>;

  if (error && users.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Users</h1>
        <div style={{ background: "var(--admin-danger-light)", color: "var(--admin-danger)", padding: 14, borderRadius: 8, fontSize: 13.5 }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Users</h1>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 20 }}>
        Manage admin accounts and roles. Only Super Admins can access this page.
      </p>

      <AdminCard title="Add User">
        {error && (
          <div style={{ background: "var(--admin-danger-light)", color: "var(--admin-danger)", padding: "8px 12px", borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px", gap: 10, marginBottom: 12 }}>
          <AdminInput placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <AdminInput placeholder="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          <AdminInput placeholder="Password (min 10 chars)" type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
          <AdminSelect value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRow["role"] })}>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </AdminSelect>
        </div>
        <AdminButton onClick={addUser} disabled={saving}>
          {saving ? "Creating…" : "Add User"}
        </AdminButton>
      </AdminCard>

      <div style={{ height: 20 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {users.map((u) => (
          <AdminCard
            key={u.id}
            actions={
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {u.is_active === 1 ? <AdminBadge tone="success">Active</AdminBadge> : <AdminBadge tone="danger">Inactive</AdminBadge>}
                <AdminButton size="sm" variant="secondary" onClick={() => toggleActive(u)}>
                  {u.is_active === 1 ? "Deactivate" : "Activate"}
                </AdminButton>
                <AdminButton size="sm" variant="danger" onClick={() => deleteUser(u.id)}>
                  Delete
                </AdminButton>
              </div>
            }
          >
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{u.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--admin-text-muted)", marginBottom: 8 }}>{u.email}</div>
            <AdminSelect
              value={u.role}
              onChange={(e) => changeRole(u, e.target.value as UserRow["role"])}
              style={{ width: 160 }}
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </AdminSelect>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
