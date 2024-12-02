"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

interface StockData {
  symbol: string;
  currentPrice: number;
  name: string;
  change: number;
  volume: number;
  marketCap: number;
  historicalData: Array<{
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
  }>;
  metrics: {
    lowestVolume: number;
    highestVolume: number;
    lowestClose: number;
    highestClose: number;
    averageVolume: number;
    currentMarketCap: number;
  };
}

interface StockTableProps {
  stocks: StockData[]
}

export function StockTable({ stocks }: StockTableProps) {
  if (!stocks.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No stock data available
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Last Price</TableHead>
          <TableHead>Change %</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>Market Cap</TableHead>
          <TableHead>Day High</TableHead>
          <TableHead>Day Low</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.map((stock) => {
          const todayData = stock.historicalData[stock.historicalData.length - 1];
          return (
            <TableRow key={stock.symbol}>
              <TableCell className="font-medium">{stock.symbol}</TableCell>
              <TableCell>{stock.name}</TableCell>
              <TableCell>${stock.currentPrice.toFixed(2)}</TableCell>
              <TableCell className={stock.change < 0 ? 'text-red-500' : 'text-green-500'}>
                {stock.change.toFixed(2)}%
              </TableCell>
              <TableCell>{stock.volume.toLocaleString()}</TableCell>
              <TableCell>${(stock.marketCap / 1e9).toFixed(2)}B</TableCell>
              <TableCell>${todayData?.high.toFixed(2) ?? "N/A"}</TableCell>
              <TableCell>${todayData?.low.toFixed(2) ?? "N/A"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  )
}
