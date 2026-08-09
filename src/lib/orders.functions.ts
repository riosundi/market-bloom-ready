import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        items: z.array(
          z.object({
            product_id: z.string(),
            quantity: z.number().min(1),
            price: z.number(),
            name: z.string(),
          })
        ),
        delivery_address: z.string(),
        subtotal: z.number(),
        delivery_fee: z.number(),
        total: z.number(),
        business_id: z.string(),
      })
      .parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        student_id: userId,
        business_id: data.business_id,
        subtotal: data.subtotal,
        delivery_fee: data.delivery_fee,
        total: data.total,
        delivery_address: data.delivery_address,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from("order_items").insert(
      data.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }))
    );

    if (itemsError) throw itemsError;

    return order;
  });

export const getStudentOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("student_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });
