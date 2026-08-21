export function Splash() {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-background">
      <div className="flex animate-pulse flex-col items-center gap-3">
        <span className="font-display text-2xl font-bold tracking-wide">
          Cup<span className="text-gradient">Draw</span>
        </span>
      </div>
    </div>
  );
}
