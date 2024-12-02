"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface StockMetrics {
  lowestVolume: number;
  highestVolume: number;
  lowestClose: number;
  highestClose: number;
  averageVolume: number;
  currentMarketCap: number;
}

export function MetricsPanel({ metrics }: { metrics?: StockMetrics }) {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    return num.toLocaleString()
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Metrics...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Period Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Lowest Volume</p>
            <p className="text-xl font-bold">{formatNumber(metrics.lowestVolume)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Highest Volume</p>
            <p className="text-xl font-bold">{formatNumber(metrics.highestVolume)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Lowest Close</p>
            <p className="text-xl font-bold">${metrics.lowestClose.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Highest Close</p>
            <p className="text-xl font-bold">${metrics.highestClose.toFixed(2)}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Average Volume</p>
          <p className="text-xl font-bold">{formatNumber(metrics.averageVolume)}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Market Cap</p>
          <p className="text-xl font-bold">${formatNumber(metrics.currentMarketCap)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
