"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  sanitizePicks,
  shuffle,
  TEAM_COUNT,
  type Picks,
  type Team,
} from "@/lib/tournament";
import { SAMPLE_TEAMS } from "@/lib/sample-teams";
import { applySharePayload, type SharePayload } from "@/lib/share";

type Stage = "setup" | "bracket";

interface CupState {
  stage: Stage;
  teams: Team[];
  /** team ids in bracket order, set by the draw */
  seed: string[] | null;
  picks: Picks;
  /** bumped on every draw so bracket entrance animations replay */
  drawId: number;

  addTeam: (name: string) => boolean;
  removeTeam: (id: string) => void;
  clearTeams: () => void;
  fillSampleTeams: () => void;
  draw: () => void;
  pick: (matchId: string, teamId: string) => void;
  toSetup: () => void;
  eraseAll: () => void;
  loadShare: (payload: SharePayload) => void;
}

type PersistedSlice = Pick<CupState, "stage" | "teams" | "seed" | "picks" | "drawId">;

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

export const useCup = create<CupState>()(
  persist<CupState, [], [], PersistedSlice>(
    (set, get) => ({
      stage: "setup",
      teams: [],
      seed: null,
      picks: {},
      drawId: 0,

      addTeam: (name) => {
        const n = name.trim().replace(/\s+/g, " ");
        if (!n || get().teams.length >= TEAM_COUNT) return false;
        if (get().teams.some((t) => t.name.toLowerCase() === n.toLowerCase())) return false;
        set({ teams: [...get().teams, { id: uid(), name: n }] });
        return true;
      },

      removeTeam: (id) => set({ teams: get().teams.filter((t) => t.id !== id) }),

      clearTeams: () => set({ teams: [] }),

      fillSampleTeams: () => {
        const existing = new Set(get().teams.map((t) => t.name.toLowerCase()));
        const additions = SAMPLE_TEAMS.filter((n) => !existing.has(n.toLowerCase()))
          .slice(0, TEAM_COUNT - get().teams.length)
          .map((n) => ({ id: uid(), name: n }));
        if (additions.length) set({ teams: [...get().teams, ...additions] });
      },

      draw: () => {
        set({
          seed: shuffle(get().teams.map((t) => t.id)),
          picks: {},
          stage: "bracket",
          drawId: get().drawId + 1,
        });
      },

      pick: (id, teamId) => {
        const current = get().picks;
        const next = { ...current };
        if (next[id] === teamId) delete next[id];
        else next[id] = teamId;
        const seed = get().seed;
        set({ picks: seed ? sanitizePicks(seed, next) : next });
      },

      toSetup: () => set({ stage: "setup", seed: null, picks: {} }),

      eraseAll: () => set({ stage: "setup", teams: [], seed: null, picks: {} }),

      loadShare: (payload) => {
        const result = applySharePayload(payload);
        if (result) set({ ...result, stage: "bracket", drawId: get().drawId + 1 });
      },
    }),
    {
      name: "cupdraw:v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        stage: s.stage,
        teams: s.teams,
        seed: s.seed,
        picks: s.picks,
        drawId: s.drawId,
      }),
    },
  ),
);
