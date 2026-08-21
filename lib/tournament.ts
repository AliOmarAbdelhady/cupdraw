export interface Team {
  id: string;
  name: string;
}

/** matchId -> winning teamId */
export type Picks = Record<string, string>;

export const TEAM_COUNT = 16;

export const ROUNDS = [
  { key: "r16", label: "Round of 16", short: "R16", matches: 8 },
  { key: "qf", label: "Quarter-finals", short: "QF", matches: 4 },
  { key: "sf", label: "Semi-finals", short: "SF", matches: 2 },
  { key: "final", label: "Final", short: "Final", matches: 1 },
] as const;

export const TOTAL_ROUNDS = ROUNDS.length;
export const TOTAL_MATCHES = ROUNDS.reduce((n, r) => n + r.matches, 0);

export const matchId = (round: number, index: number) => `${round}:${index}`;

export interface BracketMatch {
  round: number;
  index: number;
  id: string;
  slots: [string | null, string | null];
  /** the picked team, but only when that team is actually one of the two current slots */
  winner: string | null;
}

export interface Bracket {
  rounds: BracketMatch[][];
  champion: string | null;
}

/**
 * Derives the whole bracket from the draw seed + the user's picks.
 * Slots of round r+1 are the winners of round r, so changing an earlier
 * pick automatically re-shapes everything downstream.
 *
 * A match only has a winner when BOTH of its slots are filled — a team can
 * never advance past an opponent that hasn't been decided yet.
 */
export function computeBracket(seed: string[], picks: Picks): Bracket {
  const rounds: BracketMatch[][] = [];

  for (let r = 0; r < TOTAL_ROUNDS; r++) {
    const count = ROUNDS[r].matches;
    const matches: BracketMatch[] = [];

    for (let m = 0; m < count; m++) {
      let slots: [string | null, string | null];
      if (r === 0) {
        slots = [seed[m * 2] ?? null, seed[m * 2 + 1] ?? null];
      } else {
        const prev = rounds[r - 1];
        slots = [prev[m * 2]?.winner ?? null, prev[m * 2 + 1]?.winner ?? null];
      }

      const id = matchId(r, m);
      const picked = picks[id] ?? null;
      const winner =
        picked && slots[0] && slots[1] && (picked === slots[0] || picked === slots[1])
          ? picked
          : null;

      matches.push({ round: r, index: m, id, slots, winner });
    }
    rounds.push(matches);
  }

  return { rounds, champion: rounds[TOTAL_ROUNDS - 1][0].winner };
}

/** Drops picks that no longer match the current bracket (e.g. after un-picking an earlier winner). */
export function sanitizePicks(seed: string[], picks: Picks): Picks {
  const { rounds } = computeBracket(seed, picks);
  const clean: Picks = {};
  for (const round of rounds) {
    for (const match of round) {
      if (match.winner) clean[match.id] = match.winner;
    }
  }
  return clean;
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
