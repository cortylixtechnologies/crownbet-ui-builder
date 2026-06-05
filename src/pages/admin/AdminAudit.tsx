import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; admin_email: string | null; action: string; entity: string | null; entity_id: string | null; details: any; created_at: string };

const AdminAudit = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(500)
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, []);

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (r.admin_email ?? "").toLowerCase().includes(s) || r.action.toLowerCase().includes(s) || (r.entity ?? "").toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Audit Log</h1>
        <p className="text-muted-foreground">Read-only record of admin actions.</p>
      </div>
      <Input placeholder="Filter by admin, action, entity…" value={q} onChange={(e) => setQ(e.target.value)} />
      <Card>
        <CardHeader><CardTitle>{filtered.length} of {rows.length} entries</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          {filtered.length === 0 && <p className="text-muted-foreground py-6 text-center">No entries yet.</p>}
          {filtered.map((r) => (
            <div key={r.id} className="grid grid-cols-[160px_180px_140px_1fr] gap-2 py-1.5 border-b border-border/40">
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
              <span className="font-medium truncate">{r.admin_email ?? "—"}</span>
              <span className="font-bold text-primary">{r.action}</span>
              <span className="text-xs text-muted-foreground truncate">{r.entity} {r.entity_id} {r.details ? JSON.stringify(r.details) : ""}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAudit;
