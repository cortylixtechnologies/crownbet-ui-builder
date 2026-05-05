import { Link } from "react-router-dom";
import { Crown } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen bg-gradient-dark text-white flex flex-col items-center justify-center px-6 text-center">
    <Crown className="w-16 h-16 text-gold mb-4" />
    <h1 className="text-5xl font-extrabold">404</h1>
    <p className="mt-2 text-white/70">This page doesn't exist on CrownBet.</p>
    <Link to="/" className="mt-6 px-6 py-3 bg-gradient-primary rounded-lg font-bold">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
