import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { templates, OrderEmailData, BaseEmailData, VerificationEmailData } from "./templates";
import { formatCurrency } from "../roles";

// This is a wrapper that follows the "Resend Master Prompt" rules
// In a real production app, this would call the Resend API or another email provider.
// For now, we log the formatted email to demonstrate implementation.

const logEmail = (to: string, subject: string, body: string) => {
  console.log(`[TILETA EMAIL SENT]
To: ${to}
Subject: ${subject}
--------------------------
${body}
--------------------------`);
};

export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: z.infer<typeof WelcomeSchema>) => WelcomeSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { email, userName } = data;
    const template = templates.welcome({ userName });
    
    // Logic to send via Resend would go here
    logEmail(email, template.subject, template.body);
    
    return { success: true };
  });

export const sendOrderConfirmation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data) // Simplified for internal use
  .handler(async ({ data, context }) => {
    const { email, userName, orderNumber, total, deliveryAddress, items } = data;
    
    const formattedTotal = typeof total === 'number' ? formatCurrency(total) : total;
    
    const template = templates.orderConfirmation({
      userName,
      orderNumber,
      total: formattedTotal,
      deliveryAddress,
      items
    });
    
    logEmail(email, template.subject, template.body);
    
    return { success: true };
  });

export const sendOrderStatusUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data)
  .handler(async ({ data, context }) => {
    const { email, userName, orderNumber, status } = data;
    
    const template = templates.orderStatusUpdate({
      userName,
      orderNumber,
      status,
      total: '' // Not strictly needed for status update template as written
    });
    
    logEmail(email, template.subject, template.body);
    
    return { success: true };
  });

const WelcomeSchema = z.object({
  email: z.string().email(),
  userName: z.string(),
});
