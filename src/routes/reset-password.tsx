import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — TILETA" },
      {
        name: "description",
        content: "Set a new password for your TILETA campus marketplace account.",
      },
      { property: "og:title", content: "Choose a new password — TILETA" },
      {
        property: "og:description",
        content: "Set a new password for your TILETA account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setPending(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setPending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated. You're signed in.");
    void navigate({ to: "/student", replace: true });
  }

  return (
    <div className="hero-glow flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-xl">
        <h1 className="text-2xl font-bold">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick something secure you haven't used before.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
