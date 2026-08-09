import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * A mock AI agent interface that uses the MCP tools to "perform actions"
 * This demonstrates how the app's internal logic can be exposed via MCP 
 * and then consumed by an agent (or the user interface acting as one).
 */

export const askAgent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({
    prompt: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { prompt } = data;
    const lowerPrompt = prompt.toLowerCase();

    // SIMPLE MOCK AGENT LOGIC
    // In a real app, this would call an LLM which decides which MCP tools to call
    
    if (lowerPrompt.includes("product") || lowerPrompt.includes("buy") || lowerPrompt.includes("search")) {
      const { data: products } = await supabaseAdmin
        .from("products")
        .select("name, price, businesses(store_name)")
        .limit(3);
      
      const productList = products?.map(p => {
        const storeName = (p.businesses as any)?.store_name || "Unknown Store";
        return `- ${p.name} (${p.price} NGN) from ${storeName}`;
      }).join("\n");
      
      return {
        answer: `I found some products for you in the Tileta marketplace:\n${productList || "No products found."}\n\nWould you like to add any of these to your cart?`,
        suggestedActions: ["Search for more", "Go to Marketplace"]
      };
    }

    if (lowerPrompt.includes("order") || lowerPrompt.includes("status") || lowerPrompt.includes("track")) {
      const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("id, status, total, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!orders || orders.length === 0) {
        return {
          answer: "It looks like you haven't placed any orders yet. Would you like to see what's available in the marketplace?",
          suggestedActions: ["Browse Products"]
        };
      }

      const latest = orders[0];
      if (!latest) {
          return {
            answer: "Something went wrong retrieving your order status.",
            suggestedActions: ["Try Again"]
          };
      }
      return {
        answer: `Your most recent order (ID: ${latest.id.slice(0, 8)}...) is currently **${latest.status}**. The total was ${latest.total} NGN.`,
        suggestedActions: ["View Order History", "Contact Support"]
      };
    }

    return {
      answer: "I'm your Tileta Assistant. I can help you find products, check order statuses, or manage your account. What can I do for you today?",
      suggestedActions: ["Browse Products", "Check Orders", "My Wallet"]
    };
  });
