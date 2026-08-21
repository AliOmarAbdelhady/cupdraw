"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { ChevronLeft, ChevronRight, PartyPopper, Trophy } from "lucide-react";
import { ROUNDS, type Bracket, type Team } from "@/lib/tournament";
import { MatchCard } from "@/components/match-card";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/utils";

const variants: Variants = {
  enter: (dir: number) => ({ x: dir * 56, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.05 },
  },
  exit: (dir: number) => ({ x: dir * -56, opacity: 0, transition: { duration: 0.18 } }),
};

export function MobileBracket({
  bracket,
  byId,
  activeRound,
  direction,
  revealed,
  onGo,
  onPick,
}: {
  bracket: Bracket;
  byId: Map<string, Team>;
  activeRound: number;
  direction: number;
  revealed: boolean;
  onGo: (round: number) => void;
  onPick: (matchId: string, teamId: string) => void;
}) {
  const round = bracket.rounds[activeRound];
  const meta = ROUNDS[activeRound];
  const decided = round.filter((m) => m.winner).length;
  const complete = decided === meta.matches;
  const champion = bracket.champion ? (byId.get(bracket.champion) ?? null) : null;

  return (
    <div className="xl:hidden">
      <div className="sticky top-14 z-20 -mx-3 mb-4 bg-background/85 px-3 py-2 backdrop-blur-lg">
        <div role="tablist" aria-label="Tournament rounds" className="flex gap-1 rounded-xl border border-border bg-muted p-1">
          {ROUNDS.map((r, i) => {
            const d = bracket.rounds[i].filter((m) => m.winner).length;
            const active = i === activeRound;
            return (
              <button
                key={r.key}
                role="tab"
                aria-selected={active}
                onClick={() => onGo(i)}
                className={cx(
                  "flex-1 cursor-pointer rounded-lg py-2.5 text-center text-[11px] font-semibold transition-all sm:text-xs",
                  active
                    ? "border border-border bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.short}
                <span className={cx("ml-1 tabular-nums", active ? "text-accent" : "opacity-60")}>
                  {d}/{r.matches}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={activeRound}
          custom={direction}
          variants={variants}
          initial="enter"
          animate={revealed ? "center" : "enter"}
          exit="exit"
        >
          <div className="mb-3 flex items-end justify-between px-1">
            <div>
              <h2 className="font-display text-xl font-bold">{meta.label}</h2>
              <p className="text-xs text-muted-foreground">
                {decided} of {meta.matches} matches decided
              </p>
            </div>
            {activeRound > 0 && (
              <Button variant="ghost" size="sm" className="h-9" onClick={() => onGo(activeRound - 1)}>
                <ChevronLeft className="size-3.5" />
                {ROUNDS[activeRound - 1].short}
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {round.map((m) => (
              <MatchCard key={m.id} match={m} byId={byId} onPick={onPick} size="lg" />
            ))}
          </div>

          {champion && activeRound === ROUNDS.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-4 rounded-2xl border border-gold/50 bg-gradient-to-r from-gold/15 via-card to-card p-4"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-gold/15 ring-2 ring-gold/50">
                <Trophy className="size-6 text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Champion</p>
                <p className="truncate font-display text-lg font-bold">{champion.name}</p>
              </div>
              <Button
                variant="gold"
                size="sm"
                onClick={() => import("@/lib/confetti").then((m) => m.fireChampionConfetti(2000))}
              >
                <PartyPopper className="size-3.5" />
              </Button>
            </motion.div>
          )}

          {complete && activeRound < ROUNDS.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-center"
            >
              <p className="text-sm font-semibold">Round complete!</p>
              <Button variant="primary" className="mt-3 w-full" onClick={() => onGo(activeRound + 1)}>
                Go to the {ROUNDS[activeRound + 1].label}
                <ChevronRight className="size-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
