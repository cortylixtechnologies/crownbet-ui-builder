import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [v, setV] = useState({ email: "", password: "", displayName: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (v.password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    const r = await signUp(v.email, v.password, v.displayName || undefined);
    setBusy(false);
    if (r.error) return toast.error(r.error);
    toast.success("Account created — check your email to confirm, then log in.");
    navigate("/login");
  };

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-foreground">Join CrownBet</h1>
        <p className="text-muted-foreground text-sm mt-1">Get 1,000 demo credits when you sign up</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label>Display name</Label>
            <Input value={v.displayName} onChange={(e) => setV({ ...v, displayName: e.target.value })}
              placeholder="Your name" className="mt-1" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" autoComplete="email" value={v.email}
              onChange={(e) => setV({ ...v, email: e.target.value })}
              placeholder="you@example.com" className="mt-1" required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" autoComplete="new-password" value={v.password}
              onChange={(e) => setV({ ...v, password: e.target.value })}
              placeholder="At least 8 characters" className="mt-1" required />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground font-bold h-11">
            {busy ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold">Log in</Link>
        </p>
      </div>
    </AppLayout>
  );
};

export default Register;
