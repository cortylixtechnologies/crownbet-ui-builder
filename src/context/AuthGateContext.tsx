import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown } from "lucide-react";

type GateCtx = {
  /** Runs `action` when signed in, otherwise opens the sign-up prompt. Returns true when allowed. */
  requireAuth: (action?: () => void, message?: string) => boolean;
  openGate: (message?: string) => void;
};

const Ctx = createContext<GateCtx | null>(null);

export const AuthGateProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>();

  const openGate = useCallback((msg?: string) => {
    setMessage(msg);
    setOpen(true);
  }, []);

  const requireAuth = useCallback(
    (action?: () => void, msg?: string) => {
      if (session) {
        action?.();
        return true;
      }
      openGate(msg);
      return false;
    },
    [session, openGate]
  );

  const go = (path: string) => {
    setOpen(false);
    navigate(path, { state: { from: window.location.pathname } });
  };

  return (
    <Ctx.Provider value={{ requireAuth, openGate }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center mb-2">
              <Crown className="w-6 h-6" />
            </div>
            <DialogTitle className="text-center">Create your CrownBet account</DialogTitle>
            <DialogDescription className="text-center">
              {message ?? "You need an account to place bets and follow live matches."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <Button
              onClick={() => go("/register")}
              className="w-full bg-gradient-primary text-primary-foreground font-bold h-11"
            >
              Register
            </Button>
            <Button variant="outline" onClick={() => go("/login")} className="w-full font-bold h-11">
              Log in
            </Button>
            <button
              onClick={() => setOpen(false)}
              className="w-full text-xs text-muted-foreground pt-1 hover:text-foreground"
            >
              Keep browsing
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
};

export const useAuthGate = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuthGate must be used inside AuthGateProvider");
  return c;
};
