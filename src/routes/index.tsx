import { Link, createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPath } from "@/lib/roles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TILETA — Smart Campus Marketplace for Students" },
      {
        name: "description",
        content:
          "Order food, groceries, books, and electronics from campus stores. Fast student delivery and secure payments with TILETA - the smart marketplace for students.",
      },
      { property: "og:title", content: "TILETA — The Smart Campus Marketplace" },
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
              The Smart Campus Marketplace
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Everything on campus,{" "}
              <span className="brand-gradient-text">delivered to your door.</span>
            </h1>
            <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
              Order food, groceries, study materials, electronics and fashion from trusted
              campus businesses. Paid securely, delivered by fellow students.
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
            <div className="relative aspect-square overflow-hidden rounded-3xl border bg-card shadow-2xl">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jun%2024%2C%202026%2C%2007_36_40%20PM-MHcYrD9aIHWuVRyN7fABrcdrF4aYb3.png"
                alt="TILETA - The smart campus marketplace branding"
                className="h-full w-full object-cover"
                loading="lazy"
              />
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
          Everything a student needs, in one place.
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
                <Link to="/auth" search={{ mode: "register", role: r.role }}>
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
          <Logo />
          <p>{`© ${new Date().getFullYear()} TILETA. The Smart Campus Marketplace.`}</p>
        </div>
      </footer>
    </div>
  );
}
