-- First ensure the user has a profile if it doesn't exist
INSERT INTO public.profiles (id, full_name, wallet_balance)
VALUES ('6229e74d-f08e-4af4-b559-ab076da57a31', 'Test Admin', 100000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.businesses (user_id, store_name, short_code, category, approval_status)
VALUES 
  ('6229e74d-f08e-4af4-b559-ab076da57a31', 'Campus Bites', 'cbites', 'Food', 'approved'),
  ('6229e74d-f08e-4af4-b559-ab076da57a31', 'Study Hub', 'shub', 'Books', 'approved')
ON CONFLICT (short_code) DO NOTHING;

INSERT INTO public.products (business_id, name, category, price, stock, status)
SELECT id, 'Jollof Rice', 'Food', 1500, 50, 'active' FROM public.businesses WHERE short_code = 'cbites'
UNION ALL
SELECT id, 'Chicken Burger', 'Food', 2500, 30, 'active' FROM public.businesses WHERE short_code = 'cbites'
UNION ALL
SELECT id, 'Notebook', 'Books', 500, 100, 'active' FROM public.businesses WHERE short_code = 'shub';
