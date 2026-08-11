import { createFileRoute } from "@tanstack/react-router";
import { Bike, Coins, MapPin, Package } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/roles";
import { getAgentOrders } from "@/lib/products/products.functions";

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

  const { data: orders } = useSuspenseQuery({
    queryKey: ["agent-orders", profile?.id],
    queryFn: () => getAgentOrders({ data: { agentId: profile?.id || "" } }),
  });

  const activeDeliveries = orders?.filter((o: any) => o.status === "dispatched").length || 0;
  const completedDeliveries = orders?.filter((o: any) => o.status === "delivered").length || 0;

  return (
    <AppShell
      title="Delivery dashboard"
      subtitle="Pick up nearby orders and earn on every drop-off."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Stat icon={Coins} label="Earnings" value={formatCurrency(profile?.wallet_balance ?? 0)} />
        <Stat icon={Bike} label="Active deliveries" value={activeDeliveries.toString()} />
        <Stat icon={MapPin} label="Completed" value={completedDeliveries.toString()} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Available Jobs</h2>
        {orders && orders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {orders.map((order: any) => (
              <div key={order.id} className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Order ID</p>
                    <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                  </div>
                  <span className="capitalize px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Pickup: {order.businesses?.store_name || "Campus Hub"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-primary" />
                    <span>Deliver to: {order.delivery_address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border bg-card p-8 text-center">
            <Bike className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-semibold">No delivery jobs available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New jobs will appear here when they are ready for pickup.
            </p>
          </div>
        )}
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
