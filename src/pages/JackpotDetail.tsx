import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type JP = { id: string; name: string; prize: number; entry_fee: number; deadline: string; status: string };
type JPM = { id: string; match_id: string; result: string | null };
type Match = { id: string; home: string; away: string; league: string };

const JackpotDetail = () => {
  const { id } = useParams();
  const { user, refreshProfile } = useAuth();
  const [jp, setJp] = useState<JP | null>(null);
  const [matches, setMatches] = useState<(JPM & { m?: Match })[]>([]);
  const [picks, setPicks] = useState<Record<string, "1" | "X" | "2">>({});

  const load = async () => {
    if (!id) return;
    const [{ data: j }, { data: jpm }] = await Promise.all([
      supabase.from("jackpots").select("*").eq("id", id).maybeSingle(),
      supabase.from("jackpot_matches").select("*").eq("jackpot_id", id),
    ]);
    setJp(j as any);
    const ids = (jpm ?? []).map((x: any) => x.match_id);
    let mm: Match[] = [];
    if (ids.length) {
      const { data: ms } = await supabase.from("matches").select("id,home,away,league").in("id", ids);
      mm = (ms ?? []) as Match[];
    }
    setMatches((jpm ?? []).map((x: any) => ({ ...x, m: mm.find((y) => y.id === x.match_id) })));
  };
  useEffect(() => { load(); }, [id]);

  const enter = async () => {
    if (!user) return toast.error("Sign in");
    if (!jp) return;
    if (Object.keys(picks).length !== matches.length)
      return toast.error("Pick every match");
    const payload: Record<string,string> = {};
    matches.forEach((m) => { payload[m.match_id] = picks[m.match_id]; });
    const { error } = await supabase.rpc("jackpot_enter", { _jp_id: jp.id, _picks: payload });
    if (error) return toast.error(error.message);
    toast.success("Entry submitted!");
    refreshProfile();
    setPicks({});
  };

  if (!jp) return <AppLayout><p className="p-4">Loading…</p></AppLayout>;

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <Link to="/jackpot" className="text-xs text-primary">← All jackpots</Link>
        <Card className="p-4 bg-gradient-to-br from-amber-500 to-red-600 text-white">
          <h1 className="text-xl font-extrabold">{jp.name}</h1>
          <p className="text-3xl font-extrabold mt-2">TZS {Number(jp.prize).toLocaleString()}</p>
          <p className="text-xs">Entry: TZS {jp.entry_fee}</p>
          <p className="text-xs">Deadline: {new Date(jp.deadline).toLocaleString()}</p>
        </Card>

        <div className="space-y-2">
          {matches.map((m) => (
            <Card key={m.id} className="p-3">
              <p className="text-xs text-muted-foreground">{m.m?.league}</p>
              <p className="font-bold">{m.m?.home} vs {m.m?.away}</p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(["1","X","2"] as const).map((p) => (
                  <button key={p} onClick={() => setPicks((s) => ({ ...s, [m.match_id]: p }))}
                    className={`py-2 rounded font-bold ${
                      picks[m.match_id] === p ? "bg-primary text-primary-foreground" : "bg-card border"
                    }`}>{p}</button>
                ))}
              </div>
              {m.result && <p className="text-xs mt-2 text-success">Result: {m.result}</p>}
            </Card>
          ))}
        </div>

        {jp.status === "open" && new Date(jp.deadline) > new Date() && (
          <Button onClick={enter} className="w-full h-12 font-extrabold"
            disabled={Object.keys(picks).length !== matches.length}>
            Submit Entry ({Object.keys(picks).length}/{matches.length})
          </Button>
        )}
      </div>
    </AppLayout>
  );
};

export default JackpotDetail;
