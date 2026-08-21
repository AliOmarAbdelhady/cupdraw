"use client";

import { motion, type Variants } from "motion/react";
import { Check } from "lucide-react";
import { ROUNDS, type BracketMatch, type Team } from "@/lib/tournament";
import { TeamAvatar } from "@/components/team-avatar";
import { cx } from "@/lib/utils";

/** Variant keys cover both the desktop reveal (hidden/show) and mobile round slides (enter/center/exit). */
const item: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 26 } },
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 27 } },
  exit: { opacity: 0 },
};

export function MatchCard({
  match,
  byId,
  onPick,
  size = "sm",
}: {
  match: BracketMatch;
  byId: Map<string, Team>;
  onPick: (matchId: string, teamId: string) => void;
  size?: "sm" | "lg";
}) {
  // a match can only be decided once BOTH of its slots hold a team
  const ready = !!match.slots[0] && !!match.slots[1];

  return (
    <motion.div
      variants={item}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      {[0, 1].map((i) => {
        const id = match.slots[i];
        const team = id ? (byId.get(id) ?? null) : null;
        return (
          <div key={i} className={cx(i === 1 && "border-t border-border/70")}>
            <TeamSlot
              team={team}
              ready={ready}
              isWinner={!!team && match.winner === team.id}
              decided={!!match.winner}
              onPick={team ? () => onPick(match.id, team.id) : undefined}
              feederLabel={feederLabel(match, i)}
              size={size}
            />
          </div>
        );
      })}
    </motion.div>
  );
}

function feederLabel(match: BracketMatch, slot: number): string {
  if (match.round === 0) return "To be drawn";
  const feeder = match.index * 2 + slot;
  return `Winner · ${ROUNDS[match.round - 1].short} ${feeder + 1}`;
}

function TeamSlot({
  team,
  ready,
  isWinner,
  decided,
  onPick,
  feederLabel,
  size,
}: {
  team: Team | null;
  ready: boolean;
  isWinner: boolean;
  decided: boolean;
  onPick?: () => void;
  feederLabel: string;
  size: "sm" | "lg";
}) {
  const lg = size === "lg";
  const locked = !!team && !ready; // has a team, but no opponent to beat yet
  return (
    <button
      type="button"
      disabled={!team || locked}
      onClick={onPick}
      aria-pressed={isWinner}
      title={locked ? "Waiting for the other team to be decided" : undefined}
      aria-label={
        team
          ? locked
            ? `${team.name} — waiting for their opponent`
            : isWinner
              ? `${team.name} advances — tap to undo`
              : `Advance ${team.name}`
          : feederLabel
      }
      className={cx(
        "group relative flex w-full items-center gap-2.5 text-left outline-none transition-colors duration-200",
        lg ? "h-14 px-3.5" : "h-9 px-2.5",
        team && !locked
          ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-inset"
          : "cursor-default",
        isWinner ? "bg-accent/10" : team && !locked && "hover:bg-muted/60",
        decided && !isWinner && team && "opacity-45 saturate-50",
      )}
    >
      {isWinner && (
        <motion.span
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          className="absolute inset-y-0 left-0 w-[3px] origin-top bg-accent"
        />
      )}
      {team ? (
        <TeamAvatar name={team.name} size={lg ? "lg" : "sm"} />
      ) : (
        <span
          className={cx(
            "grid shrink-0 place-items-center rounded-lg border border-dashed border-border bg-muted/50 text-muted-foreground",
            lg ? "size-9" : "size-6",
          )}
        >
          <span className={lg ? "text-xs font-bold" : "text-[9px] font-bold"}>?</span>
        </span>
      )}
      <span
        className={cx(
          "min-w-0 flex-1 truncate font-medium",
          lg ? "text-[15px]" : "text-[13px]",
          !team && "font-normal italic text-muted-foreground/60",
        )}
      >
        {team ? team.name : feederLabel}
      </span>
      {team && !locked && (
        <span
          className={cx(
            "grid shrink-0 place-items-center rounded-full transition-colors",
            lg ? "size-6" : "size-5",
            isWinner ? "bg-accent text-accent-foreground" : "bg-muted/70 text-transparent group-hover:text-muted-foreground/60",
          )}
        >
          <Check className={lg ? "size-3.5" : "size-3"} strokeWidth={3.5} />
        </span>
      )}
    </button>
  );
}
