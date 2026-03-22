import { cn } from "@/lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl glass p-5 space-y-4 animate-pulse",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-muted shimmer" />
            <div className="h-3 w-24 rounded bg-muted shimmer" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full bg-muted shimmer" />
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-muted shimmer" />
        <div className="h-6 w-20 rounded-full bg-muted shimmer" />
        <div className="h-6 w-24 rounded-full bg-muted shimmer" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4">
        <div className="h-4 w-20 rounded bg-muted shimmer" />
        <div className="h-4 w-24 rounded bg-muted shimmer" />
        <div className="h-4 w-16 rounded bg-muted shimmer" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <div className="h-9 flex-1 rounded-lg bg-muted shimmer" />
        <div className="h-9 flex-1 rounded-lg bg-muted shimmer" />
        <div className="h-9 w-9 rounded-lg bg-muted shimmer" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-muted shimmer" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-muted shimmer" />
          <div className="h-4 w-56 rounded bg-muted shimmer" />
        </div>
      </div>
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="h-5 w-24 rounded bg-muted shimmer" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-muted shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
