"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useCup } from "@/lib/store";
import { computeBracket } from "@/lib/tournament";
import { readShareFromLocation } from "@/lib/share";
import { SetupScreen } from "@/components/setup-screen";
import { BracketScreen } from "@/components/bracket-screen";
import { DrawOverlay } from "@/components/draw-overlay";
import { ChampionOverlay } from "@/components/champion-overlay";
import { Splash } from "@/components/splash";
import { ToastProvider } from "@/components/toast";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const stage = useCup((s) => s.stage);
  const drawId = useCup((s) => s.drawId);

  useEffect(() => {
    const shared = readShareFromLocation();
    if (shared) {
      useCup.getState().loadShare(shared);
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      void useCup.persist.rehydrate();
    }
    setMounted(true);
  }, []);

  const handleDraw = useCallback(() => {
    useCup.getState().draw();
    setDrawing(true);
  }, []);

  if (!mounted) return <Splash />;

  return (
    <ToastProvider>
      {stage === "setup" ? (
        <SetupScreen onDraw={handleDraw} />
      ) : (
        <>
          <BracketScreen key={drawId} revealed={!drawing} onRedraw={handleDraw} />
          <AnimatePresence>
            {drawing && <DrawOverlay onFinish={() => setDrawing(false)} />}
          </AnimatePresence>
          <ChampionGate />
        </>
      )}
    </ToastProvider>
  );
}

/** Shows the champion celebration exactly once per decided final (not on every reload). */
function ChampionGate() {
  const teams = useCup((s) => s.teams);
  const seed = useCup((s) => s.seed);
  const picks = useCup((s) => s.picks);
  const championId = useMemo(
    () => (seed ? computeBracket(seed, picks).champion : null),
    [seed, picks],
  );
  const [open, setOpen] = useState(false);
  const armedRef = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      armedRef.current = true;
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (championId && armedRef.current) setOpen(true);
  }, [championId]);

  const champion = championId ? teams.find((t) => t.id === championId) : null;
  if (!champion) return null;

  return <ChampionOverlay open={open} onClose={() => setOpen(false)} championName={champion.name} />;
}
