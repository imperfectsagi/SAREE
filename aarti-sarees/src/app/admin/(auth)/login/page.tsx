"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  background: "var(--admin-surface)",
  border: "1px solid var(--admin-border)",
  borderRadius: "var(--admin-radius)",
  boxShadow: "var(--admin-shadow-md)",
  padding: 32,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 14,
  border: "1px solid var(--admin-border)",
  borderRadius: "var(--admin-radius-sm)",
  outline: "none",
  marginTop: 6,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--admin-text)",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 14,
  fontWeight: 600,
  color: "#fff",
  background: "var(--admin-primary)",
  border: "none",
  borderRadius: "var(--admin-radius-sm)",
  cursor: "pointer",
  marginTop: 18,
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={cardStyle} />}>
      <AdminLoginPageInner />
    </Suspense>
  );
}

function AdminLoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    fetch("/api/auth/setup")
      .then((r) => r.json() as Promise<{ needsSetup?: boolean }>)
      .then((data) => setNeedsSetup(Boolean(data.needsSetup)))
      .catch(() => setNeedsSetup(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div style={cardStyle}>
        <p style={{ color: "var(--admin-text-muted)", fontSize: 14, textAlign: "center" }}>
          Loading…
        </p>
      </div>
    );
  }

  return needsSetup ? (
    <SetupForm onDone={() => setNeedsSetup(false)} />
  ) : (
    <LoginForm
      onSuccess={() => router.push(searchParams.get("next") || "/admin/dashboard")}
    />
  );
}

function LoginForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string; success?: boolean };
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
        Aarti Sarees Admin
      </h1>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 24 }}>
        Sign in to manage your store
      </p>

      {error && (
        <div
          style={{
            background: "var(--admin-danger-light)",
            color: "var(--admin-danger)",
            padding: "8px 12px",
            borderRadius: "var(--admin-radius-sm)",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <label style={labelStyle}>
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="username"
        />
      </label>

      <label style={{ ...labelStyle, display: "block", marginTop: 16 }}>
        Password
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          autoComplete="current-password"
        />
      </label>

      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

function SetupForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 10) {
      setError("Password must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { error?: string; success?: boolean };
      if (!res.ok) {
        setError(data.error || "Setup failed");
        return;
      }
      onDone();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ ...cardStyle, maxWidth: 420 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
        Welcome to Aarti Sarees
      </h1>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 24 }}>
        Create your Super Admin account to get started. This form only
        appears once.
      </p>

      {error && (
        <div
          style={{
            background: "var(--admin-danger-light)",
            color: "var(--admin-danger)",
            padding: "8px 12px",
            borderRadius: "var(--admin-radius-sm)",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <label style={labelStyle}>
        Your Name
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ ...labelStyle, display: "block", marginTop: 16 }}>
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="username"
        />
      </label>

      <label style={{ ...labelStyle, display: "block", marginTop: 16 }}>
        Password
        <input
          type="password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          autoComplete="new-password"
        />
      </label>

      <label style={{ ...labelStyle, display: "block", marginTop: 16 }}>
        Confirm Password
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={inputStyle}
          autoComplete="new-password"
        />
      </label>

      <p style={{ fontSize: 12, color: "var(--admin-text-faint)", marginTop: 10 }}>
        At least 10 characters. Choose something strong — this account has
        full access to your store.
      </p>

      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "Creating account…" : "Create Super Admin Account"}
      </button>
    </form>
  );
}
