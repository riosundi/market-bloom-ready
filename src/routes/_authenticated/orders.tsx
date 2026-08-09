import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getStudentOrders } from "@/lib/orders.functions";
import { AppShell } from "@/components/app-shell";
import { formatCurrency } from "@/lib/roles";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Truck,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "My Orders | TILETA" },
      { name: "description", content: "Track your campus deliveries and view your TILETA order history." },
    ],
  }),
  loader: async ({ context }) => {
    // Protected data is fetched on the client where the session is available.
  },
  component: OrdersPage,
});

function OrdersPage() {
  const { data: orders } = useSuspenseQuery({
    queryKey: ["student-orders"],
    queryFn: () => getStudentOrders(),
  });

  return (
    <AppShell
      title="My Orders"
      subtitle="Track your deliveries and view order history."
    >
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No orders yet</h3>
            <p className="mt-2 text-muted-foreground">
              Your order history will appear here once you make a purchase.
            </p>
          </div>
        ) : (
          orders.map((order: any) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-muted/30 p-4 sm:px-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border shadow-sm">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Order ID
                    </p>
                    <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
                      Placed on
                    </p>
                    <p className="text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
                      Total
                    </p>
                    <p className="font-bold text-primary">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full",
                      getStatusColor(order.status)
                    )}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold capitalize">
                        Delivery Status: {order.status}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.delivery_address}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full",
                      order.payment_status === 'paid' ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      <CreditCard className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold capitalize">
                        Payment: {order.payment_status}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Paid via Wallet
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-[10px] font-bold">
                          {item.quantity}x
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary hover:underline">
                    View Details
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
    case "created":
      return <Clock className="h-3 w-3" />;
    case "processing":
    case "shipped":
      return <Truck className="h-3 w-3" />;
    case "delivered":
      return <CheckCircle2 className="h-3 w-3" />;
    case "cancelled":
      return <XCircle className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
    case "created":
      return "bg-amber-500/10 text-amber-500";
    case "processing":
      return "bg-blue-500/10 text-blue-500";
    case "shipped":
      return "bg-indigo-500/10 text-indigo-500";
    case "delivered":
      return "bg-green-500/10 text-green-500";
    case "cancelled":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-muted text-muted-foreground";
  }
}
