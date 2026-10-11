// Presentation coordinates only; never used to calculate payouts or resolve rounds.
export const flightPosition = (multiplier: number) => {
  const progress = Math.max(0, Math.min(1, 1 - Math.exp(-Math.log(Math.max(1, multiplier)) * 1.2)));
  return { x: 24 + progress * 770, y: 438 - progress * progress * 350 };
};