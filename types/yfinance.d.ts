declare module 'yfinance' {
  interface HistoryOptions {
    start?: Date;
    end?: Date;
    period?: string;
    interval?: string;
  }

  interface StockInfo {
    currentPrice?: number;
    regularMarketPrice?: number;
    regularMarketChangePercent?: number;
    regularMarketPreviousClose?: number;
    regularMarketVolume?: number;
    marketCap?: number;
    dayHigh?: number;
    regularMarketDayHigh?: number;
    dayLow?: number;
    regularMarketDayLow?: number;
    open?: number;
    regularMarketOpen?: number;
    [key: string]: any;
  }

  interface HistoryData {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    [key: string]: any;
  }

  class Ticker {
    constructor(symbol: string);
    info: Promise<StockInfo>;
    history(options?: HistoryOptions): Promise<HistoryData[]>;
  }

  const yf: {
    Ticker: typeof Ticker;
  };

  export = yf;
}
