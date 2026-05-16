import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export type PlayGameArgs = {
  game: string;
  stake: number;
  payout: number;
  multiplier?: number | null;
  meta?: Record<string, any> | null;
};

export const usePlayGame = () => {
  const { user, profile, refreshProfile } = useAuth();

  const play = useCallback(
    async ({ game, stake, payout, multiplier, meta }: PlayGameArgs) => {
      if (!user) {
        toast.error("Please sign in to play");
        return { ok: false as const };
      }
      const { data, error } = await supabase.rpc("play_game", {
        _game: game,
        _stake: stake,
        _payout: payout,
        _multiplier: multiplier ?? null,
        _meta: (meta as any) ?? null,
      });
      if (error) {
        toast.error(error.message);
        return { ok: false as const };
      }
      await refreshProfile();
      const row = Array.isArray(data) ? data[0] : data;
      return { ok: true as const, newBalance: Number(row?.new_balance ?? 0) };
    },
    [user, refreshProfile]
  );

  return { play, balance: Number(profile?.balance ?? 0), signedIn: !!user };
};
