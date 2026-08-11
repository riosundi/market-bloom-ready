import { supabase } from "@/integrations/supabase/client";

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSellerOrders(businessId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAgentOrders(agentId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
