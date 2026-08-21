/** Deterministic identity for a team name: monogram + gradient, no assets needed. */
export function teamStyle(name: string): { initials: string; background: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  const hue2 = (hue + 45) % 360;
  const words = name.trim().split(/\s+/);
  const initials =
    words.length >= 2 ? words[0][0] + words[1][0] : name.trim().slice(0, 2);
  return {
    initials: initials.toUpperCase(),
    background: `linear-gradient(135deg, hsl(${hue} 72% 52%), hsl(${hue2} 78% 40%))`,
  };
}
