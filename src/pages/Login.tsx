import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await signIn(email, password);
    setBusy(false);
    if (r.error) {
      toast.error(r.error);
      return;
    }
    toast.success("Logged in");
    const to = location.state?.from || "/";
    navigate(to, { replace: true });
  };

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground text-sm mt-1">Log in to your CrownBet account</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" required />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground font-bold h-11">
            {busy ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground text-center">
          New to CrownBet?{" "}
          <Link to="/register" className="text-primary font-bold">Create account</Link>
        </p>
      </div>
    </AppLayout>
  );
};

export default Login;
