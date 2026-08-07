import { createFileRoute } from "@tanstack/react-router";
import { PackageSearch, Receipt, Wallet } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/student")({
  head: () => ({
    meta: [
      { title: "Your TILETA dashboard" },
      { name: "description", content: "Track your campus orders, wallet and deliveries." },
      { property: "og:title", content: "Your TILETA dashboard" },
      { property: "og:description", content: "Track your campus orders and wallet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <AppShell
      title={`Hi ${firstName}`}
      subtitle="Your orders, wallet and deliveries in one place."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Wallet balance"
          value={formatCurrency(profile?.wallet_balance ?? 0)}
        />
        <StatCard icon={Receipt} label="Active orders" value="0" />
        <StatCard icon={PackageSearch} label="Completed orders" value="0" />
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-8 text-center">
        <PackageSearch className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-semibold">No orders yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Browsing and checkout land in the next build step.
        </p>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
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
