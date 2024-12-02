export interface StockData {
  symbol: string
  currentValue: number
  percentageChange: number
  previousClose: number
  volume: number
  marketCap: number
  high: number
  low: number
  open: number
  close: number
}

export interface CandlestickData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockMetrics {
  lowestVolume: number
  highestVolume: number
  lowestClose: number
  highestClose: number
  averageVolume: number
  currentMarketCap: number
}

