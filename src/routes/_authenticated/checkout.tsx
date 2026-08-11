import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | TILETA" },
      { name: "description", content: "Checkout is now handled securely via Shopify." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info("Checkout is now handled via the Shopify cart drawer.");
    void navigate({ to: "/student" });
  }, [navigate]);

  return (
    <AppShell title="Redirecting..." subtitle="Taking you back to the marketplace.">
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Checkout is handled via the Shopify cart drawer in the top menu.</p>
      </div>
    </AppShell>
  );
}
