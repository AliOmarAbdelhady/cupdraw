import { teamStyle } from "@/lib/colors";
import { cx } from "@/lib/utils";

export function TeamAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { initials, background } = teamStyle(name);
  return (
    <span
      aria-hidden
      className={cx(
        "inline-grid shrink-0 select-none place-items-center rounded-lg font-display font-bold text-white ring-1 ring-white/10",
        size === "sm" && "size-6 text-[10px]",
        size === "md" && "size-7 text-[11px]",
        size === "lg" && "size-9 text-sm",
        className,
      )}
      style={{ backgroundImage: background }}
    >
      {initials}
    </span>
  );
}
