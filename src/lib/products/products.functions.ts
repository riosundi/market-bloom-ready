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
  getSellerProducts as fetchSellerProducts,
  getCategories as fetchCategories,
  getProductInventory as fetchProductInventory,
  getUserTransactions as fetchUserTransactions,
  getPlatformSettings as fetchPlatformSettings
} from "./products.server";

export const getProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data)
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("products")
      .select("*, businesses(store_name), product_images(*)")
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

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      businessId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      price: z.number(),
      imageUrl: z.string().optional(),
      category: z.string(),
      stock: z.number(),
      status: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    return createProductInDB({
      business_id: data.businessId,
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      image_url: data.imageUrl ?? null,
      category: data.category,
      stock: data.stock,
      status: data.status ?? null,
    });
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      productId: z.string(),
      updates: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
        stock: z.number().optional(),
        status: z.string().optional(),
      }),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    return updateProductInDB(data.productId, {
      name: data.updates.name ?? null,
      description: data.updates.description ?? null,
      price: data.updates.price ?? null,
      image_url: data.updates.imageUrl ?? null,
      category: data.updates.category ?? null,
      stock: data.updates.stock ?? null,
      status: data.updates.status ?? null,
    });
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ productId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return deleteProductInDB(data.productId);
  });

export const getSellerProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ businessId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return fetchSellerProducts(data.businessId);
  });

export const getCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    return fetchCategories();
  });

export const getProductInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ productId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return fetchProductInventory(data.productId);
  });

export const getUserTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return fetchUserTransactions(context.userId);
  });

export const getPlatformSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    return fetchPlatformSettings();
  });

