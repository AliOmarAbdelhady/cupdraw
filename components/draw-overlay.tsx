"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Dices } from "lucide-react";
import { useCup } from "@/lib/store";
import { shuffle } from "@/lib/tournament";
import { burst } from "@/lib/confetti";
import { TeamAvatar } from "@/components/team-avatar";

/** Slot-machine style shuffle, shown while the freshly drawn bracket staggers in behind it. */
export function DrawOverlay({ onFinish }: { onFinish: () => void }) {
  const teams = useCup((s) => s.teams);
  const [current, setCurrent] = useState(teams[0] ?? null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (teams.length === 0) {
      onFinish();
      return;
    }
    const pool = shuffle(teams);
    let i = 0;
    const iv = window.setInterval(() => {
      i = (i + 1) % pool.length;
      setCurrent(pool[i]);
    }, 80);
    const t1 = window.setTimeout(() => {
      window.clearInterval(iv);
      setDone(true);
      burst();
    }, 1500);
    const t2 = window.setTimeout(onFinish, 2350);
    return () => {
      window.clearInterval(iv);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [teams, onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-40 grid place-items-center bg-background/90 p-6 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="select-none text-center" aria-live="polite">
        {done ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="flex flex-col items-center gap-3"
          >
            <CheckCircle2 className="size-14 text-accent" strokeWidth={1.8} />
            <p className="font-display text-3xl font-bold">Draw complete!</p>
            <p className="text-sm text-muted-foreground">The Round of 16 is set</p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Shuffling the pot
            </p>
            <motion.div
              key={current?.id ?? "none"}
              initial={{ y: 14, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.09 }}
              className="flex min-h-[88px] items-center gap-4 rounded-2xl border border-border bg-card px-7 py-5 shadow-2xl"
            >
              {current && <TeamAvatar name={current.name} size="lg" className="size-11 text-base" />}
              <span className="font-display text-3xl font-bold">{current?.name ?? ""}</span>
            </motion.div>
            <Dices className="size-7 animate-spin text-accent [animation-duration:2.4s]" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
