import { createFileRoute } from "@tanstack/react-router";
import { Package, ShoppingBag, Store, TrendingUp, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/roles";
import { getSellerOrders, getSellerProducts, createProduct, updateProduct, deleteProduct, getCategories } from "@/lib/products/products.functions";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/business")({
  head: () => ({
    meta: [
      { title: "Seller Dashboard | TILETA" },
      {
        name: "description",
        content: "Manage your campus store products, orders and revenue on TILETA.",
      },
      { property: "og:title", content: "Seller Dashboard | TILETA" },
      {
        property: "og:description",
        content: "Manage your store products, orders and revenue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BusinessDashboard,
});

function BusinessDashboard() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // In a real app, fetch the business ID associated with the user profile
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Effect-like check to get business ID
  if (!businessId && profile?.id) {
    supabase
      .from("businesses")
      .select("id")
      .eq("user_id", profile.id)
      .single()
      .then(({ data }) => {
        if (data) setBusinessId(data.id);
      });
  }

  const { data: orders } = useSuspenseQuery({
    queryKey: ["seller-orders", businessId],
    queryFn: () => businessId ? getSellerOrders({ data: { businessId } }) : Promise.resolve([]),
  });

  const { data: categories } = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const { data: products } = useSuspenseQuery({
    queryKey: ["seller-products", businessId],
    queryFn: () => businessId ? getSellerProducts({ data: { businessId } }) : Promise.resolve([]),
  });

  const createMutation = useMutation({


    mutationFn: (newProduct: any) => createProduct({ data: { ...newProduct, businessId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      setIsAddingProduct(false);
      toast.success("Product added successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { productId: string; updates: any }) => 
      updateProduct({ data: variables }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      setEditingProduct(null);
      toast.success("Product updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct({ data: { productId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Product deleted successfully");
    },
  });

  const totalRevenue = orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;

  if (!businessId) {
    return (
      <AppShell title="Seller dashboard">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Store className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">No Business Found</h2>
          <p className="text-muted-foreground mt-2">You need an active business profile to access this dashboard.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Seller dashboard"
      subtitle="Manage your marketplace listings and track performance."
      actions={
        <Button onClick={() => setIsAddingProduct(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={TrendingUp} label="Revenue" value={formatCurrency(totalRevenue)} />
        <Stat icon={ShoppingBag} label="Orders" value={orders?.length.toString() || "0"} />
        <Stat icon={Package} label="Products" value={products?.length.toString() || "0"} />
        <Stat icon={Store} label="Store status" value="Active" />
      </div>

      <div className="mt-8 space-y-8">
        {products?.some((p: any) => p.inventory?.[0]?.quantity <= p.inventory?.[0]?.low_stock_threshold) && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-amber-600">
            <Package className="h-5 w-5" />
            <div className="text-sm">
              <span className="font-bold">Low Stock Alert:</span> Some products are running low on stock. Please restock soon.
            </div>
          </div>
        )}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Product Inventory</h2>
          </div>
          
          <div className="rounded-2xl border bg-card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products?.map((product: any) => (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="font-bold">{product.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{product.description}</div>
                    </td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{product.inventory?.[0]?.quantity ?? product.stock}</span>
                        {product.inventory?.[0]?.quantity <= product.inventory?.[0]?.low_stock_threshold && (
                          <span className="text-[10px] text-amber-500 font-bold uppercase">Low Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`capitalize px-2 py-1 rounded-full text-[10px] font-bold ${
                        product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteMutation.mutate(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          {orders && orders.length > 0 ? (
            <div className="rounded-2xl border bg-card overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.slice(0, 5).map((order: any) => (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <span className="capitalize px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
              No orders found yet.
            </div>
          )}
        </section>
      </div>

      {/* Product Form Modals could be added here */}
      {isAddingProduct && (
        <ProductModal 
          categories={categories}
          onClose={() => setIsAddingProduct(false)} 
          onSubmit={(data) => createMutation.mutate(data)}
        />

      )}

      {editingProduct && (
        <ProductModal 
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)} 
          onSubmit={(data) => updateMutation.mutate({ productId: editingProduct.id, updates: data })}
        />

      )}
    </AppShell>
  );
}

function ProductModal({ product, categories, onClose, onSubmit }: { product?: any, categories: any[], onClose: () => void, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || (categories?.[0]?.name || ""),
    stock: product?.stock || 0,
    status: product?.status || "active",
  });


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-3xl border shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-6 w-6" /></Button>
        </div>

        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }}>
          <div>
            <label className="text-sm font-bold mb-1 block">Product Name</label>
            <input 
              type="text" 
              className="w-full bg-muted rounded-xl px-4 py-2 border focus:ring-2 ring-primary outline-none" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold mb-1 block">Description</label>
            <textarea 
              className="w-full bg-muted rounded-xl px-4 py-2 border focus:ring-2 ring-primary outline-none min-h-[100px]" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold mb-1 block">Price (K)</label>
              <input 
                type="number" 
                className="w-full bg-muted rounded-xl px-4 py-2 border focus:ring-2 ring-primary outline-none" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">Stock Quantity</label>
              <input 
                type="number" 
                className="w-full bg-muted rounded-xl px-4 py-2 border focus:ring-2 ring-primary outline-none" 
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold mb-1 block">Category</label>
            <select 
              className="w-full bg-muted rounded-xl px-4 py-2 border focus:ring-2 ring-primary outline-none"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories?.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold mb-1 block">Status</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.status === 'active'} 
                  onChange={() => setFormData({...formData, status: 'active'})}
                />
                Active
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.status === 'inactive'} 
                  onChange={() => setFormData({...formData, status: 'inactive'})}
                />
                Inactive
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-xl">
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Store;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
