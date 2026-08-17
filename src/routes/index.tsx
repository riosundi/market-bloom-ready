import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bike,
  BookOpen,
  Clock,
  Laptop,
  Shirt,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  UtensilsCrossed,
  Wallet,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPath, formatCurrency } from "@/lib/roles";
import { storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import adAsset from "@/assets/tileta-ad.mp4.asset.json";
import logoAsset from "@/assets/tileta-3d-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TILETA — The Smart World Wide Marketplace" },
      {
        name: "description",
        content:
          "Order food, groceries, books, and electronics from campus stores. Fast student delivery and secure payments with TILETA - the smart marketplace for students.",
      },
      { property: "og:title", content: "TILETA — The Smart World Wide Marketplace" },
      {
        property: "og:description",
        content:
          "Join thousands of students ordering essentials from trusted campus businesses. Fast delivery and secure wallet payments.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jun%2024%2C%202026%2C%2007_36_40%20PM-MHcYrD9aIHWuVRyN7fABrcdrF4aYb3.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jun%2024%2C%202026%2C%2007_36_40%20PM-MHcYrD9aIHWuVRyN7fABrcdrF4aYb3.png" },
    ],
  }),
  component: Index,
});

const categories = [
  { name: "Food", icon: UtensilsCrossed, desc: "Hot meals & snacks" },
  { name: "Groceries", icon: ShoppingCart, desc: "Daily essentials" },
  { name: "Study Materials", icon: BookOpen, desc: "Books & supplies" },
  { name: "Electronics", icon: Laptop, desc: "Gadgets & gear" },
  { name: "Fashion", icon: Shirt, desc: "Style on campus" },
];

const roles = [
  {
    icon: ShoppingBag,
    title: "Students",
    desc: "Browse, order and pay with your wallet. Track delivery to your room in real time.",
    role: "student",
    cta: "Order now",
  },
  {
    icon: Bike,
    title: "Delivery Agents",
    desc: "Accept nearby orders, deliver across campus, and earn on every drop-off.",
    role: "agent",
    cta: "Start earning",
  },
  {
    icon: Store,
    title: "Businesses",
    desc: "List products, manage orders and grow your campus store with analytics.",
    role: "business",
    cta: "Sell with us",
  },
];

const steps = [
  {
    icon: ShoppingBag,
    t: "Browse & order",
    d: "Pick from hundreds of products across campus stores and add to cart.",
  },
  {
    icon: Wallet,
    t: "Pay with wallet",
    d: "Top up your secure TILETA wallet and check out in one tap.",
  },
  {
    icon: Bike,
    t: "Get it delivered",
    d: "A student agent picks it up and delivers straight to your room.",
  },
];

function Index() {
  const { session, role, loading } = useAuth();

  const { data: catalogProducts, isLoading: catalogLoading, error: catalogError } = useQuery({
    queryKey: ["landing-catalog"],
    queryFn: async () => {
      // First try to fetch internal products as they are most relevant for campus
      try {
        const { data: internalProducts } = await supabase
          .from("products")
          .select("*, product_images(*)")
          .eq("status", "active")
          .limit(100);
        
        if (internalProducts && internalProducts.length > 0) {
          return internalProducts.map(p => ({
            node: {
              id: p.id,
              title: p.name,
              description: p.description,
              handle: p.id,
              priceRange: {
                minVariantPrice: {
                  amount: p.price.toString(),
                  currencyCode: "ZMW"
                }
              },
              images: {
                edges: p.product_images?.[0] ? [{ node: { url: p.product_images[0].image_url, altText: p.name } }] : []
              },
              totalInventory: p.stock || 0
            }
          })) as any[];
        }
      } catch (err) {
        console.error("Internal product fetch failed:", err);
      }

      // Fallback to Shopify if no internal products
      const data = await storefrontApiRequest(`
        query GetLandingCatalog {
          products(first: 100) {
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
                totalInventory
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
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


  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#categories" className="transition-colors hover:text-foreground">
              Categories
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#roles" className="transition-colors hover:text-foreground">
              For you
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
            ) : session ? (
              <Button asChild>
                <Link to={dashboardPath(role)}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link to="/auth" search={{ mode: "login" }}>
                    Log in
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/auth" search={{ mode: "register" }}>
                    Get started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-glow relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-float-up">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              The Smart World Wide Marketplace
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Everything you need,{" "}
              <span className="brand-gradient-text">delivered world wide.</span>
            </h1>
            <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
              Order food, groceries, study materials, electronics and fashion from trusted
              global businesses. Paid securely, delivered to your doorstep.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/auth" search={{ mode: "register", role: "student" }}>
                  Start ordering <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth" search={{ mode: "register", role: "business" }}>
                  Become a seller
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div>
                <p className="text-2xl font-bold text-foreground">10k+</p>
                <p>Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">200+</p>
                <p>Campus stores</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">15min</p>
                <p>Avg delivery</p>
              </div>
            </div>
          </div>
          <div className="relative animate-float-up">
            <div className="brand-gradient absolute -inset-4 rounded-[2rem] opacity-20 blur-2xl" />
            <div className="relative flex flex-col gap-8">
              <div className="glass relative overflow-hidden rounded-[2.5rem] border p-12 shadow-2xl">
                <div className="brand-gradient absolute -inset-10 opacity-10 blur-3xl" />
                <img 
                  src={logoAsset.url} 
                  alt="TILETA Official Mark" 
                  className="relative mx-auto h-[450px] w-full max-w-[450px] scale-125 object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.4)] transition-transform duration-700 hover:scale-130"
                />
                <div className="relative mt-8 text-center">
                  <p className="text-lg font-bold tracking-[0.2em] text-primary uppercase">Official Identity</p>
                  <p className="text-sm font-medium text-muted-foreground mt-2 opacity-60">FOZZIEL ENTERPRISE • 2026</p>
                </div>
              </div>
              
              <div className="relative aspect-video overflow-hidden rounded-[2rem] border bg-black shadow-xl md:mx-auto md:w-4/5">
                <video
                  src={adAsset.url}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jun%2024%2C%202026%2C%2007_36_40%20PM-MHcYrD9aIHWuVRyN7fABrcdrF4aYb3.png"
                />
              </div>
            </div>
            <div className="glass absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border p-4 shadow-xl sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Order delivered</p>
                <p className="text-xs text-muted-foreground">in 12 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-balance text-2xl font-bold md:text-3xl">Shop by category</h2>
        <p className="mt-2 text-muted-foreground">
          Everything you need, in one place.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/auth"
              search={{ mode: "register" }}
              className="group rounded-2xl border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <c.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 font-semibold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Catalog */}
      <section id="catalog" className="border-t bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-balance text-3xl font-bold md:text-4xl">Featured Catalog</h2>
            <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
              Explore a sample of our world-wide marketplace. High-quality products from trusted global businesses.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {catalogLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[400px] animate-pulse rounded-3xl bg-muted" />
              ))
            ) : catalogError ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center glass rounded-3xl border border-destructive/20">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold">Failed to load catalog</h3>
                <p className="text-muted-foreground mt-2">We couldn't reach the marketplace right now.</p>
              </div>
            ) : catalogProducts?.length === 0 ? (
              <div className="col-span-full py-20 text-center glass rounded-3xl border border-dashed">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-xl font-bold">Catalog is being updated</h3>
                <p className="text-muted-foreground mt-2">New products are arriving soon.</p>
              </div>
            ) : (
              catalogProducts?.map((product: ShopifyProduct) => (
                <div
                  key={product.node.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border bg-card/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {product.node.images.edges[0]?.node ? (
                      <img
                        src={product.node.images.edges[0].node.url}
                        alt={product.node.images.edges[0].node.altText || product.node.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    {/* Quick View / Out of Stock Button */}
                    <div className="absolute bottom-6 left-6 right-6 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {product.node.totalInventory > 0 ? (
                        <Button className="w-full brand-gradient border-none h-12 text-sm font-bold shadow-xl shadow-primary/20" asChild>
                          <Link to="/auth" search={{ mode: "register" }}>
                            Order Now <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled className="w-full bg-muted/80 text-muted-foreground border-none h-12 text-sm font-bold cursor-not-allowed">
                          Out of Stock
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          Official
                        </span>
                        {parseFloat(product.node.priceRange.minVariantPrice.amount) > 1000 && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Premium
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          product.node.totalInventory > 5 
                            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
                            : product.node.totalInventory > 0 
                            ? "text-orange-500 bg-orange-500/10 border-orange-500/20"
                            : "text-rose-500 bg-rose-500/10 border-rose-500/20"
                        }`}>
                          {product.node.totalInventory > 0 ? `${product.node.totalInventory} in stock` : "Out of Stock"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-card/80 border text-[10px] font-bold">
                        <Star className="h-2.5 w-2.5 fill-primary text-primary" />
                        4.9
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold truncate leading-tight tracking-tight group-hover:text-primary transition-colors">
                      {product.node.title}
                    </h3>
                    
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed min-h-[40px]">
                      {product.node.description || "Premium quality product available for world-wide delivery."}
                    </p>
                    
                    <div className="mt-6 pt-6 border-t border-primary/5 flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Price</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black tracking-tighter text-foreground">
                            {formatCurrency(parseFloat(product.node.priceRange.minVariantPrice.amount))}
                          </span>
                        </div>
                      </div>
                      
                      <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))

            )}
          </div>
          
          <div className="mt-16 text-center">
            <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-base font-bold border-2 hover:bg-primary hover:text-primary-foreground transition-all" asChild>
              <Link to="/auth" search={{ mode: "register" }}>
                View Full Marketplace <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-balance text-2xl font-bold md:text-3xl">How TILETA works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.t} className="rounded-2xl border bg-card p-6">
                <div className="flex items-center gap-3">
                  <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-4 text-lg font-semibold">{s.t}</p>
                <p className="mt-1 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-balance text-2xl font-bold md:text-3xl">
          Built for everyone on campus
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {roles.map((r) => (
            <div key={r.title} className="flex flex-col rounded-2xl border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <r.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xl font-semibold">{r.title}</p>
              <p className="mt-2 flex-1 text-muted-foreground">{r.desc}</p>
              <Button variant="outline" className="mt-5 justify-between" asChild>
                <Link to="/auth" search={{ mode: "register", role: r.role as any }}>
                  {r.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Trust + CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="brand-gradient relative overflow-hidden rounded-3xl px-6 py-12 text-center text-primary-foreground md:px-12">
          <ShieldCheck className="mx-auto h-10 w-10 opacity-90" />
          <h2 className="mt-4 text-balance text-2xl font-bold md:text-3xl">
            Secure payments. Trusted delivery. Real businesses.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty opacity-90">
            Join thousands of students already getting their essentials delivered with
            TILETA.
          </p>
          <Button size="lg" variant="secondary" className="mt-6" asChild>
            <Link to="/auth" search={{ mode: "register" }}>
              Create your free account
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Logo />
            <div className="flex flex-col items-center gap-1 md:items-start">
              <p className="text-xs font-semibold tracking-wider text-primary">FOZZIEL ENTERPRISE</p>
              <p className="text-[10px] uppercase opacity-60">Empowering Campus Commerce</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 md:items-end">
            <p className="font-medium text-foreground">© 2026 TILETA</p>
            <p className="text-[10px] opacity-60">Official Product of Fozziel Enterprise</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
