import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Loader2 } from "lucide-react";
import { useShopifyCartStore } from "@/stores/shopify-cart";
import { formatCurrency } from "@/lib/roles";
import { createCheckoutSession } from "@/lib/stripe.functions";
import { useServerFn } from "@tanstack/react-start";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading: isCartLoading, isSyncing, updateQuantity, removeItem, syncCart } = useShopifyCartStore();
  const checkoutFn = useServerFn(createCheckoutSession);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);

  const isLoading = isCartLoading || isProcessingStripe;
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsProcessingStripe(true);
    try {
      const checkoutItems = items.map(item => ({
        id: item.variantId,
        name: item.product.node.title,
        price: parseFloat(item.price.amount),
        quantity: item.quantity,
        image: item.product.node.images?.edges?.[0]?.node?.url
      }));

      const { url } = await checkoutFn({
        data: {
          items: checkoutItems,
          successUrl: `${window.location.origin}/student?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/student`,
        }
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Stripe checkout error:", error);
      toast.error("Failed to initiate checkout. Please ensure Stripe is configured.");
    } finally {
      setIsProcessingStripe(false);
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 text-foreground/80 hover:text-foreground transition-colors">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-none">
              {totalItems}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full border-l bg-card/95 backdrop-blur-xl">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-2xl font-bold">Shopping Cart</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add items from the marketplace to get started.</p>
              <Button variant="outline" className="mt-6 rounded-full px-8" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 group">
                      <div className="w-20 h-20 bg-muted rounded-2xl overflow-hidden flex-shrink-0 border border-border/50">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img 
                            src={item.product.node.images.edges[0].node.url} 
                            alt={item.product.node.title} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="font-semibold text-sm truncate leading-tight">{item.product.node.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{item.variantTitle !== "Default Title" ? item.variantTitle : 'Standard'}</p>
                        </div>
                        <p className="font-bold text-sm text-primary">
                          {formatCurrency(parseFloat(item.price.amount))}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between py-0.5">
                        <button 
                          onClick={() => removeItem(item.variantId)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 border border-border/50">
                          <button 
                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background transition-colors disabled:opacity-50"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={isLoading}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button 
                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background transition-colors disabled:opacity-50"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={isLoading}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0 space-y-4 pt-6 border-t mt-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-foreground">
                    <span>Total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCheckout} 
                  className="w-full h-12 rounded-2xl text-base font-bold brand-gradient text-primary-foreground border-none hover:opacity-90 transition-all shadow-lg shadow-primary/20" 
                  disabled={items.length === 0 || isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay with Stripe (ZMW)
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground px-4">
                  Secure checkout with Zambian Kwacha (ZMW) support.
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
