import { createFileRoute } from "@tanstack/react-router";
import { Package, ShoppingBag, Store, TrendingUp, Plus } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/roles";
import { getSellerOrders } from "@/lib/products/products.functions";

export const Route = createFileRoute("/_authenticated/business")({
  head: () => ({
    meta: [
      { title: "Seller Dashboard | TILETA" },
      {
        name: "description",
        content: "Manage your campus store products, orders and revenue on TILETA.",
      },
      { property: "og:title", content: "Seller Dashboard | TILETA" },
      {
        property: "og:description",
        content: "Manage your store products, orders and revenue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BusinessDashboard,
});

function BusinessDashboard() {
  const { profile } = useAuth();
  
  // We'll need the business ID from the profile or a separate query
  // For now we assume we can fetch it if it exists.
  // In a real app, we'd have a hook like useBusiness()
  const businessId = "00000000-0000-0000-0000-000000000002"; // Placeholder or from profile

  const { data: orders } = useSuspenseQuery({
    queryKey: ["seller-orders", businessId],
    queryFn: () => getSellerOrders({ data: { businessId } }),
  });

  const totalRevenue = orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;

  return (
    <AppShell
      title="Seller dashboard"
      subtitle="Manage your products and orders directly on Shopify."
      actions={
        <Button onClick={() => window.open('https://admin.shopify.com', '_blank')}>
          <Plus className="mr-2 h-4 w-4" /> Go to Shopify Admin
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={TrendingUp} label="Revenue" value={formatCurrency(totalRevenue)} />
        <Stat icon={ShoppingBag} label="Orders" value={orders?.length.toString() || "0"} />
        <Stat icon={Package} label="Products" value="8" />
        <Stat icon={Store} label="Store status" value="Active" />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        {orders && orders.length > 0 ? (
          <div className="rounded-2xl border bg-card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold">Manage Store on Shopify</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Your store data is now synchronized with Shopify. Visit your Shopify Admin panel to manage products, inventory, and fulfill orders.
            </p>
            <Button 
              className="mt-6 rounded-full px-8" 
              onClick={() => window.open('https://admin.shopify.com', '_blank')}
            >
              Open Shopify Admin
            </Button>
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
