"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, type Variants } from "motion/react";
import { Dices, Plus, Sparkles, Trash2, Trophy, Users, X } from "lucide-react";
import { useCup } from "@/lib/store";
import { TEAM_COUNT } from "@/lib/tournament";
import { TeamAvatar } from "@/components/team-avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/utils";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
};

export function SetupScreen({ onDraw }: { onDraw: () => void }) {
  const teams = useCup((s) => s.teams);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const shake = useAnimationControls();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  const ready = teams.length === TEAM_COUNT;
  const remaining = TEAM_COUNT - teams.length;

  function submit() {
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    const ok = useCup.getState().addTeam(trimmed);
    if (!ok) {
      const exists = useCup
        .getState()
        .teams.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());
      setError(exists ? `“${trimmed}” is already in the cup` : `The cup is full — ${TEAM_COUNT} teams max`);
      void shake.start({ x: [0, -9, 9, -6, 6, -3, 0], transition: { duration: 0.4 } });
      return;
    }
    setError(null);
    setName("");
    inputRef.current?.focus();
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-10 sm:pt-16">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-8">
        <motion.header variants={item} className="flex flex-col items-center text-center">
          <Trophy className="size-10 text-accent" strokeWidth={1.8} />
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Cup<span className="text-gradient">Draw</span>
          </h1>
          <p className="mt-3 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
            Add {TEAM_COUNT} teams, run the lottery draw, and crown a champion — knockout style,
            right in your browser.
          </p>
        </motion.header>

        <motion.section variants={item} aria-label="Team entry">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span className="tabular-nums">
              {teams.length} of {TEAM_COUNT} teams
            </span>
            <span className={cx(ready && "font-semibold text-accent")}>
              {ready ? "Cup is full — ready to draw" : `${remaining} to go`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-highlight"
              animate={{ width: `${(teams.length / TEAM_COUNT) * 100}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
            />
          </div>

          <motion.form
            animate={shake}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mt-4 flex gap-2"
          >
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              maxLength={24}
              placeholder="Team name…"
              aria-label="Team name"
              className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-card px-4 text-[15px] outline-none transition placeholder:text-muted-foreground/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
            />
            <Button type="submit" className="h-12 shrink-0 px-4">
              <Plus className="size-4" />
              Add
            </Button>
          </motion.form>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-2 px-1 text-xs text-red-500"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-3 flex flex-wrap gap-2">
            {remaining > 0 && (
              <Button variant="ghost" size="sm" onClick={() => useCup.getState().fillSampleTeams()}>
                <Sparkles className="size-3.5" />
                Fill with famous clubs
              </Button>
            )}
            {teams.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => useCup.getState().clearTeams()}>
                <Trash2 className="size-3.5" />
                Clear all
              </Button>
            )}
          </div>
        </motion.section>

        <motion.section variants={item} aria-label="Teams">
          {teams.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              <Users className="size-6 opacity-50" />
              <p className="text-sm">
                Your teams will show up here.
                <br />
                Start typing above, or fill the cup with famous clubs.
              </p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {teams.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-card py-2.5 pl-3 pr-2"
                  >
                    <TeamAvatar name={t.name} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.name}</span>
                    <button
                      type="button"
                      onClick={() => useCup.getState().removeTeam(t.id)}
                      aria-label={`Remove ${t.name}`}
                      className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                    >
                      <X className="size-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.section>
      </motion.div>

      <div className="sticky bottom-0 z-20 -mx-4 mt-10 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 26 }}
        >
          <Button
            variant={ready ? "primary" : "secondary"}
            size="xl"
            disabled={!ready}
            onClick={onDraw}
            className={cx(
              "w-full font-display text-lg font-bold tracking-wide",
              ready && "animate-glow",
            )}
          >
            <Dices className="size-5" />
            {ready ? "Draw the Cup" : `Add ${remaining} more ${remaining === 1 ? "team" : "teams"}`}
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
