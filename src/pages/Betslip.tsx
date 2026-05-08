import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBetslip } from "@/context/BetslipContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Betslip = () => {
  const { selections, removeSelection, clear, totalOdds } = useBetslip();
  const { session, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [stake, setStake] = useState(100);
  const [placing, setPlacing] = useState(false);
  const potential = stake * totalOdds;

  const placeBet = async () => {
    if (!session) {
      toast.info("Log in to place a bet");
      navigate("/login", { state: { from: "/betslip" } });
      return;
    }
    if (selections.length === 0) return;
    setPlacing(true);
    const { data, error } = await supabase.rpc("place_bet", {
      _stake: stake,
      _selections: selections.map((s) => ({
        match_id: s.matchId,
        match_label: s.match,
        market: s.market,
        pick: s.pick,
        odd: s.odd,
      })),
    });
    setPlacing(false);
    if (error) return toast.error(error.message);
    toast.success(`Bet placed! ID: ${String(data).slice(0, 8)}`);
    clear();
    await refreshProfile();
    navigate("/open-bets");
  };

  return (
    <AppLayout>
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-foreground">Betslip ({selections.length})</h1>
        {selections.length > 0 && (
          <button onClick={clear} className="text-destructive text-sm font-bold flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {profile && (
        <div className="bg-secondary px-4 py-2 text-xs text-muted-foreground flex justify-between">
          <span>Balance</span>
          <span className="font-bold text-foreground">TZS {Number(profile.balance).toLocaleString()}</span>
        </div>
      )}

      {selections.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-muted-foreground">Your betslip is empty.</p>
          <Link to="/" className="inline-block mt-4 text-primary font-bold">Browse matches →</Link>
        </div>
      ) : (
        <>
          <div className="px-3 py-3 space-y-2">
            {selections.map((s) => (
              <div key={s.id} className="bg-card rounded-lg p-3 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{s.market}</div>
                    <div className="font-bold text-foreground truncate">{s.match}</div>
                    <div className="text-sm mt-1">
                      Pick: <span className="font-bold text-success">{s.pick}</span> @ <span className="font-bold">{s.odd.toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeSelection(s.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card mx-3 rounded-lg p-4 shadow-card space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total odds</span>
              <span className="font-bold text-foreground">{totalOdds.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Stake (TZS)</span>
              <Input type="number" value={stake}
                onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
                className="flex-1 h-10" />
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <span className="font-bold text-foreground">Potential win</span>
              <span className="font-extrabold text-success text-lg">
                TZS {potential.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <Button onClick={placeBet} disabled={placing}
              className="w-full bg-gradient-primary text-primary-foreground font-bold h-12 text-base">
              {placing ? "Placing…" : session ? "Place Bet" : "Log in to place bet"}
            </Button>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Betslip;
