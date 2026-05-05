import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("This is a UI demo — registration is not connected.");
    setTimeout(() => navigate("/"), 800);
  };
  const [v, setV] = useState({ phone: "", password: "", promo: "" });
  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-foreground">Join CrownBet</h1>
        <p className="text-muted-foreground text-sm mt-1">Get a welcome bonus on your first deposit</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label>Mobile Number</Label>
            <Input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} placeholder="0712 345 678" className="mt-1" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} placeholder="At least 8 characters" className="mt-1" />
          </div>
          <div>
            <Label>Promo code (optional)</Label>
            <Input value={v.promo} onChange={(e) => setV({ ...v, promo: e.target.value })} placeholder="CROWN100" className="mt-1" />
          </div>
          <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-bold h-11">
            Create account
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
