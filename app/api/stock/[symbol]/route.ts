import { NextResponse } from 'next/server';
import yf from 'yfinance';
import { StockData } from '@/types/stock';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol;
    const stock = yf.Ticker(symbol);
    
    // Get basic info
    const info = await stock.info;
    if (!info) {
      return NextResponse.json(
        { error: `No basic info found for symbol: ${symbol}` },
        { status: 404 }
      );
    }

    // Get historical data
    const end_date = new Date();
    const start_date = new Date();
    start_date.setDate(start_date.getDate() - 30);
    
    const history = await stock.history({ start: start_date, end: end_date });
    if (!history || history.length === 0) {
      return NextResponse.json(
        { error: `No historical data found for symbol: ${symbol}` },
        { status: 404 }
      );
    }

    const historicalData = history.map((item: any) => ({
      date: item.date.toISOString().split('T')[0],
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));

    const response: StockData = {
      symbol,
      currentValue: info.currentPrice || info.regularMarketPrice,
      percentageChange: info.regularMarketChangePercent,
      previousClose: info.regularMarketPreviousClose,
      volume: info.regularMarketVolume,
      marketCap: info.marketCap,
      high: info.dayHigh || info.regularMarketDayHigh,
      low: info.dayLow || info.regularMarketDayLow,
      open: info.open || info.regularMarketOpen,
      close: info.regularMarketPrice,
      historicalData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching stock data: ${error}`);
    return NextResponse.json(
      { error: `Failed to fetch stock data: ${error}` },
      { status: 500 }
    );
  }
}
