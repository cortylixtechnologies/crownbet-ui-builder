import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("This is a UI demo — login is not connected.");
    setTimeout(() => navigate("/"), 800);
  };

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground text-sm mt-1">Log in to your CrownBet account</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="phone">Mobile Number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" />
          </div>
          <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-bold h-11">
            Log in
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
