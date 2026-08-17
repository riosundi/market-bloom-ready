import { createFileRoute } from "@tanstack/react-router";
import { 
  Bike, 
  ShieldCheck, 
  Store, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight,
  Settings,
  Layers
} from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/roles";
import { getCategories, getPlatformSettings } from "@/lib/products/products.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | TILETA" },
      {
        name: "description",
        content: "Oversee users, stores, riders and platform activity on TILETA.",
      },
      { property: "og:title", content: "Admin Dashboard | TILETA" },
      {
        property: "og:description",
        content: "Oversee users, stores, riders and platform activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: categories } = useSuspenseQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getCategories(),
  });

  const { data: settings } = useSuspenseQuery({
    queryKey: ["admin-settings"],
    queryFn: () => getPlatformSettings(),
  });

  // Fetch platform stats
  const { data: stats } = useSuspenseQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: userCount },
        { count: businessCount },
        { count: agentCount },
        { count: orderCount },
        { data: transactions }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: 'exact', head: true }),
        supabase.from("businesses").select("*", { count: 'exact', head: true }),
        supabase.from("user_roles").select("*", { count: 'exact', head: true }).eq("role", "agent"),
        supabase.from("orders").select("*", { count: 'exact', head: true }),
        supabase.from("transactions").select("amount")
      ]);

      const totalVolume = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        users: userCount || 0,
        businesses: businessCount || 0,
        agents: agentCount || 0,
        orders: orderCount || 0,
        volume: totalVolume
      };
    }
  });

  return (
    <AppShell 
      title="Admin dashboard" 
      subtitle="Platform-wide oversight and moderation."
      actions={
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" /> System Config
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Users} label="Total Users" value={stats.users.toString()} />
        <Stat icon={Store} label="Active Stores" value={stats.businesses.toString()} />
        <Stat icon={Bike} label="Active Agents" value={stats.agents.toString()} />
        <Stat icon={TrendingUp} label="Platform Volume" value={formatCurrency(stats.volume)} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Marketplace Categories
            </h2>
            <Button size="sm" variant="ghost">View All</Button>
          </div>
          <div className="rounded-2xl border bg-card divide-y overflow-hidden">
            {categories?.map((cat: any) => (
              <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {cat.name[0]}
                  </div>
                  <div>
                    <p className="font-bold">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.slug}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${cat.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {cat.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Platform Settings
          </h2>
          <div className="rounded-2xl border bg-card divide-y overflow-hidden">
            {settings?.map((s: any) => (
              <div key={s.key} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold capitalize">{s.key.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-primary">
                    {typeof s.value === 'string' ? s.value : JSON.stringify(s.value)}
                  </span>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-bold">Security Notice</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Direct database edits for payments and user roles are restricted. Use the authorized moderation tools to ensure ledger integrity.
              </p>
              <Button size="sm" className="mt-4 rounded-xl">Audit System Logs</Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
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
