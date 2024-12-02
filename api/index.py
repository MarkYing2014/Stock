from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime, timedelta
import logging

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/stock/{symbol}")
async def get_stock_data(symbol: str):
    try:
        logger.info(f"Fetching data for symbol: {symbol}")
        stock = yf.Ticker(symbol)
        
        # Get historical data for candlestick chart
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        history = stock.history(start=start_date, end=end_date)
        
        if history.empty:
            logger.error(f"No historical data found for symbol: {symbol}")
            raise HTTPException(status_code=404, detail=f"No data found for symbol: {symbol}")
        
        # Format historical data for the chart
        historical_data = []
        for index, row in history.iterrows():
            historical_data.append({
                "date": index.strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"])
            })

        # Get current stock info
        info = stock.info
        
        if not info:
            logger.error(f"No info data found for symbol: {symbol}")
            raise HTTPException(status_code=404, detail=f"No info found for symbol: {symbol}")
        
        response_data = {
            "symbol": symbol,
            "currentPrice": float(info.get("currentPrice", 0)),
            "name": info.get("longName", symbol),
            "change": float(info.get("regularMarketChangePercent", 0)),
            "volume": int(info.get("regularMarketVolume", 0)),
            "marketCap": int(info.get("marketCap", 0)),
            "historicalData": historical_data,
            "metrics": {
                "lowestVolume": min(h["volume"] for h in historical_data),
                "highestVolume": max(h["volume"] for h in historical_data),
                "lowestClose": min(h["close"] for h in historical_data),
                "highestClose": max(h["close"] for h in historical_data),
                "averageVolume": sum(h["volume"] for h in historical_data) / len(historical_data),
                "currentMarketCap": int(info.get("marketCap", 0))
            }
        }
        
        logger.info(f"Successfully fetched data for symbol: {symbol}")
        return response_data
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error fetching data for symbol {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
