import { matchId, TOTAL_ROUNDS, ROUNDS, TEAM_COUNT, type Picks, type Team } from "@/lib/tournament";
import { uid } from "@/lib/store";

export interface SharePayload {
  v: 1;
  /** team names, index = team index */
  n: string[];
  /** seed order as indices into n */
  s: number[];
  /** matchId -> winning team index */
  p: Record<string, number>;
}

export interface SharedState {
  teams: Team[];
  seed: string[];
  picks: Picks;
}

export function applySharePayload(payload: SharePayload): SharedState | null {
  const teams: Team[] = payload.n.map((name) => ({ id: uid(), name }));
  const ids = teams.map((t) => t.id);
  const picks: Picks = {};
  for (const [id, idx] of Object.entries(payload.p)) {
    picks[id] = ids[idx] ?? "";
  }
  return { teams, seed: payload.s.map((i) => ids[i]), picks };
}

export function encodeShare(teams: Team[], seed: string[], picks: Picks): string {
  const idx = new Map(teams.map((t, i) => [t.id, i]));
  const payload: SharePayload = {
    v: 1,
    n: teams.map((t) => t.name),
    s: seed.map((id) => idx.get(id) ?? 0),
    p: Object.fromEntries(
      Object.entries(picks).map(([k, v]) => [k, idx.get(v) ?? 0] as const),
    ),
  };
  const json = JSON.stringify(payload);
  return btoa(String.fromCharCode(...new TextEncoder().encode(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeShare(code: string): SharePayload | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const json = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    const raw = JSON.parse(json) as SharePayload;
    if (raw.v !== 1) return null;
    if (!Array.isArray(raw.n) || raw.n.length !== TEAM_COUNT) return null;
    if (!raw.n.every((x) => typeof x === "string" && x.trim().length > 0 && x.length <= 40)) return null;
    const sorted = [...raw.s].sort((a, b) => a - b);
    if (sorted.length !== TEAM_COUNT || sorted.some((v, i) => v !== i)) return null;
    const validMatches = new Set<string>();
    for (let r = 0; r < TOTAL_ROUNDS; r++) {
      for (let m = 0; m < ROUNDS[r].matches; m++) validMatches.add(matchId(r, m));
    }
    for (const [k, v] of Object.entries(raw.p)) {
      if (!validMatches.has(k) || typeof v !== "number" || v < 0 || v >= TEAM_COUNT) return null;
    }
    return raw;
  } catch {
    return null;
  }
}

/** Reads a shared bracket from `#b=…` in the URL, if present and valid. */
export function readShareFromLocation(): SharePayload | null {
  if (typeof window === "undefined") return null;
  const m = /[#&]b=([A-Za-z0-9_-]+)/.exec(window.location.hash);
  if (!m) return null;
  return decodeShare(m[1]);
}
