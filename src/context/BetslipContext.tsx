import { createContext, useContext, useState, ReactNode, useMemo } from "react";

export type BetSelection = {
  id: string;
  matchId: string;
  match: string;
  market: string;
  pick: string;
  odd: number;
};

type BetslipCtx = {
  selections: BetSelection[];
  addSelection: (s: BetSelection) => void;
  removeSelection: (id: string) => void;
  clear: () => void;
  totalOdds: number;
};

const Ctx = createContext<BetslipCtx | null>(null);

export const BetslipProvider = ({ children }: { children: ReactNode }) => {
  const [selections, setSelections] = useState<BetSelection[]>([]);

  const addSelection = (s: BetSelection) => {
    setSelections((prev) => {
      // replace selection from same match
      const filtered = prev.filter((p) => p.matchId !== s.matchId);
      return [...filtered, s];
    });
  };
  const removeSelection = (id: string) => setSelections((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setSelections([]);

  const totalOdds = useMemo(
    () => selections.reduce((acc, s) => acc * s.odd, 1),
    [selections]
  );

  return (
    <Ctx.Provider value={{ selections, addSelection, removeSelection, clear, totalOdds }}>
      {children}
    </Ctx.Provider>
  );
};

export const useBetslip = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBetslip must be used in BetslipProvider");
  return c;
};
