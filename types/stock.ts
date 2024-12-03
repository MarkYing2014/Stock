export interface StockData {
  symbol: string;
  currentValue?: number;
  percentageChange?: number;
  previousClose?: number;
  volume?: number;
  marketCap?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

export interface StockMetrics {
  currentValue: number;
  percentageChange: number;
  volume: number;
  marketCap: number;
}
