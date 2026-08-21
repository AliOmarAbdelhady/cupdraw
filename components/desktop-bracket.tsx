"use client";

import { motion, type Variants } from "motion/react";
import { ROUNDS, type Bracket, type Team } from "@/lib/tournament";
import { MatchCard } from "@/components/match-card";
import { ChampionCard } from "@/components/champion-card";
import { cx } from "@/lib/utils";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const GRID_COLS = "repeat(7, minmax(0, 1fr))";

/**
 * Mirrored bracket: 4 R16 matches per side flowing inward to the Final at center.
 * viewBox units: 7 columns of exactly 100, 8 row units of 125.
 */
function buildPaths(bracket: Bracket) {
  const paths: { key: string; d: string; active: boolean }[] = [];

  // vertical center of a match card, by round + index within its side
  const yR16 = (sideIdx: number) => (sideIdx * 2 + 1) * 125; // rows 1..8, span 2
  const yQF = (sideIdx: number) => (sideIdx * 4 + 2) * 125; // span 4
  const ySF = () => 500; // span 8

  for (const side of [0, 1] as const) {
    const dir = side === 0 ? 1 : -1;
    const bxR16 = side === 0 ? 100 : 600; // boundary between R16 and QF columns
    const bxQF = side === 0 ? 200 : 500;
    const bxSF = side === 0 ? 300 : 400;

    const elbow = (bx: number, y1: number, y2: number) =>
      `M ${bx - 6 * dir} ${y1} H ${bx} V ${y2} H ${bx + 6 * dir}`;

    // Round of 16 -> Quarter-finals
    for (let i = 0; i < 4; i++) {
      const m = side * 4 + i;
      const q = Math.floor(m / 2);
      paths.push({
        key: `0:${m}`,
        active: !!bracket.rounds[0][m].winner,
        d: elbow(bxR16, yR16(i), yQF(q % 2)),
      });
    }
    // Quarter-finals -> Semi-finals
    for (let i = 0; i < 2; i++) {
      const m = side * 2 + i;
      paths.push({
        key: `1:${m}`,
        active: !!bracket.rounds[1][m].winner,
        d: elbow(bxQF, yQF(i), ySF()),
      });
    }
    // Semi-finals -> Final (straight horizontal into the center)
    const sf = side;
    paths.push({
      key: `2:${sf}`,
      active: !!bracket.rounds[2][sf].winner,
      d: `M ${bxSF - 6 * dir} 500 H ${bxSF + 6 * dir}`,
    });
  }
  return paths;
}

export function DesktopBracket({
  bracket,
  byId,
  revealed,
  onPick,
}: {
  bracket: Bracket;
  byId: Map<string, Team>;
  revealed: boolean;
  onPick: (matchId: string, teamId: string) => void;
}) {
  const paths = buildPaths(bracket);
  const champion = bracket.champion ? (byId.get(bracket.champion) ?? null) : null;
  const finalMatch = bracket.rounds[3][0];

  const decidedIn = (round: number) =>
    bracket.rounds[round].filter((m) => m.winner).length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={revealed ? "show" : "hidden"}
      className="hidden xl:block"
    >
      {/* column headers */}
      <div className="grid" style={{ gridTemplateColumns: GRID_COLS }}>
        <RoundHeader label={ROUNDS[0].label} done={decidedIn(0)} total={8} />
        <RoundHeader label={ROUNDS[1].label} done={decidedIn(1)} total={4} />
        <RoundHeader label={ROUNDS[2].label} done={decidedIn(2)} total={2} />
        <RoundHeader label={ROUNDS[3].label} done={decidedIn(3)} total={1} />
        <RoundHeader label={ROUNDS[2].label} done={decidedIn(2)} total={2} />
        <RoundHeader label={ROUNDS[1].label} done={decidedIn(1)} total={4} />
        <RoundHeader label={ROUNDS[0].label} done={decidedIn(0)} total={8} />
      </div>

      <div className="relative mt-4">
        <svg
          viewBox="0 0 700 1000"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {paths.map((p) => (
            <path key={p.key} d={p.d} className="connector" data-active={p.active} />
          ))}
        </svg>

        <div className="relative grid" style={{ gridTemplateColumns: GRID_COLS }}>
          {/* left half: R16 0-3, QF 0-1, SF 0 */}
          <SideColumn>
            {bracket.rounds[0].slice(0, 4).map((m, i) => (
              <CardSlot key={m.id} row={i * 2 + 1} span={2}>
                <MatchCard match={m} byId={byId} onPick={onPick} size="sm" />
              </CardSlot>
            ))}
          </SideColumn>
          <SideColumn>
            {bracket.rounds[1].slice(0, 2).map((m, i) => (
              <CardSlot key={m.id} row={i * 4 + 1} span={4}>
                <MatchCard match={m} byId={byId} onPick={onPick} size="sm" />
              </CardSlot>
            ))}
          </SideColumn>
          <SideColumn>
            <CardSlot row={1} span={8}>
              <MatchCard match={bracket.rounds[2][0]} byId={byId} onPick={onPick} size="sm" />
            </CardSlot>
          </SideColumn>

          {/* center: champion above the final */}
          <div className="flex flex-col items-center justify-center gap-5 px-3">
            <ChampionCard champion={champion} />
            <MatchCard match={finalMatch} byId={byId} onPick={onPick} size="sm" />
          </div>

          {/* right half: SF 1, QF 2-3, R16 4-7 */}
          <SideColumn>
            <CardSlot row={1} span={8}>
              <MatchCard match={bracket.rounds[2][1]} byId={byId} onPick={onPick} size="sm" />
            </CardSlot>
          </SideColumn>
          <SideColumn>
            {bracket.rounds[1].slice(2, 4).map((m, i) => (
              <CardSlot key={m.id} row={i * 4 + 1} span={4}>
                <MatchCard match={m} byId={byId} onPick={onPick} size="sm" />
              </CardSlot>
            ))}
          </SideColumn>
          <SideColumn>
            {bracket.rounds[0].slice(4, 8).map((m, i) => (
              <CardSlot key={m.id} row={i * 2 + 1} span={2}>
                <MatchCard match={m} byId={byId} onPick={onPick} size="sm" />
              </CardSlot>
            ))}
          </SideColumn>
        </div>
      </div>
    </motion.div>
  );
}

function SideColumn({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid px-1.5" style={{ gridTemplateRows: "repeat(8, minmax(76px, 1fr))" }}>
      {children}
    </div>
  );
}

function CardSlot({
  row,
  span,
  children,
}: {
  row: number;
  span: number;
  children: React.ReactNode;
}) {
  return (
    <div className="self-center px-1" style={{ gridRow: `${row} / span ${span}` }}>
      {children}
    </div>
  );
}

function RoundHeader({ label, done, total }: { label: string; done?: number; total?: number }) {
  return (
    <div className="flex items-center justify-center gap-2 px-2 pb-1 text-center">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </h3>
      {typeof done === "number" && (
        <span
          className={cx(
            "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground",
            done === total && done > 0 && "bg-accent/15 text-accent",
          )}
        >
          {done}/{total}
        </span>
      )}
    </div>
  );
}
