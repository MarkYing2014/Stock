"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { StockData } from "@/types/stock"

interface StockTableProps {
  stocks: StockData[]
}

export function StockTable({ stocks }: StockTableProps) {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    return num.toLocaleString()
  }

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
  }

  if (!stocks.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No stock data available
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Market Cap</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow key={stock.symbol}>
              <TableCell className="font-medium">{stock.symbol}</TableCell>
              <TableCell>${stock.currentValue.toFixed(2)}</TableCell>
              <TableCell className={stock.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercentage(stock.percentageChange)}
              </TableCell>
              <TableCell>{formatNumber(stock.volume)}</TableCell>
              <TableCell>{formatNumber(stock.marketCap)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
