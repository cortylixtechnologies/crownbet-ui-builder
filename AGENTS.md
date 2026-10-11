# Project architecture
- Keep public home category browsing separate from wager and game-entry calls to action; the latter use the shared auth gate so signed-out visitors can explore without placing bets.
- Keep the desktop sportsbook home in a shared-width promotional band followed by fixture and betslip columns; this keeps navigation and odds aligned across the page.
- Keep Aviator flight coordinates and artwork in a presentation-only stage, separate from the existing server wager calls; visual changes must not affect payouts or round settlement.
