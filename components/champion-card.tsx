"use client";

import { motion } from "motion/react";
import { PartyPopper, Trophy } from "lucide-react";
import type { Team } from "@/lib/tournament";
import { Button } from "@/components/ui/button";
import { fireChampionConfetti } from "@/lib/confetti";

export function ChampionCard({
  champion,
  onCelebrate,
}: {
  champion: Team | null;
  onCelebrate?: () => void;
}) {
  if (!champion) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center">
        <Trophy className="mx-auto size-8 text-muted-foreground/40" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
          Champion
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">Decide the final to crown them</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="w-full rounded-2xl border border-gold/50 bg-gradient-to-b from-gold/15 via-card to-card p-5 text-center shadow-lg shadow-gold/10"
    >
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-gold/15 ring-2 ring-gold/50">
        <Trophy className="size-8 text-gold" />
      </div>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Champion</p>
      <p className="mt-1 font-display text-xl font-bold">{champion.name}</p>
      <Button
        variant="gold"
        size="sm"
        className="mt-4 w-full"
        onClick={() => (onCelebrate ? onCelebrate() : fireChampionConfetti(2000))}
      >
        <PartyPopper className="size-3.5" />
        Celebrate
      </Button>
    </motion.div>
  );
}
