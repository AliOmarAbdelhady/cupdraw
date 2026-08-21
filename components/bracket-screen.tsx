"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, RotateCcw, Share2 } from "lucide-react";
import { useCup } from "@/lib/store";
import { computeBracket, ROUNDS, TOTAL_MATCHES } from "@/lib/tournament";
import { copyBracketLink } from "@/lib/share-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { DesktopBracket } from "@/components/desktop-bracket";
import { MobileBracket } from "@/components/mobile-bracket";
import { ResetDialog } from "@/components/reset-dialog";

export function BracketScreen({
  revealed,
  onRedraw,
}: {
  revealed: boolean;
  onRedraw: () => void;
}) {
  const teams = useCup((s) => s.teams);
  const seed = useCup((s) => s.seed);
  const picks = useCup((s) => s.picks);

  const byId = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const bracket = useMemo(() => (seed ? computeBracket(seed, picks) : null), [seed, picks]);

  const [activeRound, setActiveRound] = useState(0);
  const [direction, setDirection] = useState(1);
  const [resetOpen, setResetOpen] = useState(false);
  const roundWasComplete = useRef(false);

  const onPick = useCallback((matchId: string, teamId: string) => {
    useCup.getState().pick(matchId, teamId);
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(8);
    }
  }, []);

  const go = useCallback(
    (r: number) => {
      setDirection(r >= activeRound ? 1 : -1);
      setActiveRound(r);
      window.scrollTo({ top: 0 });
    },
    [activeRound],
  );

  // On mobile/tablet, glide to the next round shortly after the current one is fully decided.
  useEffect(() => {
    roundWasComplete.current = false;
  }, [activeRound]);

  useEffect(() => {
    if (!bracket) return;
    const complete = bracket.rounds[activeRound].every((m) => m.winner);
    if (complete && !roundWasComplete.current && activeRound < ROUNDS.length - 1) {
      roundWasComplete.current = true;
      const t = window.setTimeout(() => go(activeRound + 1), 1100);
      return () => window.clearTimeout(t);
    }
    roundWasComplete.current = complete;
  }, [bracket, activeRound, go]);

  if (!seed || !bracket) return null;

  const decidedTotal = bracket.rounds.flat().filter((m) => m.winner).length;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-2 px-3 sm:px-6">
          <span className="font-display text-base font-bold tracking-tight">
            Cup<span className="text-gradient">Draw</span>
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="mr-2 hidden items-center gap-2 sm:flex">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-highlight"
                  initial={false}
                  animate={{ width: `${(decidedTotal / TOTAL_MATCHES) * 100}%` }}
                  transition={{ type: "spring", stiffness: 180, damping: 24 }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{decidedTotal}/15</span>
            </div>
            <ThemeToggle />
            <ShareButton />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tournament options"
              onClick={() => setResetOpen(true)}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-accent to-highlight"
          initial={false}
          animate={{ scaleX: decidedTotal / TOTAL_MATCHES }}
          transition={{ type: "spring", stiffness: 160, damping: 26 }}
        />
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-3 py-4 sm:px-6 sm:py-6">
        <MobileBracket
          bracket={bracket}
          byId={byId}
          activeRound={activeRound}
          direction={direction}
          revealed={revealed}
          onGo={go}
          onPick={onPick}
        />
        <DesktopBracket bracket={bracket} byId={byId} revealed={revealed} onPick={onPick} />
      </main>

      <ResetDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        onRedraw={() => {
          setResetOpen(false);
          onRedraw();
        }}
      />
    </div>
  );
}

function ShareButton() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function share() {
    const ok = await copyBracketLink();
    toast(ok ? "Bracket link copied!" : "Couldn't copy — try again");
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Share bracket" onClick={share}>
      {copied ? <Check className="size-4 text-accent" /> : <Share2 className="size-4" />}
    </Button>
  );
}
