import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: any) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Users</h1>
        <p className="text-muted-foreground">Manage player accounts and balances</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All Users ({users.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="grid md:grid-cols-[1fr_auto_auto] gap-3 items-center bg-secondary rounded-lg p-3">
              <div>
                <div className="font-bold text-sm">{u.display_name ?? u.email}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </div>
              <Input className="h-9 w-32" type="number" step="0.01" value={u.balance}
                onChange={(e) => update(u.id, { balance: +e.target.value })} />
              <Button size="sm"
                variant={u.status === "active" ? "default" : "destructive"}
                onClick={() => update(u.id, { status: u.status === "active" ? "suspended" : "active" })}
                className={u.status === "active" ? "bg-success hover:bg-success/90" : ""}>
                {u.status === "active" ? "Active" : "Suspended"}
              </Button>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm text-muted-foreground">No users yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
