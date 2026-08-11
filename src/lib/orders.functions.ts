import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendOrderConfirmation } from "./email/resend.functions";
import { formatCurrency } from "./roles";




// Moved to src/lib/products/products.functions.ts to avoid circular dependencies and follow architecture rules.
// keeping these as exports for backward compatibility if needed, but they should be imported from the new location.
export { getProducts } from "./products/products.functions";

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

// Moved to products.functions.ts
export { getStudentOrders } from "./products/products.functions";
