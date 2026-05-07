import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BetslipProvider } from "@/context/BetslipContext";
import { AdminProvider } from "@/context/AdminContext";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Games from "./pages/Games";
import OpenBets from "./pages/OpenBets";
import Me from "./pages/Me";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Live from "./pages/Live";
import LoadCode from "./pages/LoadCode";
import Betslip from "./pages/Betslip";
import League from "./pages/League";
import Jackpot from "./pages/Jackpot";
import Virtuals from "./pages/Virtuals";
import Livescore from "./pages/Livescore";
import Results from "./pages/Results";
import Promotions from "./pages/Promotions";
import NotFound from "./pages/NotFound";
import Aviator from "./pages/games/Aviator";
import CoinFlip from "./pages/games/CoinFlip";
import Dice from "./pages/games/Dice";
import Mines from "./pages/games/Mines";
import Wheel from "./pages/games/Wheel";
import AdminLogin from "./pages/admin/AdminLogin";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMatches from "./pages/admin/AdminMatches";
import AdminLive from "./pages/admin/AdminLive";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminGames from "./pages/admin/AdminGames";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminProvider>
        <BetslipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/aviator" element={<Aviator />} />
              <Route path="/games/coin-flip" element={<CoinFlip />} />
              <Route path="/games/dice" element={<Dice />} />
              <Route path="/games/mines" element={<Mines />} />
              <Route path="/games/wheel" element={<Wheel />} />
              <Route path="/open-bets" element={<OpenBets />} />
              <Route path="/me" element={<Me />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/live" element={<Live />} />
              <Route path="/load-code" element={<LoadCode />} />
              <Route path="/betslip" element={<Betslip />} />
              <Route path="/league/:slug" element={<League />} />
              <Route path="/jackpot" element={<Jackpot />} />
              <Route path="/virtuals" element={<Virtuals />} />
              <Route path="/livescore" element={<Livescore />} />
              <Route path="/results" element={<Results />} />
              <Route path="/promotions" element={<Promotions />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="matches" element={<AdminMatches />} />
                <Route path="live" element={<AdminLive />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="games" element={<AdminGames />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BetslipProvider>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
