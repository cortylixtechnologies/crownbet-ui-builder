import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useBetslip } from "@/context/BetslipContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export const SectionBetslip = () => {
  const { selections, totalOdds } = useBetslip();
  const { session } = useAuth();
  return <aside className="space-y-4">
    {!session && <section className="reference-section-panel p-4"><h2 className="font-bold mb-4">Instant Registration</h2><Button asChild className="w-full bg-success text-success-foreground hover:bg-success/90"><Link to="/register">Register</Link></Button></section>}
    <section className="reference-section-panel"><h2 className="p-4 font-bold border-b border-surface-dark-muted">Betslip <span className="text-gold">{selections.length}</span></h2>{selections.length ? <div className="p-4 space-y-3">{selections.map((selection) => <div key={selection.id} className="text-xs"><strong>{selection.match}</strong><div className="mt-1 opacity-70">{selection.pick} · {selection.odd.toFixed(2)}</div></div>)}<div className="text-sm">Total odds: {totalOdds.toFixed(2)}</div><Button asChild className="w-full bg-success text-success-foreground"><Link to="/betslip">Open betslip</Link></Button></div> : <div className="p-6 text-center text-sm opacity-60"><ClipboardList className="mx-auto mb-3 w-8 h-8" />No selections added.</div>}</section>
  </aside>;
};
