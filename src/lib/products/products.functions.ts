import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { 
  updateOrderStatus as updateOrderInDB, 
  getSellerOrders as fetchSellerOrders,
  getAgentOrders as fetchAgentOrders
} from "./products.server";

export const getProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("products")
      .select("*, businesses(store_name)")
      .eq("status", "active");

    if (error) throw error;
    return data;
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      orderId: z.string(),
      status: z.enum([
        "pending",
        "confirmed",
        "accepted",
        "preparing",
        "ready",
        "dispatched",
        "delivered",
        "cancelled"
      ]),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    return updateOrderInDB(data.orderId, data.status);
  });

export const getSellerOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ businessId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return fetchSellerOrders(data.businessId);
  });

export const getAgentOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ agentId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return fetchAgentOrders(data.agentId);
  });
