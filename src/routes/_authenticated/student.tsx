import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageSearch, Receipt, Wallet } from "lucide-react";
import { Plus, Star, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getStudentOrders } from "@/lib/orders.functions";
import { formatCurrency } from "@/lib/roles";
import { useShopifyCartStore } from "@/stores/shopify-cart";
import { storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

export const Route = createFileRoute("/_authenticated/student")({
  head: () => ({
    meta: [
      { title: "Marketplace | TILETA" },
      { name: "description", content: "Browse featured campus products, hot meals, groceries, and study materials on the TILETA marketplace." },
      { property: "og:title", content: "Marketplace | TILETA" },
      { property: "og:description", content: "Order everything you need on campus with fast student delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context }) => {
    // We don't prefetch protected data on the server during SSR 
    // because the session is in the browser's localStorage.
    // useSuspenseQuery in the component will handle the fetch on the client.
  },
  component: StudentDashboard,
});

function StudentDashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  const { data: shopifyProducts, isLoading: productsLoading, error: productsError } = useSuspenseQuery({
    queryKey: ["shopify-products"],
    queryFn: async () => {
      const data = await storefrontApiRequest(`
        query GetProducts {
          products(first: 20) {
            edges {
              node {
                id
                title
                description
                handle
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      availableForSale
                      selectedOptions {
                        name
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `);
      return data?.data?.products?.edges || [];
    },
  });

  const { data: orders } = useSuspenseQuery({
    queryKey: ["student-orders"],
    queryFn: () => getStudentOrders({ data: undefined }),
  });

  const { addItem, isLoading: isCartLoading } = useShopifyCartStore();

  const handleAddToCart = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) {
      toast.error("Product unavailable");
      return;
    }
    
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || []
    });
    toast.success(`${product.node.title} added to cart`);
  };

  return (
    <AppShell
      title={`Hi ${firstName}`}
      subtitle="Everything you need, delivered straight to your door."
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
        {productsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[350px] animate-pulse rounded-2xl bg-muted" />
          ))
        ) : productsError ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">Failed to load products</h3>
            <p className="text-muted-foreground mt-1">Please try refreshing the page.</p>
          </div>
        ) : shopifyProducts?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center rounded-3xl border-2 border-dashed bg-card/50">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">No products found</h3>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
              Your Shopify store is empty. Create a product in the chat by telling me what you'd like to sell!
            </p>
          </div>
        ) : (
          shopifyProducts?.map((product: ShopifyProduct) => (
            <div
              key={product.node.id}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {product.node.images.edges[0]?.node ? (
                  <img
                    src={product.node.images.edges[0].node.url}
                    alt={product.node.images.edges[0].node.altText || product.node.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Shopify Product</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    4.5
                  </span>
                </div>
                <h3 className="mt-1 font-semibold truncate">{product.node.title}</h3>
                <p className="mt-1 line-clamp-2 flex-1 text-xs text-muted-foreground">
                  {product.node.description || "Fresh products delivered from campus stores."}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {formatCurrency(parseFloat(product.node.priceRange.minVariantPrice.amount))}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddToCart(product)}
                    disabled={isCartLoading}
                  >
                    {isCartLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Plus className="mr-1 h-3 w-3" />
                    )}
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
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
