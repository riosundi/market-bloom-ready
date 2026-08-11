
-- Add location to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location TEXT;

-- Seed Demo Products using a subquery to find a business if possible, otherwise use a generic UUID if it exists
-- Since we can't easily guarantee a business ID without auth, we will just insert products without a strict FK if it fails,
-- but the table has a NOT NULL constraint on business_id.
-- Let's try to find any business first.

DO $$
DECLARE
    first_biz_id uuid;
BEGIN
    SELECT id INTO first_biz_id FROM public.businesses LIMIT 1;
    
    IF first_biz_id IS NOT NULL THEN
        INSERT INTO public.products (business_id, name, description, price, category, stock, status, rating, is_popular, image_url, location)
        VALUES 
        (first_biz_id, 'Classic Cheese Burger', 'Juicy beef patty with cheddar cheese', 85.00, 'Food', 50, 'active', 4.8, true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', 'Student Center'),
        (first_biz_id, 'Pepperoni Pizza', 'Large pepperoni pizza with extra mozzarella', 120.00, 'Food', 30, 'active', 4.5, true, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500', 'Campus Cafeteria'),
        (first_biz_id, 'Fried Chicken & Chips', '2 piece chicken with large fries', 65.00, 'Food', 100, 'active', 4.2, false, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500', 'Main Gate'),
        (first_biz_id, 'Wireless Earphones', 'High quality noise cancelling buds', 250.00, 'Electronics', 15, 'active', 4.9, true, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', 'Tech Shop'),
        (first_biz_id, 'TILETA Branded T-Shirt', '100% Cotton campus merch', 150.00, 'Fashion', 40, 'active', 4.7, false, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', 'Bookstore'),
        (first_biz_id, 'Student Stationery Pack', 'Essential pens, notebooks, and binders', 45.00, 'Campus Essentials', 200, 'active', 4.6, false, 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=500', 'Library Hub'),
        (first_biz_id, 'Fresh Fruit Pack', 'Seasonal mixed fruits for healthy snacking', 35.00, 'Groceries', 20, 'active', 4.4, false, 'https://images.unsplash.com/photo-1610832958506-ee5636637671?w=500', 'Green Market'),
        (first_biz_id, 'Skin Care Kit', 'Daily essentials for glowing campus life', 180.00, 'Beauty', 12, 'active', 4.8, true, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', 'Pharmacy')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Grant permissions for products
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
