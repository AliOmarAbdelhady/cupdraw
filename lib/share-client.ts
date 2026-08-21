"use client";

import { useCup } from "@/lib/store";
import { encodeShare } from "@/lib/share";

/** Copies a URL that recreates the current bracket (teams + draw + picks) anywhere it's opened. */
export async function copyBracketLink(): Promise<boolean> {
  const { teams, seed, picks } = useCup.getState();
  if (!seed) return false;
  const url = `${window.location.origin}${window.location.pathname}#b=${encodeShare(teams, seed, picks)}`;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
