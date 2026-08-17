export type Role = "student" | "agent" | "business" | "admin";

export const ROLES: Role[] = ["student", "agent", "business", "admin"];

/** Roles a visitor may pick during sign-up. Admin is never self-assignable. */
export const SIGNUP_ROLES = ["student", "agent", "business"] as const;

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

export function dashboardPath(role: Role | null | undefined): string {
  switch (role) {
    case "agent":
      return "/agent";
    case "business":
      return "/business";
    case "admin":
      return "/admin";
    default:
      return "/student";
  }
}

/** @deprecated Use database categories from getCategories server function instead */
export const CATEGORIES = [
  "Food",
  "Groceries",
  "Electronics",
  "Fashion",
  "Beauty",
  "Campus Essentials",
  "Drinks",
  "Services",
  "Study Materials",
] as const;


export const DELIVERY_FEE = 15; // K15 delivery fee as example
export const COMMISSION_RATE = 0.1;

export function formatCurrency(amount: number): string {
  return `K${new Intl.NumberFormat("en-ZM", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}
