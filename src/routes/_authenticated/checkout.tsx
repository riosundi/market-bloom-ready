import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { CreditCard, MapPin, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { createOrder } from "@/lib/orders.functions";
import { DELIVERY_FEE, formatCurrency } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | TILETA" },
      { name: "description", content: "Complete your TILETA order with secure campus delivery." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrderFn = useServerFn(createOrder);
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = total();
  const grandTotal = subtotal + DELIVERY_FEE;

  const handleCheckout = async () => {
    if (!address) {
      toast.error("Please enter a delivery address");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      // Assuming all items from same business for now as MVP
      // In a real app, we'd group items by business and create multiple orders
      const businessId = items[0]?.business_id;

      await createOrderFn({
        data: {
          items: items.map((i) => ({
            product_id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          business_id: businessId,
          delivery_address: address,
          subtotal,
          delivery_fee: DELIVERY_FEE,
          total: grandTotal,
        },
      });

      toast.success("Order placed successfully!");
      clearCart();
      void navigate({ to: "/orders" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <AppShell title="Checkout" subtitle="Your cart is empty.">
        <div className="rounded-2xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">Go back to the marketplace to add items.</p>
          <Button asChild className="mt-4">
            <Link to="/student">Browse Products</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Checkout" subtitle="Review your order and pay.">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Delivery Address
            </h2>
            <textarea
              placeholder="Enter your hostel, room number and any landmarks..."
              className="mt-4 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted shrink-0">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{formatCurrency(DELIVERY_FEE)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            <Button
              className="w-full mt-6"
              size="lg"
              onClick={handleCheckout}
              disabled={isSubmitting}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isSubmitting ? "Processing..." : `Pay ${formatCurrency(grandTotal)}`}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-4">
              By clicking pay, you agree to TILETA's terms of service. Secure payment via wallet.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
