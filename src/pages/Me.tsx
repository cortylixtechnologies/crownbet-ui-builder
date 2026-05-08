import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { User, Moon, Wallet, ArrowDownCircle, Receipt, RefreshCw, Gift, Headphones, Info, ChevronRight, Crown } from "lucide-react";

const Me = () => {
  return (
    <AppLayout hideHeader>
      <div className="bg-surface-dark text-surface-dark-foreground px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-dark-muted flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-xl font-extrabold">
              Login to View <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
          <button className="flex items-center gap-1 text-sm">
            Dark Mode <Moon className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <span className="text-sm text-white/70">Total Balance</span>
          <span className="text-2xl font-extrabold">TZS --</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button className="bg-success text-success-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2">
            <Wallet className="w-5 h-5" /> Deposit
          </button>
          <button className="border-2 border-success text-success py-3 rounded-lg font-bold flex items-center justify-center gap-2">
            <ArrowDownCircle className="w-5 h-5" /> Withdraw
          </button>
        </div>

        <div className="mt-4 rounded-lg overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-gold" />
            <span className="font-extrabold italic">Crown Loyalty</span>
          </div>
          <button className="text-success font-bold flex items-center gap-1 text-sm">
            Log in to join <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 bg-surface-dark-muted rounded-lg overflow-hidden divide-x divide-white/10">
          {[
            { icon: Receipt, label: "Sports Bet History" },
            { icon: RefreshCw, label: "Transaction Records" },
            { icon: Gift, label: "Gifts (0)\nLucky Wheel (0)" },
          ].map(({ icon: Icon, label }, i) => (
            <button key={i} className="py-4 px-2 flex flex-col items-center gap-2 text-xs text-center whitespace-pre-line">
              <Icon className="w-6 h-6" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card divide-y divide-border">
        <button className="w-full flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3 font-medium">
            <Headphones className="w-5 h-5" /> Customer Service
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            Online 24/7 <ChevronRight className="w-4 h-4" />
          </div>
        </button>
        <button className="w-full flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3 font-medium">
            <Info className="w-5 h-5" /> How to play
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="bg-secondary px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-bold text-foreground">18+</span>
        <span>© 2026 CrownBet. All rights reserved.</span>
      </div>

      <div className="bg-surface-dark text-white px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <Crown className="w-6 h-6 text-gold" />
          <span className="font-extrabold text-primary">CrownBet</span>
          <span className="text-white/40">|</span>
          <span className="text-xs text-white/80">Official Sports<br />Betting Partner</span>
        </div>
        <p className="mt-3 text-sm text-white/70">The world's most trusted betting crown</p>
      </div>
    </AppLayout>
  );
};

export default Me;
