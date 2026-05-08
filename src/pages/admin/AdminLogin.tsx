import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Crown, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const { isAdmin, signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const r = await signIn(email, password);
    if (r.error) {
      toast.error(r.error);
      setSubmitting(false);
      return;
    }
    // verify admin role right away
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) {
      toast.error("Login failed");
      setSubmitting(false);
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.id);
    const ok = roles?.some((r: any) => r.role === "admin");
    if (!ok) {
      toast.error("This account is not an admin.");
      await supabase.auth.signOut();
      setSubmitting(false);
      return;
    }
    toast.success("Welcome back, Admin");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-surface-dark-muted rounded-2xl p-6 shadow-elevated space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-2xl font-extrabold">
            <Crown className="w-7 h-7 text-gold fill-gold" />
            Crown<span className="text-gold">Bet</span>
          </div>
          <p className="text-white/70 text-sm mt-1">Admin Control Panel</p>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-white/70">Email</span>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-surface-dark border-white/10 text-white"
                placeholder="admin@crownbet.com"
                required
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-white/70">Password</span>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-surface-dark border-white/10 text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </label>
        </div>
        <Button type="submit" disabled={submitting} className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-bold">
          {submitting ? "Signing in…" : "Sign in to Admin"}
        </Button>
        <p className="text-[11px] text-white/50 text-center">
          Don't have an admin account yet?{" "}
          <Link to="/register" className="underline">Register</Link> with the admin email and you'll be granted access automatically.
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
