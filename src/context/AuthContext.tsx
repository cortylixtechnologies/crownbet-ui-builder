import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  display_name: string | null;
  email: string | null;
  balance: number;
  status: string;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (uid: string) => {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(prof as Profile | null);
    setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
  };

  useEffect(() => {
    // 1. Subscribe FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        // defer to avoid recursive supabase calls inside the listener
        setTimeout(() => loadUserData(sess.user.id), 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });
    // 2. Then read existing
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadUserData(data.session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (session?.user) await loadUserData(session.user.id);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl, data: { display_name: displayName } },
    });
    return error ? { error: error.message } : {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isAdmin,
        loading,
        refreshProfile,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
};
