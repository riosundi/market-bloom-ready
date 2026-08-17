import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { 
  updateOrderStatus as updateOrderInDB, 
  getSellerOrders as fetchSellerOrders,
  getAgentOrders as fetchAgentOrders,
  createProduct as createProductInDB,
  updateProduct as updateProductInDB,
  deleteProduct as deleteProductInDB,
  getSellerProducts as fetchSellerProducts
} from "./products.server";

export const getProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data)
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
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


