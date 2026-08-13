import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useAuthGate } from "@/context/AuthGateContext";
import { toast } from "sonner";

/**
 * Thin wrappers around the per-game SECURITY DEFINER RPCs.
 * All RNG and payouts are computed on the server.
 */
export const usePlayGame = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { openGate } = useAuthGate();
  const signedIn = !!user;
  const balance = Number(profile?.balance ?? 0);

  const handle = useCallback(
    async <T,>(builder: any): Promise<T | null> => {
      if (!signedIn) {
        openGate("Sign up or log in to play with real balance.");
        return null;
      }
      const { data, error } = await builder;
      if (error) {
        toast.error(error.message);
        return null;
      }
      await refreshProfile();
      return (Array.isArray(data) ? data[0] : data) as T;
    },
    [refreshProfile, signedIn, openGate]
  );


  return {
    signedIn,
    balance,
    refreshProfile,
    coinflip: (stake: number, pick: "H" | "T") =>
      handle<{ result: string; won: boolean; payout: number; new_balance: number }>(
        supabase.rpc("play_coinflip", { _stake: stake, _pick: pick })
      ),
    dice: (stake: number, target: number, over: boolean) =>
      handle<{ roll: number; won: boolean; multiplier: number; payout: number; new_balance: number }>(
        supabase.rpc("play_dice", { _stake: stake, _target: target, _over: over })
      ),
    wheel: (stake: number) =>
      handle<{ segment: number; multiplier: number; payout: number; new_balance: number }>(
        supabase.rpc("play_wheel", { _stake: stake })
      ),
    minesStart: (stake: number, mines: number) =>
      handle<{ round_id: string; new_balance: number }>(
        supabase.rpc("mines_start", { _stake: stake, _mines_count: mines })
      ),
    minesPick: (roundId: string, tile: number) =>
      handle<{ hit_mine: boolean; revealed_count: number; multiplier: number; status: string }>(
        supabase.rpc("mines_pick", { _round_id: roundId, _tile: tile })
      ),
    minesCashout: (roundId: string) =>
      handle<{ payout: number; multiplier: number; new_balance: number }>(
        supabase.rpc("mines_cashout", { _round_id: roundId })
      ),
    aviatorStart: (stake: number) =>
      handle<{ round_id: string; started_at: string; new_balance: number }>(
        supabase.rpc("aviator_start", { _stake: stake })
      ),
    aviatorCashout: (roundId: string, claimed: number) =>
      handle<{ payout: number; multiplier: number; crashed: boolean; crash_multiplier: number; new_balance: number }>(
        supabase.rpc("aviator_cashout", { _round_id: roundId, _claimed_multiplier: claimed })
      ),
    aviatorResolveCrashed: (roundId: string) =>
      supabase.rpc("aviator_resolve_crashed", { _round_id: roundId }),
  };
};
