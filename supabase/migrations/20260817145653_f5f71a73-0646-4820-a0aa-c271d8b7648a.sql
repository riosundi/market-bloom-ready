
-- 1. CATEGORIES
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO authenticated, anon;
GRANT ALL ON public.categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories 
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. PRODUCT IMAGES
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_images TO authenticated, anon;
GRANT ALL ON public.product_images TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.product_images TO authenticated;

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product images are viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their product images" ON public.product_images
    USING (EXISTS (
        SELECT 1 FROM public.products p
        JOIN public.businesses b ON p.business_id = b.id
        WHERE p.id = product_images.product_id AND b.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.products p
        JOIN public.businesses b ON p.business_id = b.id
        WHERE p.id = product_images.product_id AND b.user_id = auth.uid()
    ));

-- 3. INVENTORY
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    last_restock_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
GRANT INSERT ON public.inventory TO authenticated;

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their inventory" ON public.inventory FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.products p
        JOIN public.businesses b ON p.business_id = b.id
        WHERE p.id = inventory.product_id AND b.user_id = auth.uid()
    ));

CREATE POLICY "Sellers can update their inventory" ON public.inventory FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.products p
        JOIN public.businesses b ON p.business_id = b.id
        WHERE p.id = inventory.product_id AND b.user_id = auth.uid()
    ));

-- 4. PAYMENTS
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    provider_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their orders" ON public.payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = payments.order_id AND (o.student_id = auth.uid() OR o.agent_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.businesses b WHERE b.id = o.business_id AND b.user_id = auth.uid()
        ))
    ));

-- 5. WITHDRAWALS
CREATE TABLE public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payout_method TEXT NOT NULL,
    provider_details JSONB,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

GRANT SELECT, INSERT ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can request withdrawals" ON public.withdrawals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- 6. TRANSACTIONS
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- 7. PLATFORM SETTINGS
CREATE TABLE public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platform_settings TO authenticated, anon;
GRANT ALL ON public.platform_settings TO service_role;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform settings are viewable by everyone" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed Initial Data
INSERT INTO public.categories (name, slug, icon) VALUES 
('Food', 'food', 'UtensilsCrossed'),
('Groceries', 'groceries', 'ShoppingCart'),
('Electronics', 'electronics', 'Laptop'),
('Fashion', 'fashion', 'Shirt'),
('Beauty', 'beauty', 'Sparkles'),
('Campus Essentials', 'campus-essentials', 'BookOpen'),
('Drinks', 'drinks', 'Coffee'),
('Services', 'services', 'Wrench'),
('Study Materials', 'study-materials', 'GraduationCap')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.platform_settings (key, value, description) VALUES 
('delivery_fee', '15', 'Default delivery fee in ZMW'),
('commission_rate', '0.1', 'Platform commission rate as decimal'),
('min_withdrawal', '50', 'Minimum withdrawal amount in ZMW')
ON CONFLICT (key) DO NOTHING;
