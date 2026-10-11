import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const DepositDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const { profile, refreshProfile } = useAuth();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("1000");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number>();

  useEffect(() => { if (open && !phone && (profile as any)?.phone) setPhone((profile as any).phone); }, [open]);
  useEffect(() => () => window.clearInterval(timer.current), []);

  const poll = (id: string) => {
    let tries = 0;
    timer.current = window.setInterval(async () => {
      tries++;
      const { data } = await supabase.functions.invoke("harakapay", { body: { action: "check", order_id: id } });
      if (data?.status === "completed") {
        window.clearInterval(timer.current);
        await refreshProfile();
        toast.success("Deposit received!");
        setOrderId(null); onOpenChange(false);
      } else if (data?.status === "failed" || tries > 40) {
        window.clearInterval(timer.current);
        toast.error(data?.status === "failed" ? "Payment failed or cancelled" : "Still waiting — your balance updates once paid");
        setOrderId(null);
      }
    }, 5000);
  };

  const submit = async () => {
    const amt = Math.floor(Number(amount));
    if (!amt || amt < 100) return toast.error("Minimum deposit is TZS 100");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("harakapay", { body: { action: "start", phone: phone.trim(), amount: amt } });
    setBusy(false);
    if (error || data?.error) return toast.error(data?.error ?? "Could not start payment");
    setOrderId(data.order_id);
    toast.success("Check your phone and enter your PIN");
    poll(data.order_id);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) window.clearInterval(timer.current); setOrderId(null); onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
          <DialogDescription>Pay with mobile money. You'll get a prompt on your phone.</DialogDescription>
        </DialogHeader>
        {orderId ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-success" />
            <p className="font-bold">Waiting for payment…</p>
            <p className="text-sm text-muted-foreground">Enter your PIN on the phone prompt. Ref: {orderId}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Input placeholder="Phone e.g. 0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
            <Input type="number" min={100} value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div className="grid grid-cols-4 gap-2">
              {[1000, 5000, 10000, 50000].map((v) => (
                <Button key={v} type="button" variant="secondary" size="sm" onClick={() => setAmount(String(v))}>{v.toLocaleString()}</Button>
              ))}
            </div>
            <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" disabled={busy} onClick={submit}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : `Deposit TZS ${Number(amount || 0).toLocaleString()}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
