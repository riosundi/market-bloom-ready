import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { getProducts } from "@/lib/orders.functions";
import { formatCurrency } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/student")({
  head: () => ({
    meta: [
      { title: "Marketplace — TILETA" },
      { name: "description", content: "Browse campus businesses and order essentials." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["products"],
      queryFn: () => getProducts(),
    });
  },
  component: StudentDashboard,
});

function StudentDashboard() {
  const { data: products } = useSuspenseQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const { addItem, items } = useCart();

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <AppShell
      title="Marketplace"
      subtitle="Everything you need, delivered straight to your door."
      actions={
        <Button variant="outline" className="relative" asChild>
          <Link to="/checkout">
            <ShoppingCart className="h-4 w-4" />
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {items.length}
              </span>
            )}
          </Link>
        </Button>
      }
    >
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
