import { RotateCw, Users } from "lucide-react";
import { flightPosition } from "@/lib/aviatorFlight";

type Props = {
  phase: "waiting" | "running" | "crashed";
  multiplier: number;
  countdown: number;
  cashedAt: number | null;
  bet: number;
  spectators: number;
};

export const AviatorFlightStage = ({ phase, multiplier, countdown, cashedAt, bet, spectators }: Props) => {
  const { x, y } = flightPosition(multiplier);
  const curve = `M 0 450 Q ${x * 0.55} 450 ${x} ${y}`;
  return (
    <div className={`aviator-flight ${multiplier >= 2 ? "aviator-flight-high" : ""}`} data-phase={phase} aria-label="Aviator flight screen">
      <div className="aviator-rays" aria-hidden="true" />
      <svg className="aviator-chart" viewBox="0 0 900 450" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="aviator-trail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--aviator-red)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--aviator-red)" stopOpacity="0.23" />
          </linearGradient>
        </defs>
        {phase !== "waiting" && <>
          <path d={`${curve} L ${x} 450 Z`} fill="url(#aviator-trail)" />
          <path d={curve} fill="none" stroke="var(--aviator-red)" strokeWidth="4" />
        </>}
        <g transform={`translate(${x}, ${y})`}>
          <g className={`aviator-plane ${phase === "crashed" ? "aviator-plane-away" : ""}`}>
            <svg x="-35" y="-53" width="132" height="72" viewBox="0 0 160 90" className="aviator-plane-art">
              <g transform="rotate(-9 80 45)" fill="var(--aviator-red)">
                <path d="M20 51 8 28 22 28 42 47 105 38 125 42 138 49 127 58 53 66 20 61 4 58 7 51Z" />
                <path d="M48 45 37 22 60 18 94 38 112 39 105 46Z M44 59 27 74 50 75 102 56Z" />
                <path d="m70 43 6-15 19-2 15 15Z" />
                <path d="m78 39 3-8 10-1 10 9Z" fill="var(--aviator-canvas)" />
                <path d="m20 53 12-2 6 5-13 2Z" fill="var(--aviator-canvas)" />
                <path d="M126 40 133 40 135 59 129 60Z" />
                <g className="aviator-propeller">
                  <ellipse cx="143" cy="48" rx="3" ry="32" fill="none" stroke="var(--aviator-red)" strokeWidth="3" />
                  <path d="M139 47h9v5h-9Z" />
                </g>
                <path d="m111 46 8 9 m0-10-8 10" fill="none" stroke="var(--aviator-canvas)" strokeWidth="3" />
              </g>
            </svg>
          </g>
        </g>
      </svg>
      <div className="aviator-flight-label" aria-live="polite">
        {phase === "waiting" ? <>
          <RotateCw className="mx-auto mb-3 h-7 w-7 motion-safe:animate-spin opacity-60" />
          <div className="text-xl sm:text-2xl font-bold">READY TO FLY</div>
          <div className="mt-2 text-sm opacity-60">Next round in {countdown}s</div>
          <div className="aviator-countdown"><span style={{ width: `${countdown * 20}%` }} /></div>
        </> : <>
          {phase === "crashed" && <div className="aviator-flew-away">FLEW AWAY!</div>}
          <div className={`aviator-multiplier ${phase === "crashed" ? "aviator-ended" : ""}`}>{multiplier.toFixed(2)}x</div>
        </>}
        {cashedAt !== null && phase !== "waiting" && <div className="aviator-win">Won ${(bet * cashedAt).toFixed(2)} @ {cashedAt.toFixed(2)}x</div>}
      </div>
      <div className="aviator-viewers"><Users className="h-3 w-3" /> {spectators}</div>
    </div>
  );
};