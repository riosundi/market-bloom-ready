import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * MCP Server Implementation for Tileta
 * Tools provided:
 * - get_products: Search/List products
 * - get_order_status: Check status of an existing order
 */

export const mcpCallTool = createServerFn({ method: "POST" })
  .validator((data: unknown): { name: string; arguments?: Record<string, any> | undefined } => {
    return z.object({
      name: z.string(),
      arguments: z.record(z.any()).optional()
    }).parse(data);
  })
  .handler(async ({ data }) => {
    const { name, arguments: args } = data;

    switch (name) {
      case "get_products": {
        const query = args?.['query'] as string | undefined;
        let supabaseQuery = supabaseAdmin
          .from("products")
          .select("*, businesses(store_name)");
        
        if (query) {
          supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
        }

        const { data: products, error } = await supabaseQuery.limit(10);
        
        if (error) throw new Error(error.message);
        
        return {
          content: [{ type: "text", text: JSON.stringify(products, null, 2) }]
        };
      }

      case "get_order_status": {
        const orderId = args?.['orderId'] as string;
        if (!orderId) throw new Error("orderId is required");

        const { data: order, error } = await supabaseAdmin
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (error) throw new Error(error.message);

        return {
          content: [{ type: "text", text: `Order ${orderId} status: ${order.status}. Total: ${order.total}` }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

export const mcpListTools = createServerFn({ method: "GET" })
  .handler(async () => {
    return {
      tools: [
        {
          name: "get_products",
          description: "List or search for products in the Tileta marketplace",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string", description: "Optional search term for product names" }
            }
          }
        },
        {
          name: "get_order_status",
          description: "Check the status of a specific order",
          inputSchema: {
            type: "object",
            properties: {
              orderId: { type: "string", description: "The UUID of the order to check" }
            },
            required: ["orderId"]
          }
        }
      ]
    };
  });
