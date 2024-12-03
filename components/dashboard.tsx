"use client"

import { useReducer, useEffect } from "react"
import { StockCard } from "./stock-card"
import { CandlestickChart } from "./candlestick-chart"
import { MetricsPanel } from "./metrics-panel"
import { StockTable } from "./stock-table"
import { StockData, StockMetrics, CandlestickData } from "@/types/stock"

// Initial stock symbols to display
const STOCK_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "META"];

interface DashboardState {
  stocksData: Record<string, StockData>;
  selectedStock: string;
  stockData: StockData | null;
  isLoading: boolean;
  error: string | null;
}

type DashboardAction =
  | { type: 'SET_STOCKS_DATA'; payload: Record<string, StockData> }
  | { type: 'SET_SELECTED_STOCK'; payload: string }
  | { type: 'SET_STOCK_DATA'; payload: StockData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_STOCKS_DATA':
      return { ...state, stocksData: action.payload };
    case 'SET_SELECTED_STOCK':
      return { ...state, selectedStock: action.payload };
    case 'SET_STOCK_DATA':
      return { ...state, stockData: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export default function Dashboard() {
  const [state, dispatch] = useReducer(dashboardReducer, {
    stocksData: {},
    selectedStock: STOCK_SYMBOLS[0],
    stockData: null,
    isLoading: true,
    error: null
  });

  const { stocksData, selectedStock, stockData, isLoading, error } = state;

  useEffect(() => {
    const fetchStockData = async (symbol: string) => {
      try {
        console.log(`Attempting to fetch data for ${symbol}...`);
        const url = `http://localhost:8000/api/stock/${symbol}`;
        console.log(`Making request to: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        console.log(`Received response for ${symbol}:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });
        
        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            console.log(`Error data for ${symbol}:`, errorData);
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            console.error(`Error parsing error response for ${symbol}:`, e);
          }
          throw new Error(errorMessage);
        }
        
        console.log(`Parsing response data for ${symbol}...`);
        const data = await response.json();
        console.log(`Successfully parsed data for ${symbol}:`, data);
        
        // Calculate metrics from historical data
        console.log(`Calculating metrics for ${symbol}...`);
        const metrics: StockMetrics = {
          lowestVolume: Math.min(...data.historicalData.map((h: CandlestickData) => h.volume)),
          highestVolume: Math.max(...data.historicalData.map((h: CandlestickData) => h.volume)),
          lowestClose: Math.min(...data.historicalData.map((h: CandlestickData) => h.close)),
          highestClose: Math.max(...data.historicalData.map((h: CandlestickData) => h.close)),
          averageVolume: Math.round(
            data.historicalData.reduce((sum: number, h: CandlestickData) => sum + h.volume, 0) / 
            data.historicalData.length
          ),
          currentMarketCap: data.marketCap
        };
        console.log(`Calculated metrics for ${symbol}:`, metrics);
        
        return {
          ...data,
          metrics
        };
      } catch (error) {
        console.error(`Error in fetchStockData for ${symbol}:`, error);
        throw error;
      }
    };

    const fetchAllStocks = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      try {
        console.log('Starting to fetch all stocks...');
        const newStocksData: Record<string, StockData> = {};
        let hasAnyData = false;
        let lastError = null;
        
        // Fetch stocks sequentially to avoid rate limiting
        for (const symbol of STOCK_SYMBOLS) {
          try {
            console.log(`Fetching data for ${symbol}...`);
            const stockData = await fetchStockData(symbol);
            newStocksData[symbol] = stockData;
            hasAnyData = true;
            console.log(`Successfully fetched data for ${symbol}`);
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            lastError = error;
          }
        }
        
        if (!hasAnyData) {
          throw lastError || new Error('Failed to fetch data for any stocks');
        }
        
        console.log('Setting stocks data:', newStocksData);
        dispatch({ type: 'SET_STOCKS_DATA', payload: newStocksData });
        
        // Set initial selected stock data
        if (newStocksData[selectedStock]) {
          console.log(`Setting selected stock data for ${selectedStock}`);
          dispatch({ type: 'SET_STOCK_DATA', payload: newStocksData[selectedStock] });
        } else {
          // If selected stock failed to load, try to select the first available stock
          const firstAvailableStock = Object.keys(newStocksData)[0];
          if (firstAvailableStock) {
            console.log(`Selected stock ${selectedStock} not available, falling back to ${firstAvailableStock}`);
            dispatch({ type: 'SET_SELECTED_STOCK', payload: firstAvailableStock });
            dispatch({ type: 'SET_STOCK_DATA', payload: newStocksData[firstAvailableStock] });
          }
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch stock data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    fetchAllStocks();
  }, [selectedStock, dispatch]);

  const handleStockSelect = (symbol: string) => {
    dispatch({ type: 'SET_SELECTED_STOCK', payload: symbol });
  };

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
                  currentPrice={stock?.currentValue}
                  change={stock?.percentageChange}
                  data={stock?.historicalData}
                  isSelected={selectedStock === symbol}
                  onClick={() => dispatch({ type: 'SET_SELECTED_STOCK', payload: symbol })}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          {!selectedStock ? (
            <div className="h-[400px] flex items-center justify-center bg-white rounded-lg shadow">
              <p className="text-gray-600">Select a stock to view detailed chart</p>
            </div>
          ) : !stockData ? (
            <div className="h-[400px] flex items-center justify-center bg-white rounded-lg shadow">
              <p className="text-gray-600">Loading chart data...</p>
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
