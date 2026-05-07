import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Crown, Lock, Mail } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AdminLogin = () => {
  const { isAdmin, login } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAdmin) return <Navigate to="/admin" replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = login(email, password);
    if (r.ok) {
      toast.success("Welcome back, Admin");
      navigate("/admin");
    } else toast.error(r.error || "Login failed");
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
        <Button type="submit" className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-bold">
          Sign in to Admin
        </Button>
        <p className="text-[11px] text-white/50 text-center">
          Frontend-only demo. Backend coming soon.
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
