export function PageSkeleton({ blocks = 3 }: { blocks?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: blocks }).map((_, i) => (
        <div key={i} className="card p-4 h-24 bg-card-border/40" />
      ))}
    </div>
  );
}
