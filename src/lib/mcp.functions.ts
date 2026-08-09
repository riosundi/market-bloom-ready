import { createServerFn } from "@tanstack/react-start";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// This file defines the MCP server logic as server functions
// In a real production environment, you might run this as a standalone process
// but for this implementation we expose it via TanStack Start server functions

/**
 * MCP Server Implementation for Tileta
 * Tools provided:
 * - get_products: Search/List products
 * - create_order: Create an order for the authenticated user
 * - get_order_status: Check status of an existing order
 */

export const mcpCallTool = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    name: z.string(),
    arguments: z.record(z.any()).optional()
  }).parse(data))
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
          content: [{ type: "text", text: `Order ${orderId} status: ${order.status}. Total: ${order.total_price}` }]
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
