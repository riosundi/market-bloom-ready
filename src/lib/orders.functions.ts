import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendOrderConfirmation } from "./email/resend.functions";

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
        delivery_fee: z.number().default(15),
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

    // Trigger confirmation email
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      // In production, email is retrieved from auth.users (server-only)
      const userEmail = "customer@tileta.app"; 

      await sendOrderConfirmation({
        data: {
          email: userEmail,
          userName: profile?.full_name || "Customer",
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          total: data.total,
          deliveryAddress: data.delivery_address,
          items: data.items,
        },
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return order;
  });

export const getStudentOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data)
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("student_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

