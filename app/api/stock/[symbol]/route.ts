import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { StockData } from '@/types/stock';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol;
    const quote = await yahooFinance.quote(symbol);
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Stock data not found' },
        { status: 404 }
      );
    }

    const response: StockData = {
      symbol,
      currentValue: quote.regularMarketPrice,
      percentageChange: quote.regularMarketChangePercent,
      previousClose: quote.regularMarketPreviousClose,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      open: quote.regularMarketOpen,
      close: quote.regularMarketPrice
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
