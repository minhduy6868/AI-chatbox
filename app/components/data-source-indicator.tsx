import { InfoIcon, AlertTriangleIcon } from "lucide-react"

interface DataSourceIndicatorProps {
  isLive: boolean
  source?: string
}

export function DataSourceIndicator({ isLive, source }: DataSourceIndicatorProps) {
  if (!source) return null

  return (
    <div className="flex items-center text-xs mt-1">
      {isLive ? (
        <div className="text-muted-foreground flex items-center">
          <InfoIcon className="h-3 w-3 mr-1" />
          <span>Source: {source}</span>
        </div>
      ) : (
        <div className="text-amber-500 dark:text-amber-400 flex items-center">
          <AlertTriangleIcon className="h-3 w-3 mr-1" />
          <span>Using cached data from {source}</span>
        </div>
      )}
    </div>
  )
}

