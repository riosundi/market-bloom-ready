import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bike, Loader2, ShoppingBag, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { cn } from "@/lib/utils";
import { dashboardPath, SIGNUP_ROLES, type Role } from "@/lib/roles";

const searchSchema = z.object({
  mode: z.enum(["login", "register", "forgot"]).default("login").catch("login"),
  role: z.enum(["student", "agent", "business"]).optional().catch(undefined),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in to TILETA — Campus Marketplace" },
      {
        name: "description",
        content:
          "Log in or create your TILETA account as a student, delivery agent or campus business.",
      },
      { property: "og:title", content: "Sign in to TILETA" },
      {
        property: "og:description",
        content: "Log in or create your TILETA account in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const roleOptions: { value: Exclude<Role, "admin">; label: string; icon: typeof ShoppingBag }[] =
  [
    { value: "student", label: "Student", icon: ShoppingBag },
    { value: "agent", label: "Delivery Agent", icon: Bike },
    { value: "business", label: "Business", icon: Store },
  ];

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const registerSchema = credentialsSchema.extend({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  role: z.enum(SIGNUP_ROLES),
});

function AuthPage() {
  const { mode, role: roleParam } = Route.useSearch();
  const navigate = useNavigate();
  const { session, role, loading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Exclude<Role, "admin">>(
    roleParam ?? "student",
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  useEffect(() => {
    if (roleParam) setSelectedRole(roleParam);
  }, [roleParam]);

  // Already signed in → go to the right dashboard.
  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: dashboardPath(role), replace: true });
    }
  }, [loading, session, role, navigate]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setPending(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setPending(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = registerSchema.safeParse({
      email,
      password,
      full_name: fullName,
      role: selectedRole,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setPending(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.full_name, role: parsed.data.role, wallet_balance: 10000 },
      },
    });
    setPending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data.session) {
      setAwaitingConfirmation(true);
      toast.success("Check your email to confirm your account.");
      return;
    }
    toast.success("Account created!");
  }

  async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = z.string().trim().email().max(255).safeParse(email);
    if (!parsed.success) {
      toast.error("Enter a valid email address");
      return;
    }

    setPending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setPending(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent. Check your inbox.");
  }

  async function handleGoogle() {
    setPending(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      setPending(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    setPending(false);
  }

  if (awaitingConfirmation) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold">Confirm your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="font-medium">{email}</span>. Click
          it to finish setting up your TILETA account.
        </p>
        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={() => setAwaitingConfirmation(false)}
        >
          Back to sign in
        </Button>
      </Shell>
    );
  }

  if (mode === "forgot") {
    return (
      <Shell>
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll email you a secure link to choose a new password.
        </p>
        <form onSubmit={handleForgotPassword} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/auth"
            search={{ mode: "login" }}
            className="font-medium text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </Shell>
    );
  }

  const isRegister = mode === "register";

  return (
    <Shell>
      <h1 className="text-2xl font-bold">
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isRegister
          ? "Pick your role and enter your details to get started."
          : "Sign in to keep shopping, selling or delivering."}
      </p>

      <form
        onSubmit={isRegister ? handleRegister : handleLogin}
        className="mt-6 space-y-5"
      >
        {isRegister && (
          <>
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedRole(opt.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all",
                      selectedRole === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:border-primary/40",
                    )}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="e.g. Ada Obi"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@campus.edu"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isRegister && (
              <Link
                to="/auth"
                search={{ mode: "forgot" }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isRegister ? (
            "Create account"
          ) : (
            "Log in"
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or continue with
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogle}
        disabled={pending}
      >
        <GoogleMark />
        Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isRegister ? "Already registered? " : "New to TILETA? "}
        <Link
          to="/auth"
          search={{ mode: isRegister ? "login" : "register" }}
          className="font-medium text-primary hover:underline"
        >
          {isRegister ? "Log in" : "Create an account"}
        </Link>
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-glow flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.6c-.1 1.1-.9 2.8-2.5 3.9l-.1.1 3.6 2.8.3.1c2.3-2.1 3.6-5.2 3.6-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5l-.1.1-3.7 2.9-.1.1C3.4 21.3 7.4 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.4c-.3-.7-.4-1.5-.4-2.4 0-.8.1-1.7.4-2.4V9.5L1.4 6.6l-.1.1C.5 8.3 0 10.1 0 12s.5 3.7 1.3 5.3l4-2.9Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c2.2 0 3.7.9 4.6 1.7l3.3-3.2C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.3 6.6l4 3c.9-2.8 3.6-4.9 6.7-4.9Z"
      />
    </svg>
  );
}
