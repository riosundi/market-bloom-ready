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

export const CATEGORIES = [
  "Food",
  "Groceries",
  "Study Materials",
  "Electronics",
  "Fashion",
] as const;

export const DELIVERY_FEE = 500;
export const COMMISSION_RATE = 0.1;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
