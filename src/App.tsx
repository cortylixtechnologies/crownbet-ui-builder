import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BetslipProvider } from "@/context/BetslipContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BetslipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/games" element={<Games />} />
            <Route path="/open-bets" element={<OpenBets />} />
            <Route path="/me" element={<Me />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/live" element={<Live />} />
            <Route path="/load-code" element={<LoadCode />} />
            <Route path="/betslip" element={<Betslip />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BetslipProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
