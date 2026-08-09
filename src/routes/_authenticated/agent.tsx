import { createFileRoute } from "@tanstack/react-router";
import { Bike, Coins, MapPin } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/agent")({
  head: () => ({
    meta: [
      { title: "Agent Dashboard | TILETA" },
      {
        name: "description",
        content: "Accept campus delivery jobs and track your earnings.",
      },
      { property: "og:title", content: "Agent Dashboard | TILETA" },
      { property: "og:description", content: "Accept delivery jobs and track earnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgentDashboard,
});

function AgentDashboard() {
  const { profile } = useAuth();

  return (
    <AppShell
      title="Delivery dashboard"
      subtitle="Pick up nearby orders and earn on every drop-off."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Stat icon={Coins} label="Earnings" value={formatCurrency(profile?.wallet_balance ?? 0)} />
        <Stat icon={Bike} label="Active deliveries" value="0" />
        <Stat icon={MapPin} label="Completed" value="0" />
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-8 text-center">
        <Bike className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-semibold">No delivery jobs available</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Job matching and live tracking land in the next build step.
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
  icon: typeof Bike;
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
