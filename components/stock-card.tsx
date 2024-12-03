"use client"

import { Card, CardContent } from "./ui/card"
import { Line, LineChart, ResponsiveContainer } from "recharts"

interface StockCardProps {
  symbol: string
  currentPrice?: number
  change?: number
  data?: Array<{ close: number, date: string }>
  isSelected?: boolean
  onClick?: () => void
}

export function StockCard({ 
  symbol, 
  currentPrice = 0, 
  change = 0, 
  data = [], 
  isSelected = false,
  onClick
}: StockCardProps) {
  const isNegative = change < 0
  const chartData = data.map(item => ({ value: item.close }))

  return (
    <Card 
      className={`${isSelected ? 'ring-2 ring-primary' : ''} cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold">{symbol}</h3>
            <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          </div>
          <span className={`${isNegative ? 'text-red-500' : 'text-green-500'} font-medium`}>
            {isNegative ? '▼' : '▲'} {Math.abs(change).toFixed(2)}%
          </span>
        </div>
        <div className="h-[50px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={isNegative ? "hsl(var(--destructive))" : "hsl(var(--success))"}
                dot={false}
                strokeWidth={1.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
