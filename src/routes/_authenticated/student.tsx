import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageSearch, Receipt, Wallet } from "lucide-react";
import { Plus, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { createOrder, getProducts, getStudentOrders } from "@/lib/orders.functions";
import { formatCurrency } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/student")({
  head: () => ({
    meta: [
      { title: "Marketplace — TILETA" },
      { name: "description", content: "Browse campus businesses and order essentials." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["products"],
        queryFn: () => getProducts(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["student-orders"],
        queryFn: () => getStudentOrders(),
      }),
    ]);
  },
  component: StudentDashboard,
});

function StudentDashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  const { data: products } = useSuspenseQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const { data: orders } = useSuspenseQuery({
    queryKey: ["student-orders"],
    queryFn: () => getStudentOrders(),
  });

  const { addItem, items: cartItems } = useCart();

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <AppShell
      title={`Hi ${firstName}`}
      subtitle="Everything you need, delivered straight to your door."
      actions={
        <Button variant="outline" className="relative" asChild>
          <Link to="/checkout">
            <ShoppingCart className="h-4 w-4" />
            {cartItems.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {cartItems.length}
              </span>
            )}
          </Link>
        </Button>
      }
    >
      <div className="mb-10 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Wallet balance"
          value={formatCurrency(profile?.wallet_balance ?? 0)}
        />
        <StatCard
          icon={Receipt}
          label="Active orders"
          value={orders.filter((o: any) => o.status !== "delivered" && o.status !== "cancelled").length.toString()}
        />
        <StatCard
          icon={PackageSearch}
          label="Completed orders"
          value={orders.filter((o: any) => o.status === "delivered").length.toString()}
        />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Featured Products</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map((product) => (
          <div
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              {product.is_popular && (
                <div className="absolute left-3 top-3 rounded-full bg-primary/90 px-2 py-1 text-[10px] font-bold text-primary-foreground">
                  POPULAR
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{product.category}</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  {product.rating}
                </span>
              </div>
              <h3 className="mt-1 font-semibold">{product.name}</h3>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
                {product.description || `From ${product.businesses?.store_name}`}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">
                  {formatCurrency(product.price)}
                </span>
                <Button size="sm" onClick={() => handleAddToCart(product)}>
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function StatCard({
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
