import { InfoIcon } from "lucide-react"

interface NewsBadgeProps {
  source: string
}

export function NewsBadge({ source }: NewsBadgeProps) {
  return (
    <div className="flex items-center text-xs text-muted-foreground mt-1">
      <InfoIcon className="h-3 w-3 mr-1" />
      <span>Source: {source}</span>
    </div>
  )
}

