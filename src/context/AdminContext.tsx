// Thin shim that adapts the auth context to the existing useAdmin() API
// used by AdminLogin and AdminLayout.
import { ReactNode } from "react";
import { useAuth } from "./AuthContext";

export const AdminProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

export const useAdmin = () => {
  const { isAdmin, signIn, signOut, loading } = useAuth();
  return {
    isAdmin,
    loading,
    login: async (email: string, password: string) => {
      const r = await signIn(email, password);
      if (r.error) return { ok: false, error: r.error };
      // role check happens after auth state updates; caller can re-check isAdmin
      return { ok: true };
    },
    logout: () => signOut(),
  };
};
