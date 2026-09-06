"use client";

import type { ReactNode } from "react";

export function AdminButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  size = "md",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const base: React.CSSProperties = {
    fontWeight: 600,
    borderRadius: "var(--admin-radius-sm)",
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    fontSize: size === "sm" ? 12.5 : 13.5,
    padding: size === "sm" ? "6px 10px" : "9px 16px",
    transition: "background 0.15s",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "var(--admin-primary)", color: "#fff" },
    secondary: {
      background: "var(--admin-surface)",
      color: "var(--admin-text)",
      borderColor: "var(--admin-border)",
    },
    danger: { background: "var(--admin-danger)", color: "#fff" },
    ghost: { background: "transparent", color: "var(--admin-text-muted)" },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  );
}

export function AdminInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "8px 10px",
        fontSize: 13.5,
        border: "1px solid var(--admin-border)",
        borderRadius: "var(--admin-radius-sm)",
        outline: "none",
        background: "#fff",
        color: "var(--admin-text)",
        ...props.style,
      }}
    />
  );
}

export function AdminTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        padding: "8px 10px",
        fontSize: 13.5,
        border: "1px solid var(--admin-border)",
        borderRadius: "var(--admin-radius-sm)",
        outline: "none",
        background: "#fff",
        color: "var(--admin-text)",
        fontFamily: "inherit",
        resize: "vertical",
        ...props.style,
      }}
    />
  );
}

export function AdminSelect({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "8px 10px",
        fontSize: 13.5,
        border: "1px solid var(--admin-border)",
        borderRadius: "var(--admin-radius-sm)",
        outline: "none",
        background: "#fff",
        color: "var(--admin-text)",
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}

export function AdminLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: "var(--admin-text)",
          marginBottom: 5,
        }}
      >
        {children}
      </div>
      {hint}
    </label>
  );
}

export function AdminCard({
  children,
  title,
  actions,
}: {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--admin-surface)",
        border: "1px solid var(--admin-border)",
        borderRadius: "var(--admin-radius)",
        boxShadow: "var(--admin-shadow)",
        overflow: "hidden",
      }}
    >
      {(title || actions) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid var(--admin-border)",
          }}
        >
          {title && <h2 style={{ fontSize: 14.5, fontWeight: 700 }}>{title}</h2>}
          {actions}
        </div>
      )}
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

export function AdminBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const tones: Record<string, React.CSSProperties> = {
    neutral: { background: "#f1f2f4", color: "#4b5563" },
    success: { background: "var(--admin-success-light)", color: "var(--admin-success)" },
    warning: { background: "var(--admin-warning-light)", color: "var(--admin-warning)" },
    danger: { background: "var(--admin-danger-light)", color: "var(--admin-danger)" },
  };
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11.5,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 999,
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}
