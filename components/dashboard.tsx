"use client"

import { useEffect, useState } from "react"
import { StockCard } from "./stock-card"
import { CandlestickChart } from "./candlestick-chart"
import { MetricsPanel } from "./metrics-panel"
import { StockTable } from "./stock-table"

// Initial stock symbols to display
const STOCK_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "META"];

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

export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState(STOCK_SYMBOLS[0]);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [stocksData, setStocksData] = useState<Record<string, StockData>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStockData = async (symbol: string) => {
    try {
      console.log('Fetching data for:', symbol);
      const response = await fetch(`http://localhost:8000/api/stock/${symbol}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch stock data: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received data for', symbol, data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error;
    }
  };

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
  };

  // Fetch initial data for all stocks
  useEffect(() => {
    const fetchAllStocks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const newStocksData: Record<string, StockData> = {};
        
        // Fetch stocks sequentially to avoid rate limiting
        for (const symbol of STOCK_SYMBOLS) {
          try {
            const data = await fetchStockData(symbol);
            newStocksData[symbol] = data;
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
          }
        }
        
        setStocksData(newStocksData);
        
        // Set initial selected stock data
        if (newStocksData[selectedStock]) {
          setStockData(newStocksData[selectedStock]);
        }
      } catch (error) {
        console.error('Error fetching initial stock data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch stock data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllStocks();
  }, []);

  // Update selected stock data when stocksData changes
  useEffect(() => {
    if (stocksData[selectedStock]) {
      setStockData(stocksData[selectedStock]);
    }
  }, [selectedStock, stocksData]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-4xl font-bold mb-6">Stocks Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {STOCK_SYMBOLS.map((symbol) => {
          const stock = stocksData[symbol];
          return (
            <div 
              key={symbol} 
              onClick={() => handleStockSelect(symbol)}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              {isLoading ? (
                <div className="h-[150px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-600">Loading {symbol}...</p>
                </div>
              ) : (
                <StockCard 
                  symbol={symbol}
                  currentPrice={stock?.currentPrice ?? 0}
                  change={stock?.change ?? 0}
                  data={stock?.historicalData ?? []}
                  isSelected={selectedStock === symbol}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
              <p className="text-lg text-gray-600">Loading chart data...</p>
            </div>
          ) : (
            <CandlestickChart symbol={selectedStock} data={stockData} />
          )}
        </div>
        <div className="lg:col-span-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
              <p className="text-lg text-gray-600">Loading metrics...</p>
            </div>
          ) : (
            <MetricsPanel metrics={stockData?.metrics} />
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <StockTable stocks={stockData ? [stockData] : []} />
      </div>
    </div>
  );
}
