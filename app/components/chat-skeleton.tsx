export function ChatSkeleton() {
  return (
    <div className="flex justify-start animate-pulse">
      <div className="flex gap-3 max-w-[80%]">
        <div className="h-8 w-8 rounded-full bg-muted"></div>
        <div className="rounded-lg px-4 py-2 bg-muted">
          <div className="h-4 w-24 bg-muted-foreground/20 rounded mb-2"></div>
          <div className="h-4 w-40 bg-muted-foreground/20 rounded"></div>
        </div>
      </div>
    </div>
  )
}

