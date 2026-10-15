import { Smartphone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
const AppAccess = () => <AppLayout><div className="reference-section-room py-16 px-4 text-center"><Smartphone className="w-16 h-16 mx-auto text-success" /><h1 className="text-3xl font-extrabold mt-5">CrownBet App</h1><p className="mt-3 text-sm opacity-70">CrownBet is available in your browser. A downloadable app is not available yet.</p><Button asChild className="mt-6 bg-success text-success-foreground"><Link to="/">Open Sports <ArrowRight /></Link></Button></div></AppLayout>;
export default AppAccess;
