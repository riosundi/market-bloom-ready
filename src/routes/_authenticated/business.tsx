import { createFileRoute } from "@tanstack/react-router";
import { Package, ShoppingBag, Store, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { formatCurrency } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/business")({
  head: () => ({
    meta: [
      { title: "Seller dashboard — TILETA" },
      {
        name: "description",
        content: "Manage your campus store products, orders and revenue on TILETA.",
      },
      { property: "og:title", content: "Seller dashboard — TILETA" },
      {
        property: "og:description",
        content: "Manage your store products, orders and revenue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BusinessDashboard,
});

function BusinessDashboard() {
  return (
    <AppShell
      title="Seller dashboard"
      subtitle="Your products, orders and store performance."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={TrendingUp} label="Revenue" value={formatCurrency(0)} />
        <Stat icon={ShoppingBag} label="Orders" value="0" />
        <Stat icon={Package} label="Products" value="0" />
        <Stat icon={Store} label="Store status" value="Pending" />
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-8 text-center">
        <Store className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-semibold">Set up your store</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Store onboarding and product management land in the next build step.
        </p>
      </div>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Store;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
