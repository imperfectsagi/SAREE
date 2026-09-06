"use client";


import { categories } from "@/data/categories";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type FilterState = {
  subcategory: string;
  priceMin: number;
  priceMax: number;
  color: string;
  size: string;
  fabric: string;
  occasion: string;
  availability: string;
};

export type SortOption =
  | "latest"
  | "price-asc"
  | "price-desc"
  | "featured";

const PRICE_RANGES = [
  { label: "Under ₹3,000", min: 0, max: 3000 },
  { label: "₹3,000 – ₹6,000", min: 3000, max: 6000 },
  { label: "₹6,000 – ₹10,000", min: 6000, max: 10000 },
  { label: "Above ₹10,000", min: 10000, max: 999999 },
];

const COLORS = [
  "Maroon",
  "Gold",
  "Royal Blue",
  "Black",
  "Pink",
  "Ivory",
  "Green",
  "Mustard",
];
const SIZES = ["S", "M", "L", "XL", "XXL", "Free Size"];
const FABRICS = [
  "Pure Banarasi Silk",
  "Kanjeevaram Silk",
  "Georgette",
  "Organza",
  "Cotton",
  "Silk",
  "Velvet",
  "Chiffon",
];
const OCCASIONS = [
  "Wedding",
  "Party",
  "Festive",
  "Daily",
  "Traditional",
  "Office",
];

export function ProductFilters({
  categorySlug,
  filters,
  onChange,
  onClose,
  isMobile = false,
}: {
  categorySlug?: "sarees" | "suits";
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose?: () => void;
  isMobile?: boolean;
}) {
  const cat = categories.find((c) => c.slug === categorySlug);
  const subs = cat?.subcategories ?? [];

  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const clearAll = () => {
    onChange({
      subcategory: "",
      priceMin: 0,
      priceMax: 999999,
      color: "",
      size: "",
      fabric: "",
      occasion: "",
      availability: "",
    });
  };

  return (
    <div className={cn("space-y-6", isMobile && "p-4")}>
      {isMobile && (
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <h3 className="font-semibold">Filters</h3>
          <button onClick={onClose} className="text-sm text-[var(--muted)]">
            Close
          </button>
        </div>
      )}

      {/* Subcategory */}
      {subs.length > 0 && (
        <FilterGroup title="Category">
          <div className="space-y-1.5">
            <FilterChip
              active={!filters.subcategory}
              onClick={() => update({ subcategory: "" })}
              label="All"
            />
            {subs.map((s) => (
              <FilterChip
                key={s.id}
                active={filters.subcategory === s.slug}
                onClick={() => update({ subcategory: s.slug })}
                label={s.name}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Price */}
      <FilterGroup title="Price">
        <div className="space-y-1.5">
          {PRICE_RANGES.map((r) => (
            <FilterChip
              key={r.label}
              active={
                filters.priceMin === r.min && filters.priceMax === r.max
              }
              onClick={() =>
                update({ priceMin: r.min, priceMax: r.max })
              }
              label={r.label}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Color */}
      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() =>
                update({ color: filters.color === c ? "" : c })
              }
              className={cn(
                "px-2.5 py-1 text-xs rounded-full border transition-colors",
                filters.color === c
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border)] hover:border-[var(--primary)]"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Size */}
      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() =>
                update({ size: filters.size === s ? "" : s })
              }
              className={cn(
                "px-2.5 py-1 text-xs rounded-full border transition-colors",
                filters.size === s
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border)] hover:border-[var(--primary)]"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Fabric */}
      <FilterGroup title="Fabric">
        <div className="space-y-1.5">
          {FABRICS.map((f) => (
            <FilterChip
              key={f}
              active={filters.fabric === f}
              onClick={() =>
                update({ fabric: filters.fabric === f ? "" : f })
              }
              label={f}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Occasion */}
      <FilterGroup title="Occasion">
        <div className="flex flex-wrap gap-1.5">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              onClick={() =>
                update({ occasion: filters.occasion === o ? "" : o })
              }
              className={cn(
                "px-2.5 py-1 text-xs rounded-full border transition-colors",
                filters.occasion === o
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border)] hover:border-[var(--primary)]"
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Availability */}
      <FilterGroup title="Availability">
        <div className="space-y-1.5">
          <FilterChip
            active={filters.availability === "in-stock"}
            onClick={() =>
              update({
                availability:
                  filters.availability === "in-stock" ? "" : "in-stock",
              })
            }
            label="In Stock"
          />
          <FilterChip
            active={filters.availability === "low-stock"}
            onClick={() =>
              update({
                availability:
                  filters.availability === "low-stock" ? "" : "low-stock",
              })
            }
            label="Low Stock"
          />
        </div>
      </FilterGroup>

      <Button variant="outline" size="sm" fullWidth onClick={clearAll}>
        Clear All Filters
      </Button>

      {isMobile && (
        <Button fullWidth onClick={onClose}>
          Show Results
        </Button>
      )}
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2.5">{title}</h4>
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full text-left px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors",
        active
          ? "bg-[var(--primary)] text-white"
          : "hover:bg-[var(--background)] text-[var(--text)]"
      )}
    >
      {label}
    </button>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="text-sm border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-2 bg-[var(--surface)] outline-none focus:border-[var(--primary)]"
    >
      <option value="latest">Latest</option>
      <option value="featured">Featured</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  );
}
