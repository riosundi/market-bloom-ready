import type { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { isRole, type Role } from "@/lib/roles";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  status: string;
};

type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role | null;
};

const initialState: AuthState = {
  loading: true,
  session: null,
  user: null,
  profile: null,
  role: null,
};

/**
 * Client-side session state: session, profile row and role.
 * Route protection lives in the `_authenticated` layout, not here.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState);

  const load = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setState({ ...initialState, loading: false });
      return;
    }

    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, wallet_balance, status")
        .eq("id", session.user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", session.user.id),
    ]);

    const rawRole = roles?.[0]?.role;

    setState({
      loading: false,
      session,
      user: session.user,
      profile: profile ?? null,
      role: isRole(rawRole) ? rawRole : null,
    });
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) void load(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "TOKEN_REFRESHED") return;
      void load(session);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [load]);

  return state;
}
