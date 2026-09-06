import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "sale" | "new" | "bestseller" | "limited" | "stock";

const styles: Record<BadgeVariant, string> = {
  default: "bg-[var(--primary)] text-white",
  sale: "bg-[var(--error)] text-white",
  new: "bg-[var(--secondary)] text-white",
  bestseller: "bg-[var(--accent)] text-[var(--text)]",
  limited: "bg-[#1A1210] text-white",
  stock: "bg-[var(--success)] text-white",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-sm",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function badgeVariantFromLabel(
  label?: string
): BadgeVariant {
  if (!label) return "default";
  const l = label.toLowerCase();
  if (l === "sale") return "sale";
  if (l === "new") return "new";
  if (l === "bestseller") return "bestseller";
  if (l === "limited") return "limited";
  return "default";
}
