import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { StockData } from '@/types/stock';

// Configure yahoo-finance2
yahooFinance.setGlobalConfig({
  queue: {
    concurrent: 5, // number of concurrent requests
    timeout: 10000 // timeout in ms
  }
});

// Suppress the survey notice
yahooFinance.suppressNotices(['yahooSurvey']);

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol;
    
    // Add retry logic for quote fetching
    let retries = 3;
    let quote;
    
    while (retries > 0) {
      try {
        quote = await yahooFinance.quote(symbol);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

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
