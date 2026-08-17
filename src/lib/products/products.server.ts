import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSellerOrders(businessId: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAgentOrders(agentId: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProduct(product: {
  business_id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category: string;
  stock: number;
  status?: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert([
      {
        business_id: product.business_id,
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        stock: product.stock,
        status: product.status || "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(
  productId: string,
  updates: Partial<{
    name: string | null;
    description: string | null;
    price: number | null;
    image_url: string | null;
    category: string | null;
    stock: number | null;
    status: string | null;
  }>
) {
  const updatePayload: any = {
    updated_at: new Date().toISOString()
  };
  
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.description !== undefined) updatePayload.description = updates.description;
  if (updates.price !== undefined) updatePayload.price = updates.price;
  if (updates.image_url !== undefined) updatePayload.image_url = updates.image_url;
  if (updates.category !== undefined && updates.category !== null) updatePayload.category = updates.category;
  if (updates.stock !== undefined && updates.stock !== null) updatePayload.stock = updates.stock;
  if (updates.status !== undefined && updates.status !== null) updatePayload.status = updates.status;

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(updatePayload)
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw error;
  return true;
}

export async function getSellerProducts(businessId: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
