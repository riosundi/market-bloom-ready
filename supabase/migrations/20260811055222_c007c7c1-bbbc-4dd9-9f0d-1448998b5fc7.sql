DROP POLICY IF EXISTS "Order items follow order visibility" ON public.order_items;
CREATE POLICY "Order items follow order visibility"
ON public.order_items FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = order_items.order_id
    AND (
      o.student_id = auth.uid()
      OR o.agent_id = auth.uid()
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = o.business_id AND b.user_id = auth.uid())
    )
));

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Order counterparts can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE (o.student_id = profiles.id OR o.agent_id = profiles.id
         OR EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = o.business_id AND b.user_id = profiles.id))
    AND (
      o.student_id = auth.uid()
      OR o.agent_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.businesses b2 WHERE b2.id = o.business_id AND b2.user_id = auth.uid())
    )
));

REVOKE SELECT ON public.profiles FROM anon;