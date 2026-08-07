import { createFileRoute } from "@tanstack/react-router";
import { Bike, ShieldCheck, Store, Users } from "lucide-react";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — TILETA" },
      {
        name: "description",
        content: "Oversee users, stores, riders and platform activity on TILETA.",
      },
      { property: "og:title", content: "Admin dashboard — TILETA" },
      {
        property: "og:description",
        content: "Oversee users, stores, riders and platform activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <AppShell title="Admin dashboard" subtitle="Platform-wide oversight and moderation.">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Users} label="Users" value="0" />
        <Stat icon={Store} label="Stores" value="0" />
        <Stat icon={Bike} label="Agents" value="0" />
        <Stat icon={ShieldCheck} label="Pending reviews" value="0" />
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-8 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-semibold">Moderation tools coming next</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Store approvals, user management and reporting land in the next build step.
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
  icon: typeof Users;
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
