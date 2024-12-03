"use client"

import { StockMetrics } from "@/types/stock"

interface MetricsPanelProps {
  metrics: StockMetrics | undefined
  isLoading: boolean
}

export function MetricsPanel({ metrics, isLoading }: MetricsPanelProps) {
  if (isLoading) {
    return <div className="text-center py-4">Loading Metrics...</div>
  }

  if (!metrics) {
    return <div className="text-center py-4">No metrics available</div>
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Period Metrics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Value</p>
          <p className="text-xl font-bold">{formatCurrency(metrics.currentValue)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Change</p>
          <p className={`text-xl font-bold ${metrics.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(metrics.percentageChange)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Volume</p>
          <p className="text-xl font-bold">{formatNumber(metrics.volume)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Market Cap</p>
          <p className="text-xl font-bold">{formatCurrency(metrics.marketCap)}</p>
        </div>
      </div>
    </div>
  )
}
