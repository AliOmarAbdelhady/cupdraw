import confetti from "canvas-confetti";

export const CONFETTI_COLORS = ["#34d399", "#38bdf8", "#fbbf24", "#ffffff", "#a78bfa"];

export function burst() {
  confetti({
    particleCount: 70,
    spread: 75,
    startVelocity: 32,
    scalar: 0.9,
    origin: { y: 0.55 },
    colors: CONFETTI_COLORS,
  });
}

/** Center burst + side cannons for a few seconds. */
export function fireChampionConfetti(durationMs = 2600) {
  confetti({
    particleCount: 130,
    spread: 100,
    startVelocity: 42,
    origin: { y: 0.6 },
    colors: CONFETTI_COLORS,
  });
  const end = Date.now() + durationMs;
  const iv = window.setInterval(() => {
    if (Date.now() > end) {
      window.clearInterval(iv);
      return;
    }
    confetti({ particleCount: 28, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: CONFETTI_COLORS });
    confetti({ particleCount: 28, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: CONFETTI_COLORS });
  }, 380);
}
