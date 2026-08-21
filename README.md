# CupDraw 🏆

**Live: https://cup-draw.pages.dev** (Cloudflare Pages, free tier)

Add 16 teams, run the lottery draw, and play out a Champions League–style knockout
bracket — Round of 16 → Quarter-finals → Semi-finals → Final → Champion.
Tap a team to advance them; tap again to undo (later rounds update automatically).

**No login, no database.** Everything runs in the browser and persists in
localStorage. The Share button copies a link that recreates your exact bracket.

## Stack

- [Next.js 16](https://nextjs.org) (static export) + React 19
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first theme tokens, dark/light)
- [motion](https://motion.dev) (springs, staggered reveals, round transitions)
- Zustand (persisted state), Radix Dialog, canvas-confetti, lucide-react

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build & deploy (Cloudflare)

```bash
npm run deploy          # → https://cup-draw.pages.dev (Pages, canonical)
npm run deploy:workers  # → https://cupdraw.edu-pulse-aliomar.workers.dev (backup)
npm test                # bracket engine test suite
```

One-time: `npx wrangler login`. Workers config lives in `wrangler.jsonc`.

## Structure

- `lib/tournament.ts` — pure bracket derivation (slots/rounds/champion from seed + picks)
- `lib/store.ts` — persisted client state (teams, seed, picks)
- `lib/share.ts` / `lib/share-client.ts` — URL-hash bracket sharing
- `components/` — setup screen, draw overlay, desktop bracket (SVG connectors),
  mobile round tabs, champion celebration, theme toggle
