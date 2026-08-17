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
  const insertData: any = {
    business_id: product.business_id,
    name: product.name,
    price: product.price,
    category: product.category,
    stock: product.stock,
    status: product.status || "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (product.description !== undefined) insertData.description = product.description;
  if (product.image_url !== undefined) insertData.image_url = product.image_url;

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert([insertData])
    .select()
    .single();

  if (error) throw error;

  // Initialize inventory for the new product
  if (data) {
    await supabaseAdmin
      .from("inventory")
      .insert([{
        product_id: data.id,
        quantity: product.stock,
        low_stock_threshold: 5
      }]);
  }

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

  // Sync inventory if stock was updated
  if (updates.stock !== undefined && updates.stock !== null) {
    await supabaseAdmin
      .from("inventory")
      .upsert({
        product_id: productId,
        quantity: updates.stock,
        updated_at: new Date().toISOString()
      }, { onConflict: 'product_id' });
  }

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
    .select("*, inventory(*), product_images(*)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

export async function getProductInventory(productId: string) {
  const { data, error } = await supabaseAdmin
    .from("inventory")
    .select("*")
    .eq("product_id", productId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserTransactions(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPlatformSettings() {
  const { data, error } = await supabaseAdmin
    .from("platform_settings")
    .select("*");

  if (error) throw error;
  return data;
}

