"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { copyBracketLink } from "@/lib/share-client";
import { fireChampionConfetti } from "@/lib/confetti";

export function ChampionOverlay({
  open,
  onClose,
  championName,
}: {
  open: boolean;
  onClose: () => void;
  championName: string;
}) {
  const toast = useToast();

  useEffect(() => {
    if (open) fireChampionConfetti(2600);
  }, [open]);

  async function share() {
    toast((await copyBracketLink()) ? "Bracket link copied!" : "Couldn't copy — try again");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-background/85 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, y: 36, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-gold/40 bg-card p-8 text-center shadow-2xl shadow-gold/10"
            role="dialog"
            aria-label={`${championName} is the champion`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl"
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto grid size-24 place-items-center rounded-full bg-gold/15 ring-2 ring-gold/50"
            >
              <Trophy className="size-11 text-gold" />
            </motion.div>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.35em] text-gold">Champion</p>
            <h2 className="text-gradient mt-2 font-display text-4xl font-bold leading-tight">
              {championName}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">15 matches. One crown. The cup is theirs.</p>
            <div className="mt-7 grid gap-2">
              <Button variant="gold" size="lg" onClick={share}>
                <Share2 className="size-4" />
                Share this bracket
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Back to the bracket
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
