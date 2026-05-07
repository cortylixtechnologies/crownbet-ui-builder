import { useAdmin } from "@/context/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const AdminUsers = () => {
  const { store, updateUser, deleteUser } = useAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Users</h1>
        <p className="text-muted-foreground">Manage player accounts and balances</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All Users ({store.users.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {store.users.map((u) => (
            <div key={u.id} className="grid md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center bg-secondary rounded-lg p-3">
              <div>
                <div className="font-bold text-sm">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </div>
              <Input
                className="h-9 w-28"
                type="number"
                value={u.balance}
                onChange={(e) => updateUser(u.id, { balance: +e.target.value })}
              />
              <Button
                size="sm"
                variant={u.status === "active" ? "default" : "destructive"}
                onClick={() => updateUser(u.id, { status: u.status === "active" ? "suspended" : "active" })}
                className={u.status === "active" ? "bg-success hover:bg-success/90" : ""}
              >
                {u.status === "active" ? "Active" : "Suspended"}
              </Button>
              <Button size="icon" variant="destructive" onClick={() => deleteUser(u.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
